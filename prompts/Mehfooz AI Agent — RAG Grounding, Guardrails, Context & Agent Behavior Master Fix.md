# MEHFOOZ AI AGENT — RAG GROUNDING, DOMAIN GUARDRAILS, CONVERSATION MEMORY & AGENT BEHAVIOR MASTER FIX

## ROLE

You are modifying the existing Mehfooz AI agent.

Your task is to fix the **agent's behavior and architecture**, not redesign the application.

The current application already has working functionality, RAG documents, agent logic, UI, authentication, conversation history, complaint generation, and other integrations.

**Do not replace the working architecture.**

First inspect the existing implementation and understand how the current agent, RAG, conversation state, tools, streaming/final responses, and frontend chat state work.

Then make the **smallest safe changes necessary** to achieve the behavior specified below.

---

# 1. CURRENT PROBLEMS

The current AI agent has several major behavioral problems.

### Problem 1 — Generic answers

The agent frequently responds using its general model knowledge instead of the application's domain knowledge.

For example:

User:

> What should I do if someone is threatening me?

The agent may produce a generic safety answer instead of grounding the response in the Mehfooz knowledge base and available Punjab laws/resources.

The agent should behave like a **domain-specific Mehfooz safety and legal assistant**, not a general-purpose chatbot.

---

### Problem 2 — RAG only appears after the agent stops

Currently, while the agent is "working", the visible response does not appear to be based on the RAG documents.

Only after the agent finishes does the application apparently produce the RAG-grounded answer.

Investigate whether:

- RAG is being executed too late
- RAG is being called after the main LLM response
- the model generates an answer before retrieval
- streaming and final-output handling are separated incorrectly
- the frontend displays an intermediate model response that was generated without retrieval
- the orchestrator bypasses RAG in some execution paths
- the RAG result is not inserted into the LLM conversation/context
- a second model call is being used to "correct" the first answer
- the agent loop is returning an intermediate response instead of the final grounded response

The desired architecture is:

**USER MESSAGE**
→ **INPUT GUARDRAIL / DOMAIN CHECK**
→ **INTENT + CONTEXT ANALYSIS**
→ **RAG RETRIEVAL**
→ **RETRIEVED EVIDENCE ADDED TO LLM CONTEXT**
→ **AGENT REASONING**
→ **TOOL CALLS IF REQUIRED**
→ **FINAL GROUNDED RESPONSE**
→ **OUTPUT GUARDRAIL**
→ **USER**

Do NOT allow the model to first generate an unrestricted answer and then retrieve documents afterward.

Retrieval must happen **before the answer that the user sees as the final substantive answer**.

---

# 2. FIRST: AUDIT THE EXISTING AGENT ARCHITECTURE

Before modifying code, inspect at minimum:

- `server/agent/runner.ts`
- `server/agent/*`
- `server/agent/confirmation.ts`
- system prompt/instructions
- `orchestrator.ts`
- RAG implementation
- retrieval functions
- conversation/session implementation
- Supabase conversation/message queries
- frontend Chat component
- chat state management
- streaming implementation
- final response handling
- tool definitions
- handoffs
- guardrails, if any
- agent configuration
- Gemini/OpenAI model configuration
- complaint-generation path
- voice-mode path

Search the complete repository for:

- `Runner.run`
- `Runner.run_streamed`
- `Agent(`
- `instructions`
- `context`
- `session`
- `conversation`
- `conversation_id`
- `previous_response_id`
- `to_input_list`
- `tool`
- `handoff`
- `guardrail`
- `input_guardrail`
- `output_guardrail`
- `retrieval`
- `RAG`
- `embedding`
- `vector`
- `search`
- `messages`
- `final_output`
- `stream`
- `yield`
- `on_message`
- `history`
- `chat`

Do not assume that the current implementation works the way its filenames suggest.

Trace the actual execution path from:

**user sends message → backend → agent → retrieval → model → tools → final response → frontend**

Document the current flow internally before changing it.

---

# 3. DOMAIN DEFINITION

Mehfooz is NOT a general-purpose AI assistant.

The assistant's primary domain is:

### Mehfooz domain

- women's safety
- personal safety
- emergency situations
- harassment
- threats
- domestic violence
- abuse
- stalking
- violence prevention
- incident reporting
- complaint preparation
- legal navigation
- Punjab/Pakistan relevant laws
- emergency services
- police/reporting channels
- safety planning
- safe navigation
- check-ins
- emergency contacts
- available Mehfooz application features
- Punjab-specific legal information contained in the approved knowledge base

