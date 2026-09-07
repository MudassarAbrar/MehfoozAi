/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * RAG Retriever — Performs pre-execution retrieval from the Punjab legal corpus
 * using the hybrid embedding + keyword search engine. Injects authoritative evidence
 * into the Gemini prompt BEFORE the model reasons or produces a response, preventing
 * generic model hallucinations.
 */

import { hybridSearch } from '../../src/utils/hybridRetriever.js';
import { AgentCitation } from './schemas.js';

export interface GroundedEvidenceResult {
  citations: AgentCitation[];
  evidencePrompt: string;
  hasSufficientEvidence: boolean;
}

/**
 * Retrieves grounded legal evidence from the Punjab legal corpus
 * and formats the authoritative evidence prompt for Gemini.
 */
export async function retrieveGroundedEvidence(
  query: string,
  ai: any,
  language: 'en' | 'ur' = 'en',
  limit: number = 4
): Promise<GroundedEvidenceResult> {
  const isUrdu = language === 'ur';

  try {
    const rawCitations = await hybridSearch(query, ai, limit);

    if (!rawCitations || rawCitations.length === 0) {
      return {
        citations: [],
        hasSufficientEvidence: false,
        evidencePrompt: buildNoEvidencePrompt(isUrdu)
      };
    }

    const citations: AgentCitation[] = rawCitations.map(c => ({
      sourceId: c.chunkId,
      title: isUrdu && c.sectionTitleUrdu ? c.sectionTitleUrdu : c.sectionTitle,
      statute: isUrdu && c.documentUrdu ? c.documentUrdu : c.document,
      section: c.section,
      summary: isUrdu && c.excerptUrdu ? c.excerptUrdu : c.excerpt,
      url: c.url
    }));

    const evidencePrompt = buildEvidencePrompt(citations, isUrdu);

    return {
      citations,
      hasSufficientEvidence: true,
      evidencePrompt
    };
  } catch (err: any) {
    console.warn('[RAG Retriever] Hybrid retrieval error, proceeding with fallback:', err?.message);
    return {
      citations: [],
      hasSufficientEvidence: false,
      evidencePrompt: buildNoEvidencePrompt(isUrdu)
    };
  }
}

function buildEvidencePrompt(citations: AgentCitation[], isUrdu: boolean): string {
  const chunks = citations.map((c, idx) => {
    return `[Evidence Item ${idx + 1}: ${c.statute} — ${c.section}: ${c.title}]\nSummary: ${c.summary}`;
  }).join('\n\n');

  return `=== RETRIEVED PUNJAB LEGAL KNOWLEDGE BASE EVIDENCE ===
The following information comes from Mehfooz's approved Punjab legal knowledge base.
Use this information as the primary authoritative source for your response.
Do NOT answer from general model memory if it contradicts or exceeds this verified evidence.
Do NOT invent statutory sections, acts, case law, phone numbers, or penalties not present here.

${chunks}
========================================================`;
}

function buildNoEvidencePrompt(isUrdu: boolean): string {
  return `=== NOTICE: NO VERIFIED LEGAL EVIDENCE FOUND ===
No verified Punjab statutes in Mehfooz's legal knowledge base matched this specific legal question with sufficient confidence.
CRITICAL INSTRUCTION: You MUST explicitly state in your response:
${isUrdu 
  ? '"محفوظ (Mehfooz) کے تصدیق شدہ قانونی ذرائع میں اس سوال کے متعلق کافی معلومات نہیں مل سکیں۔"'
  : '"I couldn’t find enough verified information in Mehfooz’s legal resources to answer that confidently."'}
Do NOT invent or hallucinate any statutory acts, sections, procedures, or penalties.
You may only offer practical, safe safety planning or suggest consulting Punjab Women Helpline 1043.
=================================================`;
}
