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
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, ComplaintDraft, IncidentCategory, PunjabDistrict, VaultRecord } from '../types';

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
  const [requestedSupport, setRequestedSupport] = useState<'legal_aid' | 'police_support' | 'workplace_ombudsperson' | 'counselling' | 'shelter'>('police_support');
  const [safeContactMethod, setSafeContactMethod] = useState('');
  const [explicitConsent, setExplicitConsent] = useState(false);
  const [isSubmittingHandoff, setIsSubmittingHandoff] = useState(false);
  const [handoffSuccess, setHandoffSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Attached photos and user approval state
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [userApprovedPhotos, setUserApprovedPhotos] = useState<boolean>(true);

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

  // Generate structured summary when reaching Step 3
  useEffect(() => {
    if (step === 3 && !structuredSummary) {
      // Synthesize clean fact-based neutral summary
      const generated = `STATEMENT OF INCIDENT / GRIEVANCE (District: ${district}, Punjab)

1. JURISDICTION & APPLICABLE LAWS:
   - Primary Subject: ${category.replace(/_/g, ' ').toUpperCase()}
   - Jurisdiction: District ${district}, Province of Punjab
   - Relevant Acts: Punjab Protection of Women Against Violence Act 2016 (PPWVA) / Pakistan Penal Code (PPC)

2. CHRONOLOGY OF FACTS:
   - Incident Date / Period: ${incidentDate || 'Ongoing'} (Approx. ${incidentTime})
   - Incident Location: ${locationDetails || 'Confidential residential/workplace premises'}
   - Ongoing Status: ${isSituationOngoing ? 'Yes, situation is active' : 'Past incident documented'}

3. SUMMARY OF GRIEVANCE:
   ${rawUserWords || 'The complainant reports an incident of domestic restriction, intimidation, or harassment requiring protective orders and legal intervention under Punjab provincial jurisdiction.'}

4. RELIEF / SUPPORT REQUESTED:
   - Request for ${requestedSupport === 'police_support' ? 'Police Assistance / Protection Order via PSCA 15 / VWPS' : requestedSupport === 'workplace_ombudsperson' ? 'Investigation by Provincial Ombudsperson Punjab' : 'Pro-bono Legal Aid Representation'}
   - Safe contact preference: ${safeContactMethod || 'Discreet contact via designated representative'}`;

      setStructuredSummary(generated);
    }
  }, [step, category, district, incidentDate, incidentTime, locationDetails, isSituationOngoing, rawUserWords, requestedSupport, safeContactMethod, structuredSummary]);

  const handleExecuteHandoff = async () => {
    if (!explicitConsent) return;

    setIsSubmittingHandoff(true);
    onLogAudit?.('consent_granted', 'User gave explicit consent for official channel handoff');

    try {
      const res = await fetch('/api/mock-handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintData: {
            district,
            category,
            summary: structuredSummary
          }
        })
      });

      const data = await res.json();
      const trackingCode = data.trackingNumber || `PSCA-${district.substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newDraft: ComplaintDraft = {
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
        requestedSupport,
        safeContactMethod,
        attachedVaultRecordIds: importedRecords.map(r => r.id),
        attachedPhotos: userApprovedPhotos ? photos : [],
        userApprovalForPhotos: userApprovedPhotos,
        hasEvidence: photos.length > 0 || importedRecords.length > 0,
        evidencePrivacyAcknowledged: true,
        userConsentGiven: true,
        userConsentTimestamp: new Date().toISOString(),
        officialChannelUsed: requestedSupport === 'workplace_ombudsperson' ? 'Office of Ombudsperson Punjab' : 'PSCA Emergency 15 / Virtual Women Police Station',
        officialReferenceNumber: trackingCode,
        isMockHandoff: true
      };

      // Save to localStorage
      const existingDrafts: ComplaintDraft[] = JSON.parse(localStorage.getItem('mehfooz_complaint_drafts_v1') || '[]');
      localStorage.setItem('mehfooz_complaint_drafts_v1', JSON.stringify([newDraft, ...existingDrafts]));

      setHandoffSuccess(trackingCode);
      onDraftCreated(newDraft);
      onLogAudit?.('handoff_executed', `Official channel handoff initialized with ref: ${trackingCode}`);
    } catch (err) {
      console.error('Handoff error:', err);
    } finally {
      setIsSubmittingHandoff(false);
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
      requestedSupport,
      safeContactMethod,
      attachedVaultRecordIds: importedRecords.map(r => r.id),
      attachedPhotos: userApprovedPhotos ? photos : [],
      userApprovalForPhotos: userApprovedPhotos,
      hasEvidence: photos.length > 0 || importedRecords.length > 0,
      evidencePrivacyAcknowledged: true,
      userConsentGiven: false
    };

    const existingDrafts: ComplaintDraft[] = JSON.parse(localStorage.getItem('mehfooz_complaint_drafts_v1') || '[]');
    localStorage.setItem('mehfooz_complaint_drafts_v1', JSON.stringify([newDraft, ...existingDrafts]));

    onDraftCreated(newDraft);
    onLogAudit?.('complaint_drafted', 'Saved private unsubmitted complaint draft');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(structuredSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5 text-[#181A20]">
      {/* Step Progress Bar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-[#181A20] uppercase tracking-wider">
            {isUrdu ? 'شکایت ڈرافٹ معاون • مرحلہ ' + step + ' از 4' : `Complaint Intake Assistant • Step ${step} of 4`}
          </span>
          <span className="text-[#6B7280]">
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
                s <= step ? 'bg-[#9333EA]' : 'bg-transparent'
              } ${s < step ? 'border-r border-white' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Safety & Category Selection */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Immediate Danger Check */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-[#181A20] space-y-2">
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
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#181A20]">
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
                      ? 'bg-[#F5EEFD] border-[#E9D5FF] ring-2 ring-[#B886FD]/50 text-[#181A20]' 
                      : 'bg-slate-50 border-slate-200 text-[#4B5563] hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className={category === c.key ? 'text-[#9333EA]' : 'text-[#181A20]'}>{c.title}</span>
                    {category === c.key && <CheckCircle2 className="w-4 h-4 text-[#9333EA]" />}
                  </div>
                  <p className="text-[11px] text-[#6B7280]">{c.desc}</p>
                </button>
              ))}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
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
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#181A20]">
              {isUrdu ? 'مقام اور واقعات کی تفصیل:' : 'Incident Details & Jurisdiction (Punjab):'}
            </h3>

            {/* District & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#181A20] font-semibold mb-1">
                  {isUrdu ? 'ضلع (پنجاب):' : 'Punjab District / Division:'}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as PunjabDistrict)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#181A20] focus:outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
                >
                  {PUNJAB_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#181A20] font-semibold mb-1">
                  {isUrdu ? 'مقام یا علاقہ:' : 'Town / Area Location:'}
                </label>
                <input
                  type="text"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="e.g. Model Town Lahore, workplace office"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#181A20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
                />
              </div>
            </div>

            {/* Date & Ongoing check */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#181A20] font-semibold mb-1">
                  {isUrdu ? 'واقعہ کی تاریخ (یا آغاز):' : 'Incident Date (or start date):'}
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#181A20] focus:outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="ongoing-check"
                  checked={isSituationOngoing}
                  onChange={(e) => setIsSituationOngoing(e.target.checked)}
                  className="w-4 h-4 text-[#9333EA] rounded bg-white border-slate-300 focus:ring-[#9333EA]"
                />
                <label htmlFor="ongoing-check" className="text-xs text-[#181A20] cursor-pointer">
                  {isUrdu ? 'یہ صورتحال ابھی بھی جاری ہے' : 'This situation / threat is currently ongoing'}
                </label>
              </div>
            </div>

            {/* Narrative */}
            <div className="text-xs space-y-1">
              <label className="block text-[#181A20] font-semibold">
                {isUrdu ? 'اپنے الفاظ میں واقعہ بیان کریں:' : 'Describe the incident in your own words:'}
              </label>
              <textarea
                rows={5}
                value={rawUserWords}
                onChange={(e) => setRawUserWords(e.target.value)}
                placeholder="Include what happened, who did it, what threats were made, and whether children are involved. You will be able to review and redact any text in the next step..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[#181A20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
              />
            </div>

            {/* Preferred Support Target */}
            <div className="text-xs space-y-1">
              <label className="block text-[#181A20] font-semibold">
                {isUrdu ? 'آپ کس قسم کی قانونی یا سرکاری مدد چاہتی ہیں؟' : 'Preferred Support Channel Target:'}
              </label>
              <select
                value={requestedSupport}
                onChange={(e) => setRequestedSupport(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#181A20] focus:outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
              >
                <option value="police_support">Punjab Police / PSCA Emergency 15 & Virtual Women Police Station</option>
                <option value="workplace_ombudsperson">Provincial Ombudsperson Punjab (Workplace Harassment)</option>
                <option value="legal_aid">Free Legal Aid Cell (AGHS / Asma Jahangir Foundation)</option>
                <option value="shelter">Dar-ul-Aman Safe Crisis Shelter</option>
                <option value="counselling">Psychological Counselling & Trauma Support</option>
              </select>
            </div>

            {/* Evidence Photos Section with User Approval Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-[#181A20]">
                  <ImageIcon className="w-4 h-4 text-[#9333EA]" />
                  <span>{isUrdu ? 'فوٹو ثبوت (پرائیویٹ سیفٹی زون)' : 'Photo Evidence (Private Safety Zone)'}</span>
                </div>
                <span className="text-[11px] text-[#6B7280] font-semibold">
                  {photos.length} {photos.length === 1 ? 'photo' : 'photos'} attached
                </span>
              </div>

              {photos.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2.5">
                    {photos.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt="Evidence"
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-slate-300 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-xs cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* User Approval Toggle for Photos */}
                  <label className="flex items-center space-x-2.5 pt-2 border-t border-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={userApprovedPhotos}
                      onChange={(e) => setUserApprovedPhotos(e.target.checked)}
                      className="w-4 h-4 text-[#9333EA] rounded bg-white border-slate-300 focus:ring-[#9333EA]"
                    />
                    <span className="text-[#181A20] font-semibold text-xs leading-normal">
                      {isUrdu 
                        ? 'رسمی شکایت میں یہ تصاویر منسلک کریں' 
                        : 'Include verified photos in formal complaint package'}
                    </span>
                  </label>
                </div>
              ) : (
                <p className="text-[#6B7280] text-[11px]">
                  {isUrdu 
                    ? 'کوئی تصویر منسلک نہیں ہے۔ آپ لیگل چیٹ یا والٹ سے تصاویر منسلک کر سکتی ہیں۔' 
                    : 'No photos currently attached. You can attach photos during legal chat or private vault records.'}
                </p>
              )}
              {/* AI Privacy & Non-Training Guarantee Notice */}
              <div className="p-3 rounded-xl bg-[#F5EEFD] border border-[#E9D5FF] flex items-start space-x-2 text-[11px] text-[#181A20]">
                <Lock className="w-4 h-4 text-[#9333EA] mt-0.5 flex-shrink-0" />
                <p>
                  <strong className="text-[#9333EA]">{isUrdu ? 'پرائیویسی گارنٹی:' : 'Privacy Guarantee:'}</strong>{' '}
                  {isUrdu
                    ? 'آپ کے اپ لوڈ کردہ شواہد اور تصاویر صرف متعلقہ سرکاری ادارے (جیسے پنجاب پروٹیکشن اتھارٹی / محتسب) میں جمع کرانے کے لیے ہیں۔ یہ ڈیٹا کسی AI ماڈل کی ٹریننگ کے لیے استعمال نہیں ہوتا۔'
                    : 'Your uploaded evidence is strictly intended for submission to the relevant organization (e.g., Punjab Women Protection Authority / Ombudsperson). Your evidence is not used to train AI models.'}
                </p>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#181A20] text-xs font-semibold flex items-center space-x-1 whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => {
                  setStructuredSummary(''); // Force regeneration in step 3
                  setStep(3);
                }}
                className="px-4 sm:px-6 py-2.5 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition whitespace-nowrap cursor-pointer"
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
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#181A20] flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-[#9333EA]" />
                  <span>{isUrdu ? 'ڈرافٹ کا جائزہ اور ایڈیٹنگ:' : 'Review & Redact Structured Draft'}</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  You have full editorial control. You can freely edit or delete any sentence before proceeding.
                </p>
              </div>

              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs text-[#181A20] flex items-center space-x-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            {/* Editable Structured Summary */}
            <div className="text-xs">
              <label className="block text-[#181A20] font-semibold mb-1">
                Formal Complaint Petition Text (Editable):
              </label>
              <textarea
                rows={11}
                value={structuredSummary}
                onChange={(e) => setStructuredSummary(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-[#181A20] leading-relaxed focus:outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
              />
            </div>

            {/* Safe Contact Specification */}
            <div className="text-xs space-y-1">
              <label className="block text-[#181A20] font-semibold">
                {isUrdu ? 'محفوظ رابطے کا طریقہ (اختیاری):' : 'Safe Contact Method / Alternate Phone (Optional):'}
              </label>
              <input
                type="text"
                value={safeContactMethod}
                onChange={(e) => setSafeContactMethod(e.target.value)}
                placeholder="e.g. Call only between 10am-1pm on alternate SIM, or contact via sister's number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#181A20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
              />
            </div>

            {/* Data Boundary Clarification */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-[#6B7280] uppercase tracking-wider text-[10px]">
                {isUrdu ? 'پرائیویسی و ڈیٹا باؤنڈری:' : 'Privacy & Data Boundary Check:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center space-x-1.5 text-[#181A20]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Shareable: Incident facts, category, district</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[#181A20]">
                  <Lock className="w-3.5 h-3.5 text-[#9333EA] flex-shrink-0" />
                  <span>Kept Private: Device notes, unselected photos</span>
                </div>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#181A20] text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveDraftOnly}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#181A20] text-xs font-semibold cursor-pointer"
                >
                  Save as Private Draft (No Send)
                </button>

                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
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
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-[#181A20] flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#9333EA]" />
                <span>{isUrdu ? 'حتمی رضامندی و سرکاری چینل روٹ:' : 'Final Explicit Consent & Official Handoff Gate'}</span>
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Mehfooz does not automatically submit complaints without your explicit approval. Please review and confirm your handoff choice below.
              </p>
            </div>

            {/* Target Channel Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Selected Official Destination:
              </span>
              <h4 className="text-sm font-bold text-[#181A20]">
                {requestedSupport === 'workplace_ombudsperson' 
                  ? 'Office of the Provincial Ombudsperson Punjab (Harassment at Workplace)' 
                  : requestedSupport === 'legal_aid'
                    ? 'AGHS Legal Aid Cell (Asma Jahangir Foundation Lahore)'
                    : 'Punjab Safe Cities Authority (PSCA) Emergency 15 & Virtual Women Police Station'}
              </h4>
              <p className="text-[#6B7280] text-[11px]">
                Upon handoff, your structured draft will be registered in your local tracking dashboard and prepared for official verification.
              </p>
            </div>

            {/* Mandatory Explicit Consent Checkbox */}
            <div className="p-4 rounded-2xl bg-[#F5EEFD] border border-[#E9D5FF] space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={explicitConsent}
                  onChange={(e) => setExplicitConsent(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-[#9333EA] rounded bg-white border-slate-300 focus:ring-[#9333EA]"
                />
                <span className="text-xs text-[#181A20] leading-relaxed font-medium">
                  {isUrdu 
                    ? 'میں تصدیق کرتی ہوں کہ میں نے اس ڈرافٹ کا جائزہ لیا ہے اور میں اسے منتخب سرکاری چینل پر کھولنے اور پیش کرنے کی واضح اجازت دیتی ہوں۔ میں سمجھتی ہوں کہ حتمی کارروائی متعلقہ ادارے کے تصدیقی عمل کے بعد ہوگی۔'
                    : 'I confirm that I have reviewed this draft complaint and give my explicit consent to open and hand off this information to the selected official/support route. I acknowledge that Mehfooz prepares the request and that official status is confirmed upon agency review.'}
                </span>
              </label>
            </div>

            {/* Success state display */}
            {handoffSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Official Channel Handoff Prepared Successfully!</span>
                </div>
                <p>
                  Your request tracking reference code is: <strong className="font-mono text-emerald-950 text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">{handoffSuccess}</strong>.
                </p>
                <p className="text-[11px] text-emerald-700">
                  You can now monitor this request in the <strong>My Updates</strong> dashboard or print/copy the formal petition.
                </p>
              </div>
            )}

            {/* Step 4 Actions */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => setStep(3)}
                disabled={Boolean(handoffSuccess)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#181A20] text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Review</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveDraftOnly}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#181A20] text-xs font-semibold cursor-pointer"
                >
                  Save as Private Draft
                </button>

                <button
                  onClick={handleExecuteHandoff}
                  disabled={!explicitConsent || isSubmittingHandoff || Boolean(handoffSuccess)}
                  className="px-6 py-2.5 rounded-xl bg-[#181A20] hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#B886FD]" />
                  <span>
                    {isSubmittingHandoff ? 'Preparing Handoff...' : 'Confirm & Open Official Channel'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