The agent may explain general concepts when they are directly necessary to answer a Mehfooz-domain question.

It must NOT become a general programming, homework, entertainment, coding, medical, financial, political, or general knowledge chatbot.

---

# 4. IMPLEMENT INPUT GUARDRAILS

Use the agent SDK's actual **input guardrail mechanism** where appropriate.

Do not implement a fake guardrail consisting only of instructions in the system prompt.

The input guardrail should determine whether the request belongs to the supported Mehfooz domain.

Examples:

### ALLOWED

> Someone is threatening me. What should I do?

> How can I report harassment?

> What laws protect women in Punjab?

> I am being stalked. What safety steps should I take?

> Help me prepare a complaint.

> What emergency options are available?

> How do I use the check-in feature?

### ALLOWED WITH CONTEXT

> What does Section X mean?

If the section is relevant to the application's legal knowledge base.

### ALLOWED

> Explain this legal term in simple language.

### OUT OF DOMAIN

> How do I reverse a linked list?

> Write a Python program.

> Solve this calculus problem.

> Give me a recipe.

> Who won the cricket match?

> Write my resume.

> Explain quantum physics.

The agent should politely refuse unsupported topics and redirect the user toward what Mehfooz can help with.

Example behavior:

> I’m designed specifically to help with women’s safety, legal guidance, emergency support, incident reporting, and Mehfooz features. I can’t help with programming questions, but I can help you with a safety or legal concern.

Keep the refusal concise.

Do not expose internal guardrail logic.

---

# 5. IMPORTANT: GUARDRAIL MUST NOT BREAK VALID REQUESTS

Do NOT create an overly aggressive keyword-based domain filter.

The following should remain allowed:

> My husband keeps threatening me.

> Someone is following me.

> What should I do if I feel unsafe?

> Can you explain my legal options?

> I don't know what law applies to my situation.

> Can you help me report this?

> I was harassed yesterday.

> What can I do if I don't have evidence?

These requests may not contain obvious keywords.

The guardrail should evaluate semantic relevance, not merely perform a simplistic keyword check.

---

# 6. INPUT GUARDRAIL ARCHITECTURE

Use a lightweight classification step.

Prefer structured output such as:

```text
{
  "allowed": true,
  "domain": "safety | legal | complaint | emergency | app_help | general",
  "reason": "...",
  "requires_rag": true
}
```

For unsupported requests:

```text
{
  "allowed": false,
  "domain": "out_of_domain",
  "reason": "Programming question"
}
```

Do not expose this JSON directly to the user.

The guardrail should execute before expensive domain processing whenever possible.

---

# 7. USE THE SDK'S ACTUAL GUARDRAIL MODEL

Implement proper SDK guardrails rather than recreating them entirely inside the system prompt.

Respect the SDK behavior:

### Input guardrails

Input guardrails should run on the initial input to the first agent in the chain.

Use them for:

- domain validation
- obvious malicious/out-of-domain requests
- unsafe input patterns where appropriate
- request classification

### Output guardrails

Output guardrails should run on the agent that produces the final user-facing answer.

Use them to verify:

- domain compliance
- RAG grounding
- no unsupported legal claims
- no fabricated laws
- no fabricated citations
- no dangerous instructions
- no accidental unrelated general-purpose answer
- response quality

Do not assume input guardrails and output guardrails are interchangeable.

---

# 8. IMPLEMENT RAG AS A REQUIRED GROUNDING PIPELINE

The current system appears to have RAG available but does not consistently use it as the source of the answer.

Fix this.

For domain-relevant questions:

**RAG should be the default source of truth.**

The model should NOT answer from its general knowledge first.

Correct pipeline:

```text
User message
↓
Conversation context
↓
Input guardrail
↓
Query understanding
↓
RAG retrieval
↓
Relevant documents/chunks
↓
Evidence/context assembly
↓
Agent
↓
Tools if needed
↓
Grounded response
↓
Output guardrail
↓
User
```

---

# 9. MAKE RAG CONTEXT VISIBLE TO THE MODEL

Retrieving documents is not enough.

The retrieved content must actually be supplied to the LLM in a form it can use.

Verify that the RAG result is:

- successfully returned
- not discarded
- not stored only in local application state
- not merely logged
- not used only after the model response
- included in the model's actual input/context/instructions

The model should receive something conceptually like:

```text
RETRIEVED KNOWLEDGE

The following information comes from Mehfooz's approved knowledge base.

Use this information as the primary source for your response.

[retrieved chunk 1]

[retrieved chunk 2]

[retrieved chunk 3]
```

