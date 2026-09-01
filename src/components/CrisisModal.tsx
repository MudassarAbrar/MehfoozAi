/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  ShieldAlert, 
  ExternalLink, 
  X, 
  CloudSun,
  Lock,
  HeartHandshake,
  CheckCircle2,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage } from '../types';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickExit: () => void;
  language: AppLanguage;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  onQuickExit,
  language,
}) => {
  const [callInitiated, setCallInitiated] = useState<string | null>(null);

  if (!isOpen) return null;

  const isUrdu = language === 'ur';

  const handleCall = (number: string, serviceName: string) => {
    setCallInitiated(serviceName);
    // Open tel: URI
    window.location.href = `tel:${number}`;
    setTimeout(() => setCallInitiated(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-lg bg-white dark:bg-[#181B24] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 text-[#181A20] dark:text-[#F9FAFB] transition-colors"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#181A20] dark:text-white flex items-center space-x-2">
                <span>{isUrdu ? 'فوری حفاظتی و ایمرجنسی مدد' : 'Immediate Safety & Crisis Channels'}</span>
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 font-semibold">
                {isUrdu ? 'پنجاب ایمرجنسی 15 اور ہیلپ لائنز' : 'Punjab Emergency 15 & Instant Crisis Support'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-[#181A20] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E2230] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Notice */}
        <div className="p-3.5 rounded-2xl bg-[#F5EEFD] dark:bg-[#2D1F47] border border-[#E9D5FF] dark:border-[#581C87] text-xs text-[#181A20] dark:text-[#E9D5FF] leading-relaxed">
          <strong className="font-semibold text-[#9333EA] dark:text-[#C084FC]">{isUrdu ? 'اہم انتباہ:' : 'Important Safety Note:'}</strong>{' '}
          {isUrdu 
            ? 'محفوظ ایپ از خود پولیس یا ایمرجنسی سروسز کو روانہ نہیں کرتی۔ اگر آپ کو یا آپ کے بچوں کو فوری خطرہ لاحق ہے تو نیچے دیے گئے بٹن سے 15 یا ورچوئل وومن پولیس اسٹیشن پر کال کریں۔'
            : 'Mehfooz does not automatically dispatch police or contact emergency services without your action. If you or your children are in imminent physical danger, prioritize physical safety and contact Punjab Police 15 directly below.'}
        </div>

        {/* Emergency Call Options */}
        <div className="space-y-3">
          {/* 1. PSCA Emergency 15 */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Punjab Police / PSCA</span>
              <h4 className="text-sm font-bold text-[#181A20] dark:text-white">Emergency 15 (Rescue & Police)</h4>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">24/7 centralized emergency dispatch & live CCTV units</p>
            </div>

            <button
              onClick={() => handleCall('15', 'Emergency 15')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition transform active:scale-95 flex-shrink-0 self-start sm:self-center w-full sm:w-auto cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 15</span>
            </button>
          </div>

          {/* 2. Virtual Women Police Station */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12141C] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">Online & Video Support</span>
              <h4 className="text-sm font-bold text-[#181A20] dark:text-white">Virtual Women Police Station (VWPS)</h4>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Female police officers available via 15 (Option 2)</p>
            </div>

            <button
              onClick={() => handleCall('15', 'Virtual Women Police Station')}
              className="px-3.5 py-2.5 rounded-xl bg-[#181A20] dark:bg-[#C084FC] hover:bg-slate-800 dark:hover:bg-[#D8B4FE] text-white dark:text-[#0F1117] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition flex-shrink-0 self-start sm:self-center w-full sm:w-auto cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#B886FD] dark:text-[#0F1117]" />
              <span>Connect</span>
            </button>
          </div>

          {/* 3. Punjab Women Helpline 1043 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12141C] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">PCSW Helpline</span>
              <h4 className="text-sm font-bold text-[#181A20] dark:text-white">Punjab Women Helpline 1043</h4>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Legal advisory, Protection Officers & shelter referral</p>
            </div>

            <button
              onClick={() => handleCall('1043', 'Punjab Helpline 1043')}
              className="px-3.5 py-2.5 rounded-xl bg-[#181A20] dark:bg-[#C084FC] hover:bg-slate-800 dark:hover:bg-[#D8B4FE] text-white dark:text-[#0F1117] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition flex-shrink-0 self-start sm:self-center w-full sm:w-auto cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#B886FD] dark:text-[#0F1117]" />
              <span>Call 1043</span>
            </button>
          </div>

          {/* 4. Dar-ul-Aman Shelters */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12141C] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">Safe Accommodation</span>
              <h4 className="text-sm font-bold text-[#181A20] dark:text-white">Dar-ul-Aman Shelter Directory</h4>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">36 Government safe crisis shelters across Punjab</p>
            </div>

            <a
              href="#directory"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E2230] hover:bg-slate-100 dark:hover:bg-[#2A2F40] border border-slate-200 dark:border-slate-700 text-[#181A20] dark:text-white text-xs font-semibold flex items-center justify-center space-x-1 transition shadow-xs flex-shrink-0 self-start sm:self-center w-full sm:w-auto cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-[#9333EA] dark:text-[#C084FC]" />
              <span>View Shelters</span>
            </a>
          </div>
        </div>

        {/* Quick Exit / Clear Screen */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onQuickExit}
            className="flex items-center space-x-2 text-xs font-semibold text-[#181A20] dark:text-slate-200 hover:text-[#9333EA] dark:hover:text-[#C084FC] transition cursor-pointer"
          >
            <CloudSun className="w-4 h-4 text-[#9333EA] dark:text-[#C084FC]" />
            <span>{isUrdu ? 'فوری موسم پر جائیں' : 'Instant Escape to Weather'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#2A2F40] text-xs font-semibold text-[#181A20] dark:text-slate-200 transition cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
