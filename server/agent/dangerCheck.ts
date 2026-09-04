/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Server-side immediate danger detection — deterministic fast path
 * that runs before the agent loop. If the user is in immediate
 * physical danger, we skip the LLM entirely and return a safety alert.
 */

const IMMEDIATE_DANGER_KEYWORDS = [
  'kill', 'killing', 'weapon', 'gun', 'pistol', 'knife', 'chhuri', 'chaku', 'bandook',
  'blood', 'khoon', 'maar dalega', 'mar dalega', 'jaan ko khatra', 'save me', 'bachao',
  'attack in progress', 'beating right now', 'abhi maar raha hai', 'locked in room',
  'kamre mein band', 'acid', 'tezaab', 'burn', 'jalaney ki koshish'
];

/** Returns true if the query contains immediate danger indicators. */
export function checkImmediateDanger(text: string): boolean {
  const normalized = text.toLowerCase();
  return IMMEDIATE_DANGER_KEYWORDS.some(kw => normalized.includes(kw));
}
