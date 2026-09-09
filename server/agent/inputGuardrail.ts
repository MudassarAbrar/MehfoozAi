/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Input Guardrail — Evaluates whether incoming requests belong to the
 * Mehfooz safety, legal, incident, emergency, or application domain.
 *
 * Core Principles:
 * 1. Strict domain boundaries: rejects non-domain requests (coding, calculus, recipes, sports, resumes).
 * 2. Conversational context awareness: follow-up turns ("What should I do about it?", "Can I report this?")
 *    inherit the conversation domain from prior turns and are NEVER falsely rejected.
 * 3. Semantic safety: realistic user expressions without technical keywords ("My husband keeps threatening me",
 *    "Someone is following me", "I was harassed yesterday") are always recognized as valid.
 * 4. Structured classification output: specifies domain, allowed status, RAG requirement, and polite refusal if needed.
 */

import { StoredMessage } from './context.js';

export type DomainType =
  | 'safety'
  | 'legal'
  | 'complaint'
  | 'emergency'
  | 'app_help'
  | 'general'
  | 'out_of_domain';

export interface InputGuardrailResult {
  allowed: boolean;
  domain: DomainType;
  reason: string;
  requires_rag: boolean;
  refusalMessage?: string;
  detectedTopic?: string;
}

// Clear out-of-domain patterns (software engineering, homework, culinary, general trivia)
const OUT_OF_DOMAIN_PATTERNS: Array<{ regex: RegExp; topicEn: string; topicUr: string }> = [
  {
    regex: /\b(write|create|debug|fix|compile|refactor)\s+(a\s+)?(python|javascript|typescript|c\+\+|java|rust|go|php|ruby|sql|html|css|react|node|docker|kubernetes|bash)\s+(code|script|program|app|function|query|component)\b/i,
    topicEn: 'programming or code generation',
    topicUr: 'پروگرامنگ یا کوڈنگ'
  },
  {
    regex: /\b(calculate|solve|find the (integral|derivative|limit)|differential equation|calculus|matrix multiplication|quadratic equation|pythagorean theorem)\b/i,
    topicEn: 'mathematics or homework problems',
    topicUr: 'ریاضی یا ہوم ورک کے سوالات'
  },
  {
    regex: /\b(recipe for|how to cook|ingredients for|how to bake|make biryani|make nihari|bake cake|roast chicken)\b/i,
    topicEn: 'cooking or culinary recipes',
    topicUr: 'کھانا پکانے یا ترکیبوں'
  },
  {
    regex: /\b(who won the (ipl|psl|match|world cup|game)|cricket score|football score|champions league)\b/i,
    topicEn: 'sports scores or entertainment trivia',
    topicUr: 'کھیلوں کے نتائج یا تفریحی معلومات'
  },
  {
    regex: /\b(write my resume|cv for software|cover letter for (job|software|engineer|developer|marketing))\b/i,
    topicEn: 'resume or job application writing',
    topicUr: 'سی وی یا ملازمت کی درخواست لکھنے'
  },
  {
    regex: /\b(quantum physics|black hole|astronomy|general relativity|string theory|photosynthesis process)\b/i,
    topicEn: 'academic physics or science questions',
    topicUr: 'سائنسی یا طبیعیاتی سوالات'
  }
];

// Safety, violence, harassment, threat, domestic, or legal keywords (broad inclusion)
const DOMAIN_INDICATORS = [
  // Safety & violence
  'unsafe', 'safe', 'threat', 'threaten', 'threats', 'dhamki', 'follow', 'following', 'chase',
  'stalk', 'stalker', 'stalking', 'peechha', 'harass', 'harassment', 'abuse', 'abusive',
  'domestic', 'marpeet', 'tashaddud', 'violence', 'hit', 'beaten', 'strike', 'assault', 'attack',
  'blackmail', 'extort', 'photos', 'leaked', 'viral', 'video', 'compromise', 'deepfake',
  // Emergency
  'emergency', 'help', 'danger', 'scared', 'afraid', 'khauf', 'khatra', 'call 15', 'police',
  'fir', 'chowki', 'thana', 'dar-ul-aman', 'shelter', 'hospital', '1122', '1043',
  // Legal & rights
  'law', 'legal', 'right', 'rights', 'kanoon', 'section', 'act', 'ppwva', 'peca', 'ppc',
  'ombudsperson', 'ombudsman', 'court', 'judge', 'magistrate', 'divorce', 'talaq', 'khula',
  'maintenance', 'kharcha', 'custody', 'dower', 'haq mehr', 'protection order', 'residence order',
  'workplace', 'boss', 'manager', 'colleague', 'coworker', 'colleague', 'office',
  // Actions & reporting
  'report', 'complaint', 'dar-khawast', 'evidence', 'proof', 'saboot', 'record', 'vault',
  'check-in', 'checkin', 'tracking', 'status', 'petition', 'complaint draft'
];

