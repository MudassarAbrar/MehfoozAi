/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  FileDown, 
  CheckCircle2, 
  X, 
  Printer, 
  ShieldCheck, 
  KeyRound,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ComplaintDraft, VaultRecord, AppLanguage } from '../types';
import { 
  exportComplaintToPDF, 
  exportIncidentRecordsToPDF,
  PDFExportResult 
} from '../utils/pdfExport';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  complaintDraft?: ComplaintDraft | null;
  incidentRecords?: VaultRecord[];
  defaultUserPin?: string;
  defaultUserName?: string;
  onLogAudit?: (event: string, detail: string) => void;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  language,
  complaintDraft,
  incidentRecords = [],
  defaultUserPin = '1520',
  defaultUserName = 'Ayesha Rehman',
  onLogAudit
}) => {
  const isUrdu = language === 'ur';

  // Modal form states
  const [usePassword, setUsePassword] = useState(true);
  const [password, setPassword] = useState(defaultUserPin);
  const [showPassword, setShowPassword] = useState(false);
  const [complainantName, setComplainantName] = useState(defaultUserName);
  const [includeRecords, setIncludeRecords] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportResult, setExportResult] = useState<PDFExportResult | null>(null);

  if (!isOpen) return null;

  const isComplaint = Boolean(complaintDraft);
  const hasVaultRecords = incidentRecords.length > 0;

  const handleQuickPin = () => {
    setPassword(defaultUserPin);
    setUsePassword(true);
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      let result: PDFExportResult;
      const exportPassword = usePassword ? password.trim() : undefined;

      if (isComplaint && complaintDraft) {
        result = await exportComplaintToPDF(complaintDraft, {
          password: exportPassword,
          complainantName: complainantName.trim() || undefined,
          includeAttachedRecords: includeRecords && hasVaultRecords,
          attachedRecords: incidentRecords,
          downloadImmediately: true
        });

        onLogAudit?.(
          'pdf_exported', 
          `Exported legal complaint ${complaintDraft.id} to PDF (Protected: ${Boolean(exportPassword)})`
        );
      } else if (hasVaultRecords) {
        result = await exportIncidentRecordsToPDF(incidentRecords, {
          password: exportPassword,
          downloadImmediately: true
        });

        onLogAudit?.(
          'vault_pdf_exported', 
          `Exported ${incidentRecords.length} vault records to PDF (Protected: ${Boolean(exportPassword)})`
        );
      } else {
        throw new Error('No record or complaint selected for PDF generation.');
      }

      setExportResult(result);
    } catch (err: any) {
      console.error('PDF export error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetAndClose = () => {
    setExportResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 my-6 text-[#1C2C34]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] text-[#1C2C34] flex items-center justify-center border border-[#BCD4D4]">
                <Printer className="w-4 h-4 text-[#FC7454]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1C2C34]">
                  {isUrdu 
                    ? 'قانونی جمع آوری کیلئے محفوظ پی ڈی ایف ایکسپورٹ' 
                    : 'Export Printer-Friendly Legal PDF'}
                </h3>
                <span className="text-[10px] text-[#5A6E78]">
                  {isUrdu 
                    ? 'پاس ورڈ سے محفوظ • عدالتی و پولیس فارمیٹ' 
                    : '128-bit Encrypted • Standard Legal Submission Layout'}
                </span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#1C2C34] hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!exportResult ? (
            <form onSubmit={handleExport} className="space-y-4 text-xs">
              {/* Document Overview Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-[#5A6E78] uppercase tracking-wider">
                  {isUrdu ? 'دستاویز کی قسم:' : 'Target Document Scope:'}
                </span>
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#1C2C34]">
                  <FileText className="w-4 h-4 text-[#FC7454] flex-shrink-0" />
                  <span>
                    {isComplaint 
                      ? `Formal Complaint Petition: ${complaintDraft?.officialReferenceNumber || complaintDraft?.id}`
                      : `${incidentRecords.length} Encrypted Incident Vault Record(s)`}
                  </span>
                </div>
                <p className="text-[11px] text-[#5A6E78] leading-relaxed">
                  Formatted according to Punjab protective statutes (PPWVA 2016 / PECA 2016) with formal prayer, verification on oath, and clean monochrome styling for standard printers.
                </p>
              </div>

              {/* Password Protection Toggle & Input */}
              <div className="p-4 rounded-xl bg-[#ECF4F4]/60 border border-[#BCD4D4] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-[#FC7454]" />
                    <span className="font-bold text-xs text-[#1C2C34]">
                      {isUrdu ? 'پاس ورڈ پروٹیکشن فعال کریں:' : 'Password Protection (Encrypted PDF)'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePassword}
                      onChange={(e) => setUsePassword(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FC7454]"></div>
                  </label>
                </div>

                {usePassword ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-[#1C2C34]">
                        {isUrdu ? 'پی ڈی ایف اوپن پاس ورڈ درج کریں:' : 'Set Document Unlock Password:'}
                      </label>
                      <button
                        type="button"
                        onClick={handleQuickPin}
                        className="text-[10px] text-[#FC7454] hover:underline font-semibold cursor-pointer"
                      >
                        Use App Stealth PIN ({defaultUserPin})
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={usePassword}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (e.g. 1520 or custom key)"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 text-[#1C2C34] text-xs font-mono focus:outline-none focus:border-[#FC7454] focus:ring-1 focus:ring-[#FC7454]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1C2C34] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-[10px] text-[#5A6E78] leading-tight">
                      When opened in Adobe Reader, Chrome, or mobile, the recipient must enter this password to view or print the petition.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    Warning: Disabling password protection generates an open PDF. Anyone who obtains the file can read the incident particulars.
                  </p>
                )}
              </div>

              {/* Complainant Identity Input */}
              {isComplaint && (
                <div>
                  <label className="block text-[#1C2C34] font-semibold mb-1">
                    {isUrdu ? 'مدعیہ / سائلہ کا نام یا محفوظ کوڈ:' : 'Complainant Name (for signature block):'}
                  </label>
                  <input
                    type="text"
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    placeholder="e.g. Ayesha Rehman or Anonymous (Sec 13 PPWVA)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#1C2C34] focus:outline-none focus:border-[#FC7454]"
                  />
                </div>
              )}

              {/* Include Attached Records Checkbox */}
              {isComplaint && hasVaultRecords && (
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeRecords}
                    onChange={(e) => setIncludeRecords(e.target.checked)}
                    className="w-4 h-4 text-[#FC7454] rounded border-slate-300 focus:ring-[#FC7454]"
                  />
                  <span className="text-xs text-[#1C2C34] font-medium">
                    Include {incidentRecords.length} attached Vault incident logs in the legal dossier
                  </span>
                </label>
              )}

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#1C2C34] font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isGenerating || (usePassword && !password.trim())}
                  className="px-5 py-2.5 rounded-xl bg-[#1C2C34] hover:bg-[#263842] disabled:opacity-40 text-white font-bold flex items-center space-x-2 shadow-xs transition cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-[#BCD4D4]" />
                  <span>
                    {isGenerating ? 'Generating Protected PDF...' : 'Download Legal PDF'}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-4 py-2 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-emerald-900">
                <div className="flex items-center space-x-2 font-bold text-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Legal Submission PDF Generated & Downloaded</span>
                </div>
                <p className="text-xs">
                  Your formal document has been successfully compiled into a printer-friendly layout ({exportResult.pageCount} page{exportResult.pageCount > 1 ? 's' : ''}).
                </p>
                <p className="font-mono text-[11px] bg-white px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-950 truncate">
                  {exportResult.fileName}
                </p>
              </div>

              {exportResult.isPasswordProtected ? (
                <div className="p-3.5 rounded-xl bg-[#ECF4F4] border border-[#BCD4D4] space-y-1 text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-[#1C2C34]">
                    <KeyRound className="w-4 h-4 text-[#FC7454]" />
                    <span>Password Required to Open:</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-[#1C2C34] tracking-wider bg-white px-3 py-1 rounded border border-slate-200 inline-block">
                    {password}
                  </p>
                  <p className="text-[11px] text-[#5A6E78]">
                    Share this key only with your authorized legal advisor or the receiving authority desk.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#5A6E78]">
                  Exported as standard unencrypted PDF.
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
