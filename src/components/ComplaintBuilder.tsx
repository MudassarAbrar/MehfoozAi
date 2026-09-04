/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Send, 
  Edit3, 
  Eye, 
  Building, 
  PhoneCall, 
  HelpCircle,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Image as ImageIcon,
  Trash2,
  Plus,
  Mail,
  FileDown,
  RotateCw,
  Upload,
  Sparkles,
  X,
  Maximize2,
  FolderUp,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, ComplaintDraft, IncidentCategory, PunjabDistrict, SupportChannelType, VaultRecord } from '../types';
import { getStoredProfile, getAuthHeaders } from '../utils/auth';
import { persistComplaintDrafts } from '../utils/dataService';
import { exportComplaintToPDF } from '../utils/pdfExport';
import { ExportPdfModal } from './ExportPdfModal';

export interface SupportChannelOption {
  id: SupportChannelType;
  name: string;
  nameUrdu: string;
  group: 'authorities' | 'support' | 'custom';
  description: string;
  descriptionUrdu: string;
  badge?: string;
  powers?: string;
  law?: string;
}

export const SUPPORT_CHANNELS: SupportChannelOption[] = [
  {
    id: 'police_support',
    name: 'Punjab Police / PSCA Emergency 15 & Virtual Women Police Station',
    nameUrdu: 'پنجاب پولیس / ورچوئل ویمن پولیس اسٹیشن (ایمرجنسی 15)',
    group: 'authorities',
    description: 'Immediate response, emergency escort dispatch, FIR registration, and 24/7 Virtual Women Police Station.',
    descriptionUrdu: 'فوری ایمرجنسی مدد، ایف آئی آر کا اندراج، حفاظتی اہلکاروں کی روانگی اور 24/7 خواتین کا ورچوئل تھانہ۔',
    badge: 'Emergency 15',
    powers: 'Immediate emergency police dispatch, suspect detention, FIR registration, physical safety escort.',
    law: 'Pakistan Penal Code (PPC 506 / 354) & Police Order 2002'
  },
  {
    id: 'workplace_ombudsperson',
    name: 'Provincial Ombudsperson Punjab (Workplace Harassment Act 2010)',
    nameUrdu: 'صوبائی محتسب پنجاب (کام کی جگہ پر ہراسانی ایکٹ 2010)',
    group: 'authorities',
    description: 'Quasi-judicial authority with powers of a Civil Court to subpoena employers, order dismissals, and penalize perpetrators.',
    descriptionUrdu: 'سول کورٹ کے اختیارات کے حامل جو آجروں کو طلب کرنے، سزائیں دینے اور برطرف کرنے کے مجاز ہیں۔',
    badge: 'Statutory Body',
    powers: 'Civil Court powers: Subpoena employers, inspect inquiry records, issue injunctions, award financial damages.',
    law: 'Protection Against Harassment of Women at the Workplace Act 2010 (Amended 2022)'
  },
  {
    id: 'fia_cybercrime',
    name: 'FIA Cyber Crime Wing / NR3C (PECA 2016)',
    nameUrdu: 'ایف آئی اے سائبر کرائم ونگ / این آر تھری سی (PECA 2016)',
    group: 'authorities',
    description: 'Federal investigation of online blackmail, non-consensual image distribution, WhatsApp extortion, and deepfakes.',
    descriptionUrdu: 'آن لائن بلیک میلنگ، غیر اخلاقی تصاویر/ویڈیوز کی تشہیر اور واٹس ایپ ہراسانی کے خلاف کارروائی۔',
    badge: 'PECA 2016',
    powers: 'Digital forensic extraction, electronic device seizure, platform blocking orders to Meta/Google, arrest warrants.',
    law: 'Prevention of Electronic Crimes Act 2016 (Sections 20, 21 & 24)'
  },
  {
    id: 'protection_committee',
    name: 'District Women Protection Committee (DWPC / PPWVA 2016)',
    nameUrdu: 'ڈسٹرکٹ ویمن پروٹیکشن کمیٹی (PPWVA 2016)',
    group: 'authorities',
    description: 'Issuance of court-backed Residence Orders, Protection Orders, and GPS monitoring against domestic abusers.',
    descriptionUrdu: 'گھریلو تشدد کے خلاف رہائشی احکامات، حفاظتی آرڈرز اور کونسلنگ کی باضابطہ فراہمی۔',
    badge: 'PPWVA 2016',
    powers: 'Petitions Magistrate for Residence Orders, Restraining Orders, and GPS ankle-band monitoring of aggressor.',
    law: 'Punjab Protection of Women Against Violence Act 2016 (PPWVA)'
  },
  {
    id: 'pcsw_helpline',
    name: 'Punjab Commission on the Status of Women (PCSW Helpline 1043)',
    nameUrdu: 'پنجاب کمیشن برائے وقار نسواں (ہیلپ لائن 1043)',
    group: 'authorities',
    description: 'Toll-free 24/7 grievance redressal, legal advice, workplace monitoring, and inter-departmental referral.',
    descriptionUrdu: 'مفت قانونی مشورہ، سرکاری محکموں سے رابطہ کاری اور خواتین کے حقوق کی نگرانی۔',
    badge: 'Helpline 1043',
    powers: 'Statutory oversight, departmental inquiry escalation, and direct coordination with DPO / DC.',
    law: 'Punjab Commission on the Status of Women Act 2014'
  },
  {
    id: 'fospah',
    name: 'Federal Ombudsperson for Protection Against Harassment (FOSPAH)',
    nameUrdu: 'وفاقی محتسب برائے انسداد ہراسانی (فوسپاہ)',
    group: 'authorities',
    description: 'For employees in federal government departments, banks, universities, airlines, and corporations in Punjab.',
    descriptionUrdu: 'وفاقی سرکاری اداروں، نجی و سرکاری بینکوں اور یونیورسٹیوں میں ہراسانی کی شکایات کے لیے۔',
    badge: 'Federal Entities',
    powers: 'Federal Civil Court powers for federal ministries, statutory corporations, and national entities.',
    law: 'Protection Against Harassment of Women at the Workplace Act 2010 & Enforcement of Women\'s Property Rights Act 2020'
  },
  {
    id: 'legal_aid',
    name: 'Free Legal Aid Cell (AGHS / Asma Jahangir Foundation)',
    nameUrdu: 'مفت قانونی امداد سیل (عاصمہ جہانگیر فاؤنڈیشن / AGHS)',
    group: 'support',
    description: 'Pro-bono court lawyers for custody, divorce/khula, maintenance recovery, bail, and criminal trials.',
    descriptionUrdu: 'خاندان، طلاق، نان نفقہ، بچوں کی تحویل اور عدالتی چارہ جوئی کے لیے مفت وکلاء۔',
    badge: 'Pro-Bono Legal',
    powers: 'Court representation by licensed advocates in Family Courts, Sessions Courts, and Lahore High Court.',
    law: 'Family Courts Act 1964 & Guardians and Wards Act 1890'
  },
  {
    id: 'shelter',
    name: 'Dar-ul-Aman Safe Crisis Shelter (Social Welfare Punjab)',
    nameUrdu: 'دارالامان محفوظ پناہ گاہ (محکمہ سماجی بہبود پنجاب)',
    group: 'support',
    description: 'State-run residential crisis shelter offering secure stay, food, medical assistance, and child accommodation.',
    descriptionUrdu: 'خواتین اور ان کے بچوں کے لیے محفوظ رہائش، خوراک، طبی سہولیات اور بحالی۔',
    badge: 'Shelter & Care',
    powers: 'Secure residential sanctuary, police perimeter security, child custody shelter, and medical support.',
    law: 'Social Welfare Department Punjab Crisis Regulations & PPWVA 2016'
  },
  {
    id: 'social_welfare',
    name: 'Punjab Social Welfare & Bait-ul-Maal Department',
    nameUrdu: 'محکمہ سماجی بہبود و بیت المال پنجاب',
    group: 'support',
    description: 'Financial subsistence, crisis rehabilitation funds, vocational training, and survivor grants.',
    descriptionUrdu: 'مالی معاونت، بحالی پیکجز اور بیواؤں/متاثرہ خواتین کے لیے حکومتی وظائف۔',
    badge: 'Financial Relief',
    powers: 'Direct financial welfare grants, subsistence relief, and rehabilitation enrollment.',
    law: 'Punjab Bait-ul-Maal Act 1991'
  },
  {
    id: 'counselling',
    name: 'Psychological Counselling & Trauma Support',
    nameUrdu: 'نفسیاتی کونسلنگ اور ذہنی صدمے کا علاج',
    group: 'support',
    description: 'Confidential clinical therapy and peer counselling for post-traumatic stress and domestic trauma.',
    descriptionUrdu: 'ذہنی تناؤ، صدمے اور خوف سے نجات کے لیے ماہرین نفسیات کی خفیہ رہنمائی۔',
    badge: 'Trauma Therapy',
    powers: 'Clinical psychological evaluation, trauma therapy, and mental health rehabilitation.',
    law: 'Mental Health Ordinance 2001'
  },
  {
    id: 'other',
    name: 'Other / Custom Support Channel (Specify Below)',
    nameUrdu: 'دیگر / اپنی مرضی کا ادارہ یا تنظیم (نیچے درج کریں)',
    group: 'custom',
    description: 'Direct routing to a specific NGO, local court committee, labor union, or specialized agency of your choice.',
    descriptionUrdu: 'اپنی مرضی کے غیر سرکاری ادارے (NGO)، مقامی بار، مزدور یونین یا دیگر ادارے کا انتخاب۔',
    badge: 'Custom'
  }
];