Do not blindly dump huge documents into the prompt.

Use the existing retrieval/ranking/chunking architecture.

---

# 10. RAG MUST BE AUTHORITATIVE FOR LEGAL QUESTIONS

For legal questions:

**Never rely on model memory when the approved Mehfooz RAG contains relevant information.**

The model should:

1. retrieve relevant legal material
2. identify the applicable evidence
3. answer using that evidence
4. clearly distinguish facts from interpretation
5. avoid inventing sections, laws, penalties, procedures, or rights

If the RAG does not contain enough information:

Say so.

For example:

> I couldn't find enough information in Mehfooz's verified legal resources to answer that confidently.

Do NOT hallucinate an answer.

---

# 11. RAG CITATIONS / SOURCE ATTRIBUTION

If the current RAG system already provides:

- document name
- law name
- section
- chunk ID
- source metadata
- citation information

preserve it.

Where appropriate, expose useful source references in the final response.

For example:

> According to the Punjab Protection of Women Against Violence Act...

Do not fabricate citations.

If source metadata is available, connect it to the response in the existing application's supported format.

Do not create fake URLs or fake legal references.

---

# 12. DO NOT REQUIRE RAG FOR EVERY SINGLE MESSAGE

Not every message requires retrieval.

Examples:

> Hello

> Thanks

> Okay

> Yes

> No

> Tell me more

These should use conversation context and normal conversational behavior.

However, when a follow-up refers to previous domain information:

> What about the second option?

> What law applies to that?

> Can I report it?

The system must use the previous conversation context to understand what "that" means.

Then retrieve relevant knowledge if necessary.

---

# 13. CONVERSATION CONTEXT IS CURRENTLY BROKEN

The agent currently loses previous-message context.

Fix the conversation architecture.

A conversation must contain BOTH:

```text
USER
ASSISTANT
USER
ASSISTANT
USER
ASSISTANT
```

not only assistant responses.

Every user message must be persisted exactly once.

Every assistant final response must be persisted exactly once.

---

# 14. DO NOT DUPLICATE USER MESSAGES

Before changing message persistence, inspect exactly how `Runner.run()` receives input.

Do NOT blindly do:

```text
save user message
↓
load history
↓
append current user message again
```

if the runner already receives the current message separately.

Determine the actual lifecycle.

The model must receive:

```text
previous conversation
+
current user message
```

exactly once.

---

# 15. USE A REAL CONVERSATION STATE STRATEGY

Use one consistent mechanism.

Depending on the existing architecture, use an appropriate combination of:

- session
- conversation ID
- previous response ID
- `result.to_input_list()`
- persisted conversation history

Do not introduce multiple competing state systems unnecessarily.

The important behavior is:

### Turn 1

User:

> Someone is threatening me.

Agent:

> ...

### Turn 2

User:

> What should I do about it?

Agent must understand that **"it" refers to the threat**.

### Turn 3

User:

> Can I report this?

Agent must understand the same incident.

### Turn 4

User:

> What law protects me?

Agent must understand the same situation and perform appropriate RAG retrieval.

---

# 16. ACTIVE CONVERSATION VS HISTORY

Maintain a distinction between:

### Active conversation

The conversation currently being used.

### Historical conversations

Previously saved conversations.

### New Chat

Explicitly starts a new conversation.

Navigating to another feature must NOT create a new conversation.

Returning to Chat must restore the same active conversation.

Only:

**New Chat**

should intentionally reset the active conversation.

---

# 17. PRESERVE CONTEXT DURING NAVIGATION

The user may do:

```text
Chat
↓
Agent response
↓
Navigate to Complaint
↓
Return to Chat
```

The previous conversation must still be present.

Do not recreate the Chat component in a way that initializes a new conversation.

Audit:

- React mounting/unmounting
- state initialization
- route changes
- conversation IDs
- localStorage/sessionStorage
- backend session state
- Supabase conversation records
- active conversation selection

---

# 18. USE RUN CONTEXT CORRECTLY

Implement a typed application context for local runtime dependencies where appropriate.

For example, conceptually:

```text
MehfoozRunContext
├── userId
├── conversationId
├── userProfile
├── requestId
├── policy
├── ragService
├── logger
└── feature permissions
```

The exact structure should follow the existing application architecture.

Important:

`RunContextWrapper.context` is **local application context**.

It is NOT automatically visible to the LLM.

Do not assume putting information in:

```text
RunContextWrapper.context
```

