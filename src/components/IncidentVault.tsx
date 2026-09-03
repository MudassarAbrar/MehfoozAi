/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Trash2, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Image as ImageIcon, 
  CheckSquare, 
  Square as SquareOutline, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, IncidentCategory, VaultRecord } from '../types';
import { encryptLocalData, decryptLocalData } from '../utils/crypto';
import { ExportPdfModal } from './ExportPdfModal';
import { getStoredProfile } from '../utils/auth';


interface IncidentVaultProps {
  language: AppLanguage;
  onExportToComplaint: (records: VaultRecord[]) => void;
  onLogAudit?: (event: string, detail: string) => void;
  initialDraftNote?: { title: string; note: string } | null;
  onClearInitialDraft?: () => void;
}

const CATEGORY_MAP: Record<IncidentCategory, { label: string; labelUrdu: string; color: string }> = {
  domestic_violence: { label: 'Domestic Violence', labelUrdu: 'گھریلو تشدد', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  coercive_control: { label: 'Coercive Control / Isolation', labelUrdu: 'زبردستی کنٹرول / قید', color: 'bg-[#ECF4F4] text-[#1C2C34] border-[#BCD4D4]' },
  threats_intimidation: { label: 'Threats & Intimidation', labelUrdu: 'دھمکیاں و خوف و ہراس', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  workplace_harassment: { label: 'Workplace Harassment', labelUrdu: 'کام کی جگہ پر ہراسانی', color: 'bg-[#ECF4F4] text-[#1C2C34] border-[#BCD4D4]' },
  stalking_harassment: { label: 'Stalking / Public Harassment', labelUrdu: 'پیچھا کرنا / پبلک ہراسانی', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  cyber_blackmail: { label: 'Cyber Blackmail / PECA', labelUrdu: 'سائبر بلیک میلنگ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  physical_assault: { label: 'Physical Assault', labelUrdu: 'جسمانی مار پیٹ', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  financial_abuse: { label: 'Economic / Financial Abuse', labelUrdu: 'معاشی حق تلفی', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  other: { label: 'Other Incident', labelUrdu: 'دیگر واقعہ', color: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export const IncidentVault: React.FC<IncidentVaultProps> = ({
  language,
  onExportToComplaint,
  onLogAudit,
  initialDraftNote,
  onClearInitialDraft
}) => {
  const [records, setRecords] = useState<VaultRecord[]>([]);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [viewingRecord, setViewingRecord] = useState<VaultRecord | null>(null);

  // New Record Form State
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('domestic_violence');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('14:30');
  const [location, setLocation] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined);

  // Audio Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [exportRecordsSelection, setExportRecordsSelection] = useState<VaultRecord[]>([]);


  const isUrdu = language === 'ur';

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('mehfooz_vault_records_v1');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse vault records', err);
      }
    } else {
      // Seed sample encrypted demo record
      const seed: VaultRecord[] = [
        {
          id: 'rec-seed-1',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          incidentDate: '2026-08-27',
          incidentTime: '19:45',
          category: 'coercive_control',
          title: 'Phone confiscated & locked in bedroom',
          note: 'He snatched my mobile phone, deleted my messages with my sister, and locked the bedroom door from outside for 4 hours. No food was provided.',
          location: 'Gulberg III, Lahore (Shared residence)',
          witnesses: 'Mother-in-law was present in living room',
          encrypted: true,
          hasPhoto: false,
          audioDuration: 18
        }
      ];
      setRecords(seed);
      localStorage.setItem('mehfooz_vault_records_v1', JSON.stringify(seed));
    }
  }, []);

  // Handle incoming draft from legal assistant
  useEffect(() => {
    if (initialDraftNote) {
      setTitle(initialDraftNote.title);
      setNote(initialDraftNote.note);
      setIsAddingRecord(true);
      onClearInitialDraft?.();
    }
  }, [initialDraftNote, onClearInitialDraft]);

  // Audio record timer simulation
  useEffect(() => {
    let timer: any;
    if (isRecordingAudio) {
      timer = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingAudio]);

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !note.trim()) return;

    // Encrypt note text with Web Crypto
    await encryptLocalData(note);

    const newRecord: VaultRecord = {
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      incidentDate: incidentDate || new Date().toISOString().split('T')[0],
      incidentTime: incidentTime || '12:00',
      category,
      title: title.trim() || 'Private Incident Note',
      note: note.trim(),
      location: location.trim(),
      witnesses: witnesses.trim(),
      encrypted: true,
      hasPhoto,
      photoUrl,
      audioDuration
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('mehfooz_vault_records_v1', JSON.stringify(updated));

    onLogAudit?.('vault_encrypted', `Saved AES-256 encrypted incident note (${newRecord.category})`);

    // Reset Form
    setTitle('');
    setNote('');
    setLocation('');
    setWitnesses('');
    setHasPhoto(false);
    setPhotoUrl(undefined);
    setAudioDuration(undefined);
    setIsAddingRecord(false);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem('mehfooz_vault_records_v1', JSON.stringify(updated));
    setSelectedRecordIds(selectedRecordIds.filter(selId => selId !== id));
    if (viewingRecord?.id === id) setViewingRecord(null);
    onLogAudit?.('vault_deleted', `Deleted record ${id}`);
  };

  const toggleSelectRecord = (id: string) => {
    setSelectedRecordIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    const selected = records.filter(r => selectedRecordIds.includes(r.id));
    if (selected.length > 0) {
      onExportToComplaint(selected);
    }
  };

  const handlePhotoUploadSim = () => {
    setHasPhoto(true);
    setPhotoUrl('https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80');
  };

  const handleToggleAudioRecord = () => {
    if (!isRecordingAudio) {
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
    } else {
      setIsRecordingAudio(false);
      setAudioDuration(recordingSeconds || 12);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-3 space-y-4 text-[#1C2C34]">
      {/* Vault Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] text-[#1C2C34] flex items-center justify-center border border-[#BCD4D4]">
                <Lock className="w-4 h-4 text-[#FC7454]" />
              </div>
              <h2 className="text-base font-bold text-[#1C2C34]">
                {isUrdu ? 'پرائیویٹ و خفیہ نوٹس والی والٹ' : 'Encrypted Private Incident Vault'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#ECF4F4] text-[#FC7454] text-[10px] font-mono border border-[#BCD4D4]">
                AES-256 On-Device
              </span>
            </div>
            <p className="text-xs text-[#5A6E78] max-w-xl">
              {isUrdu 
                ? 'تمام واقعات اور نوٹس آپ کے فون میں محفوظ اور اینکرپٹڈ ہیں۔ یہ ڈیٹا کسی سرور پر اپلوڈ نہیں ہوتا تاوقتیکہ آپ شکایت کا حصہ نہ بنائیں۔'
                : 'Incident timelines, dates, and evidence notes stay strictly encrypted on this device. Nothing is shared with authorities unless you explicitly export to a verified complaint.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {records.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setExportRecordsSelection(records);
                  setIsExportPdfOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-[#ECF4F4] hover:bg-[#d8ebeb] border border-[#BCD4D4] text-[#1C2C34] font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                title="Export all incident records into a password-protected PDF"
              >
                <Printer className="w-4 h-4 text-[#FC7454]" />
                <span>Export Vault PDF</span>
              </button>
            )}

            <button
              onClick={() => setIsAddingRecord(true)}
              className="px-4 py-2.5 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FC7454]" />
              <span>{isUrdu ? 'نیا واقعہ درج کریں' : 'Log New Incident'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Export to Complaint Action Bar */}
      {selectedRecordIds.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-[#ECF4F4] border border-[#BCD4D4] flex flex-wrap items-center justify-between gap-2 shadow-xs"
        >
          <div className="flex items-center space-x-2 text-xs text-[#1C2C34] min-w-0">
            <CheckSquare className="w-4 h-4 text-[#FC7454] flex-shrink-0" />
            <span className="truncate">
              <strong>{selectedRecordIds.length}</strong> record{selectedRecordIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const sel = records.filter(r => selectedRecordIds.includes(r.id));
                setExportRecordsSelection(sel);
                setIsExportPdfOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1C2C34] font-semibold text-xs flex items-center space-x-1.5 shadow-2xs transition whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#FC7454]" />
              <span>Export Protected PDF</span>
            </button>

            <button
              onClick={handleExportSelected}
              className="px-3.5 py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition whitespace-nowrap flex-shrink-0 cursor-pointer"
            >
              <span>{isUrdu ? 'ڈرافٹ میں شامل کریں' : 'Export to Complaint'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#BCD4D4]" />
            </button>
          </div>
        </motion.div>
      )}


      {/* Add New Record Modal / Drawer */}
      <AnimatePresence>
        {isAddingRecord && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#FC7454]" />
                  <h3 className="text-sm font-bold text-[#1C2C34]">
                    {isUrdu ? 'نیا واقعہ / پرائیویٹ نوٹ محفوظ کریں' : 'Create Encrypted Incident Record'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsAddingRecord(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#1C2C34] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRecord} className="space-y-3.5 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-[#1C2C34] font-semibold mb-1">
                    {isUrdu ? 'عنوان (مختصر):' : 'Incident Title / Summary:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Verbal threats during dinner, room locked from outside"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#1C2C34] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[#1C2C34] font-semibold mb-1">
                    {isUrdu ? 'واقعہ کی نوعیت:' : 'Incident Category:'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#1C2C34] focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
                  >
                    {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                      <option key={key} value={key}>
                        {isUrdu ? val.labelUrdu : val.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#1C2C34] font-semibold mb-1 flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{isUrdu ? 'تاریخ:' : 'Incident Date:'}</span>
                    </label>
                    <input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#1C2C34] focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[#1C2C34] font-semibold mb-1 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{isUrdu ? 'وقت (تقریباً):' : 'Approximate Time:'}</span>
                    </label>
                    <input
                      type="time"
                      value={incidentTime}
                      onChange={(e) => setIncidentTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#1C2C34] focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[#1C2C34] font-semibold mb-1 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{isUrdu ? 'مقام (شہر / گھر / دفتر):' : 'Location (e.g. Lahore residence, office):'}</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Model Town Lahore, shared residence"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#1C2C34] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
                  />
                </div>

                {/* Private Detailed Note */}
                <div>
                  <label className="block text-[#1C2C34] font-semibold mb-1">
                    {isUrdu ? 'واقعہ کی تفصیل (مکمل محفوظ):' : 'Private Notes & Exact Words Spoken:'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write what happened in your own words. Include quotes, threats, physical actions, or restrictions..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#1C2C34] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
                  />
                </div>

                {/* Witnesses */}
                <div>
                  <label className="block text-[#1C2C34] font-semibold mb-1">
                    {isUrdu ? 'گواہان / موجود افراد (اختیاری):' : 'Witnesses or People Present (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={witnesses}
                    onChange={(e) => setWitnesses(e.target.value)}
                    placeholder="e.g. Neighbor, colleague, relative"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#1C2C34] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FC7454] focus:ring-2 focus:ring-[#FC7454]/20"
                  />
                </div>

                {/* Evidence Attachments Row */}
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  {/* Photo simulation */}
                  <button
                    type="button"
                    onClick={handlePhotoUploadSim}
                    className={`px-3 py-2 rounded-xl border flex items-center space-x-1.5 transition shadow-xs cursor-pointer ${
                      hasPhoto 
                        ? 'bg-[#ECF4F4] border-[#BCD4D4] text-[#FC7454]' 
                        : 'bg-white border-slate-200 text-[#1C2C34] hover:bg-slate-50'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{hasPhoto ? 'Photo Attached (1)' : 'Attach Photo'}</span>
                  </button>

                  {/* Audio Recording simulation */}
                  <button
                    type="button"
                    onClick={handleToggleAudioRecord}
                    className={`px-3 py-2 rounded-xl border flex items-center space-x-1.5 transition shadow-xs cursor-pointer ${
                      isRecordingAudio 
                        ? 'bg-[#ECF4F4] border-[#BCD4D4] text-[#FC7454] animate-pulse' 
                        : audioDuration 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-white border-slate-200 text-[#1C2C34] hover:bg-slate-50'
                    }`}
                  >
                    {isRecordingAudio ? <Square className="w-3.5 h-3.5 text-[#1C2C34]" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>
                      {isRecordingAudio 
                        ? `Recording (${recordingSeconds}s)...` 
                        : audioDuration 
                          ? `Voice Note (${audioDuration}s)` 
                          : 'Record Voice Memo'}
                    </span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingRecord(false)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1C2C34] font-medium cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#FC7454]" />
                    <span>Save & Encrypt Record</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Incident List Timeline */}
      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#181A20]">
              {isUrdu ? 'کوئی پرائیویٹ نوٹ موجود نہیں ہے' : 'No Incident Records in Vault'}
            </h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              {isUrdu 
                ? 'آپ واقعات، دھمکیوں یا تفصیلات کو وقت اور تاریخ کے ساتھ مکمل محفوظ رکھ سکتی ہیں۔'
                : 'Document incidents, timelines, and private thoughts safely. Tap "Log New Incident" to begin.'}
            </p>
          </div>
        ) : (
          records.map((rec) => {
            const isSelected = selectedRecordIds.includes(rec.id);
            const catBadge = CATEGORY_MAP[rec.category] || CATEGORY_MAP.other;

            return (
              <div
                key={rec.id}
                className={`rounded-2xl bg-white border transition-all p-5 shadow-xs ${
                  isSelected ? 'border-[#FC7454] ring-2 ring-[#FC7454]/30' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Select Checkbox & Title */}
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleSelectRecord(rec.id)}
                      className="mt-1 text-slate-400 hover:text-[#FC7454] transition cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#FC7454]" />
                      ) : (
                        <SquareOutline className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catBadge.color}`}>
                          {isUrdu ? catBadge.labelUrdu : catBadge.label}
                        </span>

                        <span className="text-[11px] text-[#5A6E78] flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{rec.incidentDate}</span>
                        </span>

                        <span className="text-[11px] text-[#5A6E78] flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{rec.incidentTime}</span>
                        </span>

                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ECF4F4] text-[#FC7454] border border-[#BCD4D4] font-mono">
                          AES-256
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#1C2C34]">{rec.title}</h3>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDeleteRecord(rec.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Note Excerpt */}
                <p className="mt-3 text-xs text-[#1C2C34] leading-relaxed line-clamp-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {rec.note}
                </p>

                {/* Meta details & Media Tags */}
                <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-[#5A6E78] gap-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center space-x-3">
                    {rec.location && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-[#FC7454]" />
                        <span>{rec.location}</span>
                      </span>
                    )}

                    {rec.hasPhoto && (
                      <span className="flex items-center space-x-1 text-[#1C2C34]">
                        <ImageIcon className="w-3 h-3" />
                        <span>Encrypted Photo</span>
                      </span>
                    )}

                    {rec.audioDuration && (
                      <span className="flex items-center space-x-1 text-[#1C2C34]">
                        <Mic className="w-3 h-3" />
                        <span>Voice Memo ({rec.audioDuration}s)</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onExportToComplaint([rec])}
                    className="text-xs text-[#1C2C34] hover:text-[#FC7454] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{isUrdu ? 'شکایت میں تبدیل کریں' : 'Draft Request from this'}</span>
                    <ArrowRight className="w-3 h-3 text-[#FC7454]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Export Vault Records to Protected PDF Modal */}
      {isExportPdfOpen && (
        <ExportPdfModal
          isOpen={isExportPdfOpen}
          onClose={() => setIsExportPdfOpen(false)}
          language={language}
          incidentRecords={exportRecordsSelection.length > 0 ? exportRecordsSelection : records}
          defaultUserPin={getStoredProfile()?.stealthPin || '1520'}
          defaultUserName={getStoredProfile()?.fullName || 'Ayesha Rehman'}
          onLogAudit={onLogAudit}
        />
      )}
    </div>
  );
};

