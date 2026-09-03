/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PUNJAB_SUPPORT_DIRECTORY } from '../data/supportDirectory';
import { PUNJAB_LEGAL_CORPUS, LegalArticle } from '../data/legalCorpus';
import { SupportResource } from '../types';

const OFFLINE_CACHE_VERSION = 'mehfooz_offline_cache_v2';
const OFFLINE_CACHE_METADATA_KEY = 'mehfooz_offline_cache_meta';
const OFFLINE_DIRECTORY_KEY = 'mehfooz_offline_directory';
const OFFLINE_LEGAL_KEY = 'mehfooz_offline_legal_corpus';

export interface OfflineCacheMetadata {
  version: string;
  lastCachedAt: string;
  totalDirectoryEntries: number;
  totalLegalArticles: number;
  verified: boolean;
}

export interface OfflineEmergencyHotline {
  id: string;
  name: string;
  nameUrdu: string;
  number: string;
  category: 'police' | 'legal' | 'rescue' | 'cyber';
  is24x7: boolean;
  notes: string;
  notesUrdu: string;
}

export const CRITICAL_OFFLINE_HOTLINES: OfflineEmergencyHotline[] = [
  {
    id: 'psca_15',
    name: 'Punjab Police & PSCA Emergency',
    nameUrdu: 'پنجاب پولیس و سیف سٹیز ایمرجنسی',
    number: '15',
    category: 'police',
    is24x7: true,
    notes: 'Direct 24/7 emergency dispatch across all 36 districts of Punjab.',
    notesUrdu: 'تمام پنجاب میں فوری ایمرجنسی پولیس مدد۔'
  },
  {
    id: 'pcsw_1043',
    name: 'Punjab Women Helpline',
    nameUrdu: 'پنجاب وومن ہیلپ لائن (PCSW)',
    number: '1043',
    category: 'legal',
    is24x7: true,
    notes: 'Free legal counseling, harassment tracking, and protection officer dispatch.',
    notesUrdu: 'مفت قانونی رہنمائی اور پروٹیکشن افسران سے فوری رابطہ۔'
  },
  {
    id: 'rescue_1122',
    name: 'Punjab Emergency Ambulance & Rescue',
    nameUrdu: 'ریسکیو 1122 ایمرجنسی سروس',
    number: '1122',
    category: 'rescue',
    is24x7: true,
    notes: 'Immediate medical ambulance and trauma support.',
    notesUrdu: 'فوری ایمبولینس اور ہنگامی طبی امداد۔'
  },
  {
    id: 'drf_cyber',
    name: 'Digital Rights Cyber Harassment Helpline',
    nameUrdu: 'ڈیجیٹل رائٹس سائبر ہراسانی ہیلپ لائن',
    number: '080039393',
    category: 'cyber',
    is24x7: false,
    notes: 'Confidential legal & technical advice for online blackmail and photo leaks.',
    notesUrdu: 'سوشل میڈیا بلیک میلنگ اور تصاویر کے غلط استعمال پر مفت قانونی مشاورت۔'
  },
  {
    id: 'fia_1991',
    name: 'FIA Cyber Crime Official Wing',
    nameUrdu: 'ایف آئی اے سائبر کرائم ونگ',
    number: '1991',
    category: 'cyber',
    is24x7: true,
    notes: 'Federal statutory agency for PECA cyber harassment FIR registration.',
    notesUrdu: 'سائبر کرائم کی باضابطہ شکایت اور کارروائی کے لیے وفاقی ادارہ۔'
  }
];

/**
 * Initializes and persists the complete offline emergency cache to browser storage.
 * Runs on application start and whenever cache refresh is requested.
 */
