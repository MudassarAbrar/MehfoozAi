/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Hybrid Retrieval Engine — Combines Gemini gemini-embedding-2 vector similarity
 * with keyword-based scoring for robust legal corpus retrieval.
 *
 * Server-side: Gemini embeddings (semantic) + keyword boosts (hybrid)
 * Client-side: Keyword scoring only (offline fallback, no API needed)
 *
 * Blending: finalScore = 0.6 × semanticScore + 0.4 × keywordScore
 */

import { PUNJAB_LEGAL_CORPUS, LegalArticle, searchLegalCorpus } from '../data/legalCorpus.js';
import { LegalSourceCitation } from '../types.js';

// ─── Configuration ───────────────────────────────────────────────────────────

const EMBEDDING_WEIGHT = 0.6;
const KEYWORD_WEIGHT = 0.4;
const EMBEDDING_MODEL = 'gemini-embedding-2';

interface ArticleEmbedding {
  articleId: string;
  vector: number[];
}

// ─── Embedding Cache ─────────────────────────────────────────────────────────

let embeddingCache: Map<string, ArticleEmbedding> | null = null;
let embeddingsReady = false;
let embeddingsInitPromise: Promise<void> | null = null;

// ─── Cosine Similarity ───────────────────────────────────────────────────────

/**
 * Cosine similarity between two vectors. Returns value in 0–1 range.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, nA = 0, nB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    nA += a[i] * a[i];
    nB += b[i] * b[i];
  }
  const denom = Math.sqrt(nA) * Math.sqrt(nB);
  return denom === 0 ? 0 : dot / denom;
}

// ─── Gemini Embedding Generation ─────────────────────────────────────────────

/**
 * Generate embedding vector via Gemini gemini-embedding-2.
 */
export async function generateEmbedding(ai: any, text: string): Promise<number[] | null> {
  try {
    const result = await ai.models.embedContent({ model: EMBEDDING_MODEL, contents: text });
    return result?.embeddings?.[0]?.values ?? null;
  } catch (err) {
    console.warn('[HybridRetriever] Embedding generation failed:', err);
    return null;
  }
}

// ─── Pre-compute Article Embeddings ──────────────────────────────────────────

/**
 * Pre-compute embeddings for all corpus articles at server startup.
 */
export async function initializeEmbeddings(ai: any): Promise<void> {
  if (embeddingsReady && embeddingCache) return;
  if (embeddingsInitPromise) return embeddingsInitPromise;

  embeddingsInitPromise = (async () => {
    const unique = new Map<string, LegalArticle>();
    for (const a of PUNJAB_LEGAL_CORPUS) {
      if (!unique.has(a.id)) unique.set(a.id, a);
    }

    console.info('[HybridRetriever] Computing embeddings for', unique.size, 'articles...');
    const cache = new Map<string, ArticleEmbedding>();
    let ok = 0, fail = 0;

    for (const [id, art] of unique) {
      const text = `${art.actTitle} ${art.section} ${art.title} ${art.fullText} ${art.keywords.join(' ')}`;
      const vec = await generateEmbedding(ai, text);
      if (vec) {
        cache.set(id, { articleId: id, vector: vec });
        ok++;
      } else {
        fail++;
      }
      await new Promise(r => setTimeout(r, 100));
    }

    embeddingCache = cache;
    embeddingsReady = true;
    console.info(`[HybridRetriever] Ready: ${ok} ok, ${fail} failed / ${unique.size} total`);
  })();
  return embeddingsInitPromise;
}

export function areEmbeddingsReady(): boolean {
  return embeddingsReady && embeddingCache !== null && embeddingCache.size > 0;
}

// ─── Keyword Scoring ─────────────────────────────────────────────────────────

