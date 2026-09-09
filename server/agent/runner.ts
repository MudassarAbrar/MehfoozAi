/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Agent runner — the bounded Gemini function-calling loop.
 *
 * Flow per iteration:
 *   1. Call Gemini with tools: [{ functionDeclarations }]
 *   2. If no function calls → return text response
 *   3. For each function call:
 *      - Validate via validateFunctionCall()
 *      - If requiresConfirmation: create pending action, pause loop
 *      - If safe (read_only / ui_only): execute immediately
 *   4. Append tool results as functionResponse parts
 *   5. Continue loop
 *
 * Safety invariants:
 *   - Side-effecting tools NEVER execute without user confirmation.
 *   - Timeout via Promise.race with GEMINI_AGENT_TIMEOUT_MS.
 *   - Model fallback: try primary, then fallbacks on failure.
 *   - Never duplicate side effects on retry.
 */

import { GoogleGenAI } from '@google/genai';
import { getAgentConfig, getModelChain } from './config.js';
import { buildSystemInstruction } from './systemPrompt.js';
import { safetyFunctionDeclarations } from './declarations.js';
import { validateFunctionCall, getToolPolicy } from './policies.js';
import { executeSafeTool } from './executor.js';
import { createPendingAction } from './confirmation.js';
import { buildAgentContext, formatHistoryForGemini, saveMessage, updateConversationTitle } from './context.js';
import { AgentError, normalizeAgentError } from './errors.js';
import { checkImmediateDanger } from './dangerCheck.js';
import { evaluateInputGuardrail, redactPII } from './inputGuardrail.js';
import { resolveConversationContext } from './contextResolver.js';
import { retrieveGroundedEvidence } from './ragRetriever.js';
import { validateOutputGuardrail } from './outputGuardrail.js';
import { checkAndConsumeServerQuota } from '../supabaseServer.js';
import {
  AgentInput,
  AgentOutput,
  AgentStep,
  AgentCitation,
  AgentToolProposal,
  AgentResponse
} from './schemas.js';

/** Creates a lazily-initialised Gemini client (server-side only). */
function createAgentClient(): GoogleGenAI {
  const cfg = getAgentConfig();
  if (!cfg.apiKey) {
    throw new AgentError('GEMINI_UNAVAILABLE', 'AI service is not configured.', 503);
  }
  return new GoogleGenAI({
    apiKey: cfg.apiKey,
    httpOptions: { headers: { 'User-Agent': 'mehfooz-agent/1.0' } }
  });
}

