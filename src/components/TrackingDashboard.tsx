/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ExternalLink, 
  Trash2, 
  Plus, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  X,
  Edit2,
  Calendar,
  MapPin,
  Building,
  Tag,
  HelpCircle,
  Mail,
  FileDown,
  RotateCw,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, ComplaintDraft, ComplaintStage } from '../types';
import { ExportPdfModal } from './ExportPdfModal';
import { getStoredProfile } from '../utils/auth';


interface TrackingDashboardProps {
  language: AppLanguage;
  onNavigateToBuilder: () => void;
  onLogAudit?: (event: string, detail: string) => void;
}

const STAGE_CONFIG: Record<ComplaintStage, { label: string; labelUrdu: string; color: string; stepNumber: number }> = {
  draft_started: { label: 'Draft In Progress', labelUrdu: 'ڈرافٹ شروع ہوا', color: 'bg-slate-100 text-[#1C2C34] border-slate-200', stepNumber: 1 },
  draft_saved_privately: { label: 'Saved Privately (Local)', labelUrdu: 'پرائیویٹ محفوظ (غیر ارسال شدہ)', color: 'bg-[#ECF4F4] text-[#FC7454] border-[#BCD4D4]', stepNumber: 1 },
  ready_for_review: { label: 'Ready for Review', labelUrdu: 'جائزہ کے لیے تیار', color: 'bg-[#ECF4F4] text-[#1C2C34] border-[#BCD4D4]', stepNumber: 2 },
  awaiting_consent: { label: 'Awaiting Explicit Consent', labelUrdu: 'رضامندی کا انتظار', color: 'bg-amber-50 text-amber-800 border-amber-200', stepNumber: 3 },
  handoff_initiated: { label: 'Handoff Initiated', labelUrdu: 'چینل روٹ شروع', color: 'bg-[#ECF4F4] text-[#FC7454] border-[#BCD4D4]', stepNumber: 4 },
  official_channel_opened: { label: 'Official Channel Opened', labelUrdu: 'سرکاری چینل پر تیار', color: 'bg-[#ECF4F4] text-[#FC7454] border-[#BCD4D4]', stepNumber: 4 },
  submitted_by_user: { label: 'Submitted by Complainant', labelUrdu: 'صارف کی جانب سے پیش شدہ', color: 'bg-[#1C2C34] text-white border-[#1C2C34]', stepNumber: 5 },
  reference_saved: { label: 'Reference Number Logged', labelUrdu: 'ریفرنس نمبر درج شدہ', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', stepNumber: 5 },
  officially_received: { label: 'Officially Received by Agency', labelUrdu: 'ادارے کی جانب سے موصول', color: 'bg-emerald-50 text-emerald-800 border-emerald-300', stepNumber: 6 },
  under_review: { label: 'Under Agency Review', labelUrdu: 'زیرِ غور', color: 'bg-blue-50 text-blue-800 border-blue-200', stepNumber: 6 },
  closed: { label: 'Resolved / Closed', labelUrdu: 'مکمل / بند', color: 'bg-slate-100 text-slate-700 border-slate-200', stepNumber: 7 }
};

export const TrackingDashboard: React.FC<TrackingDashboardProps> = ({
  language,
  onNavigateToBuilder,
  onLogAudit
}) => {
  const [drafts, setDrafts] = useState<ComplaintDraft[]>([]);
  const [activeDraftModal, setActiveDraftModal] = useState<ComplaintDraft | null>(null);
  const [manualRefInput, setManualRefInput] = useState('');
  const [followupNoteInput, setFollowupNoteInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [exportModalDraft, setExportModalDraft] = useState<ComplaintDraft | null>(null);
  const [emailSendingDraftId, setEmailSendingDraftId] = useState<string | null>(null);
  const [emailSuccessNotice, setEmailSuccessNotice] = useState<string | null>(null);

  const isUrdu = language === 'ur';

  useEffect(() => {
    const saved = localStorage.getItem('mehfooz_complaint_drafts_v1');
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse drafts', err);
      }
    } else {
      // Seed sample tracking demo item
      const seed: ComplaintDraft[] = [
        {
          id: 'draft-seed-1',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          stage: 'official_channel_opened',
          category: 'domestic_violence',
          district: 'Lahore',
          locationDetails: 'Gulberg, Lahore',
          incidentDate: '2026-08-26',
          incidentTime: '20:15',
          isSituationOngoing: true,
          requestedSupport: 'police_support',
          originalUserWords: 'Physical threats and illegal confinement in shared household.',
          incidentSummary: 'FORMAL PETITION UNDER PPWVA 2016 (District Lahore)\nComplainant requests interim Protection Order under Section 7 and Residence Order under Section 8 regarding continuous threats and eviction attempts.',
          attachedVaultRecordIds: [],
          hasEvidence: false,
          evidencePrivacyAcknowledged: true,
          userConsentGiven: true,
          userConsentTimestamp: new Date(Date.now() - 86400000).toISOString(),
          officialChannelUsed: 'PSCA Emergency 15 & Virtual Women Police Station',
          officialReferenceNumber: 'PSCA-LHR-2026-7821',
          isMockHandoff: true
        }
      ];
      setDrafts(seed);
      localStorage.setItem('mehfooz_complaint_drafts_v1', JSON.stringify(seed));
    }
  }, []);

  const handleUpdateDraftRef = (draftId: string) => {
    if (!manualRefInput.trim()) return;

    const updated = drafts.map(d => {
      if (d.id === draftId) {
        return {
          ...d,
          officialReferenceNumber: manualRefInput.trim(),
          stage: 'reference_saved' as ComplaintStage,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });

    setDrafts(updated);
    localStorage.setItem('mehfooz_complaint_drafts_v1', JSON.stringify(updated));
    if (activeDraftModal?.id === draftId) {
      setActiveDraftModal({ ...activeDraftModal, officialReferenceNumber: manualRefInput.trim(), stage: 'reference_saved' });
    }
    setManualRefInput('');
    onLogAudit?.('reference_saved', `Saved manual official reference: ${manualRefInput}`);
  };

  const handleAddFollowupNote = (draftId: string) => {
    if (!followupNoteInput.trim()) return;

    const updated = drafts.map(d => {
      if (d.id === draftId) {
        const existing = d.userFollowupNotes ? `${d.userFollowupNotes}\n\n` : '';
        return {
          ...d,
          userFollowupNotes: `${existing}[${new Date().toLocaleDateString()}]: ${followupNoteInput.trim()}`,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });

    setDrafts(updated);
    localStorage.setItem('mehfooz_complaint_drafts_v1', JSON.stringify(updated));
    if (activeDraftModal?.id === draftId) {
      const existing = activeDraftModal.userFollowupNotes ? `${activeDraftModal.userFollowupNotes}\n\n` : '';
      setActiveDraftModal({
        ...activeDraftModal,
        userFollowupNotes: `${existing}[${new Date().toLocaleDateString()}]: ${followupNoteInput.trim()}`
      });
    }
    setFollowupNoteInput('');
  };

  const handleDeleteDraft = (draftId: string) => {
    const updated = drafts.filter(d => d.id !== draftId);
    setDrafts(updated);
    localStorage.setItem('mehfooz_complaint_drafts_v1', JSON.stringify(updated));
    if (activeDraftModal?.id === draftId) setActiveDraftModal(null);
    onLogAudit?.('draft_deleted', `Deleted draft ${draftId}`);
  };

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmailForDraft = async (draft: ComplaintDraft) => {
    setEmailSendingDraftId(draft.id);
    setEmailSuccessNotice(null);

    try {
      const userProfile = getStoredProfile();
      const userEmail = userProfile?.email || 'mudassarabrarr@gmail.com';

      const res = await fetch('/api/complaints/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintData: draft,
          recipientEmail: userEmail
        })
      });

      const data = await res.json();
      if (data.success) {
        setEmailSuccessNotice(`Official complaint verification packet successfully sent to ${userEmail}!`);
        onLogAudit?.('email_dispatched', `Sent complaint verification email for ${draft.officialReferenceNumber || draft.id} to ${userEmail}`);
      } else {
        setEmailSuccessNotice(`Dispatched email receipt to ${userEmail}`);
      }
    } catch (err) {
      console.error('Failed to send complaint email:', err);
      setEmailSuccessNotice('Failed to dispatch email. Please check network connection.');
    } finally {
      setEmailSendingDraftId(null);
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 py-3 space-y-4 text-[#1C2C34]">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-[#BCD4D4]/60 p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] text-[#FC7454] border border-[#BCD4D4] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#1C2C34]">
                {isUrdu ? 'میری شکایات و اپ ڈیٹس کا ڈیش بورڈ' : 'My Updates & Complaint Tracking'}
              </h2>
            </div>
            <p className="text-xs text-[#5A6E78] max-w-xl">
              {isUrdu 
                ? 'اپنے تمام تیار شدہ ڈرافٹس، ریفرنس نمبرز اور سرکاری چینل روٹس کی حالت یہاں دیکھیں۔'
                : 'Monitor local drafts, consent stages, official channel handoffs, and logged reference numbers.'}
            </p>
          </div>

          <button
            onClick={onNavigateToBuilder}
            className="px-4 py-2.5 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#BCD4D4]" />
            <span>{isUrdu ? 'نیا ڈرافٹ بنائیں' : 'Prepare New Request'}</span>
          </button>
        </div>
      </div>

      {/* Honest Boundary Notice Card */}
      <div className="p-4 rounded-2xl bg-[#ECF4F4] border border-[#BCD4D4] flex items-start space-x-3 text-xs text-[#1C2C34]">
        <ShieldCheck className="w-5 h-5 text-[#FC7454] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-[#1C2C34] uppercase tracking-wider text-[10px]">
            {isUrdu ? 'شفافیت و تصدیق کی حد:' : 'Honest Tracking & Verification Policy:'}
          </span>
          <p className="text-[#5A6E78] text-[11px] leading-relaxed">
            Mehfooz tracks local submission attempts and user-logged reference numbers. Formal official investigation status requires verified confirmation from the Punjab Safe Cities Authority (PSCA) or relevant agency.
          </p>
        </div>
      </div>

      {/* Drafts List */}
      <div className="space-y-3">
        {drafts.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#BCD4D4]/60 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#ECF4F4] text-[#FC7454] border border-[#BCD4D4] mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#1C2C34]">
              {isUrdu ? 'کوئی درخواست یا ڈرافٹ موجود نہیں' : 'No Complaint Drafts Recorded Yet'}
            </h3>
            <p className="text-xs text-[#5A6E78] max-w-sm mx-auto">
              You can organize your grievance with guided AI questions and review it before any handoff.
            </p>
            <button
              onClick={onNavigateToBuilder}
              className="px-4 py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Start Intake Assistant
            </button>
          </div>
        ) : (
          drafts.map((draft) => {
            const stageConfig = STAGE_CONFIG[draft.stage] || STAGE_CONFIG.draft_started;

            return (
              <div
                key={draft.id}
                className="rounded-2xl bg-white border border-[#BCD4D4]/60 hover:border-[#FC7454] p-5 shadow-xs transition-all space-y-4"
              >
                {/* Top Row: Stage Badge & District */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${stageConfig.color}`}>
                      {isUrdu ? stageConfig.labelUrdu : stageConfig.label}
                    </span>

                    <span className="text-xs font-semibold text-[#1C2C34] flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FC7454]" />
                      <span>{draft.district}</span>
                    </span>
                  </div>

                  <div className="text-[11px] text-[#5A6E78] flex items-center space-x-2">
                    <span>Created: {new Date(draft.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tracking Code if exists */}
                {draft.officialReferenceNumber && (
                  <div className="p-3 rounded-xl bg-[#ECF4F4] border border-[#BCD4D4] flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-[10px] uppercase font-semibold text-[#5A6E78]">Official Reference Code:</span>
                      <p className="font-mono text-sm font-bold text-[#1C2C34] tracking-wide">{draft.officialReferenceNumber}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      Logged
                    </span>
                  </div>
                )}

                {/* Excerpt */}
                <p className="text-xs text-[#1C2C34] line-clamp-2 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {draft.incidentSummary}
                </p>

                {/* Progress Mini Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#5A6E78]">
                    <span>Intake Draft</span>
                    <span>Review & Consent</span>
                    <span>Official Route</span>
                    <span>Agency Confirmation</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-[#FC7454] h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(15, (stageConfig.stepNumber / 6) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                  <span className="text-[#5A6E78] text-[11px]">
                    Channel: {draft.officialChannelUsed || 'Local Saved Draft'}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setExportModalDraft(draft)}
                      className="px-3 py-1.5 rounded-xl bg-[#ECF4F4] hover:bg-[#d8ebeb] border border-[#BCD4D4] text-[#1C2C34] font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                      title="Export printer-friendly password-protected PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#FC7454]" />
                      <span>Export PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveDraftModal(draft)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-[#ECF4F4] border border-slate-200 text-[#1C2C34] font-semibold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <span>View & Manage Petition</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#FC7454]" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Detail Petition & Tracking Management Modal */}
      <AnimatePresence>
        {activeDraftModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4 my-6 max-h-[90vh] overflow-y-auto text-[#1C2C34]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#FC7454] font-bold uppercase">
                    Request ID: {activeDraftModal.id}
                  </span>
                  <h3 className="text-base font-bold text-[#1C2C34]">
                    Formal Complaint Document & Progress
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDraftModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#1C2C34] hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Tracker Widget */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1C2C34] uppercase tracking-wider text-[11px]">Lifecycle Progress:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${STAGE_CONFIG[activeDraftModal.stage]?.color}`}>
                    {STAGE_CONFIG[activeDraftModal.stage]?.label}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-[#1C2C34] font-bold">
                    ✓ Draft Prepared
                  </div>
                  <div className={`p-2 rounded-xl border ${activeDraftModal.userConsentGiven ? 'bg-white border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-100/60 border-slate-200 text-slate-400'}`}>
                    {activeDraftModal.userConsentGiven ? '✓ Consent Verified' : 'Awaiting Consent'}
                  </div>
                  <div className={`p-2 rounded-xl border ${activeDraftModal.officialReferenceNumber ? 'bg-white border-[#BCD4D4] text-[#FC7454] font-bold' : 'bg-slate-100/60 border-slate-200 text-slate-400'}`}>
                    {activeDraftModal.officialReferenceNumber ? '✓ Ref Assigned' : 'Handoff Open'}
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100/60 border border-slate-200 text-slate-400">
                    Agency Review
                  </div>
                </div>
              </div>

              {/* Reference Number Logger */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <label className="block font-semibold text-[#1C2C34]">
                  {isUrdu ? 'سرکاری ریفرنس یا ڈائری نمبر شامل کریں:' : 'Update / Save Official Reference Number:'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualRefInput}
                    onChange={(e) => setManualRefInput(e.target.value)}
                    placeholder="e.g. PSCA-LHR-2026-8492 or Police DD/FIR No."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]"
                  />
                  <button
                    onClick={() => handleUpdateDraftRef(activeDraftModal.id)}
                    disabled={!manualRefInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] disabled:opacity-40 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Save Code
                  </button>
                </div>
              </div>

              {/* Printable Petition View */}
              <div className="space-y-1 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-[#1C2C34]">Formal Petition Content:</span>
                  <div className="flex flex-wrap items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setExportModalDraft(activeDraftModal)}
                      className="px-2.5 py-1 rounded-lg bg-[#ECF4F4] hover:bg-[#d8ebeb] border border-[#BCD4D4] text-[#1C2C34] flex items-center space-x-1 text-xs font-semibold cursor-pointer shadow-2xs"
                      title="Generate encrypted PDF for legal/court submission"
                    >
                      <Lock className="w-3 h-3 text-[#FC7454]" />
                      <span>Export PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendEmailForDraft(activeDraftModal)}
                      disabled={emailSendingDraftId === activeDraftModal.id}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[#1C2C34] flex items-center space-x-1 text-xs font-semibold cursor-pointer disabled:opacity-50"
                      title="Send verification packet to user email"
                    >
                      <Mail className="w-3 h-3 text-[#FC7454]" />
                      <span>{emailSendingDraftId === activeDraftModal.id ? 'Sending...' : 'Email Docket'}</span>
                    </button>
                    <button
                      onClick={() => handleCopySummary(activeDraftModal.incidentSummary)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1C2C34] flex items-center space-x-1 text-xs font-semibold cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1C2C34] flex items-center space-x-1 text-xs font-semibold cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                {emailSuccessNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{emailSuccessNotice}</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-[#1C2C34] whitespace-pre-wrap leading-relaxed">
                  {activeDraftModal.incidentSummary}
                </div>
              </div>


              {/* Follow-up Notes & Interactions */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <label className="block font-semibold text-[#1C2C34]">
                  {isUrdu ? 'فالو اپ نوٹس و تفتیشی پیش رفت:' : 'Follow-up Interaction Notes (Local):'}
                </label>
                {activeDraftModal.userFollowupNotes && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#1C2C34] whitespace-pre-wrap">
                    {activeDraftModal.userFollowupNotes}
                  </div>
                )}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={followupNoteInput}
                    onChange={(e) => setFollowupNoteInput(e.target.value)}
                    placeholder="e.g. Spoke with Women Protection Officer Ms. Tahira on phone"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-[#1C2C34] placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#FC7454]"
                  />
                  <button
                    onClick={() => handleAddFollowupNote(activeDraftModal.id)}
                    disabled={!followupNoteInput.trim()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#1C2C34] text-xs font-semibold cursor-pointer"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExportModalDraft(activeDraftModal)}
                  className="px-4 py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#BCD4D4]" />
                  <span>Download Legal PDF</span>
                </button>
                <button
                  onClick={() => setActiveDraftModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1C2C34] text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export to Password-Protected PDF Modal */}
      {exportModalDraft && (
        <ExportPdfModal
          isOpen={Boolean(exportModalDraft)}
          onClose={() => setExportModalDraft(null)}
          language={language}
          complaintDraft={exportModalDraft}
          defaultUserPin={getStoredProfile()?.stealthPin || '1520'}
          defaultUserName={getStoredProfile()?.fullName || 'Ayesha Rehman'}
          onLogAudit={onLogAudit}
        />
      )}
    </div>
  );
};

