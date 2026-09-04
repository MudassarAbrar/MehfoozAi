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
  Building,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, UserContact } from '../types';
import { getAuthHeaders } from '../utils/auth';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickExit: () => void;
  language: AppLanguage;
  /** Emergency contacts for the SOS SMS burst (Prompt #2). */
  contacts: UserContact[];
}

function getCurrentPosition(timeoutMs = 6000): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 30_000 }
    );
  });
}

async function getBatteryLevel(): Promise<number | null> {
  try {
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number }> };
    if (nav.getBattery) {
      const battery = await nav.getBattery();
      return battery.level;
    }
  } catch {
    /* Battery API not supported */
  }
  return null;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  onQuickExit,
  language,
  contacts,
}) => {
  const [callInitiated, setCallInitiated] = useState<string | null>(null);
  const [smsState, setSmsState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'signin_required'>('idle');
  const [smsResult, setSmsResult] = useState<{ notified: number; dispatched: number; simulated: number } | null>(null);

  if (!isOpen) return null;

  const isUrdu = language === 'ur';

  const handleCall = (number: string, serviceName: string) => {
    setCallInitiated(serviceName);
    // Open tel: URI
    window.location.href = `tel:${number}`;
    setTimeout(() => setCallInitiated(null), 3000);
  };

  // SOS SMS burst to her trusted contacts — live GPS + battery level,
  // dispatched server-side via Twilio (Prompt #2).
  const handleSendSmsAlert = async () => {
    if (contacts.length === 0) return;
    setSmsState('sending');
    try {
      const [pos, battery] = await Promise.all([getCurrentPosition(), getBatteryLevel()]);
      const res = await fetch('/api/crisis-alert', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          contacts: contacts.map(c => ({ id: c.id, name: c.name, phone: c.phone })),
          ...(pos ? { lat: pos.lat, lng: pos.lng } : {}),
          ...(battery !== null ? { batteryLevel: battery } : {}),
          helpline: 'Punjab Police 15'
        })
      });
      if (res.status === 401) {
        setSmsState('signin_required');
        return;
      }
      if (!res.ok) {
        setSmsState('error');
        return;
      }
      const data = await res.json();
      setSmsResult({
        notified: data.contactsNotified || 0,
        dispatched: data.dispatched || 0,
        simulated: data.simulated || 0
      });
      setSmsState('sent');
    } catch {
      setSmsState('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-lg bg-white dark:bg-[#18242A] border border-[#BCD4D4]/60 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 text-[#1C2C34] dark:text-[#F4F4FC] transition-colors"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1C2C34] dark:text-white flex items-center space-x-2">
                <span>{isUrdu ? 'فوری حفاظتی و ایمرجنسی مدد' : 'Immediate Safety & Crisis Channels'}</span>
              </h2>
              <p className="text-xs text-[#5A6E78] dark:text-slate-400 font-semibold">
                {isUrdu ? 'پنجاب ایمرجنسی 15 اور ہیلپ لائنز' : 'Punjab Emergency 15 & Instant Crisis Support'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-[#1C2C34] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#263842] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Notice */}
        <div className="p-3.5 rounded-2xl bg-[#ECF4F4] dark:bg-[#263842] border border-[#BCD4D4] dark:border-[#263842] text-xs text-[#1C2C34] dark:text-[#ECF4F4] leading-relaxed">
          <strong className="font-semibold text-[#FC7454] dark:text-[#FC7C54]">{isUrdu ? 'اہم انتباہ:' : 'Important Safety Note:'}</strong>{' '}
          {isUrdu 
            ? 'محفوظ ایپ از خود پولیس یا ایمرجنسی سروسز کو روانہ نہیں کرتی۔ اگر آپ کو یا آپ کے بچوں کو فوری خطرہ لاحق ہے تو نیچے دیے گئے بٹن سے 15 یا ورچوئل وومن پولیس اسٹیشن پر کال کریں۔'
            : 'Mehfooz does not automatically dispatch police or contact emergency services without your action. If you or your children are in imminent physical danger, prioritize physical safety and contact Punjab Police 15 directly below.'}
        </div>

        {/* SOS SMS burst to trusted contacts (Prompt #2) */}
        <div className="p-4 rounded-2xl bg-slate-900/[0.03] dark:bg-[#131E24] border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FC7454] dark:text-[#FC7C54]">Trusted Contacts SMS</span>
              <h4 className="text-sm font-bold text-[#1C2C34] dark:text-white">
                {isUrdu ? 'قریبی رابطوں کو SOS ایس ایم ایس بھیجیں' : `Send SOS SMS to ${contacts.length} emergency contact${contacts.length !== 1 ? 's' : ''}`}
              </h4>
              <p className="text-[11px] text-[#5A6E78] dark:text-slate-400">
                {isUrdu ? 'لائیو مقام اور بیٹری کی سطح کے ساتھ — سرور کی جانب سے ٹویلیو کے ذریعے' : 'Includes your live GPS location & battery level — dispatched server-side via Twilio'}
              </p>
            </div>

            <button
              onClick={handleSendSmsAlert}
              disabled={smsState === 'sending' || contacts.length === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-[#1C2C34] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition transform active:scale-95 flex-shrink-0 self-start sm:self-center w-full sm:w-auto cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${smsState === 'sending' ? 'animate-pulse' : ''}`} />
              <span>{smsState === 'sending' ? (isUrdu ? 'بھیجا جا رہا ہے…' : 'Sending…') : (isUrdu ? 'الرٹ بھیجیں' : 'Send Alert')}</span>
            </button>
          </div>

          {smsState === 'sent' && smsResult && (
            <div className="flex items-start space-x-2 text-[11px] rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 p-2.5 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {isUrdu ? 'الرٹ بھیج دیا گیا — ' : 'Alert dispatched — '}
                <strong>{smsResult.notified}</strong>
                {isUrdu ? ' رابطوں کو اطلاع دی گئی' : ` contact${smsResult.notified !== 1 ? 's' : ''} notified`}
                {smsResult.dispatched > 0
                  ? ` (${smsResult.dispatched} live SMS via Twilio)`
                  : smsResult.simulated > 0
                    ? ' (simulated — Twilio credentials not configured on this server)'
                    : ''}.
              </span>
            </div>
          )}

          {smsState === 'signin_required' && (
            <div className="flex items-start space-x-2 text-[11px] rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 p-2.5 leading-relaxed">
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {isUrdu
                  ? 'سرور سے ایس ایم ایس بھیجنے کے لیے سائن اِن کریں۔ نیچے دیے گئے کال بٹن سائن اِن کے بغیر بھی کام کرتے ہیں۔'
                  : 'Sign in to enable server-dispatched SMS alerts. The direct call buttons below work without sign-in.'}
              </span>
            </div>
          )}

          {smsState === 'error' && (
            <div className="flex items-start space-x-2 text-[11px] rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 p-2.5 leading-relaxed">
              <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {isUrdu
                  ? 'ڈسپیچ سروس تک رسائی نہیں ہو سکی۔ براہِ کرم نیچے دیے گئے فوری کال بٹن استعمال کریں۔'
                  : 'Could not reach the SMS dispatch service. Please use the direct call buttons below.'}
              </span>
            </div>
          )}
        </div>

        {/* Emergency Call Options */}
        <div className="space-y-3">
          {/* 1. PSCA Emergency 15 */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Punjab Police / PSCA</span>
              <h4 className="text-sm font-bold text-[#1C2C34] dark:text-white">Emergency 15 (Rescue & Police)</h4>
              <p className="text-[11px] text-[#5A6E78] dark:text-slate-400">24/7 centralized emergency dispatch & live CCTV units</p>
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
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131E24] border border-[#BCD4D4]/40 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6E78] dark:text-slate-400">Online & Video Support</span>
              <h4 className="text-sm font-bold text-[#1C2C34] dark:text-white">Virtual Women Police Station (VWPS)</h4>
              <p className="text-[11px] text-[#5A6E78] dark:text-slate-400">Female police officers available via 15 (Option 2)</p>
            </div>

            <button
              onClick={() => handleCall('15', 'Virtual Women Police Station')}
              className="px-3.5 py-2.5 rounded-xl bg-[#FC7454] hover:bg-[#FC7C54] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition flex-shrink-0 self-start sm:self-center w-full sm:w-auto cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-white" />
              <span>Connect</span>
            </button>
          </div>

          {/* 3. Punjab Women Helpline 1043 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131E24] border border-[#BCD4D4]/40 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6E78] dark:text-slate-400">PCSW Helpline</span>
              <h4 className="text-sm font-bold text-[#1C2C34] dark:text-white">Punjab Women Helpline 1043</h4>
              <p className="text-[11px] text-[#5A6E78] dark:text-slate-400">Legal advisory, Protection Officers & shelter referral</p>
            </div>

            <button
              onClick={() => handleCall('1043', 'Punjab Helpline 1043')}
              className="px-3.5 py-2.5 rounded-xl bg-[#FC7454] hover:bg-[#FC7C54] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition flex-shrink-0 self-start sm:self-center w-full sm:w-auto cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-white" />
              <span>Call 1043</span>
            </button>
          </div>

          {/* 4. Dar-ul-Aman Shelters */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131E24] border border-[#BCD4D4]/40 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6E78] dark:text-slate-400">Safe Accommodation</span>
              <h4 className="text-sm font-bold text-[#1C2C34] dark:text-white">Dar-ul-Aman Shelter Directory</h4>
              <p className="text-[11px] text-[#5A6E78] dark:text-slate-400">36 Government safe crisis shelters across Punjab</p>
            </div>

            <a
              href="#directory"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#263842] hover:bg-slate-100 dark:hover:bg-[#344854] border border-[#BCD4D4]/60 dark:border-slate-700 text-[#1C2C34] dark:text-white text-xs font-semibold flex items-center justify-center space-x-1 transition shadow-xs flex-shrink-0 self-start sm:self-center w-full sm:w-auto cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-[#FC7454]" />
              <span>View Shelters</span>
            </a>
          </div>
        </div>

        {/* Quick Exit / Clear Screen */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onQuickExit}
            className="flex items-center space-x-2 text-xs font-semibold text-[#1C2C34] dark:text-slate-200 hover:text-[#FC7454] dark:hover:text-[#FC7C54] transition cursor-pointer"
          >
            <CloudSun className="w-4 h-4 text-[#FC7454]" />
            <span>{isUrdu ? 'فوری موسم پر جائیں' : 'Instant Escape to Weather'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#263842] hover:bg-slate-200 dark:hover:bg-[#344854] text-xs font-semibold text-[#1C2C34] dark:text-slate-200 transition cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