automatically gives the model that information.

If the model needs information, provide it through:

- conversation history
- agent instructions
- model input
- tool output
- retrieval context

as appropriate.

---

# 19. DO NOT PUT SECRETS INTO RUN CONTEXT

Never place these in serialized/persisted context:

- API keys
- Gemini keys
- Supabase service role keys
- passwords
- vault encryption keys
- Twilio secrets
- Resend secrets
- private tokens

Keep secrets server-side and outside persistent conversation state.

---

# 20. CONTEXT SHOULD INCLUDE RELEVANT USER STATE

Where useful, provide the agent with non-sensitive contextual information such as:

- current conversation ID
- current intent
- incident context
- selected complaint category
- previous relevant assistant/user messages
- application feature state

Do not expose unnecessary private information to the model.

Follow least privilege.

---

# 21. BUILD A STRUCTURED INCIDENT CONTEXT

For safety conversations, maintain a structured internal context when information has actually been provided.

For example:

```text
IncidentContext

category
incident_description
location
time
threat_level
people_involved
requested_support
evidence_mentioned
user_uncertainty
```

Only populate fields with information actually provided by the user or retrieved from trusted application data.

Never invent missing values.

---

# 22. PRESERVE UNCERTAINTY

If the user says:

> I think he followed me yesterday.

Do NOT convert that into:

> He followed you yesterday.

Maintain the uncertainty.

Similarly:

> I think it happened around 8 PM.

must remain approximately 8 PM.

This is especially important when generating complaints or legal summaries.

---

# 23. AGENT SHOULD USE TOOLS INTELLIGENTLY

Do not expose every tool to every request if the SDK supports dynamic capability control.

Use the application context/policy to determine which tools are enabled.

For example:

### Legal question

Enable:

- RAG/legal retrieval
- relevant legal tools

Do not expose unrelated tools.

### Complaint

Enable:

- incident context
- complaint drafting
- relevant organization/channel tools

### Navigation

Enable:

- location/navigation functionality

### App help

Enable:

- Mehfooz feature/help tools

Use the SDK's tool enablement mechanisms where appropriate.

---

# 24. TOOL AUTHORIZATION MUST BE SERVER-SIDE

Dynamic tool visibility is not sufficient security.

Every sensitive tool must independently validate:

- authenticated user
- ownership
- authorization
- input
- resource IDs
- allowed operation

Never trust model-generated arguments.

---

# 25. TOOL INPUT VALIDATION

Where supported, use tool input guardrails for sensitive function tools.

Validate:

- argument types
- required fields
- maximum lengths
- user ownership
- allowed values
- dangerous values

For sensitive actions, reject invalid input rather than silently modifying it.

---

# 26. HANDOFFS MUST ALSO BE VALIDATED

If the application uses handoffs:

Do not assume tool input guardrails protect handoffs.

Validate handoff input at the beginning of the handoff callback before side effects.

Authorization failures must fail safely.

---

# 27. AGENT MUST NOT LOOP

Audit the agent runner carefully.

The execution should be:

```text
Input
↓
Guardrail
↓
Agent
↓
Tool/retrieval if necessary
↓
Tool result
↓
Agent final response
↓
Output guardrail
↓
STOP
```

Do not allow:

```text
Agent
↓
response
↓
agent
↓
response
↓
agent
↓
response
```

unless an actual tool/handoff requires another model step.

Add explicit maximum execution/tool-loop limits.

---

# 28. FIX THE "AGENT IS WORKING" UX

Investigate what the frontend currently displays while the agent is processing.

Do not show a generic/unverified model answer as the final answer before RAG has completed.

The UI may show status such as:

> Understanding your request…

> Checking Mehfooz resources…

> Reviewing relevant legal information…

> Preparing response…

These are status indicators, not fake answers.

Once the grounded final answer is ready:

> display the actual response.

---

# 29. STREAMING MUST NOT BYPASS RAG

If the agent uses streaming:

Do not stream an unrestricted model response before retrieval.

Correct:

```text
retrieve
↓
construct grounded model input
↓
stream grounded generation
```

Not:

```text
start model
↓
stream generic answer
↓
retrieve
↓
replace answer
```

If retrieval itself is slow, show a processing state rather than displaying an ungrounded answer.

---

# 30. FINAL RESPONSE MUST BE GROUNDED

Every domain answer should internally satisfy:

```text
Is this relevant to Mehfooz?
↓
What retrieved evidence supports it?
↓
What did the user actually tell us?
↓
What can we safely conclude?
↓
What must remain uncertain?
↓
What should the response say?
```