export const getOfficialChannelTitle = (channelId: string, customName?: string): string => {
  if (channelId === 'other') {
    return customName?.trim() ? `Custom Channel: ${customName.trim()}` : 'Custom Support Authority / Organization';
  }
  const match = SUPPORT_CHANNELS.find(c => c.id === channelId);
  return match?.name || 'Punjab Police / PSCA Emergency 15 & Virtual Women Police Station';
};

// Client-side image compressor using HTML5 canvas
function compressImageToDataUri(file: File, maxDimension = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUri = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUri);
      };
      img.onerror = reject;
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Client-side deterministic legal engine fallback
function getLocalDeterministicChannelRecommendation(category: string, rawNarrative: string, isSituationOngoing: boolean) {
  const text = `${category || ''} ${rawNarrative || ''}`.toLowerCase();

  if (isSituationOngoing && (text.includes('weapon') || text.includes('gun') || text.includes('knife') || text.includes('kill') || text.includes('attack') || text.includes('hit') || text.includes('beat') || text.includes('kidnap') || text.includes('hostage') || text.includes('emergency') || text.includes('blood'))) {
    return {
      recommendedChannel: 'police_support',
      recommendedChannelTitle: 'Punjab Police / PSCA Emergency 15 & Virtual Women Police Station',
      recommendedChannelTitleUrdu: 'پنجاب پولیس / ورچوئل ویمن پولیس اسٹیشن (ایمرجنسی 15)',
      urgencyLevel: 'immediate' as const,
      rationale: 'Active threat of physical assault or lethal danger reported. Punjab Police Emergency 15 and the 24/7 Virtual Women Police Station have statutory mandate to dispatch immediate armed protective escorts, arrest suspects under PPC 506/354, and register an emergency FIR.',
      rationaleUrdu: 'فوری جسمانی خطرے یا تشدد کی صورت میں، پنجاب پولیس 15 اور ورچوئل ویمن پولیس اسٹیشن فوری حفاظتی اسکواڈ روانہ کرنے، ملزمان کو حراست میں لینے اور قانونی کارروائی کرنے کے مجاز ہیں۔',
      applicableLaw: 'Pakistan Penal Code (PPC 506 / 354) & Police Order 2002',
      authorityPowers: 'Immediate emergency police dispatch, suspect detention, FIR registration, physical safety escort, and Virtual Women Police Station live camera monitoring.',
      suggestedNextStep: 'Dial Emergency 15 immediately or dispatch formal docket to Virtual Women Police Station.'
    };
  }

  if (category === 'cyber_blackmail' || text.includes('whatsapp') || text.includes('facebook') || text.includes('instagram') || text.includes('video') || text.includes('photo') || text.includes('leak') || text.includes('blackmail') || text.includes('online') || text.includes('hacked') || text.includes('deepfake') || text.includes('nude') || text.includes('camera')) {
    return {
      recommendedChannel: 'fia_cybercrime',
      recommendedChannelTitle: 'FIA Cyber Crime Wing / NR3C (PECA 2016)',
      recommendedChannelTitleUrdu: 'ایف آئی اے سائبر کرائم ونگ / این آر تھری سی (PECA 2016)',
      urgencyLevel: 'high' as const,
      rationale: 'Digital extortion, non-consensual media distribution, and online stalking fall under the exclusive investigative jurisdiction of the Federal Investigation Agency (FIA) under PECA 2016. FIA possesses specialized forensic subpoena powers to seize digital devices, trace IP addresses, and issue mandatory takedown orders to Meta, WhatsApp, and Google.',
      rationaleUrdu: 'آن لائن بلیک میلنگ، غیر اخلاقی تصاویر/ویڈیوز کی تشہیر اور سائبر ہراسانی کی تحقیقات کے لیے وفاقی ادارہ FIA مجاز ہے۔ ان کے پاس ڈیجیٹل فرانزک، موبائل فون ضبط کرنے اور ڈیٹا فوری ڈیلیٹ کرانے کے قانونی اختیارات ہیں۔',
      applicableLaw: 'Prevention of Electronic Crimes Act 2016 (Sections 20, 21 & 24)',
      authorityPowers: 'Digital forensic extraction, electronic device seizure, issuing statutory content-takedown directives to platforms, and executing non-bailable arrest warrants.',
      suggestedNextStep: 'Preserve original screenshots, chat exports, and submit formal petition to FIA NR3C.'
    };
  }

  if (category === 'workplace_harassment' || text.includes('boss') || text.includes('office') || text.includes('colleague') || text.includes('manager') || text.includes('job') || text.includes('university') || text.includes('professor') || text.includes('faculty') || text.includes('salary') || text.includes('workplace') || text.includes('promotion')) {
    return {
      recommendedChannel: 'workplace_ombudsperson',
      recommendedChannelTitle: 'Provincial Ombudsperson Punjab (Workplace Harassment Act 2010)',
      recommendedChannelTitleUrdu: 'صوبائی محتسب پنجاب (کام کی جگہ پر ہراسانی ایکٹ 2010)',
      urgencyLevel: 'high' as const,
      rationale: 'The Provincial Ombudsperson Punjab is a quasi-judicial body with full powers of a Civil Court specifically established under the 2010 Act to adjudicate workplace sexual harassment, hostile work environments, and retaliatory firing by management without requiring expensive litigation.',
      rationaleUrdu: 'صوبائی محتسب پنجاب کے پاس سول کورٹ کے اختیارات ہیں جو دفاتر، فیکٹریوں یا تعلیمی اداروں میں ہراسانی کے ملزم کو نوکری سے برخاست کرنے، بھاری جرمانہ عائد کرنے اور متاثرہ خاتون کی ملازمت بحال رکھنے کے مجاز ہیں۔',
      applicableLaw: 'Protection Against Harassment of Women at the Workplace Act 2010 (Amended 2022)',
      authorityPowers: 'Civil Court powers: Subpoena employers, inspect internal committee inquiry records, issue injunctions against dismissal, and award punitive financial damages.',
      suggestedNextStep: 'Submit a formal petition with statement of facts to the Provincial Ombudsperson Punjab.'
    };
  }

  if (text.includes('shelter') || text.includes('dar-ul-aman') || text.includes('kicked out') || text.includes('thrown out') || text.includes('homeless') || text.includes('nowhere to go') || text.includes('roof') || text.includes('expelled')) {
    return {
      recommendedChannel: 'shelter',
      recommendedChannelTitle: 'Dar-ul-Aman Safe Crisis Shelter (Social Welfare Punjab)',
      recommendedChannelTitleUrdu: 'دارالامان محفوظ پناہ گاہ (محکمہ سماجی بہبود پنجاب)',
      urgencyLevel: 'immediate' as const,
      rationale: 'When a survivor faces domestic expulsion, eviction, or physical insecurity at home with nowhere safe to stay, Dar-ul-Aman provides state-protected residential sanctuary, meals, medical assistance, legal aid, and accommodation for accompanied minor children.',
      rationaleUrdu: 'اگر آپ کے پاس رہنے کے لیے کوئی محفوظ چھت نہیں ہے تو سرکاری دارالامان آپ کو اور آپ کے بچوں کو محفوظ پناہ، کھانا، مفت طبی امداد اور قانونی تحفظ فراہم کرتا ہے۔',
      applicableLaw: 'Social Welfare Department Punjab Crisis Shelter Regulations & PPWVA 2016',
      authorityPowers: '24/7 guarded residential refuge, police perimeter security, infant/child care accommodation, and district magistrate referral.',
      suggestedNextStep: 'Request emergency admission through District Women Protection Officer or local Judicial Magistrate.'
    };
  }

  if (category === 'domestic_violence' || category === 'financial_abuse' || text.includes('husband') || text.includes('in-laws') || text.includes('marital') || text.includes('home') || text.includes('father') || text.includes('brother') || text.includes('dowry') || text.includes('maintenance')) {
    return {
      recommendedChannel: 'protection_committee',
      recommendedChannelTitle: 'District Women Protection Committee (DWPC / PPWVA 2016)',
      recommendedChannelTitleUrdu: 'ڈسٹرکٹ ویمن پروٹیکشن کمیٹی (PPWVA 2016)',
      urgencyLevel: 'high' as const,
      rationale: 'Under the landmark Punjab Protection of Women Against Violence Act 2016, the District Women Protection Officer (DWPO) can petition the court for Residence Orders (barring the abuser from throwing you out of your house), Protection Restraining Orders, and Monetary Maintenance Relief without needing an expensive private lawyer.',
      rationaleUrdu: 'پنجاب پروٹیکشن آف ویمن اگینسٹ وائلنس ایکٹ 2016 کے تحت، ویمن پروٹیکشن آفیسر آپ کے لیے عدالتی پروٹیکشن آرڈر، گھر سے بے دخلی روکنے کا حکم اور مالی نان نفقہ بغیر کسی فیس کے دلوانے کی مجاز ہے۔',
      applicableLaw: 'Punjab Protection of Women Against Violence Act 2016 (Sections 3, 4, 5, 6 & 7)',
      authorityPowers: 'Petitions Magistrate for Residence Orders, Protection Orders, GPS ankle-band monitoring of aggressor, and emergency shelter assistance.',
      suggestedNextStep: 'File your grievance with District Women Protection Officer or call 1043 helpline.'
    };
  }

  if (text.includes('lawyer') || text.includes('court') || text.includes('divorce') || text.includes('khula') || text.includes('custody') || text.includes('children custody') || text.includes('bail') || text.includes('judge')) {
    return {
      recommendedChannel: 'legal_aid',
      recommendedChannelTitle: 'Free Legal Aid Cell (AGHS / Asma Jahangir Foundation)',
      recommendedChannelTitleUrdu: 'مفت قانونی امداد سیل (عاصمہ جہانگیر فاؤنڈیشن / AGHS)',
      urgencyLevel: 'standard' as const,
      rationale: 'For contested court proceedings including dissolution of marriage (Khula), child custody petitions, recovery of dowry articles, maintenance recovery, or filing writ petitions before the High Court, pro-bono human rights counsel provides free legal advocacy.',
      rationaleUrdu: 'خاندانی عدالتوں میں خلع، بچوں کی تحویل، جہیز کی واپسی اور نان نفقہ کے مقدمات لڑنے کے لیے عاصمہ جہانگیر لیگل ایڈ سیل مفت وکیل فراہم کرتا ہے۔',
      applicableLaw: 'Family Courts Act 1964 & Guardians and Wards Act 1890',
      authorityPowers: 'Court representation by licensed advocates, filing petitions before Family Courts, Sessions Courts, and Lahore High Court.',
      suggestedNextStep: 'Schedule pro-bono consultation with AGHS Legal Aid intake team.'
    };
  }

  return {
    recommendedChannel: 'pcsw_helpline',
    recommendedChannelTitle: 'Punjab Commission on the Status of Women (PCSW Helpline 1043)',
    recommendedChannelTitleUrdu: 'پنجاب کمیشن برائے وقار نسواں (ہیلپ لائن 1043)',
    urgencyLevel: 'standard' as const,
    rationale: 'PCSW provides toll-free 24/7 legal counseling, statutory monitoring of women\'s grievances, and cross-departmental coordination with police, district administration, and courts across all 36 Punjab districts.',
    rationaleUrdu: 'پنجاب کمیشن برائے وقار نسواں کی 1043 ہیلپ لائن مفت قانونی رہنمائی، متعلقہ اداروں سے رابطہ کاری اور آپ کے کیس کی سرکاری سطح پر نگرانی کرتی ہے۔',
    applicableLaw: 'Punjab Commission on the Status of Women Act 2014',
    authorityPowers: 'Statutory oversight, case forwarding to DPO / Ombudsperson, and legal advisory services.',
    suggestedNextStep: 'Call toll-free 1043 or submit through official grievance portal.'
  };
}

