/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  PhoneCall,
  Lock,
  FileText,
  Navigation as NavIcon,
  EyeOff,
  HelpCircle,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Scale,
  MapPin,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage } from '../types';

interface SafetyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onNavigateToTab?: (tab: string) => void;
}

type GuideSection = 'helplines' | 'legal' | 'vault' | 'complaints' | 'navigation' | 'privacy_stealth' | 'faqs';

export const SafetyGuideModal: React.FC<SafetyGuideModalProps> = ({
  isOpen,
  onClose,
  language,
  onNavigateToTab
}) => {
  const isUrdu = language === 'ur';
  const [activeSection, setActiveSection] = useState<GuideSection>('helplines');

  if (!isOpen) return null;

  const sections = [
    {
      id: 'helplines' as GuideSection,
      icon: PhoneCall,
      title: 'Emergency Helplines',
      titleUrdu: 'ہنگامی ہیلپ لائنز',
      badge: 'Immediate'
    },
    {
      id: 'legal' as GuideSection,
      icon: Scale,
      title: 'Punjab Legal Rights',
      titleUrdu: 'پنجاب قانونی حقوق',
      badge: 'Statutory'
    },
    {
      id: 'vault' as GuideSection,
      icon: Lock,
      title: 'Encrypted Vault',
      titleUrdu: 'محفوظ والٹ',
      badge: 'AES-256'
    },
    {
      id: 'complaints' as GuideSection,
      icon: FileText,
      title: 'Complaint Builder',
      titleUrdu: 'شکایت ڈرافٹر',
      badge: 'Ombudsman'
    },
    {
      id: 'navigation' as GuideSection,
      icon: NavIcon,
      title: 'Safe Corridors',
      titleUrdu: 'محفوظ راستے',
      badge: 'Live Map'
    },
    {
      id: 'privacy_stealth' as GuideSection,
      icon: EyeOff,
      title: 'Privacy & Stealth',
      titleUrdu: 'رازداری اور کوئیک ایگزٹ',
      badge: 'Zero-Leak'
    },
    {
      id: 'faqs' as GuideSection,
      icon: HelpCircle,
      title: 'FAQs & Help',
      titleUrdu: 'عام سوالات و جوابات',
      badge: 'Guide'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#1A262C] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-50 dark:bg-[#121A1E] border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1C2C34] dark:text-white">
                  {isUrdu ? 'محفوظ ہیلپ و قانونی رہنما گائیڈ' : 'Mehfooz Safety Guide & Help Center'}
                </h2>
                <p className="text-xs text-[#5A6E78] dark:text-slate-400">
                  {isUrdu
                    ? 'پنجاب میں خواتین کے قانونی تحفظ، پرائیویٹ والٹ اور ہنگامی خدمات کی جامع گائیڈ'
                    : 'Statutory protections, encrypted private vault, and emergency resources in Punjab'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Navigation Tabs (Horizontal Scrollable) */}
          <div className="px-4 py-2.5 bg-slate-100/60 dark:bg-[#152026] border-b border-slate-200/60 dark:border-slate-800 overflow-x-auto scrollbar-none flex items-center gap-2">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#1E2B32] text-[#5A6E78] dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isUrdu ? sec.titleUrdu : sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Guide Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-[#1C2C34] dark:text-slate-100 text-sm leading-relaxed">
            {/* 1. HELPLINES */}
            {activeSection === 'helplines' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-900 dark:text-rose-200">
                      {isUrdu ? 'فوری خطرے کی صورت میں' : 'Immediate Physical Threat'}
                    </h4>
                    <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                      {isUrdu
                        ? 'اگر آپ کو فوری جسمانی خطرہ یا تشدد کا سامنا ہے تو کسی قانونی مسودے کے بجائے فوراً پولیس 15 یا ریسکیو 1122 کو کال کریں۔'
                        : 'If you are facing active danger, violence, or stalking right now, call 15 or 1122 directly. Do not wait to file an app complaint.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Punjab Police Emergency</div>
                      <div className="text-lg font-black text-[#1C2C34] dark:text-white">15</div>
                      <div className="text-xs text-[#5A6E78] dark:text-slate-400">Immediate response & PCR dispatch across Punjab</div>
                    </div>
                    <a href="tel:15" className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 transition">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call 15</span>
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Rescue 1122</div>
                      <div className="text-lg font-black text-[#1C2C34] dark:text-white">1122</div>
                      <div className="text-xs text-[#5A6E78] dark:text-slate-400">Emergency medical care & trauma response</div>
                    </div>
                    <a href="tel:1122" className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1.5 transition">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call 1122</span>
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">PCSW Women Helpline</div>
                      <div className="text-lg font-black text-[#1C2C34] dark:text-white">1043</div>
                      <div className="text-xs text-[#5A6E78] dark:text-slate-400">Punjab Commission on Status of Women (Toll-free 24/7)</div>
                    </div>
                    <a href="tel:1043" className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center space-x-1.5 transition">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call 1043</span>
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Human Rights Helpline</div>
                      <div className="text-lg font-black text-[#1C2C34] dark:text-white">1099</div>
                      <div className="text-xs text-[#5A6E78] dark:text-slate-400">Ministry of Human Rights Free Legal Aid & Referral</div>
                    </div>
                    <a href="tel:1099" className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call 1099</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 2. LEGAL RIGHTS */}
            {activeSection === 'legal' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">
                    {isUrdu ? 'پنجاب میں خواتین کے قانونی تحفظات' : 'Key Statutory Protections in Punjab'}
                  </h3>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab?.('assistant');
                    }}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
                  >
                    <span>{isUrdu ? 'قانونی اسسٹنٹ سے پوچھیں' : 'Ask AI Legal Assistant'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-300 font-bold text-sm">
                      <Scale className="w-4 h-4" />
                      <span>Punjab Protection of Women Against Violence Act 2016 (PPWVA)</span>
                    </div>
                    <p className="text-xs text-[#5A6E78] dark:text-slate-400 mt-1">
                      Covers domestic violence, emotional abuse, stalking, and economic deprivation. Empowers Magistrates to issue:
                    </p>
                    <ul className="mt-2 text-xs space-y-1 text-[#1C2C34] dark:text-slate-200 list-disc list-inside">
                      <li><strong>Protection Orders:</strong> Restraining the aggressor from entering residence or contacting victim.</li>
                      <li><strong>Residence Orders:</strong> Ensuring victim is not evicted from shared home.</li>
                      <li><strong>Monetary Orders:</strong> Directing financial maintenance and medical compensation.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                      <Scale className="w-4 h-4" />
                      <span>Protection Against Harassment of Women at Workplace Act 2010 (Amended 2022)</span>
                    </div>
                    <p className="text-xs text-[#5A6E78] dark:text-slate-400 mt-1">
                      Mandates every organization (formal & informal) to establish a 3-member Inquiry Committee. Gives victims direct access to the <strong>Punjab Ombudsperson</strong> who holds civil court powers to subpoena, fine, or dismiss perpetrators.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                      <Scale className="w-4 h-4" />
                      <span>Prevention of Electronic Crimes Act 2016 (PECA — Sections 20, 21, 24)</span>
                    </div>
                    <p className="text-xs text-[#5A6E78] dark:text-slate-400 mt-1">
                      Investigated by FIA Cyber Crime Wing (NR3C). Penalizes non-consensual image distribution, blackmail, deepfakes, and online stalking with up to 5 years imprisonment and PKR 5 million fine.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ENCRYPTED VAULT */}
            {activeSection === 'vault' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                      {isUrdu ? 'زیرو نالج اینکرپشن گرانٹی' : 'Zero-Knowledge Client Encryption Guarantee'}
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                      {isUrdu
                        ? 'آپ کے شواہد، تصاویر، آڈیو نوٹس اور تفصیلات آپ کے آلے پر AES-GCM-256 بٹ کے ذریعے محفوظ ہوتے ہیں۔ کوئی سرور یا ایڈمن آپ کا پاس ورڈ یا فائلیں نہیں پڑھ سکتا۔'
                        : 'All evidence, audio notes, and photos are encrypted in your browser using AES-GCM-256 before storage. Even server administrators cannot decrypt your evidence.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#5A6E78] dark:text-slate-300">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>PIN / Passphrase Protection:</strong> A 4-digit PIN derives a cryptographic key via PBKDF2 with 100,000 iterations.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Tamper-Evident SHA-256 Hashes:</strong> Each incident file produces a cryptographic hash verifying the evidence has not been altered since recorded.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Legal Court Export:</strong> Generate password-protected PDF dossiers with timestamps, geolocation coordinates, and evidentiary chains for judges and ombudsmen.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab?.('vault');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'پرائیویٹ والٹ کھولیں' : 'Open Private Incident Vault'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. COMPLAINT BUILDER */}
            {activeSection === 'complaints' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold">
                  {isUrdu ? 'سرکاری شکایت ساز (Complaint Builder)' : 'Statutory Complaint Builder'}
                </h3>
                <p className="text-xs text-[#5A6E78] dark:text-slate-400">
                  Mehfooz helps you draft formally formatted complaints that cite applicable Punjab statutes and are structured for direct submission to authorities.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800">
                    <div className="font-bold text-xs text-purple-700 dark:text-purple-300">Workplace Ombudsman</div>
                    <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 mt-1">Formally drafted for the Punjab Ombudsperson with required statutory reliefs.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800">
                    <div className="font-bold text-xs text-teal-700 dark:text-teal-300">Police FIR Request</div>
                    <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 mt-1">Structured for the Station House Officer (SHO) citing relevant PPC sections.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800">
                    <div className="font-bold text-xs text-blue-700 dark:text-blue-300">FIA Cyber Crime NR3C</div>
                    <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 mt-1">Structured for cyber harassment, blackmail, and online account compromise under PECA.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab?.('complaint');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-2 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'شکایت بلڈر شروع کریں' : 'Start Complaint Builder'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. NAVIGATION & SAFE CORRIDORS */}
            {activeSection === 'navigation' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold">
                  {isUrdu ? 'محفوظ راستے اور کمیونٹی کوآرڈینیٹس' : 'Safe Navigation & Verified Corridors'}
                </h3>
                <p className="text-xs text-[#5A6E78] dark:text-slate-400">
                  Using OpenStreetMap data, Mehfooz highlights well-lit streets, 24/7 pharmacies, police stations, and verified safe havens across Lahore, Rawalpindi, Faisalabad, Multan, and other Punjab districts.
                </p>

                <div className="space-y-2 text-xs text-[#5A6E78] dark:text-slate-300">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Live Safety POIs:</strong> Nearby police helpdesks, hospitals, and female-staffed transit kiosks.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Silent Check-In:</strong> Set a timer when walking or in transit. If you don't check in before it expires, automatic SMS/email alerts are dispatched to your emergency contacts with your coordinates.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab?.('navigate');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-2 transition cursor-pointer"
                  >
                    <NavIcon className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'سیف میپ کھولیں' : 'Open Safe Navigation Map'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 6. PRIVACY & STEALTH */}
            {activeSection === 'privacy_stealth' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold">
                  {isUrdu ? 'رازداری، کیموفلاج اور کوئیک ایگزٹ' : 'Privacy Protection & Quick Disguise'}
                </h3>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                    <EyeOff className="w-4 h-4" />
                    <span>Quick Disguise / Quick Exit (ESC Key or Red Button)</span>
                  </div>
                  <p className="text-xs text-[#5A6E78] dark:text-slate-400">
                    If someone enters the room or inspects your phone, clicking <strong>Quick Exit</strong> or pressing the <strong>ESC</strong> key instantly replaces the screen with an innocent weather forecast widget and conceals the browser tab.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Data Wiping vs Account Deletion</span>
                  </div>
                  <p className="text-xs text-[#5A6E78] dark:text-slate-400">
                    In Settings, you can choose between:
                  </p>
                  <ul className="text-xs space-y-1 text-[#1C2C34] dark:text-slate-200 list-disc list-inside">
                    <li><strong>Clear Local Device Data:</strong> Erases your browser vault, encryption keys, and active session from this phone. Does not touch your remote account if you have one.</li>
                    <li><strong>Delete Account Permanently:</strong> Completely destroys all remote incidents, complaints, check-in history, and auth credentials with zero recovery.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 7. FAQS */}
            {activeSection === 'faqs' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800">
                  <h4 className="font-bold text-xs text-[#1C2C34] dark:text-white">
                    {isUrdu ? 'کیا یہ ایپ مکمل طور پر مفت ہے؟' : 'Is Mehfooz completely free to use?'}
                  </h4>
                  <p className="text-xs text-[#5A6E78] dark:text-slate-400 mt-1">
                    Yes. Mehfooz is a non-commercial public service initiative. All AI legal analysis, PDF drafting, and encrypted vault storage are 100% free with no hidden charges.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800">
                  <h4 className="font-bold text-xs text-[#1C2C34] dark:text-white">
                    {isUrdu ? 'کیا انٹرنیٹ کے بغیر بھی مدد مل سکتی ہے؟' : 'Can I access help without an active internet connection?'}
                  </h4>
                  <p className="text-xs text-[#5A6E78] dark:text-slate-400 mt-1">
                    Yes. All emergency helplines (15, 1122, 1043) and offline Punjab statutory summaries are stored locally inside the PWA and work without internet.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E2B32] border border-slate-200/80 dark:border-slate-800">
                  <h4 className="font-bold text-xs text-[#1C2C34] dark:text-white">
                    {isUrdu ? 'کیا یہ قانونی مشورہ ایک وکیل کے برابر ہے؟' : 'Does this constitute official legal advice?'}
                  </h4>
                  <p className="text-xs text-[#5A6E78] dark:text-slate-400 mt-1">
                    Mehfooz provides legal navigation, statutory citations, and structured templates based on verified Punjab laws. It does not replace a licensed advocate for court representation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-[#121A1E] border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-[#5A6E78] dark:text-slate-400 font-medium">
              {isUrdu ? 'پنجاب ویمن سیفٹی نیٹ ورک' : 'Punjab Women Safety Network'}
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer"
            >
              {isUrdu ? 'بند کریں' : 'Close Guide'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