The agent should not fill gaps with invented facts.

---

# 31. OUTPUT GUARDRAIL

Add a proper output guardrail to the final agent.

The output guardrail should detect:

### 1. Out-of-domain response

Example:

> Here's how to reverse a linked list...

Reject.

### 2. Unsupported legal claim

Example:

> Section 14 guarantees exactly 30 days of protection...

if the RAG does not support it.

Reject/retry or replace with a safe response.

### 3. Hallucinated source

Example:

> According to the Punjab Women Safety Act 2022...

when no such source exists in the knowledge base.

Reject.

### 4. Unnecessary generic answer

If the response completely ignores available relevant RAG evidence, flag it.

### 5. Unsafe or fabricated information

Reject or regenerate safely.

---

# 32. OUTPUT GUARDRAIL SHOULD NOT CREATE INFINITE RETRIES

If output validation fails:

Attempt a bounded correction.

For example:

```text
maximum 1–2 correction attempts
```

If still invalid:

return a safe fallback.

Never create an unlimited:

```text
generate → validate → generate → validate
```

loop.

---

# 33. RAG GROUNDING CHECK

Where practical, the output guardrail should determine whether the final answer is supported by retrieved evidence.

It does NOT need to require every sentence to be a quotation.

The goal is:

**claims should be supported by the available trusted context.**

Allow normal reasoning and explanation based on retrieved material.

---

# 34. SYSTEM PROMPT / INSTRUCTIONS

Update the agent instructions so the model understands its role.

The instructions should establish:

```text
You are Mehfooz, a domain-specific safety and legal assistant.

You are not a general-purpose assistant.

Your primary purpose is to help users with:
- women's safety
- emergency support
- harassment
- threats
- abuse
- legal navigation
- incident reporting
- complaint preparation
- Mehfooz application features

For domain questions, use the retrieved Mehfooz knowledge as the primary source.

Do not invent laws, sections, penalties, procedures, organizations, facts, or citations.

If the knowledge base does not provide enough information, clearly say that you do not have enough verified information.

Use conversation history to understand follow-up questions.

Never assume missing facts.

Preserve uncertainty.

Keep responses useful and appropriately concise.

For unsupported topics, politely explain that Mehfooz is domain-specific and redirect the user to supported topics.
```

Do not rely on this prompt alone.

The actual guardrails and RAG pipeline must enforce the behavior.

---

# 35. RAG QUERY SHOULD USE CONVERSATION CONTEXT

Do not retrieve based only on the latest sentence.

Bad:

```text
User:
What about reporting it?

RAG query:
"reporting it"
```

Better:

```text
Current message:
"What about reporting it?"

Relevant conversation:
User: Someone has been threatening me.
Assistant: ...
User: What can I do?
Assistant: ...

Resolved retrieval query:
"reporting threats / reporting harassment / available complaint channels"
```

Use the conversation to resolve references such as:

- it
- this
- that
- he
- she
- them
- the incident
- the law
- the second option
- that complaint
- this situation

---

# 36. DO NOT SEND THE ENTIRE DATABASE TO THE MODEL

Retrieve only relevant chunks.

Use the existing:

- semantic retrieval
- keyword retrieval
- ranking
- metadata

where available.

Preserve the current hybrid retrieval architecture if it is working.

Do not replace the existing RAG system unnecessarily.

---

# 37. HANDLE NO-RESULT RAG

If retrieval returns no relevant information:

Do NOT pretend that retrieval succeeded.

Use a safe response such as:

> I couldn't find enough verified information in Mehfooz's knowledge base to answer that confidently.

Then provide only safe, clearly qualified general guidance if the request allows it.

For legal questions, be especially conservative.

---

# 38. FIX COMPLAINT GENERATION CONTEXT

When the user eventually asks to create a complaint/report:

Use the conversation context to construct the incident.

The complaint must be based on:

- user messages
- confirmed incident context
- retrieved relevant information
- explicitly requested support

Do not generate a complaint from only the latest message.

Do not invent:

- dates
- locations
- names
- witnesses
- injuries
- evidence
- legal sections
- threats
- events

---

# 39. USE `incident_summary` CORRECTLY

Audit the existing complaint confirmation flow.

If:

```text
executePrepareComplaintDraft
```

receives:

```text
incident_summary
```

ensure that the value is actually used.

Do not replace it with a placeholder such as:

```text
category | district | draft
```

The complaint summary should represent the actual incident context.

Preserve the user's uncertainty.