function keywordScore(query: string, art: LegalArticle): number {
  const n = query.toLowerCase();
  let s = 0;

  for (const kw of art.keywords) {
    if (n.includes(kw.toLowerCase())) s += 2.5;
  }
  for (const w of art.title.toLowerCase().split(/\s+/)) {
    if (w.length > 3 && n.includes(w)) s += 1.0;
  }

  // Domain-specific boosts — original corpus
  if (['work','office','boss','naukri'].some(k => n.includes(k)) && art.id === 'workplace_act_2010') s += 5;
  if (['ghar','husband','shohar','beat','marpeet','control'].some(k => n.includes(k)) && art.id.startsWith('ppwva')) s += 4;
  if (['dhamki','threat','maar dalunga','kill'].some(k => n.includes(k)) && art.id === 'ppc_sec_506') s += 4.5;
  if (['photo','video','blackmail','whatsapp','online'].some(k => n.includes(k)) && art.id === 'peca_sec_20_21') s += 5;

  // Domain-specific boosts — expanded corpus
  if (['honor','karo kari','ghairat','izzat'].some(k => n.includes(k)) && art.id === 'honor_killing_2016') s += 5;
  if (['rape','sexual assault','ziyadti','molestation'].some(k => n.includes(k)) && art.id === 'anti_rape_2016') s += 5;
  if (['acid','tezaab','jalna'].some(k => n.includes(k)) && art.id === 'acid_crime_ppc_336') s += 5;
  if (['child marriage','bachon ki shadi','underage','nai umar'].some(k => n.includes(k)) && art.id === 'child_marriage_1929') s += 5;
  if (['dowry','jahez','jahiz'].some(k => n.includes(k)) && art.id === 'dowry_act_1976') s += 5;
  if (['talaq','divorce','khula','nikah','polygamy'].some(k => n.includes(k)) && art.id === 'muslim_family_laws_1961') s += 5;
  if (['custody','hizanat','bache','guardian'].some(k => n.includes(k)) && art.id === 'guardians_wards_act_1890') s += 5;
  if (['vani','swara','forced marriage','inheritance','miras'].some(k => n.includes(k)) && art.id === 'anti_women_practices_2011') s += 5;
  if (['trafficking','forced labor','begar','bonded'].some(k => n.includes(k)) && art.id === 'trafficking_2018') s += 5;
  if (['transgender','khawaja sara','hijra','third gender'].some(k => n.includes(k)) && art.id === 'transgender_act_2018') s += 5;
  if (['domestic worker','naukrani','maid','kaam wali'].some(k => n.includes(k)) && art.id === 'domestic_workers_punjab_2019') s += 5;
  if (['kidnap','aghwa','utha le gaya'].some(k => n.includes(k)) && art.id === 'ppc_sec_366_366b') s += 5;
  if (['inheritance','miras','wirasat','jaidad','property share'].some(k => n.includes(k)) && art.id === 'inheritance_rights_islamic') s += 4.5;
  if (['safe cities','psca','cctv','emergency 15'].some(k => n.includes(k)) && art.id === 'punjab_safe_cities_2015') s += 5;
  if (['maintenance','nan nafqa','kharcha','allowance'].some(k => n.includes(k)) && art.id === 'maintenance_crpc_488') s += 5;
  if (['stalking','peecha','following','spy'].some(k => n.includes(k)) && art.id === 'stalking_ppc_509_expanded') s += 5;
  if (['mental health','depression','trauma','ptsd','suicidal'].some(k => n.includes(k)) && art.id === 'mental_health_punjab_2014') s += 5;
  if (['disability','disabled','handicap','wheelchair','maazoor'].some(k => n.includes(k)) && art.id === 'disabilities_punjab_2020') s += 5;
  if (['child abuse','child labor','corporal punishment'].some(k => n.includes(k)) && art.id === 'child_protection_punjab_2019') s += 5;
  if (['home worker','home based','piece rate','sewing at home'].some(k => n.includes(k)) && art.id === 'home_workers_punjab_2019') s += 5;
  if (['family court','dispute','reconciliation'].some(k => n.includes(k)) && art.id === 'family_courts_act_1964') s += 5;

  // Default baseline for general legal queries
  if (s === 0 && ['law','haq','help','rights'].some(k => n.includes(k))) {
    if (art.id === 'ppwva_sec_3' || art.id === 'ppwva_sec_7') s = 1.0;
  }
  return s;
}

// ─── Hybrid Search ───────────────────────────────────────────────────────────

/**
 * Hybrid search: semantic embeddings + keyword scoring.
 * Falls back to keyword-only when embeddings are unavailable.
 */
export async function hybridSearch(query: string, ai?: any, limit: number = 3): Promise<LegalSourceCitation[]> {
  if (!ai || !areEmbeddingsReady() || !embeddingCache) {
    return searchLegalCorpus(query, limit);
  }

  const qEmb = await generateEmbedding(ai, query);
  if (!qEmb) {
    console.warn('[HybridRetriever] Query embedding failed, keyword fallback');
    return searchLegalCorpus(query, limit);
  }

  const unique = new Map<string, LegalArticle>();
  for (const a of PUNJAB_LEGAL_CORPUS) {
    if (!unique.has(a.id)) unique.set(a.id, a);
  }

  const scored: { art: LegalArticle; hybrid: number }[] = [];
  for (const [id, art] of unique) {
    const cached = embeddingCache.get(id);
    if (!cached) continue;
    const sem = cosineSimilarity(qEmb, cached.vector);
    const kw = Math.min(1.0, keywordScore(query, art) / 15.0);
    const hybrid = EMBEDDING_WEIGHT * sem + KEYWORD_WEIGHT * kw;
    scored.push({ art, hybrid });
  }

  scored.sort((a, b) => b.hybrid - a.hybrid);
  const top = scored.filter(s => s.hybrid > 0.05).slice(0, limit);
  const results = top.length > 0 ? top : scored.slice(0, 2);

  return results.map(({ art, hybrid }) => ({
    document: art.actTitle,
    documentUrdu: art.actTitleUrdu,
    section: art.section,
    sectionTitle: art.title,
    sectionTitleUrdu: art.titleUrdu,
    excerpt: art.summary,
    excerptUrdu: art.summaryUrdu,
    relevanceScore: Math.min(0.99, Math.max(0.65, 0.6 + hybrid * 0.4)),
    chunkId: art.id,
    jurisdiction: art.jurisdiction,
    url: art.url || 'https://pcsw.punjab.gov.pk/'
  }));
}

/** Synchronous keyword-only search for client-side / offline use. */
export function keywordSearch(query: string, limit: number = 3): LegalSourceCitation[] {
  return searchLegalCorpus(query, limit);
}

/** Retriever status metadata for health checks. */
export function getRetrieverStatus() {
  return {
    embeddingsReady,
    embeddingCount: embeddingCache?.size ?? 0,
    totalArticles: PUNJAB_LEGAL_CORPUS.length,
    embeddingModel: EMBEDDING_MODEL,
    embeddingWeight: EMBEDDING_WEIGHT,
    keywordWeight: KEYWORD_WEIGHT
  };
}