/** Main entry point: runs the bounded agent loop with full guardrail and RAG pipeline. */
export async function runMehfoozAgent(input: AgentInput): Promise<AgentOutput> {
  // PII Redaction: mask CNICs, phone numbers, and emails before model processing
  if (input.query) {
    input.query = redactPII(input.query);
  }

  // Server-Side 10-Message / 12-Hour Session Quota Verification
  const quotaResult = await checkAndConsumeServerQuota(input.userId || 'guest');
  if (!quotaResult.allowed) {
    const isUrdu = input.language === 'ur';
    const hoursLeft = Math.ceil(quotaResult.resetInMs / (1000 * 60 * 60));
    const quotaRefusal = isUrdu
      ? `آپ نے اس 12 گھنٹے کے سیشن کے لیے اپنی 10 پیغامات کی حد (10/10) پوری کر لی ہے۔ آپ کی حد تقریباً ${hoursLeft} گھنٹوں میں دوبارہ فعال ہو جائے گی۔`
      : `You have reached your 10-message limit (0/10 remaining) for this 12-hour session. Your message quota will reset in approximately ${hoursLeft} hours.`;

    return {
      type: 'final',
      text: quotaRefusal,
      citations: [],
      conversationId: input.conversationId || 'guest-conv',
      runId: `run-${Date.now()}`,
      steps: [],
      modelUsed: 'quota-enforcer',
      error: { code: 'SESSION_QUOTA_EXHAUSTED', message: quotaRefusal }
    };
  }

  const cfg = getAgentConfig();
  const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const steps: AgentStep[] = [];
  let stepCounter = 0;

  function addStep(label: string, toolName?: string, status: AgentStep['status'] = 'active'): AgentStep {
    const step: AgentStep = {
      id: `step-${++stepCounter}`,
      toolName,
      label,
      status,
      startedAt: new Date().toISOString()
    };
    steps.push(step);
    return step;
  }

  function completeStep(step: AgentStep, status: AgentStep['status'] = 'completed') {
    step.status = status;
    step.completedAt = new Date().toISOString();
  }

  try {
    // 1. Build agent context (user profile, conversation history, contacts)
    const contextStep = addStep('Loading conversation…');
    const context = await buildAgentContext(
      input.userId || 'guest',
      input.accessToken,
      input.conversationId
    );
    completeStep(contextStep);

    // 2. Immediate Danger Check (deterministic fast path — skips LLM entirely)
    if (checkImmediateDanger(input.query)) {
      const dangerStep = addStep('Immediate safety alert detected');
      completeStep(dangerStep);
      const dangerText = input.language === 'ur'
        ? 'فوری حفاظتی الرٹ: اگر آپ فوری جسمانی خطرے میں ہیں تو اپنی جان کی حفاظت کو اولین ترجیح دیں۔ براہ کرم فوری طور پر ایمرجنسی 15 یا ریسکیو 1122 پر کال کریں۔ محفوظ کرائسس بٹن کے ذریعے اپنے ایمرجنسی رابطوں کو الرٹ کریں۔'
        : 'IMMEDIATE SAFETY ALERT: If you are in immediate physical danger, prioritize your physical safety. Please call Emergency 15 or Rescue 1122 immediately. Use the Crisis button to alert emergency contacts.';

      await saveMessage(context.conversationId, input.accessToken, 'user', input.query);
      await saveMessage(context.conversationId, input.accessToken, 'model', dangerText);

      return {
        type: 'final',
        text: dangerText,
        citations: [],
        conversationId: context.conversationId,
        runId,
        modelUsed: 'local-safety-guardrail',
        steps
      };
    }

    // 3. Input Guardrail: Domain & Intent check
    const guardrail = evaluateInputGuardrail(input.query, input.language, context.messages);
    if (!guardrail.allowed) {
      const guardStep = addStep('Checking request domain');
      completeStep(guardStep);

      const refusalText = guardrail.refusalMessage || (input.language === 'ur'
        ? 'میں خاص طور پر خواتین کے تحفظ، پنجاب کی قانونی رہنمائی، ہنگامی امداد اور محفوظ (Mehfooz) کے فیچرز کے لیے بنائی گئی ہوں۔ میں اس موضوع پر مدد نہیں کر سکتی، لیکن اگر آپ کا کوئی حفاظتی یا قانونی سوال ہو تو ضرور بتائیں۔'
        : 'I’m designed specifically to help with women’s safety, Punjab legal guidance, emergency support, and Mehfooz features. I can’t help with this topic, but I can help you with any safety or legal concern.');

      await saveMessage(context.conversationId, input.accessToken, 'user', input.query);
      await saveMessage(context.conversationId, input.accessToken, 'model', refusalText);

      return {
        type: 'final',
        text: refusalText,
        citations: [],
        conversationId: context.conversationId,
        runId,
        modelUsed: 'input-guardrail',
        steps
      };
    }

    // 4. Intent + Context Analysis: Resolve pronouns and extract incident context
    const { resolvedQuery, structuredIncident } = resolveConversationContext(
      input.query,
      input.language,
      context.messages
    );

    // Save user message to conversation
    const userTurn = input.query;
    await saveMessage(context.conversationId, input.accessToken, 'user', userTurn);

    // If new conversation, generate a short title from the user query
    if (context.messages.length === 0) {
      void updateConversationTitle(context.conversationId, input.accessToken, userTurn);
    }

    // 5. Create Gemini client
    const client = createAgentClient();
    const modelChain = getModelChain();

    // 6. Pre-execution RAG Retrieval: Ground legal answers in Punjab Legal Corpus BEFORE generation
    let citations: AgentCitation[] = [];
    let evidencePrompt = '';
    let hasSufficientEvidence = true;

    if (guardrail.requires_rag) {
      const ragStep = addStep('Searching verified Punjab legal corpus…');
      const groundedEvidence = await retrieveGroundedEvidence(
        resolvedQuery,
        client,
        input.language,
        4
      );
      completeStep(ragStep);

      citations = [...groundedEvidence.citations];
      evidencePrompt = groundedEvidence.evidencePrompt;
      hasSufficientEvidence = groundedEvidence.hasSufficientEvidence;
    }

    // Build system instruction incorporating authoritative retrieved evidence
    const baseSystemInstruction = buildSystemInstruction(input.language);
    const systemInstruction = evidencePrompt
      ? `${baseSystemInstruction}\n\n${evidencePrompt}`
      : baseSystemInstruction;

    // 7. Build conversation history for Gemini
    const history = formatHistoryForGemini(context.messages, cfg.maxHistoryMessages);

    // Bounded agent loop: append user turn ensuring strict alternation
    const contents: any[] = [...history];
    const userPromptText = resolvedQuery !== input.query && resolvedQuery.length > input.query.length
      ? `${userTurn}\n[Context: ${resolvedQuery}]`
      : userTurn;

    const lastContent = contents[contents.length - 1];
    if (lastContent && lastContent.role === 'user') {
      lastContent.parts.push({ text: userPromptText });
    } else {
      contents.push({ role: 'user', parts: [{ text: userPromptText }] });
    }

    let finalText: string | undefined;
    let pendingActions: AgentToolProposal[] = [];
    let uiActions: Array<{ action: string; payload?: Record<string, unknown> }> = [];
    let modelUsed: string | undefined;
    let lastError: unknown;

    for (let iteration = 0; iteration < cfg.maxIterations; iteration++) {
      let geminiResponse: any = null;
      let usedModel: string | undefined;

      // Try each model in the fallback chain
      for (const modelName of modelChain) {
        try {
          const callStep = addStep('Reasoning grounded response…');

          const callWithTimeout = Promise.race([
            client.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction,
                tools: [{ functionDeclarations: safetyFunctionDeclarations as any }],
                maxOutputTokens: 1500,
              }
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Agent request timed out')), cfg.timeoutMs)
            )
          ]);

          geminiResponse = await callWithTimeout;
          usedModel = modelName;
          completeStep(callStep);
          break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Agent model ${modelName} failed (iteration ${iteration}):`, err?.message);
          // Try next model
        }
      }

      if (!geminiResponse) {
        throw new AgentError(
          'GEMINI_UNAVAILABLE',
          'All AI models are temporarily unavailable. Please try again.',
          503
        );
      }

      modelUsed = usedModel;

      // Parse the response
      const responseCandidates = geminiResponse?.candidates || [];
      if (responseCandidates.length === 0) {
        throw new AgentError('GEMINI_UNAVAILABLE', 'AI response was empty.', 503);
      }

      const candidate = responseCandidates[0];
      const responseParts: any[] = candidate?.content?.parts || [];

      // Check for function calls
      const functionCalls: Array<{ id?: string; name: string; args: Record<string, unknown> }> = [];
      let textParts: string[] = [];

      for (const part of responseParts) {
        if (part.functionCall) {
          functionCalls.push({
            id: part.functionCall.id,
            name: part.functionCall.name,
            args: (part.functionCall.args || {}) as Record<string, unknown>
          });
        } else if (part.text) {
          textParts.push(part.text);
        }
      }

      // If no function calls, we have the final text response
      if (functionCalls.length === 0) {
        finalText = textParts.join('\n').trim();
        break;
      }

      // Process each function call
      const toolResults: Array<{ id?: string; name: string; response: Record<string, unknown> }> = [];
      let confirmationRequired = false;

      for (const fc of functionCalls) {
        const policy = getToolPolicy(fc.name);

        // Validate the call
        const validation = validateFunctionCall(fc.name, fc.args);
        if (!validation.valid) {
          toolResults.push({
            id: fc.id,
            name: fc.name,
            response: { error: validation.error || 'Invalid tool call' }
          });
          const failStep = addStep(`Unknown request blocked`, fc.name, 'failed');
          completeStep(failStep, 'failed');
          continue;
        }

        if (!policy) {
          toolResults.push({
            id: fc.id,
            name: fc.name,
            response: { error: 'Tool policy not found' }
          });
          continue;
        }

        if (policy.requiresConfirmation) {
          // Pause the loop — create a pending action
          const confirmStep = addStep('Waiting for your approval…', fc.name, 'waiting');

          const displayData = buildDisplayData(fc.name, fc.args, context);
          const pendingAction = await createPendingAction({
            userId: input.userId || 'guest',
            conversationId: context.conversationId,
            accessToken: input.accessToken,
            toolName: fc.name,
            arguments: fc.args,
            displayData
          });

          pendingActions.push(pendingAction);
          confirmationRequired = true;

          // Tell Gemini the action is awaiting confirmation
          toolResults.push({
            id: fc.id,
            name: fc.name,
            response: {
              status: 'pending_confirmation',
              actionId: pendingAction.id,
              message: `Action "${pendingAction.title}" is awaiting user confirmation.`
            }
          });

          completeStep(confirmStep, 'waiting');
          // Don't process more function calls once confirmation is required
          break;
        }

        // Safe tool — execute immediately
        const execStep = addStep(`Looking up information…`, fc.name, 'active');

        if (policy.safety === 'ui_only') {
          // UI-only tools return an action signal
          const result = await executeSafeTool(fc.name, fc.args, input.userId || 'guest', input.accessToken || '');
          if (result.success && result.data && (result.data as Record<string, unknown>).uiAction) {
            const uiAction = (result.data as Record<string, unknown>).uiAction as string;
            uiActions.push({
              action: uiAction,
              payload: result.data as Record<string, unknown>
            });
          }
          toolResults.push({
            id: fc.id,
            name: fc.name,
            response: result.success
              ? { success: true, data: result.data }
              : { success: false, error: result.error }
          });
          completeStep(execStep);
        } else {
          // Read-only tool
          const result = await executeSafeTool(fc.name, fc.args, input.userId || 'guest', input.accessToken || '');
          toolResults.push({
            id: fc.id,
            name: fc.name,
            response: result.success
              ? { success: true, data: result.data }
              : { success: false, error: result.error }
          });

          // Collect citations from legal corpus search and merge uniquely
          if (fc.name === 'search_legal_corpus' && result.success && result.data) {
            const data = result.data as Record<string, unknown>;
            if (Array.isArray(data.citations)) {
              for (const c of data.citations as AgentCitation[]) {
                if (!citations.some(existing => existing.sourceId === c.sourceId)) {
                  citations.push(c);
                }
              }
            }
          }

          completeStep(execStep);
        }
      }

      // If confirmation is required, pause the loop and return to the user
      if (confirmationRequired) {
        // Generate a text response explaining the pending action
        const confirmTextStep = addStep('Preparing confirmation…');

        try {
          const confirmContents = [
            ...contents,
            candidate.content,
            {
              role: 'user',
              parts: toolResults.map(tr => ({
                functionResponse: {
                  name: tr.name,
                  response: tr.response,
                  ...(tr.id ? { id: tr.id } : {})
                }
              }))
            }
          ];

          for (const modelName of modelChain) {
            try {
              const textResponse = await client.models.generateContent({
                model: modelName,
                contents: confirmContents,
                config: {
                  systemInstruction,
                  maxOutputTokens: 500,
                }
              });

              if (textResponse?.text) {
                finalText = textResponse.text.trim();
                modelUsed = modelName;
                break;
              }
            } catch {
              // Try next model
            }
          }

          if (!finalText) {
            finalText = pendingActions.length > 0
              ? `I'd like to ${pendingActions[0].title.toLowerCase()}. Please confirm or cancel this action.`
              : 'An action requires your confirmation.';
          }
        } catch {
          finalText = 'An action requires your confirmation. Please review the action card below.';
        }

        completeStep(confirmTextStep);
        break;
      }

      // Append model's response + tool results to the conversation for the next iteration
      contents.push(candidate.content);

      contents.push({
        role: 'user',
        parts: toolResults.map(tr => ({
          functionResponse: {
            name: tr.name,
            response: tr.response,
            ...(tr.id ? { id: tr.id } : {})
          }
        }))
      });
    }

    // If we exhausted all iterations without text, generate a fallback
    if (!finalText) {
      finalText = input.language === 'ur'
        ? 'معذرت، میں اس وقت آپ کی درخواست مکمل نہیں کر سکی۔ براہ کرم دوبارہ کوشش کریں۔'
        : 'I was unable to complete your request at this time. Please try again.';
    }

    // 8. Output Guardrail: Verify legal grounding, catch hallucinations or dangerous advice
    if (finalText && pendingActions.length === 0) {
      const outputGuardStep = addStep('Verifying safety and legal accuracy…');
      const outputCheck = await validateOutputGuardrail(
        finalText,
        input.language,
        hasSufficientEvidence,
        citations,
        client,
        modelUsed || cfg.primaryModel
      );
      completeStep(outputGuardStep);
      finalText = outputCheck.cleanText;
    }

    // 9. Save the assistant message to the conversation
    await saveMessage(context.conversationId, input.accessToken, 'model', finalText);

    return {
      type: pendingActions.length > 0 ? 'confirmation_required' : (uiActions.length > 0 ? 'ui_action' : 'final'),
      text: finalText,
      citations: citations.length > 0 ? citations : undefined,
      pendingActions: pendingActions.length > 0 ? pendingActions : undefined,
      uiActions: uiActions.length > 0 ? uiActions : undefined,
      steps: steps.length > 0 ? steps : undefined,
      conversationId: context.conversationId,
      runId,
      modelUsed,
      error: undefined
    };
  } catch (err: unknown) {
    const agentErr = normalizeAgentError(err);
    console.warn(`Agent run ${runId} failed:`, agentErr.message);

    return {
      type: 'error',
      text: input.language === 'ur'
        ? 'معذرت، ایک تکنیکی مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔'
        : 'A technical issue occurred. Please try again.',
      steps: steps.length > 0 ? steps : undefined,
      conversationId: input.conversationId || '',
      runId,
      error: {
        code: agentErr.code,
        message: agentErr.message
      }
    };
  }
}