---

# 40. CONVERSATION HISTORY LIMIT

Preserve the existing requirement of a maximum of 20 chats/history items.

Do not confuse:

**20 historical conversations**

with:

**20 messages in the active conversation.**

The active conversation should retain enough recent context to function correctly.

If context becomes too large, implement sensible context compaction/summarization rather than arbitrarily deleting important information.

---

# 41. CONTEXT WINDOW MANAGEMENT

Do not blindly send unlimited conversation history to the model.

Implement a safe strategy:

```text
recent conversation messages
+
important incident context
+
relevant retrieved knowledge
+
current user request
```

Prioritize:

1. current user request
2. recent conversation
3. important unresolved incident facts
4. relevant RAG evidence
5. older conversation when needed

Do not summarize away important incident facts.

---

# 42. CONTEXT SUMMARIZATION

If the conversation becomes long, create a structured summary such as:

```text
ConversationSummary

Current situation:
...

Known facts:
...

Uncertain facts:
...

User requested:
...

Relevant legal topic:
...

Actions already discussed:
...
```

The summary must be derived only from conversation content.

Never introduce new facts.

---

# 43. VOICE MODE MUST USE THE SAME CONVERSATION

Voice input and text input must enter the same active conversation.

Example:

```text
User speaks:
"Someone is threatening me."

↓ transcription

User message:
"Someone is threatening me."

↓ same conversation ID

Agent response

↓ user asks another question by voice

same conversation
```

Do not create a separate conversation merely because the input came from voice.

---

# 44. VOICE CLEANUP

When leaving the chat:

- stop speech synthesis
- stop active audio playback
- stop recording if appropriate
- clean up audio streams
- preserve conversation state

Returning to Chat must restore the same conversation.

---

# 45. MODEL BEHAVIOR SHOULD BE CONCISE BUT NOT ARTIFICIALLY TRUNCATED

Do not solve generic responses simply by setting an extremely low `maxOutputTokens`.

A legal/safety answer may legitimately need detail.

Instead:

- instruct the model to answer directly
- avoid unnecessary repetition
- use short sections
- provide actionable steps
- retrieve only relevant evidence
- limit verbosity through instructions

Choose model token limits based on actual response requirements.

Do not truncate legal guidance.

---

# 46. DO NOT LET THE MODEL INVENT RAG SOURCES

The model must never claim:

> According to the RAG...

if it did not actually receive supporting evidence.

Likewise, never fabricate:

- source titles
- section numbers
- document names
- URLs
- citations

---

# 47. RAG SHOULD BE THE PRIMARY SOURCE, NOT THE ONLY SOURCE

The model can reason over retrieved information.

Example:

RAG says:

> A user may report through channel X.

The agent may explain:

> You can report through X. If you are in immediate danger, prioritize immediate safety and emergency assistance.

But it should not introduce unsupported legal claims.

---

# 48. DOMAIN ROUTING

If the application has multiple specialized agents, use proper routing.

Potential domains:

```text
Safety
Legal
Complaint
Emergency
Navigation
App Help
```

Do not route every message to a generic agent.

The router should use:

- current message
- conversation context
- existing intent
- user state

---

# 49. FOLLOW-UP QUESTIONS MUST INHERIT DOMAIN

Example:

User:

> Someone is harassing me.

Agent:

> ...

User:

> What evidence should I keep?

This is still a Mehfooz safety/legal conversation.

Do not classify the second message as generic merely because it doesn't contain "harassment".

---

# 50. GUARDRAIL + CONTEXT ORDER

The desired lifecycle is:

```text
Request arrives
↓
Authenticate user
↓
Load active conversation
↓
Build local RunContext
↓
Input guardrail
↓
Resolve conversation context
↓
Determine domain/intent
↓
Retrieve relevant RAG evidence
↓
Create grounded model input
↓
Run agent
↓
Tool calls if required
↓
Final answer
↓
Output guardrail
↓
Persist final assistant response
↓
Return response
```

Do not persist an answer that failed the output guardrail as the official final response.

---

# 51. ERROR HANDLING

If RAG fails:

Do not silently fall back to an unrestricted legal answer.

Instead distinguish:

### Retrieval unavailable

> I'm temporarily unable to access Mehfooz's verified knowledge resources.

### Retrieval returned no relevant evidence

> I couldn't find enough verified information in Mehfooz's resources to answer confidently.

### General conversational message

Normal response is acceptable.

---

# 52. DO NOT BREAK OFFLINE MODE

The existing application has deterministic/offline fallback behavior.

