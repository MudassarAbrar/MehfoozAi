/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Output Guardrail — Validates the final generated agent response before delivery.
 *
 * Checks:
 * 1. Out-of-domain drift (code generation, recipes, math solutions).
 * 2. Fabricated / hallucinated statutes or non-existent Pakistani Acts.
 * 3. Dangerous instructions (e.g., advising direct confrontation with an abuser).
 * 4. Unsupported definitive legal assertions when RAG evidence was insufficient.
 *
 * Provides a bounded single-retry mechanism with explicit critique. If the correction
 * still fails, applies a safe deterministic fallback.
 */

import { GoogleGenAI } from '@google/genai';
import { AgentCitation } from './schemas.js';

export interface OutputGuardrailResult {
  valid: boolean;
  cleanText: string;
  violations: string[];
}

// Approved Punjab/Pakistan statutory references
const APPROVED_ACT_PATTERNS = [
  /Punjab\s+Protection\s+of\s+Women\s+Against\s+Violence\s+Act/i,
  /PPWVA/i,
  /Protection\s+Against\s+Harassment\s+of\s+Women\s+at\s+the\s+Workplace\s+Act/i,
  /Workplace\s+Harassment\s+Act/i,
  /Pakistan\s+Penal\s+Code/i,
  /PPC/i,
  /Prevention\s+of\s+Electronic\s+Crimes\s+Act/i,
  /PECA/i,
  /Punjab\s+Commission\s+on\s+the\s+Status\s+of\s+Women/i,
  /Muslim\s+Family\s+Laws\s+Ordinance/i,
  /Family\s+Courts\s+Act/i,
  /تحفظ\s+نسواں/u,
  /ہراسانی/u,
  /تعزیرات\s+پاکستان/u,
  /الیکٹرانک\s+کرائمز/u
];

// Common hallucinated / non-existent statutes to catch
const HALLUCINATED_ACT_PATTERNS = [
  /Punjab\s+Women\s+Safety\s+Act\s+(202[0-9]|2019)/i,
  /National\s+Harassment\s+Code/i,
  /Federal\s+Women\s+Protection\s+Bill/i,
  /Pakistan\s+Domestic\s+Violence\s+Act\s+202/i,
  /Punjab\s+Emergency\s+Safety\s+Act/i
];

// Dangerous physical action suggestions
const DANGEROUS_ADVICE_PATTERNS = [
  /\b(confront\s+(the\s+)?(abuser|attacker|stalker|aggressor)\s+alone)\b/i,
  /\b(fight\s+back\s+physically\s+instead\s+of\s+calling)\b/i,
  /\b(do\s+not\s+(call|contact)\s+the\s+police)\b/i,
  /\b(meet\s+him\s+in\s+private\s+to\s+resolve)\b/i
];

// Out-of-domain code or mathematical answers
const OUT_OF_DOMAIN_RESPONSE_PATTERNS = [
  /```(python|javascript|typescript|c\+\+|java|rust|html|css|sql|bash)\b/i,
  /\bdef\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*:/,
  /\bfunction\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*\{/,
  /\bint\s+main\s*\(\s*\)/,
  /\b(ingredients|recipe):\s*(\n|\r)+-\s+/i
];

/**
 * Validates the generated text and identifies any safety, hallucination, or domain violations.
 */
export function auditResponseQuality(
  text: string,
  hasSufficientEvidence: boolean,
  citations: AgentCitation[] = []
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  // 1. Out-of-domain content check
  for (const pattern of OUT_OF_DOMAIN_RESPONSE_PATTERNS) {
    if (pattern.test(text)) {
      violations.push('Response contains out-of-domain code or recipe formatting');
      break;
    }
  }

  // 2. Dangerous advice check
  for (const pattern of DANGEROUS_ADVICE_PATTERNS) {
    if (pattern.test(text)) {
      violations.push('Response contains potentially dangerous advice advising private confrontation');
      break;
    }
  }

  // 3. Hallucinated statutes check
  for (const pattern of HALLUCINATED_ACT_PATTERNS) {
    if (pattern.test(text)) {
      violations.push('Response cites a non-existent or fabricated statutory Act');
      break;
    }
  }

  // 4. Unsupported legal claims if evidence was insufficient
  if (!hasSufficientEvidence) {
    const mentionsSpecificSection = /\b(section\s+\d+|دفعہ\s+\d+)\b/i.test(text);
    const mentionsMandatoryPenalty = /\b(mandatory\s+\d+\s+years|rigorous\s+imprisonment\s+of\s+\d+)\b/i.test(text);
    if (mentionsSpecificSection || mentionsMandatoryPenalty) {
      violations.push('Response claims specific statutory sections or penal terms when no verified evidence was retrieved');
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Validates and if necessary applies a bounded single correction pass to the response.
 */
export async function validateOutputGuardrail(
  originalText: string,
  language: 'en' | 'ur',
  hasSufficientEvidence: boolean,
  citations: AgentCitation[],
  client: GoogleGenAI,
  modelName: string
): Promise<OutputGuardrailResult> {
  const audit = auditResponseQuality(originalText, hasSufficientEvidence, citations);

  if (audit.valid) {
    return {
      valid: true,
      cleanText: originalText,
      violations: []
    };
  }

  console.warn('[Output Guardrail] Detected violations in response:', audit.violations);

  // Attempt a single bounded correction
  try {
    const critiquePrompt = `CRITICAL CORRECTION REQUIRED:
The previous response had the following policy violations:
${audit.violations.map(v => `- ${v}`).join('\n')}

Original Text:
"""
${originalText}
"""

Please rewrite this response strictly in ${language === 'ur' ? 'Urdu' : 'English'}.
Requirements:
1. Ground legal statements only in verified Punjab laws (PPWVA 2016, Harassment Act 2010, PPC 506/509, PECA 2016).
2. If evidence was insufficient, explicitly state: "I couldn't find enough verified information in Mehfooz's legal resources to answer that confidently."
3. Do not include programming code, recipes, or dangerous advice.
4. Keep the tone empathetic, concise, and focused on women's safety.`;

    const correctionResponse = await client.models.generateContent({
      model: modelName,
      contents: critiquePrompt,
      config: { maxOutputTokens: 1000 }
    });

    const correctedText = correctionResponse?.text?.trim();
    if (correctedText) {
      const secondAudit = auditResponseQuality(correctedText, hasSufficientEvidence, citations);
      if (secondAudit.valid) {
        return {
          valid: true,
          cleanText: correctedText,
          violations: audit.violations
        };
      }
    }
  } catch (err: any) {
    console.warn('[Output Guardrail] Correction pass failed:', err?.message);
  }

  // Safe fallback if correction failed or still had violations
  const isUrdu = language === 'ur';
  const safeFallback = isUrdu
    ? 'محفوظ کے تصدیق شدہ قانونی ذرائع کے مطابق، خواتین کے تحفظ کے لیے پنجاب تحفظ نسواں ایکٹ 2016 اور کام کی جگہ پر ہراسانی کا ایکٹ 2010 بنیادی قوانین ہیں۔ اگر آپ کو فوری خطرہ ہے تو 15 پر کال کریں، یا مفت رہنمائی کے لیے پنجاب ویمن ہیلپ لائن 1043 پر رابطہ کریں۔'
    : 'According to Mehfooz’s verified legal knowledge base, key protections include the Punjab Protection of Women Against Violence Act 2016 and the Workplace Harassment Act 2010. If you are in immediate danger, please dial 15. For verified free legal guidance, contact the Punjab Women Helpline at 1043.';

  return {
    valid: false,
    cleanText: safeFallback,
    violations: audit.violations
  };
}