// =====================================================================
// Helpers
// =====================================================================

/** Builds display data for a confirmation-required tool call. */
function buildDisplayData(
  toolName: string,
  args: Record<string, unknown>,
  context: { emergencyContacts: Array<{ id: string; name: string; phone: string }> }
): Record<string, unknown> {
  switch (toolName) {
    case 'prepare_complaint_draft':
      return {
        complaintCategory: (args.category as string) || 'unspecified',
        incidentSummary: (args.incident_summary as string) || '',
        district: (args.district as string) || 'Lahore',
        requestedSupport: (args.requested_support as string) || ''
      };

    case 'save_incident_to_vault':
      return {
        incidentType: (args.incident_type as string) || 'incident',
        incidentTitle: (args.title as string) || 'Untitled Incident'
      };

    case 'start_safety_checkin': {
      const contactIds = Array.isArray(args.contact_ids) ? (args.contact_ids as string[]) : [];
      const contactNames = contactIds
        .map(id => context.emergencyContacts.find(c => c.id === id)?.name)
        .filter(Boolean);
      return {
        destination: (args.destination as string) || '',
        durationMinutes: (args.duration_minutes as number) || 0,
        contactNames: contactNames.join(', ') || 'No contacts selected'
      };
    }

    case 'send_sms_to_contact': {
      const contactId = typeof args.contact_id === 'string' ? args.contact_id : '';
      const contact = context.emergencyContacts.find(c => c.id === contactId);
      return {
        recipient: contact?.name || 'Emergency Contact',
        recipientPhone: contact?.phone || '',
        messagePreview: typeof args.message === 'string' ? args.message.slice(0, 200) : '',
        includeGps: Boolean(args.include_gps)
      };
    }

    case 'email_complaint_to_authority':
      return {
        complaintId: (args.complaint_id as string) || '',
        recipientEmail: (args.recipient_email as string) || 'Configured authority'
      };

    default:
      return {};
  }
}