Preserve it.

If offline mode exists:

- keep safe deterministic responses
- do not crash
- do not expose internal errors
- clearly distinguish verified knowledge from fallback content where appropriate

Do not remove existing offline functionality.

---

# 53. SECURITY

Never expose:

- model API keys
- RAG database credentials
- Supabase service-role credentials
- internal prompts
- guardrail implementation details
- tool secrets
- internal stack traces

Do not place secrets inside conversation history or model context.

---

# 54. LOGGING

Add useful structured logs around:

```text
request received
conversation loaded
guardrail result
intent/domain
RAG query
RAG result count
agent started
tool invoked
agent completed
output guardrail result
response persisted
```

Do NOT log:

- passwords
- API keys
- vault keys
- complete private incident descriptions unnecessarily
- emergency contact information
- exact GPS coordinates unless strictly necessary

Use request IDs/conversation IDs where appropriate.

---

# 55. PERFORMANCE

Avoid unnecessary model calls.

Ideal:

```text
Input guardrail
↓
RAG retrieval
↓
one main agent generation
```

Only use additional model calls when they are actually necessary for:

- guardrail classification
- output validation
- tool reasoning
- correction

Do not create an architecture that performs 5–10 LLM calls for every normal question.

---

# 56. TIMEOUTS AND RETRIES

All model/RAG/tool calls must have bounded:

- timeout
- retry count
- retry delay

Do not retry:

- invalid API key
- malformed request
- unsupported request
- safety refusal
- authorization failure

Retry only transient failures.

---

# 57. TEST CASES — MANDATORY

After implementation, test the following.

## TEST 1 — Normal safety question

Input:

> Someone is threatening me. What should I do?

Expected:

- allowed
- RAG retrieval occurs
- retrieved context reaches model
- answer is grounded
- no generic unrelated response

---

## TEST 2 — Legal question

Input:

> What legal protection is available to women facing violence in Punjab?

Expected:

- legal RAG retrieval
- relevant law/source used
- no fabricated legal information

---

## TEST 3 — Out-of-domain programming

Input:

> How do I reverse a linked list?

Expected:

- input guardrail rejects
- no RAG/legal agent execution
- concise domain refusal
- no programming answer

---

## TEST 4 — Follow-up

Message 1:

> Someone has been threatening me.

Message 2:

> What should I do about it?

Expected:

Second message understands "it".

---

## TEST 5 — Follow-up legal question

Message 1:

> Someone has been threatening me.

Message 2:

> Can I report this?

Expected:

The agent understands the incident context and retrieves appropriate reporting/legal information.

---

## TEST 6 — Pronoun context

Message 1:

> My ex-partner keeps contacting me and threatening me.

Message 2:

> What evidence should I keep?

Expected:

Agent understands who "they" refer to and why evidence matters.

---

## TEST 7 — RAG failure

Temporarily make retrieval unavailable.

Expected:

Agent does not hallucinate legal information.

---

## TEST 8 — RAG empty result

Expected:

Agent clearly says verified information was insufficient.

---

## TEST 9 — Long conversation

Create 15–20 turns.

Expected:

Agent still remembers important facts.

---

## TEST 10 — Navigation

Chat → Complaint → Chat.

Expected:

Same conversation restored.

---

## TEST 11 — New Chat

Existing conversation → New Chat.

Expected:

New conversation created intentionally.

---

## TEST 12 — Voice

Voice message → response → second voice message.

Expected:

Same conversation.

---

## TEST 13 — Output hallucination

Provide a scenario designed to tempt the model to invent a law.

Expected:

Output guardrail catches unsupported claim.

---

## TEST 14 — Tool authorization

Attempt to reference another user's resource ID.

Expected:

Request rejected server-side.

---

# 58. DO NOT BREAK EXISTING FEATURES

This is extremely important.

Do NOT break:

- authentication
- email verification
- onboarding
- private vault
- incident vault
- complaint builder
- complaint PDF
- complaint handoff
- check-in
- emergency alerts
- GPS
- navigation
- voice transcription
- voice playback
- chat history
- offline support
- Supabase
- Twilio
- Resend
- existing RAG documents
- existing UI
- existing routing

Make focused changes.

---

# 59. DO NOT CREATE FAKE SUCCESS STATES

Never show:

> RAG retrieved successfully

unless retrieval actually succeeded.

Never show:

> Complaint submitted

unless it actually was.

Never show:

> Message sent

unless the provider confirmed it.

Never show fake AI/tool progress pretending something happened when it did not.