export function initializeOfflineEmergencyCache(): OfflineCacheMetadata {
  try {
    const existingMetaRaw = localStorage.getItem(OFFLINE_CACHE_METADATA_KEY);
    if (existingMetaRaw) {
      const existingMeta: OfflineCacheMetadata = JSON.parse(existingMetaRaw);
      if (existingMeta.version === OFFLINE_CACHE_VERSION && existingMeta.verified) {
        return existingMeta;
      }
    }

    // Persist complete support directory and legal corpus
    localStorage.setItem(OFFLINE_DIRECTORY_KEY, JSON.stringify(PUNJAB_SUPPORT_DIRECTORY));
    localStorage.setItem(OFFLINE_LEGAL_KEY, JSON.stringify(PUNJAB_LEGAL_CORPUS));

    const meta: OfflineCacheMetadata = {
      version: OFFLINE_CACHE_VERSION,
      lastCachedAt: new Date().toISOString(),
      totalDirectoryEntries: PUNJAB_SUPPORT_DIRECTORY.length,
      totalLegalArticles: PUNJAB_LEGAL_CORPUS.length,
      verified: true,
    };

    localStorage.setItem(OFFLINE_CACHE_METADATA_KEY, JSON.stringify(meta));
    return meta;
  } catch (err) {
    console.warn('LocalStorage offline cache allocation fallback:', err);
    return {
      version: OFFLINE_CACHE_VERSION,
      lastCachedAt: new Date().toISOString(),
      totalDirectoryEntries: PUNJAB_SUPPORT_DIRECTORY.length,
      totalLegalArticles: PUNJAB_LEGAL_CORPUS.length,
      verified: true,
    };
  }
}

/**
 * Retrieves the cached support directory directly from memory/local storage.
 */
export function getOfflineSupportDirectory(): SupportResource[] {
  try {
    const raw = localStorage.getItem(OFFLINE_DIRECTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading offline directory cache, using bundled memory:', err);
  }
  return PUNJAB_SUPPORT_DIRECTORY;
}

/**
 * Retrieves the cached legal corpus directly from memory/local storage.
 */
export function getOfflineLegalCorpus(): LegalArticle[] {
  try {
    const raw = localStorage.getItem(OFFLINE_LEGAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading offline legal corpus cache, using bundled memory:', err);
  }
  return PUNJAB_LEGAL_CORPUS;
}

/**
 * Fast offline search across legal corpus and directory
 */
export function searchOfflineEmergencyIndex(query: string) {
  const norm = query.toLowerCase().trim();
  const directory = getOfflineSupportDirectory();
  const legal = getOfflineLegalCorpus();

  const matchedResources = directory.filter(res => 
    res.name.toLowerCase().includes(norm) ||
    (res.nameUrdu && res.nameUrdu.includes(norm)) ||
    res.district.toLowerCase().includes(norm) ||
    res.category.toLowerCase().includes(norm) ||
    (res.helpline && res.helpline.includes(norm)) ||
    res.description.toLowerCase().includes(norm)
  );

  const matchedLaws = legal.filter(law =>
    law.actTitle.toLowerCase().includes(norm) ||
    law.section.toLowerCase().includes(norm) ||
    law.title.toLowerCase().includes(norm) ||
    law.keywords.some(kw => kw.toLowerCase().includes(norm)) ||
    law.summary.toLowerCase().includes(norm)
  );

  return {
    matchedResources,
    matchedLaws,
    isOfflineResult: true,
    timestamp: new Date().toISOString()
  };
}

/**
 * Returns current status of offline readiness
 */
export function getOfflineReadinessStatus(): {
  isReady: boolean;
  entriesCount: number;
  lawsCount: number;
  lastCached: string;
} {
  try {
    const metaRaw = localStorage.getItem(OFFLINE_CACHE_METADATA_KEY);
    if (metaRaw) {
      const meta: OfflineCacheMetadata = JSON.parse(metaRaw);
      return {
        isReady: meta.verified,
        entriesCount: meta.totalDirectoryEntries,
        lawsCount: meta.totalLegalArticles,
        lastCached: meta.lastCachedAt,
      };
    }
  } catch {
    // Fallback to static counts
  }

  return {
    isReady: true,
    entriesCount: PUNJAB_SUPPORT_DIRECTORY.length,
    lawsCount: PUNJAB_LEGAL_CORPUS.length,
    lastCached: new Date().toISOString(),
  };
}