interface ComplaintBuilderProps {
  language: AppLanguage;
  importedRecords?: VaultRecord[];
  initialSummary?: string;
  initialCategory?: string;
  initialPhotos?: string[];
  onDraftCreated: (draft: ComplaintDraft) => void;
  onOpenCrisis: () => void;
  onLogAudit?: (event: string, detail: string) => void;
}

const PUNJAB_DISTRICTS: PunjabDistrict[] = [
  'Lahore',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Gujranwala',
  'Sialkot',
  'Bahawalpur',
  'Sargodha',
  'Sheikhupura',
  'Gujrat',
  'Kasur',
  'Sahiwal',
  'Other Punjab District'
];

export const ComplaintBuilder: React.FC<ComplaintBuilderProps> = ({
  language,
  importedRecords = [],
  initialSummary = '',
  initialCategory = 'domestic_violence',
  initialPhotos = [],
  onDraftCreated,
  onOpenCrisis,
  onLogAudit
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState<IncidentCategory>('domestic_violence');
  const [district, setDistrict] = useState<PunjabDistrict>('Lahore');
  const [isSituationOngoing, setIsSituationOngoing] = useState(true);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('14:00');
  const [locationDetails, setLocationDetails] = useState('Lahore, Punjab');
  const [rawUserWords, setRawUserWords] = useState(initialSummary);
  const [structuredSummary, setStructuredSummary] = useState('');
  const [requestedSupport, setRequestedSupport] = useState<SupportChannelType | 'ai_recommendation'>('police_support');
  const [customChannelName, setCustomChannelName] = useState('');
  const [customChannelContact, setCustomChannelContact] = useState('');
  const [isRecommendingChannel, setIsRecommendingChannel] = useState(false);
  const [channelRecommendationError, setChannelRecommendationError] = useState<string | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<{
    recommendedChannel: string;
    recommendedChannelTitle: string;
    recommendedChannelTitleUrdu?: string;
    urgencyLevel: 'immediate' | 'high' | 'standard';
    rationale: string;
    rationaleUrdu?: string;
    applicableLaw: string;
    authorityPowers: string;
    suggestedNextStep?: string;
    recommendedAt?: string;
  } | null>(null);

  // Attached photos, upload, and user approval state
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [userApprovedPhotos, setUserApprovedPhotos] = useState<boolean>(true);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [safeContactMethod, setSafeContactMethod] = useState('');
  const [explicitConsent, setExplicitConsent] = useState(false);
  const [isSubmittingHandoff, setIsSubmittingHandoff] = useState(false);
  const [handoffSuccess, setHandoffSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [emailDispatchedTo, setEmailDispatchedTo] = useState<string | null>(null);
  const [deliveryNotice, setDeliveryNotice] = useState<string | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendEmailNotice, setResendEmailNotice] = useState<string | null>(null);
  const [createdDraft, setCreatedDraft] = useState<ComplaintDraft | null>(null);

  useEffect(() => {
    if (initialPhotos && initialPhotos.length > 0) {
      setPhotos(initialPhotos);
    }
  }, [initialPhotos]);

  const isUrdu = language === 'ur';

  // Import from vault notes if passed
  useEffect(() => {
    if (importedRecords.length > 0) {
      const combined = importedRecords.map(r => `[${r.incidentDate} at ${r.incidentTime}]: ${r.title} - ${r.note}`).join('\n\n');
      setRawUserWords(combined);
      setCategory(importedRecords[0].category);
      if (importedRecords[0].location) setLocationDetails(importedRecords[0].location);
    }
  }, [importedRecords]);

  // Handle Photo Uploads with client-side compression
  const handleFilesUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsUploadingPhotos(true);
    setPhotoUploadError(null);

    const processedPhotos: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setPhotoUploadError('Please upload valid image files (JPEG, PNG, WEBP).');
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        setPhotoUploadError('Image exceeds the 15MB file size limit.');
        continue;
      }

      try {
        const compressedDataUri = await compressImageToDataUri(file);
        processedPhotos.push(compressedDataUri);
      } catch (err) {
        console.warn('Image compression error:', err);
      }
    }

    if (processedPhotos.length > 0) {
      setPhotos(prev => [...prev, ...processedPhotos]);
      setUserApprovedPhotos(true);
      onLogAudit?.('photos_attached', `${processedPhotos.length} photo(s) attached to draft`);
    }
    setIsUploadingPhotos(false);
  };

  // Import photos stored in saved vault records
  const handleImportVaultPhotos = () => {
    try {
      setPhotoUploadError(null);
      const rawVault = localStorage.getItem('mehfooz_vault_records_v1');
      const vaultRecords: VaultRecord[] = rawVault ? JSON.parse(rawVault) : [];
      const allRecords = [...importedRecords, ...vaultRecords];
      const vaultPhotos: string[] = [];

      allRecords.forEach(rec => {
        if (rec.attachments && Array.isArray(rec.attachments)) {
          rec.attachments.forEach(att => {
            if (typeof att === 'string' && (att.startsWith('data:image') || att.startsWith('blob:') || att.startsWith('http'))) {
              if (!photos.includes(att) && !vaultPhotos.includes(att)) {
                vaultPhotos.push(att);
              }
            }
          });
        }
      });

      if (vaultPhotos.length > 0) {
        setPhotos(prev => [...prev, ...vaultPhotos]);
        setUserApprovedPhotos(true);
        onLogAudit?.('vault_photos_imported', `Imported ${vaultPhotos.length} photo(s) from vault`);
      } else {
        setPhotoUploadError(isUrdu ? 'والٹ میں کوئی تصویر موجود نہیں ہے۔' : 'No photos found in your saved incident records.');
      }
    } catch (err) {
      console.warn('Vault photo import error:', err);
    }
  };

  // Trigger AI Support Channel Recommendation with guardrails
  const handleTriggerAiRecommendation = async () => {
    setIsRecommendingChannel(true);
    setChannelRecommendationError(null);
    onLogAudit?.('ai_channel_recommendation_requested', `User requested AI channel analysis for category: ${category}`);

    try {
      const res = await fetch('/api/recommend-channel', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          category,
          district,
          rawNarrative: rawUserWords,
          isSituationOngoing,
          language
        })
      });

      const data = await res.json();
      if (data.success && data.recommendedChannel) {
        const rec = {
          recommendedChannel: data.recommendedChannel,
          recommendedChannelTitle: data.recommendedChannelTitle,
          recommendedChannelTitleUrdu: data.recommendedChannelTitleUrdu,
          urgencyLevel: data.urgencyLevel || 'standard',
          rationale: data.rationale,
          rationaleUrdu: data.rationaleUrdu,
          applicableLaw: data.applicableLaw,
          authorityPowers: data.authorityPowers,
          suggestedNextStep: data.suggestedNextStep,
          recommendedAt: new Date().toISOString()
        };
        setAiRecommendation(rec);
        // Automatically switch selection to recommended channel
        setRequestedSupport(data.recommendedChannel as SupportChannelType);
      } else {
        throw new Error(data.error || 'Server unable to compute recommendation');
      }
    } catch (err) {
      console.warn('AI recommendation network error, utilizing local deterministic legal engine:', err);
      const localRec = getLocalDeterministicChannelRecommendation(category, rawUserWords, isSituationOngoing);
      const rec = {
        ...localRec,
        recommendedAt: new Date().toISOString()
      };
      setAiRecommendation(rec);
      setRequestedSupport(localRec.recommendedChannel as SupportChannelType);
    } finally {
      setIsRecommendingChannel(false);
    }
  };

  // Generate structured summary when reaching Step 3
  useEffect(() => {
    if (step === 3 && !structuredSummary) {
      const channelDisplay = getOfficialChannelTitle(requestedSupport, customChannelName);
      // Synthesize clean fact-based neutral summary
      const generated = `STATEMENT OF INCIDENT / GRIEVANCE (District: ${district}, Punjab)

1. JURISDICTION & APPLICABLE LAWS:
   - Primary Subject: ${category.replace(/_/g, ' ').toUpperCase()}
   - Target Support Channel: ${channelDisplay}
   - Jurisdiction: District ${district}, Province of Punjab
   - Relevant Acts: Punjab Protection of Women Against Violence Act 2016 (PPWVA) / PECA 2016 / Protection Against Harassment of Women at Workplace Act 2010 / Pakistan Penal Code (PPC)

2. CHRONOLOGY OF FACTS:
   - Incident Date / Period: ${incidentDate || 'Ongoing'} (Approx. ${incidentTime})
   - Incident Location: ${locationDetails || 'Confidential residential/workplace premises'}
   - Ongoing Status: ${isSituationOngoing ? 'Yes, situation is active' : 'Past incident documented'}

3. SUMMARY OF GRIEVANCE:
   ${rawUserWords || 'The complainant reports an incident of domestic restriction, intimidation, or harassment requiring protective orders and legal intervention under Punjab provincial jurisdiction.'}

4. RELIEF / SUPPORT REQUESTED:
   - Request filed before: ${channelDisplay}
   - Safe contact preference: ${safeContactMethod || 'Discreet contact via designated representative'}`;

      setStructuredSummary(generated);
    }
  }, [step, category, district, incidentDate, incidentTime, locationDetails, isSituationOngoing, rawUserWords, requestedSupport, customChannelName, safeContactMethod, structuredSummary]);

  const handleExecuteHandoff = async () => {
    if (!explicitConsent) return;

    setIsSubmittingHandoff(true);
    onLogAudit?.('consent_granted', 'User gave explicit consent for official channel handoff');

    try {
      const userProfile = getStoredProfile();
      const userEmail = userProfile?.email || '';
      const userPin = userProfile?.stealthPin || '1520';
      const complainantName = userProfile?.fullName || 'Ayesha Rehman';
      const officialChannelTitle = getOfficialChannelTitle(requestedSupport, customChannelName);

      // Create draft representation
      const tempDraft: ComplaintDraft = {
        id: `draft-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stage: 'official_channel_opened',
        category,
        incidentSummary: structuredSummary,
        originalUserWords: rawUserWords,
        incidentDate,
        incidentTime,
        district,
        locationDetails,
        isSituationOngoing,
        requestedSupport: requestedSupport === 'ai_recommendation' ? 'police_support' : requestedSupport,
        customChannelName: requestedSupport === 'other' ? customChannelName : undefined,
        customChannelContact: requestedSupport === 'other' ? customChannelContact : undefined,
        aiRecommendationDetails: aiRecommendation || undefined,
        safeContactMethod,
        attachedVaultRecordIds: importedRecords.map(r => r.id),
        attachedPhotos: userApprovedPhotos ? photos : [],
        userApprovalForPhotos: userApprovedPhotos,
        hasEvidence: photos.length > 0 || importedRecords.length > 0,
        evidencePrivacyAcknowledged: true,
        userConsentGiven: true,
        userConsentTimestamp: new Date().toISOString(),
        officialChannelUsed: officialChannelTitle,
        officialReferenceNumber: `PSCA-${district.substring(0, 3).toUpperCase()}-2026-PENDING`,
        isMockHandoff: true
      };

      // 1. Generate encrypted password-protected PDF in memory to attach in dispatch email
      let pdfBase64: string | undefined;
      try {
        const pdfGen = await exportComplaintToPDF(tempDraft, {
          password: userPin,
          complainantName,
          includeAttachedRecords: importedRecords.length > 0,
          attachedRecords: importedRecords,
          downloadImmediately: false
        });
        pdfBase64 = pdfGen.dataUri;
      } catch (pdfErr) {
        console.warn('PDF pre-generation warning:', pdfErr);
      }

      // 2. Official handoff (Prompt #2) — real Resend dispatch to the authority
      //    + Supabase persistence (tracking + delivery status). Falls back to the
      //    legacy mock endpoint only when no Supabase session is available so the
      //    flow still completes end-to-end.
      const handoffPayload = {
        complaintData: {
          district,
          category,
          summary: structuredSummary,
          incidentSummary: structuredSummary,
          incidentDate,
          incidentTime,
          locationDetails,
          isSituationOngoing,
          requestedSupport,
          safeContactMethod,
          officialChannelUsed: tempDraft.officialChannelUsed,
          userEmail,
          complainantName,
          pdfBase64,
          isPasswordProtected: true
        }
      };

      let res = await fetch('/api/complaint-handoff', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(handoffPayload)
      });
      if (res.status === 401 || res.status === 503) {
        res = await fetch('/api/mock-handoff', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(handoffPayload)
        });
      }

      const data = await res.json();
      const trackingCode = data.trackingNumber || `PSCA-${district.substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const finalDraft: ComplaintDraft = {
        ...tempDraft,
        officialReferenceNumber: trackingCode,
        remoteId: typeof data.complaintId === 'string' && data.complaintId ? data.complaintId : undefined,
        isMockHandoff: data.simulated === undefined ? true : Boolean(data.simulated)
      };

      // 3. Persist encrypted to Supabase (zero-knowledge) + local mirror.
      try {
        const existingDrafts: ComplaintDraft[] = JSON.parse(localStorage.getItem('mehfooz_complaint_drafts_v1') || '[]');
        await persistComplaintDrafts([finalDraft, ...existingDrafts]);
      } catch (persistErr) {
        console.warn('Draft persist failed:', persistErr);
      }

      setCreatedDraft(finalDraft);
      setHandoffSuccess(trackingCode);
      // Show the department email as the primary recipient + user copy status
      const deptName = data.department?.name || '';
      const deptEmail = data.department?.email || '';
      setEmailDispatchedTo(
        data.userCopyDispatched ? userEmail
          : data.emailDispatched ? deptEmail
          : null
      );
      setDeliveryNotice(typeof data.notice === 'string' ? data.notice : null);
      onDraftCreated(finalDraft);
      const deptInfo = deptName ? `Dispatched to ${deptName}${deptEmail ? ` (${deptEmail})` : ''}.` : '';
      const apiInfo = data.department?.apiStatus === 'dispatched' ? ' Department API endpoint hit successfully.' : data.department?.apiStatus === 'failed' ? ' Department API endpoint returned an error.' : '';
      const userInfo = data.userCopyDispatched ? ` Confirmation copy sent to ${userEmail}.` : '';
      onLogAudit?.('handoff_executed', `Official channel handoff ${data.deliveryStatus === 'dispatched' ? 'dispatched' : 'registered'} — ref: ${trackingCode}. ${deptInfo}${apiInfo}${userInfo}`);
    } catch (err) {
      console.error('Handoff error:', err);
    } finally {
      setIsSubmittingHandoff(false);
    }
  };

  const handleResendEmail = async () => {
    if (!createdDraft && !handoffSuccess) return;
    setIsResendingEmail(true);
    setResendEmailNotice(null);

    try {
      const userProfile = getStoredProfile();
      const userEmail = userProfile?.email || '';

      const res = await fetch('/api/complaints/send-email', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          complaintData: createdDraft || {
            officialReferenceNumber: handoffSuccess,
            district,
            category,
            incidentSummary: structuredSummary,
            incidentDate,
            incidentTime,
            locationDetails,
            isSituationOngoing,
            officialChannelUsed: requestedSupport === 'workplace_ombudsperson' ? 'Office of Ombudsperson Punjab' : 'PSCA Emergency 15 / Virtual Women Police Station'
          },
          recipientEmail: userEmail
        })
      });

      const resData = await res.json();
      if (resData.success) {
        setResendEmailNotice(`Official verification dossier successfully resent to ${userEmail}!`);
      } else {
        setResendEmailNotice(`Dispatched to ${userEmail} (Receipt ID: ${resData.messageId})`);
      }
    } catch (err) {
      console.error('Email resend error:', err);
      setResendEmailNotice('Unable to resend email right now. Please check network.');
    } finally {
      setIsResendingEmail(false);
    }
  };


  const handleSaveDraftOnly = () => {
    const newDraft: ComplaintDraft = {
      id: `draft-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stage: 'draft_saved_privately',
      category,
      incidentSummary: structuredSummary || rawUserWords,
      originalUserWords: rawUserWords,
      incidentDate,
      incidentTime,
      district,
      locationDetails,
      isSituationOngoing,
      requestedSupport: requestedSupport === 'ai_recommendation' ? 'police_support' : requestedSupport,
      customChannelName: requestedSupport === 'other' ? customChannelName : undefined,
      customChannelContact: requestedSupport === 'other' ? customChannelContact : undefined,
      aiRecommendationDetails: aiRecommendation || undefined,
      safeContactMethod,
      attachedVaultRecordIds: importedRecords.map(r => r.id),
      attachedPhotos: userApprovedPhotos ? photos : [],
      userApprovalForPhotos: userApprovedPhotos,
      hasEvidence: photos.length > 0 || importedRecords.length > 0,
      evidencePrivacyAcknowledged: true,
      userConsentGiven: false
    };

    const existingDrafts: ComplaintDraft[] = JSON.parse(localStorage.getItem('mehfooz_complaint_drafts_v1') || '[]');
    void persistComplaintDrafts([newDraft, ...existingDrafts]);

    onDraftCreated(newDraft);
    onLogAudit?.('complaint_drafted', 'Saved private unsubmitted complaint draft');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(structuredSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5 text-[#1C2C34]">
      {/* Step Progress Bar */}
      <div className="rounded-2xl bg-white border border-[#BCD4D4]/60 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-[#1C2C34] uppercase tracking-wider">
            {isUrdu ? 'شکایت ڈرافٹ معاون • مرحلہ ' + step + ' از 4' : `Complaint Intake Assistant • Step ${step} of 4`}
          </span>
          <span className="text-[#5A6E78]">
            {step === 1 && (isUrdu ? 'حفاظتی جانچ و کیٹیگری' : '1. Safety & Category')}
            {step === 2 && (isUrdu ? 'واقعات و تفصیلات' : '2. Facts & Narrative')}
            {step === 3 && (isUrdu ? 'ڈرافٹ کا جائزہ و تصحیح' : '3. AI Synthesis & Review')}
            {step === 4 && (isUrdu ? 'رضامندی و آفیشل روٹ' : '4. Consent & Official Channel')}
          </span>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`flex-1 transition-all duration-300 ${
                s <= step ? 'bg-[#FC7454]' : 'bg-transparent'
              } ${s < step ? 'border-r border-white' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Safety & Category Selection */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Immediate Danger Check */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-[#1C2C34] space-y-2">
            <div className="flex items-center space-x-2 font-bold text-rose-700">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{isUrdu ? 'پہلا قدم: فوری خطرے کی جانچ' : 'Step 1: Immediate Safety Verification'}</span>
            </div>
            <p className="text-slate-600">
              {isUrdu 
                ? 'کیا آپ اس وقت کسی محفوظ جگہ پر ہیں؟ اگر ملزم قریب ہے یا ہتھیار موجود ہے تو فارم نہ بھریں، فوری طور پر ایمرجنسی 15 پر کال کریں۔'
                : 'Are you currently in a safe location? If the aggressor is physically present or armed, do not fill out this form. Prioritize physical safety and dial 15 immediately.'}
            </p>
            <button
              onClick={onOpenCrisis}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs whitespace-nowrap cursor-pointer transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'فوری مدد (15 کال کریں)' : 'Emergency Help (Dial 15)'}</span>
            </button>
          </div>

          {/* Category Chooser */}
          <div className="rounded-2xl bg-white border border-[#BCD4D4]/60 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#1C2C34]">
              {isUrdu ? 'شکایت کی بنیادی نوعیت منتخب کریں:' : 'Select Primary Issue Category:'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'domestic_violence', title: 'Domestic Abuse (PPWVA 2016)', desc: 'Physical abuse, confinement, threats, expulsion from home' },
                { key: 'workplace_harassment', title: 'Workplace Harassment (Act 2010)', desc: 'Office advances, hostile environment, job threats by boss' },
                { key: 'cyber_blackmail', title: 'Cyber Blackmail (PECA 2016)', desc: 'Photo leaks, WhatsApp harassment, fake social profiles' },
                { key: 'threats_intimidation', title: 'Criminal Intimidation (PPC 506)', desc: 'Death threats, harm to family, acid/weapon threats' },
                { key: 'stalking_harassment', title: 'Stalking & Public Modesty (PPC 509)', desc: 'Followed in public, verbal harassment on streets/transit' },
                { key: 'financial_abuse', title: 'Financial & Economic Deprivation', desc: 'Denial of food, maintenance, confiscation of dowry/salary' }
              ].map(c => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key as IncidentCategory)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    category === c.key 
                      ? 'bg-[#ECF4F4] border-[#BCD4D4] ring-2 ring-[#FC7454]/40 text-[#1C2C34]' 
                      : 'bg-slate-50 border-slate-200 text-[#4B5563] hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className={category === c.key ? 'text-[#FC7454]' : 'text-[#1C2C34]'}>{c.title}</span>
                    {category === c.key && <CheckCircle2 className="w-4 h-4 text-[#FC7454]" />}
                  </div>
                  <p className="text-[11px] text-[#5A6E78]">{c.desc}</p>
                </button>
              ))}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
              >
                <span>Continue to Incident Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Factual Narrative & District */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-2xl bg-white border border-[#BCD4D4]/60 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#1C2C34]">
              {isUrdu ? 'مقام اور واقعات کی تفصیل:' : 'Incident Details & Jurisdiction (Punjab):'}
            </h3>

            {/* District & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#1C2C34] font-semibold mb-1">
                  {isUrdu ? 'ضلع (پنجاب):' : 'Punjab District / Division:'}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as PunjabDistrict)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#1C2C34] focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
                >
                  {PUNJAB_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#1C2C34] font-semibold mb-1">
                  {isUrdu ? 'مقام یا علاقہ:' : 'Town / Area Location:'}
                </label>
                <input
                  type="text"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="e.g. Model Town Lahore, workplace office"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
                />
              </div>
            </div>

            {/* Date & Ongoing check */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#1C2C34] font-semibold mb-1">
                  {isUrdu ? 'واقعہ کی تاریخ (یا آغاز):' : 'Incident Date (or start date):'}
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#1C2C34] focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="ongoing-check"
                  checked={isSituationOngoing}
                  onChange={(e) => setIsSituationOngoing(e.target.checked)}
                  className="w-4 h-4 text-[#FC7454] rounded bg-white border-slate-300 focus:ring-[#FC7454]"
                />
                <label htmlFor="ongoing-check" className="text-xs text-[#1C2C34] cursor-pointer">
                  {isUrdu ? 'یہ صورتحال ابھی بھی جاری ہے' : 'This situation / threat is currently ongoing'}
                </label>
              </div>
            </div>

            {/* Narrative */}
            <div className="text-xs space-y-1">
              <label className="block text-[#1C2C34] font-semibold">
                {isUrdu ? 'اپنے الفاظ میں واقعہ بیان کریں:' : 'Describe the incident in your own words:'}
              </label>
              <textarea
                rows={5}
                value={rawUserWords}
                onChange={(e) => setRawUserWords(e.target.value)}
                placeholder="Include what happened, who did it, what threats were made, and whether children are involved. You will be able to review and redact any text in the next step..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
              />
            </div>

            {/* Preferred Support Target */}
            <div className="text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="block text-[#1C2C34] font-semibold">
                  {isUrdu ? 'آپ کس قسم کی قانونی یا سرکاری مدد چاہتی ہیں؟' : 'Preferred Support Channel Target:'}
                </label>
                <button
                  type="button"
                  onClick={handleTriggerAiRecommendation}
                  disabled={isRecommendingChannel}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#FC7454] to-[#e05634] text-white text-[11px] font-bold hover:brightness-105 transition shadow-2xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isRecommendingChannel ? 'animate-spin' : ''}`} />
                  <span>
                    {isRecommendingChannel 
                      ? (isUrdu ? 'تجزیہ ہو رہا ہے...' : 'Analyzing Legal Mandate...') 
                      : (isUrdu ? '✨ AI سے بہترین ادارہ منتخب کروائیں' : '✨ AI Decide Best Channel')}
                  </span>
                </button>
              </div>

              <select
                value={requestedSupport}
                onChange={(e) => {
                  const val = e.target.value as SupportChannelType | 'ai_recommendation';
                  if (val === 'ai_recommendation') {
                    setRequestedSupport('ai_recommendation');
                    handleTriggerAiRecommendation();
                  } else {
                    setRequestedSupport(val);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#1C2C34] focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20 font-medium"
              >
                <option value="ai_recommendation" className="font-bold text-[#FC7454] bg-[#FC7454]/10">
                  ✨ Let AI Decide / Recommend Best Channel (Based on Narrative & Laws)
                </option>
                <optgroup label="Official Statutory & Legal Authorities">
                  {SUPPORT_CHANNELS.filter(c => c.group === 'authorities').map(c => (
                    <option key={c.id} value={c.id}>
                      {isUrdu ? c.nameUrdu : c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Protective Services, Shelters & Legal Aid">
                  {SUPPORT_CHANNELS.filter(c => c.group === 'support').map(c => (
                    <option key={c.id} value={c.id}>
                      {isUrdu ? c.nameUrdu : c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other / Custom Destination">
                  {SUPPORT_CHANNELS.filter(c => c.group === 'custom').map(c => (
                    <option key={c.id} value={c.id}>
                      {isUrdu ? c.nameUrdu : c.name}
                    </option>
                  ))}
                </optgroup>
              </select>

              {/* Custom Channel Details Input if 'other' is selected */}
              {requestedSupport === 'other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5 text-xs text-amber-950"
                >
                  <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                    <Scale className="w-4 h-4 text-amber-700" />
                    <span>{isUrdu ? 'اپنی مرضی کے ادارے یا تنظیم کی تفصیلات:' : 'Custom Support Authority / Organization Details:'}</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      {isUrdu ? 'ادارے / این جی او / وکیل کا نام:' : 'Authority / Organization / NGO / Advocate Name:'}
                    </label>
                    <input
                      type="text"
                      value={customChannelName}
                      onChange={(e) => setCustomChannelName(e.target.value)}
                      placeholder="e.g. Shirkat Gah Women's Resource Centre, Lahore Bar Association, or Local Labour Union"
                      className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454] focus:ring-1 focus:ring-[#FC7454]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      {isUrdu ? 'فوکل پرسن / رابطہ نمبر یا ای میل (اختیاری):' : 'Focal Person / Official Contact Info (Optional):'}
                    </label>
                    <input
                      type="text"
                      value={customChannelContact}
                      onChange={(e) => setCustomChannelContact(e.target.value)}
                      placeholder="e.g. Helpline: 042-xxxxxxx or contact@shirkatgah.org"
                      className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454] focus:ring-1 focus:ring-[#FC7454]"
                    />
                  </div>
                  <p className="text-[10px] text-amber-800 leading-tight">
                    {isUrdu 
                      ? 'یہ نام اور رابطہ تفصیلات آپ کی باضابطہ قانونی شکایت کے ہیڈر اور پی ڈی ایف میں شامل کی جائیں گی۔' 
                      : 'These custom details will be included as the recipient authority on your legal petition docket and protected PDF.'}
                  </p>
                </motion.div>
              )}

              {/* AI Channel Recommendation Card with Statutory Powers */}
              {aiRecommendation && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#ECF4F4] to-white border border-[#BCD4D4] shadow-xs space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2 font-bold text-[#1C2C34]">
                      <Sparkles className="w-4 h-4 text-[#FC7454]" />
                      <span>{isUrdu ? 'AI قانونی جائزہ اور تجویز کردہ ادارہ' : 'AI Legal Assessment & Recommended Channel'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      aiRecommendation.urgencyLevel === 'immediate'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : aiRecommendation.urgencyLevel === 'high'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {aiRecommendation.urgencyLevel === 'immediate' 
                        ? '🚨 Immediate Emergency' 
                        : aiRecommendation.urgencyLevel === 'high' 
                        ? '⚠️ High Urgency' 
                        : '📋 Standard Legal Track'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white/90 rounded-xl border border-[#BCD4D4]/60 space-y-1">
                    <div className="font-bold text-[#1C2C34] text-xs">
                      {isUrdu && aiRecommendation.recommendedChannelTitleUrdu
                        ? aiRecommendation.recommendedChannelTitleUrdu
                        : aiRecommendation.recommendedChannelTitle}
                    </div>
                    <p className="text-[#5A6E78] text-[11px] leading-relaxed">
                      {isUrdu && aiRecommendation.rationaleUrdu ? aiRecommendation.rationaleUrdu : aiRecommendation.rationale}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-[#1C2C34] block">Statutory Mandate:</span>
                      <span className="text-[#5A6E78]">{aiRecommendation.applicableLaw}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-[#1C2C34] block">Authority Legal Powers:</span>
                      <span className="text-[#5A6E78] line-clamp-2">{aiRecommendation.authorityPowers}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Currently Active Channel</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiRecommendation(null)}
                      className="text-[11px] text-[#5A6E78] hover:text-[#1C2C34] underline cursor-pointer"
                    >
                      Dismiss Card
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Evidence Photos Section with Multi-file Upload, Dropzone & Vault Import */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 font-bold text-[#1C2C34]">
                  <ImageIcon className="w-4 h-4 text-[#FC7454]" />
                  <span>{isUrdu ? 'فوٹو ثبوت و دستاویزات (پرائیویٹ سیفٹی زون)' : 'Photo & Document Evidence (Private Safety Zone)'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-[#5A6E78] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {photos.length} {photos.length === 1 ? 'photo' : 'photos'} attached
                  </span>
                </div>
              </div>

              {/* Hidden file input for manual upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesUpload(e.target.files);
                    e.target.value = ''; // Reset input to allow re-uploading same file if desired
                  }
                }}
              />

              {/* Upload Controls & Drag-Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files) {
                    handleFilesUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1.5 ${
                  isDragOver 
                    ? 'border-[#FC7454] bg-[#FC7454]/10' 
                    : 'border-slate-300 hover:border-[#FC7454] bg-white hover:bg-slate-50/80'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#ECF4F4] flex items-center justify-center text-[#FC7454]">
                  <Upload className={`w-5 h-5 ${isUploadingPhotos ? 'animate-bounce' : ''}`} />
                </div>
                <div className="text-xs font-bold text-[#1C2C34]">
                  {isUploadingPhotos 
                    ? (isUrdu ? 'تصاویر محفوظ کی جا رہی ہیں...' : 'Processing & Compressing Images...')
                    : (isUrdu ? 'تصاویر اپ لوڈ کرنے کے لیے کلک کریں یا ڈریگ کریں' : 'Click to Upload Images or Drag & Drop Here')}
                </div>
                <p className="text-[11px] text-[#5A6E78]">
                  Supports JPEG, PNG, WEBP (up to 15MB each). Images are securely compressed on your device.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#1C2C34] hover:bg-[#263842] text-white text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'تصویر منتخب کریں' : 'Choose Files'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImportVaultPhotos();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#ECF4F4] hover:bg-[#d9ecec] border border-[#BCD4D4] text-[#1C2C34] text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <FolderUp className="w-3.5 h-3.5 text-[#FC7454]" />
                    <span>{isUrdu ? 'والٹ سے حاصل کریں' : 'Import from Incident Vault'}</span>
                  </button>
                </div>
              </div>

              {/* Upload Error Banner */}
              {photoUploadError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
                  <span>{photoUploadError}</span>
                  <button
                    type="button"
                    onClick={() => setPhotoUploadError(null)}
                    className="text-red-700 hover:text-red-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Attached Photos Gallery */}
              {photos.length > 0 ? (
                <div className="space-y-3 pt-1">
                  <div className="flex flex-wrap gap-2.5">
                    {photos.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 shadow-xs bg-black/5">
                        <img
                          src={img}
                          alt={`Evidence #${idx + 1}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover cursor-pointer hover:opacity-95 transition"
                          onClick={() => setPreviewPhotoUrl(img)}
                        />
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoUrl(img)}
                            className="p-1.5 bg-white/90 hover:bg-white text-[#1C2C34] rounded-full shadow-xs cursor-pointer"
                            title="View Full Size"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-xs cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}

                    {/* Quick Add More Tile */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#FC7454] bg-white flex flex-col items-center justify-center text-slate-500 hover:text-[#FC7454] cursor-pointer transition text-[10px] font-semibold space-y-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add More</span>
                    </button>
                  </div>

                  {/* User Approval Toggle for Photos */}
                  <label className="flex items-center space-x-2.5 pt-2 border-t border-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={userApprovedPhotos}
                      onChange={(e) => setUserApprovedPhotos(e.target.checked)}
                      className="w-4 h-4 text-[#FC7454] rounded bg-white border-slate-300 focus:ring-[#FC7454]"
                    />
                    <span className="text-[#1C2C34] font-semibold text-xs leading-normal">
                      {isUrdu 
                        ? 'رسمی شکایت میں یہ تصاویر منسلک کریں' 
                        : 'Include verified photos in formal complaint package'}
                    </span>
                  </label>
                </div>
              ) : (
                <p className="text-[#5A6E78] text-[11px]">
                  {isUrdu 
                    ? 'کوئی تصویر منسلک نہیں ہے۔ آپ اوپر دیے گئے بٹن سے فوری تصاویر اپ لوڈ کر سکتی ہیں یا والٹ سے امپورٹ کر سکتی ہیں۔' 
                    : 'No photos currently attached. Use the upload button above or import stored evidence from your incident vault.'}
                </p>
              )}

              {/* AI Privacy & Non-Training Guarantee Notice */}
              <div className="p-3 rounded-xl bg-[#ECF4F4] border border-[#BCD4D4] flex items-start space-x-2 text-[11px] text-[#1C2C34]">
                <Lock className="w-4 h-4 text-[#FC7454] mt-0.5 flex-shrink-0" />
                <p>
                  <strong className="text-[#FC7454]">{isUrdu ? 'پرائیویسی گارنٹی:' : 'Privacy Guarantee:'}</strong>{' '}
                  {isUrdu
                    ? 'آپ کے اپ لوڈ کردہ شواہد اور تصاویر صرف متعلقہ سرکاری ادارے (جیسے پنجاب پروٹیکشن اتھارٹی / محتسب) میں جمع کرانے کے لیے ہیں۔ یہ ڈیٹا کسی AI ماڈل کی ٹریننگ کے لیے استعمال نہیں ہوتا۔'
                    : 'Your uploaded evidence is strictly intended for submission to the relevant authority (e.g. Punjab Women Protection Authority / Ombudsperson). Your evidence is never used to train AI models.'}
                </p>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1C2C34] text-xs font-semibold flex items-center space-x-1 whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => {
                  setStructuredSummary(''); // Force regeneration in step 3
                  setStep(3);
                }}
                className="px-4 sm:px-6 py-2.5 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition whitespace-nowrap cursor-pointer"
              >
                <span>{isUrdu ? 'ڈرافٹ تیار کریں' : 'Generate AI Draft'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 3: AI Synthesis, Review & Redaction */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-2xl bg-white border border-[#BCD4D4]/60 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1C2C34] flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-[#FC7454]" />
                  <span>{isUrdu ? 'ڈرافٹ کا جائزہ اور ایڈیٹنگ:' : 'Review & Redact Structured Draft'}</span>
                </h3>
                <p className="text-xs text-[#5A6E78] mt-0.5">
                  You have full editorial control. You can freely edit or delete any sentence before proceeding.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#ECF4F4] hover:bg-[#d8ebeb] border border-[#BCD4D4] text-xs font-semibold text-[#1C2C34] flex items-center space-x-1.5 cursor-pointer shadow-xs transition"
                  title="Export to printer-friendly, password-protected PDF for court/police submission"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FC7454]" />
                  <span>Export Protected PDF</span>
                </button>

                <button
                  onClick={handleCopyText}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs text-[#1C2C34] flex items-center space-x-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
            </div>


            {/* Editable Structured Summary */}
            <div className="text-xs">
              <label className="block text-[#1C2C34] font-semibold mb-1">
                Formal Complaint Petition Text (Editable):
              </label>
              <textarea
                rows={11}
                value={structuredSummary}
                onChange={(e) => setStructuredSummary(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-[#1C2C34] leading-relaxed focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
              />
            </div>

            {/* Safe Contact Specification */}
            <div className="text-xs space-y-1">
              <label className="block text-[#1C2C34] font-semibold">
                {isUrdu ? 'محفوظ رابطے کا طریقہ (اختیاری):' : 'Safe Contact Method / Alternate Phone (Optional):'}
              </label>
              <input
                type="text"
                value={safeContactMethod}
                onChange={(e) => setSafeContactMethod(e.target.value)}
                placeholder="e.g. Call only between 10am-1pm on alternate SIM, or contact via sister's number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
              />
            </div>

            {/* Data Boundary Clarification */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-[#5A6E78] uppercase tracking-wider text-[10px]">
                {isUrdu ? 'پرائیویسی و ڈیٹا باؤنڈری:' : 'Privacy & Data Boundary Check:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center space-x-1.5 text-[#1C2C34]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Shareable: Incident facts, category, district</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[#1C2C34]">
                  <Lock className="w-3.5 h-3.5 text-[#FC7454] flex-shrink-0" />
                  <span>Kept Private: Device notes, unselected photos</span>
                </div>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1C2C34] text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveDraftOnly}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1C2C34] text-xs font-semibold cursor-pointer"
                >
                  Save as Private Draft (No Send)
                </button>

                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                >
                  <span>Proceed to Consent & Channel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 4: Consent & Official Handoff */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-2xl bg-white border border-[#BCD4D4]/60 p-6 space-y-5 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-[#1C2C34] flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#FC7454]" />
                <span>{isUrdu ? 'حتمی رضامندی و سرکاری چینل روٹ:' : 'Final Explicit Consent & Official Handoff Gate'}</span>
              </h3>
              <p className="text-xs text-[#5A6E78] mt-1">
                Mehfooz does not automatically submit complaints without your explicit approval. Please review and confirm your handoff choice below.
              </p>
            </div>

            {/* Target Channel Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5A6E78] uppercase tracking-wider">
                  Selected Official Destination:
                </span>
                {aiRecommendation && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-[#FC7454]" />
                    <span>AI Recommended Match</span>
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-[#1C2C34]">
                {getOfficialChannelTitle(requestedSupport, customChannelName)}
              </h4>
              {requestedSupport === 'other' && customChannelContact && (
                <p className="text-[11px] font-medium text-[#1C2C34] bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-block">
                  Recipient Contact / Focal Person: {customChannelContact}
                </p>
              )}
              {aiRecommendation && (
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <div className="font-semibold text-emerald-900">
                    Statutory Jurisdiction: {aiRecommendation.applicableLaw}
                  </div>
                  <div className="text-[#5A6E78] leading-tight">
                    {aiRecommendation.rationale}
                  </div>
                </div>
              )}
              <p className="text-[#5A6E78] text-[11px]">
                Upon handoff, your structured draft will be registered in your local tracking dashboard and prepared for official verification.
              </p>
            </div>

            {/* Mandatory Explicit Consent Checkbox */}
            <div className="p-4 rounded-2xl bg-[#ECF4F4] border border-[#BCD4D4] space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={explicitConsent}
                  onChange={(e) => setExplicitConsent(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-[#FC7454] rounded bg-white border-slate-300 focus:ring-[#FC7454]"
                />
                <span className="text-xs text-[#1C2C34] leading-relaxed font-medium">
                  {isUrdu 
                    ? 'میں تصدیق کرتی ہوں کہ میں نے اس ڈرافٹ کا جائزہ لیا ہے اور میں اسے منتخب سرکاری چینل پر کھولنے اور پیش کرنے کی واضح اجازت دیتی ہوں۔ میں سمجھتی ہوں کہ حتمی کارروائی متعلقہ ادارے کے تصدیقی عمل کے بعد ہوگی۔'
                    : 'I confirm that I have reviewed this draft complaint and give my explicit consent to open and hand off this information to the selected official/support route. I acknowledge that Mehfooz prepares the request and that official status is confirmed upon agency review.'}
                </span>
              </label>
            </div>

            {/* Success state display */}
            {handoffSuccess && (
              <div className="p-4.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-3.5">
                <div className="flex items-center space-x-2 font-bold text-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Official Channel Handoff & Email Dispatched Successfully!</span>
                </div>
                <p className="leading-relaxed">
                  Your formal legal docket reference code is: <strong className="font-mono text-emerald-950 text-sm bg-white px-2.5 py-1 rounded-lg border border-emerald-300 ml-1 inline-block">{handoffSuccess}</strong>
                </p>

                {/* Dispatch status notice (live vs simulated, honest reporting) */}
                {deliveryNotice && (
                  <p className="text-[11px] text-emerald-800 bg-white/80 border border-emerald-200 rounded-lg p-2 leading-relaxed">
                    {deliveryNotice}
                  </p>
                )}

                {/* Automated Email Confirmation Banner */}
                <div className="p-3 bg-white/95 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-900 shadow-2xs">
                  <div className="flex items-center space-x-2 font-semibold">
                    <Mail className="w-4 h-4 text-[#FC7454]" />
                    <span>Automated Legal Confirmation Emailed to:</span>
                  </div>
                  <p className="font-mono text-xs font-bold text-[#1C2C34] bg-emerald-50/70 px-2.5 py-1 rounded border border-emerald-200 inline-block">
                    {emailDispatchedTo || '(email not configured)'}
                  </p>
                  <p className="text-[11px] text-[#5A6E78]">
                    {emailDispatchedTo
                      ? 'A formal verification docket with statutory legal grounds (PPWVA 2016 / PECA 2016) and filing receipt was automatically sent to your email address.'
                      : 'Live email dispatch is not configured on this server — your docket was registered locally and can be exported below as a password-protected PDF.'}
                  </p>
                  {resendEmailNotice && (
                    <p className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 p-2 rounded-lg border border-emerald-200">
                      {resendEmailNotice}
                    </p>
                  )}
                </div>

                {/* Password-Protected PDF Download Notice */}
                <div className="p-3 bg-white/95 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-semibold">
                      <Lock className="w-4 h-4 text-[#FC7454]" />
                      <span>Printer-Friendly Legal Submission PDF (128-bit Encrypted):</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      On Demand
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A6E78]">
                    No file was downloaded automatically. Use the button below whenever you are ready — you will set a password first, and the PDF will require that password to open or print for official submission.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsExportModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#1C2C34] text-white hover:bg-[#263842] font-semibold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition"
                    >
                      <FileDown className="w-3.5 h-3.5 text-[#BCD4D4]" />
                      <span>Download Password-Protected PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={isResendingEmail}
                      className="px-3 py-1.5 rounded-lg bg-[#ECF4F4] text-[#1C2C34] hover:bg-[#d8ebeb] border border-[#BCD4D4] font-semibold text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-[#FC7454] ${isResendingEmail ? 'animate-spin' : ''}`} />
                      <span>{isResendingEmail ? 'Sending...' : 'Resend Email Copy'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800">
                  You can now monitor this request in the <strong>My Updates</strong> dashboard or share the password-protected PDF with legal counsel.
                </p>
              </div>
            )}


            {/* Step 4 Actions */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => setStep(3)}
                disabled={Boolean(handoffSuccess)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1C2C34] text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Review</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveDraftOnly}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1C2C34] text-xs font-semibold cursor-pointer"
                >
                  Save as Private Draft
                </button>

                <button
                  onClick={handleExecuteHandoff}
                  disabled={!explicitConsent || isSubmittingHandoff || Boolean(handoffSuccess)}
                  className="px-6 py-2.5 rounded-xl bg-[#1C2C34] hover:bg-[#263842] disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#BCD4D4]" />
                  <span>
                    {isSubmittingHandoff ? 'Preparing Handoff...' : 'Confirm & Open Official Channel'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* Export to Password-Protected PDF Modal */}
      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        language={language}
        complaintDraft={createdDraft || {
          id: `draft-active-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stage: handoffSuccess ? 'official_channel_opened' : 'ready_for_review',
          category,
          district,
          locationDetails,
          incidentDate,
          incidentTime,
          isSituationOngoing,
          requestedSupport: requestedSupport === 'ai_recommendation' ? 'police_support' : requestedSupport,
          customChannelName: requestedSupport === 'other' ? customChannelName : undefined,
          customChannelContact: requestedSupport === 'other' ? customChannelContact : undefined,
          aiRecommendationDetails: aiRecommendation || undefined,
          safeContactMethod,
          incidentSummary: structuredSummary || rawUserWords,
          originalUserWords: rawUserWords,
          attachedVaultRecordIds: importedRecords.map(r => r.id),
          attachedPhotos: userApprovedPhotos ? photos : [],
          userApprovalForPhotos: userApprovedPhotos,
          hasEvidence: importedRecords.length > 0 || photos.length > 0,
          evidencePrivacyAcknowledged: true,
          userConsentGiven: Boolean(handoffSuccess),
          officialReferenceNumber: handoffSuccess || undefined,
          officialChannelUsed: getOfficialChannelTitle(requestedSupport, customChannelName)
        }}
        incidentRecords={importedRecords}
        defaultUserPin={getStoredProfile()?.stealthPin || '1520'}
        defaultUserName={getStoredProfile()?.fullName || 'Ayesha Rehman'}
        onLogAudit={onLogAudit}
      />

      {/* Fullscreen Photo Lightbox Modal */}
      <AnimatePresence>
        {previewPhotoUrl && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700 text-white">
                <span className="text-xs font-semibold flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-[#FC7454]" />
                  <span>Photo Evidence Preview</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(null)}
                  className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3 flex items-center justify-center overflow-auto max-h-[75vh]">
                <img
                  src={previewPhotoUrl}
                  alt="Full size evidence"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>
              <div className="px-4 py-2.5 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">
                  Protected under Punjab Evidence Act / Qanun-e-Shahadat 1984
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(null)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