---

# 60. ACCEPTANCE CRITERIA

The implementation is complete only when all of the following are true:

### RAG

- [ ] Domain questions trigger RAG where appropriate
- [ ] RAG runs before substantive final generation
- [ ] Retrieved evidence reaches the model
- [ ] Legal responses are grounded in approved documents
- [ ] No fabricated citations
- [ ] No-result behavior is safe
- [ ] RAG failure is handled explicitly

### Guardrails

- [ ] Input guardrail exists
- [ ] Out-of-domain requests are rejected
- [ ] Follow-up domain questions remain allowed
- [ ] Output guardrail exists
- [ ] Unsupported legal claims are detected
- [ ] Guardrail retries are bounded

### Context

- [ ] User messages persist
- [ ] Assistant messages persist
- [ ] Messages are not duplicated
- [ ] Follow-up questions understand previous messages
- [ ] Active conversation survives navigation
- [ ] New Chat intentionally resets context
- [ ] Voice uses the same conversation
- [ ] Important incident facts survive long conversations

### Agent execution

- [ ] No unnecessary agent loops
- [ ] Tool calls are bounded
- [ ] Tool authorization is server-side
- [ ] Tool inputs are validated
- [ ] Agent stops after final response

### UX

- [ ] No ungrounded answer shown while RAG is still running
- [ ] Processing state is honest
- [ ] Final answer is grounded
- [ ] Chat state is preserved

---

# 61. FINAL CODE REVIEW

Before finishing, inspect your changes specifically for regressions.

Check:

```text
Does every user message reach the model exactly once?

Does every assistant final response get persisted exactly once?

Can the model see previous conversation turns?

Can the RAG result actually reach the model?

Can an out-of-domain request bypass the guardrail?

Can a legal answer be generated without relevant retrieved evidence?

Can the agent get stuck in a loop?

Can output validation loop forever?

Can navigating away destroy active conversation state?

Can voice create a separate conversation?

Can a user access another user's tools/resources?

Can secrets enter model context or logs?
```

Fix any issue discovered.

---

# 62. FINAL VALIDATION COMMANDS

Run the project's existing validation commands.

At minimum, perform:

```text
TypeScript type checking
Linting if configured
Production build
Existing tests
Agent/RAG tests
```

Do not change dependencies unless necessary.

Do not perform a mass dependency upgrade.

If something fails because of your changes, fix it before reporting completion.

---

# 63. FINAL REPORT

When finished, provide:

### 1. Files changed

List every modified file.

### 2. RAG fixes

Explain exactly how retrieval now reaches the model before final generation.

### 3. Guardrail implementation

Explain:

- input guardrail
- output guardrail
- domain classification
- failure behavior

### 4. Context fixes

Explain how conversation history is now maintained.

### 5. Agent execution fixes

Explain:

- tool lifecycle
- loops
- streaming
- final response

### 6. Tests executed

List actual tests and results.

### 7. Build/typecheck result

Report the real result.

### 8. Remaining limitations

Do not claim perfection.

If something could not be safely fixed, explicitly state it.

---

# ABSOLUTE RULE

**Do not solve this by simply making the system prompt longer.**

The problem is architectural.

The desired architecture is:

```text
                 USER
                   │
                   ▼
          Authentication / Context
                   │
                   ▼
           INPUT GUARDRAIL
                   │
          ┌────────┴────────┐
          │                 │
      OUT OF DOMAIN      DOMAIN
          │                 │
          ▼                 ▼
       REFUSE          CONTEXT RESOLUTION
                            │
                            ▼
                       RAG RETRIEVAL
                            │
                            ▼
                    GROUNDED AGENT INPUT
                            │
                     ┌──────┴──────┐
                     │             │
                   TOOLS        NO TOOLS
                     │             │
                     └──────┬──────┘
                            ▼
                     FINAL RESPONSE
                            │
                            ▼
                    OUTPUT GUARDRAIL
                            │
                     ┌──────┴──────┐
                     │             │
                  INVALID        VALID
                     │             │
                 BOUNDED FIX       ▼
                     │          PERSIST
                     │             │
                     └─────────────┘
                                   │
                                   ▼
                                  USER
```

The most important principle is:

**Mehfooz must behave like a domain-specific, RAG-grounded safety/legal agent with persistent conversational context — not like a general-purpose LLM with a Mehfooz prompt attached to it.**

Do not replace working features.

Do not invent new application functionality.

Do not fake successful retrieval/tool execution.

Inspect first, modify second, test third.