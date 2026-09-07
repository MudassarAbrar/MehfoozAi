/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Context Resolver — Performs conversational entity and pronoun resolution
 * across multi-turn dialogs. Formulates an optimal, resolved search query for
 * RAG retrieval and extracts structured incident facts while faithfully preserving
 * user uncertainty.
 */

import { StoredMessage } from './context.js';

export interface StructuredIncidentContext {
  category?: string;
  location?: string;
  peopleInvolved?: string;
  threatLevel?: 'immediate' | 'ongoing' | 'past';
  timeline?: string;
  uncertaintyPhrases: string[];
}

export interface ContextResolutionResult {
  resolvedQuery: string;
  structuredIncident: StructuredIncidentContext;
  isFollowUp: boolean;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  workplace_harassment: ['workplace', 'office', 'boss', 'manager', 'colleague', 'coworker', 'job', 'employment', 'salary'],
  domestic_violence: ['husband', 'in-laws', 'sas', 'susar', 'home', 'domestic', 'marpeet', 'tashaddud', 'wife', 'beaten'],
  cyber_harassment: ['whatsapp', 'facebook', 'instagram', 'online', 'photos', 'leaked', 'viral', 'video', 'compromise', 'deepfake', 'cyber', 'messages'],
  public_stalking: ['stalking', 'stalker', 'following', 'peechha', 'bus stop', 'market', 'car', 'bike', 'street', 'metro'],
  forced_marriage: ['forced marriage', 'nikah', 'consent', 'quran', 'family pressure'],
  criminal_intimidation: ['threat', 'threaten', 'dhamki', 'kill', 'acid', 'destroy', 'consequences']
};

const UNCERTAINTY_PATTERNS = [
  /\b(i\s+think|i\s+believe|probably|maybe|might\s+be|approximately|around|about|not\s+sure|as\s+far\s+as\s+i\s+remember)\b/gi,
  /\b(شاید|میرا\s+خیال\s+ہے|تقریباً|یقین\s+سے\s+نہیں\s+کہہ\s+سکتی)\b/gi
];

/**
 * Resolves pronoun references and formulates an enriched search query for RAG.
 */
export function resolveConversationContext(
  currentQuery: string,
  language: 'en' | 'ur',
  history: StoredMessage[] = []
): ContextResolutionResult {
  const trimmed = currentQuery.trim();
  const lower = trimmed.toLowerCase();

  // 1. Detect uncertainty phrases in user statement
  const uncertaintyPhrases: string[] = [];
  for (const pattern of UNCERTAINTY_PATTERNS) {
    const matches = trimmed.match(pattern);
    if (matches) {
      uncertaintyPhrases.push(...matches.map(m => m.trim()));
    }
  }

  // 2. Extract structured incident context from the full conversation
  const structuredIncident: StructuredIncidentContext = {
    uncertaintyPhrases
  };

  // Compile full user narrative from history + current message
  const userNarratives = history
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .concat([currentQuery]);
  const combinedUserText = userNarratives.join(' ').toLowerCase();

  // Determine category
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some(kw => combinedUserText.includes(kw))) {
      structuredIncident.category = cat;
      break;
    }
  }

  // Determine threat level
  if (/\b(right now|today|just now|outside right now|urgent|immediately|ابھی|فوری)\b/i.test(combinedUserText)) {
    structuredIncident.threatLevel = 'immediate';
  } else if (/\b(keeps|continuous|every day|repeatedly|روزانہ|مسلسل|بار بار)\b/i.test(combinedUserText)) {
    structuredIncident.threatLevel = 'ongoing';
  } else if (/\b(yesterday|last week|last month|ago|پہلے|گزشتہ)\b/i.test(combinedUserText)) {
    structuredIncident.threatLevel = 'past';
  }

  // Determine location (e.g. Lahore, Rawalpindi, Faisalabad, Multan, or generic 'workplace' / 'home')
  const districtMatch = combinedUserText.match(/\b(lahore|rawalpindi|faisalabad|multan|gujranwala|sialkot|bahawalpur|sargodha|sheikhupura)\b/i);
  if (districtMatch) {
    structuredIncident.location = districtMatch[1].charAt(0).toUpperCase() + districtMatch[1].slice(1);
  }

  // Check if current query is an ambiguous or dependent follow-up
  const isFollowUp = 
    trimmed.split(/\s+/).length <= 7 ||
    /\b(it|this|that|these|the incident|the situation|about it|about this|my options|what should i do|can i report|what evidence)\b/i.test(trimmed);

  // Synthesize resolved query
  let resolvedQuery = trimmed;

  if (isFollowUp && history.length > 0) {
    // Find recent incident details mentioned by user
    const recentUserMsgs = history.filter(m => m.role === 'user').slice(-3);
    const incidentContextSnippets: string[] = [];

    for (const msg of recentUserMsgs) {
      const text = msg.content;
      if (text.length > 5 && !/^(hi|hello|ok|thanks|yes|no)\b/i.test(text.trim())) {
        incidentContextSnippets.push(text);
      }
    }

    if (incidentContextSnippets.length > 0) {
      const contextSummary = incidentContextSnippets.join('; ').slice(0, 150);
      resolvedQuery = `${trimmed} (Context: ${contextSummary}${structuredIncident.category ? `, Category: ${structuredIncident.category}` : ''})`;
    }
  }

  return {
    resolvedQuery,
    structuredIncident,
    isFollowUp
  };
}