// General polite conversational patterns (allowed, but requires_rag = false)
const GENERAL_CONVERSATIONAL_REGEX = /^(hi|hello|hey|salam|assalam|assalamu\s+alaikum|adab|good\s+(morning|afternoon|evening)|thank\s+you|thanks|shukriya|jazakallah|ok|okay|bye|goodbye|who\s+are\s+you|what\s+can\s+you\s+do|how\s+can\s+you\s+help|what\s+is\s+mehfooz)\b/i;

// Ambiguous or context-dependent follow-ups
const FOLLOWUP_REGEX = /^(what\s+should\s+i\s+do(\s+about\s+it)?|can\s+i\s+report\s+(this|it)|what\s+evidence(\s+should\s+i\s+keep|\s+do\s+i\s+need)?|what\s+about\s+the\s+(first|second|other)\s+option|how\s+does\s+that\s+help|what\s+law\s+applies|will\s+they\s+arrest|what\s+if\s+i\s+don't\s+have\s+proof|can\s+my\s+family\s+find\s+out|how\s+long\s+does\s+it\s+take|go\s+ahead|yes|no|tell\s+me\s+more|continue)\b/i;

/**
 * PII Redaction Helper — Masks CNICs, Pakistani phone numbers, and email addresses
 * to prevent sensitive personal identifiers from being sent to external LLMs.
 */
export function redactPII(text: string): string {
  if (!text) return text;
  let sanitized = text;

  // Mask Pakistani CNIC numbers (e.g. 35202-1234567-8 or 3520212345678)
  sanitized = sanitized.replace(/\b\d{5}[-–\s]?\d{7}[-–\s]?\d\b/g, '[CNIC REDACTED]');

  // Mask Pakistani Mobile & Landline Phone Numbers (e.g. +923001234567, 0300-1234567, 042-35763234)
  sanitized = sanitized.replace(/\b(\+92|0)(3\d{2}|4[1-9]|51|21)[-–\s]?\d{7}\b/g, '[PHONE REDACTED]');

  // Mask Email Addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL REDACTED]');

  return sanitized;
}

/**
 * Structural Prompt Injection Detector — Intercepts malicious jailbreak overrides.
 */
export function detectPromptInjection(query: string): boolean {
  if (!query) return false;
  const lower = query.toLowerCase();

  const INJECTION_PATTERNS = [
    /\b(ignore|forget|override|bypass)\s+(all\s+)?(previous|prior|system)\s+(instructions|rules|prompts|directives)\b/i,
    /\b(act|pretend|behave)\s+as\s+(an?\s+)?(unrestricted|dan|jailbroken|developer|admin|root|god)\b/i,
    /\b(system\s+override|developer\s+mode|reveal\s+your\s+system\s+prompt|print\s+your\s+instructions|show\s+system\s+prompt)\b/i,
    /\b(you\s+are\s+now\s+a\s+free\s+ai|disregard\s+safety\s+guidelines)\b/i,
    /\[system\s*:\s*override\]/i
  ];

  return INJECTION_PATTERNS.some(pattern => pattern.test(lower));
}

/**
 * Evaluates whether a query is within the domain of Mehfooz.
 * Takes conversational history into account so that follow-up turns are not rejected.
 */
export function evaluateInputGuardrail(
  query: string,
  language: 'en' | 'ur',
  historyMessages: StoredMessage[] = []
): InputGuardrailResult {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const isUrdu = language === 'ur';

  // 1. Empty query check
  if (!trimmed) {
    return {
      allowed: false,
      domain: 'out_of_domain',
      reason: 'Empty query',
      requires_rag: false,
      refusalMessage: isUrdu ? 'براہ کرم اپنا سوال یا مسئلہ درج کریں۔' : 'Please provide a message or question.'
    };
  }

  // 2. Structural Prompt Injection Interception
  if (detectPromptInjection(trimmed)) {
    return {
      allowed: false,
      domain: 'out_of_domain',
      reason: 'Prompt injection attempt detected',
      requires_rag: false,
      refusalMessage: isUrdu
        ? 'سیکیورٹی الرٹ: آپ کی درخواست میں غیر مجاز کمانڈ شامل ہے، جسے بلاک کر دیا گیا ہے۔ میں صرف خواتین کے تحفظ اور پنجاب کے قوانین پر معلومات دے سکتی ہوں۔'
        : 'Security Notice: Your request contained an unauthorized system directive and was blocked. I can only assist with women’s safety, legal guidance, and Mehfooz features.'
    };
  }

  // 3. Greetings and conversational queries (strict greeting pattern)
  if (GENERAL_CONVERSATIONAL_REGEX.test(trimmed) && trimmed.length < 50) {
    return {
      allowed: true,
      domain: 'general',
      reason: 'Standard conversational greeting or capability query',
      requires_rag: false
    };
  }

  // 4. Check for explicit out-of-domain patterns (coding, calculus, recipes, sports, etc.)
  for (const pattern of OUT_OF_DOMAIN_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      const topic = isUrdu ? pattern.topicUr : pattern.topicEn;
      const refusal = isUrdu
        ? `میں خاص طور پر خواتین کے تحفظ، پنجاب کی قانونی رہنمائی، ہنگامی امداد اور محفوظ (Mehfooz) کے فیچرز کے لیے بنائی گئی ہوں۔ میں ${topic} پر مدد نہیں کر سکتی، لیکن اگر آپ کا کوئی حفاظتی یا قانونی سوال ہو تو ضرور بتائیں۔`
        : `I’m designed specifically to help with women’s safety, Punjab legal guidance, emergency support, incident reporting, and Mehfooz features. I can’t help with ${topic}, but I can help you with any safety or legal concern.`;

      return {
        allowed: false,
        domain: 'out_of_domain',
        reason: `Explicit out-of-domain topic: ${pattern.topicEn}`,
        requires_rag: false,
        refusalMessage: refusal,
        detectedTopic: pattern.topicEn
      };
    }
  }

  // 5. Follow-up inquiry check: inherits domain from conversation history
  const isFollowUp = FOLLOWUP_REGEX.test(trimmed) || (trimmed.split(/\s+/).length <= 6 && (lower.includes('report') || lower.includes('law') || lower.includes('evidence') || lower.includes('help') || lower.includes('option')));
  
  if (isFollowUp && historyMessages.length > 0) {
    const previousDomainMessages = historyMessages.filter(m => m.role === 'user');
    const hasPriorContext = previousDomainMessages.some(m => {
      const mText = m.content.toLowerCase();
      return DOMAIN_INDICATORS.some(ind => mText.includes(ind));
    });

    if (hasPriorContext) {
      return {
        allowed: true,
        domain: 'safety',
        reason: 'Valid follow-up inheriting safety/legal domain from prior turns',
        requires_rag: true
      };
    }
  }

  // 6. Check for domain indicators in the current query
  const hasDomainIndicator = DOMAIN_INDICATORS.some(indicator => lower.includes(indicator));
  
  // Semantic expressions check (capturing user intent without strict keywords)
  const isSemanticSafetyIntent = 
    /\b(feel\s+unsafe|someone\s+is\s+following|afraid\s+of|threatening\s+me|threatened\s+me|harassed\s+me|harassing\s+me|scared\s+to\s+go|beaten\s+me|hit\s+me|taking\s+my\s+money|won't\s+let\s+me\s+leave|locked\s+me|forced\s+me|share\s+my\s+photos|blackmail|what\s+are\s+my\s+rights|who\s+can\s+help\s+me|file\s+a\s+case|FIR)\b/i.test(trimmed);

  if (hasDomainIndicator || isSemanticSafetyIntent) {
    // Classify specific sub-domain
    let domain: DomainType = 'safety';
    if (/\b(emergency|immediate danger|dial 15|call 15|urgent|danger now|someone is breaking in|1122)\b/i.test(trimmed)) {
      domain = 'emergency';
    } else if (/\b(draft|prepare complaint|file complaint|builder|register complaint|fir draft)\b/i.test(trimmed)) {
      domain = 'complaint';
    } else if (/\b(vault|check-in|checkin|status|sos|how to use|features)\b/i.test(trimmed)) {
      domain = 'app_help';
    } else if (/\b(law|act|section|court|ombudsperson|legal|rights|ppwva|peca|ppc|punjab)\b/i.test(trimmed)) {
      domain = 'legal';
    }

    return {
      allowed: true,
      domain,
      reason: 'Domain indicators or semantic safety expression identified',
      requires_rag: domain === 'legal' || domain === 'safety' || domain === 'complaint'
    };
  }

  // 7. General queries check: if query has no safety/legal domain indicators and is not a greeting,
  // reject it politely as out of domain to prevent arbitrary LLM usage.
  const isGeneralGreeting = /^(hi|hello|hey|salam|assalam|adab|bye|thanks|thank\s+you|ok|okay|who\s+are\s+you|what\s+is\s+mehfooz)\b/i.test(trimmed);
  if (!isGeneralGreeting) {
    const refusal = isUrdu
      ? 'معذرت، میں صرف خواتین کے تحفظ، پنجاب کے قوانین، ہنگامی امداد اور محفوظ (Mehfooz) ایپ کی معاونت کے لیے بنائی گئی ہوں۔ میں اس موضوع پر جواب نہیں دے سکتی۔'
      : 'I apologize, but I am specifically restricted to assisting with women’s safety, Punjab legal rights, emergency support, and Mehfooz application features. I cannot answer queries outside this domain.';

    return {
      allowed: false,
      domain: 'out_of_domain',
      reason: 'Query is outside Mehfooz safety & legal domain boundary',
      requires_rag: false,
      refusalMessage: refusal
    };
  }

  return {
    allowed: true,
    domain: 'general',
    reason: 'General inquiry within Mehfooz service boundary',
    requires_rag: false
  };
}
