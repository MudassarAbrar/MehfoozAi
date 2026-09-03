/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  Lock, 
  Navigation, 
  CheckCircle2, 
  ArrowRight, 
  Check, 
  X, 
  Sparkles,
  PhoneCall,
  Eye,
  Sliders,
  ChevronRight,
  Sun,
  Map,
  ShieldAlert,
  Store,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MehfoozLogo } from './common/MehfoozLogo';
import { AppLanguage, UserProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  user: UserProfile | null;
  onSavePreferences?: (prefs: any) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  language,
  user,
  onSavePreferences
}) => {
  const isUrdu = language === 'ur';
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Preference selections (Step 2)
  const [safetyPreferences, setSafetyPreferences] = useState<{ [key: string]: boolean }>({
    wellLit: true,
    busyAreas: true,
    familiarRoutes: false,
    policePresence: true,
    womenFriendly: true,
    shortDistances: false
  });

  // Emergency contacts (Step 3)
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Protiva (Mom)', phone: '+92 300 1234567', relation: 'Mother' },
    { id: '2', name: 'Subodh (Father)', phone: '+92 321 9876543', relation: 'Father' }
  ]);

  // Privacy toggles (Step 4)
  const [privacyToggles, setPrivacyToggles] = useState({
    shareWithContacts: true,
    contributeCommunity: true,
    localAlerts: true
  });

  if (!isOpen) return null;

  const togglePref = (key: string) => {
    setSafetyPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (onSavePreferences) {
        onSavePreferences({ safetyPreferences, contacts, privacyToggles });
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 text-[#1C2C34]"
      >
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  step === currentStep
                    ? 'w-6 bg-[#FC7454]'
                    : step < currentStep
                    ? 'w-3 bg-[#FC7454]/60'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="text-xs text-[#5A6E78] hover:text-[#1C2C34] font-semibold cursor-pointer"
          >
            Skip
          </button>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: WELCOME & MISSION */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="text-center space-y-4 py-2">
            <div className="flex justify-center">
              <MehfoozLogo variant="stacked" size="xl" showUrdu={true} animated={true} />
            </div>

            <div className="p-4 rounded-2xl bg-[#ECF4F4]/70 border border-[#BCD4D4] text-xs text-[#1C2C34] leading-relaxed text-left space-y-2">
              <div className="flex items-center space-x-2 text-[#FC7454] font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Designed for women, verified by women</span>
              </div>
              <p className="text-[#5A6E78]">
                Get real-time safe routes, silent safety check-ins, verified community alerts, and complete zero-knowledge privacy.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: USER PREFERENCES */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-[#1C2C34]">
                Help us understand you
              </h2>
              <p className="text-xs text-[#5A6E78]">
                What makes you feel most secure when walking or commuting?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'wellLit', label: 'Well-lit streets', icon: Sun },
                { key: 'busyAreas', label: 'Busy areas with people', icon: Users },
                { key: 'familiarRoutes', label: 'Familiar routes', icon: Map },
                { key: 'policePresence', label: 'Police presence nearby', icon: ShieldAlert },
                { key: 'womenFriendly', label: 'Women-friendly businesses', icon: Store },
                { key: 'shortDistances', label: 'Short walking distances', icon: Clock }
              ].map((item) => {
                const isSelected = safetyPreferences[item.key];
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => togglePref(item.key)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#ECF4F4] border-[#FC7454] text-[#1C2C34] ring-1 ring-[#FC7454]'
                        : 'bg-slate-50 border-slate-200 text-[#5A6E78] hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                      isSelected ? 'bg-[#FC7454] text-white' : 'bg-slate-200/80 text-slate-500'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SAFETY NETWORK */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-[#1C2C34]">
                Set Your Emergency Contacts
              </h2>
              <p className="text-xs text-[#5A6E78]">
                Who should we notify immediately if an alert is triggered?
              </p>
            </div>

            <div className="space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] text-[#FC7454] border border-[#BCD4D4] flex items-center justify-center font-bold text-xs">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1C2C34]">{c.name}</h4>
                      <p className="text-[10px] text-[#5A6E78]">{c.phone}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Verified
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#5A6E78]">
              You can edit or add more contacts anytime in your Profile.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: PRIVACY CONTROL */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-[#1C2C34]">
                Your privacy, your control
              </h2>
              <p className="text-xs text-[#5A6E78]">
                Choose what to share with absolute zero-knowledge guarantees.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1C2C34]">
                    Share location with emergency contacts
                  </h4>
                  <p className="text-[10px] text-[#5A6E78]">
                    Only during active check-ins and emergency mode.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacyToggles.shareWithContacts}
                  onChange={(e) => setPrivacyToggles({ ...privacyToggles, shareWithContacts: e.target.checked })}
                  className="w-4 h-4 accent-[#FC7454] cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1C2C34]">
                    Contribute to community
                  </h4>
                  <p className="text-[10px] text-[#5A6E78]">
                    Help other women by sharing anonymous route ratings.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacyToggles.contributeCommunity}
                  onChange={(e) => setPrivacyToggles({ ...privacyToggles, contributeCommunity: e.target.checked })}
                  className="w-4 h-4 accent-[#FC7454] cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1C2C34]">
                    Allow local safety notifications
                  </h4>
                  <p className="text-[10px] text-[#5A6E78]">
                    Get updates about hazards or road closures nearby.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacyToggles.localAlerts}
                  onChange={(e) => setPrivacyToggles({ ...privacyToggles, localAlerts: e.target.checked })}
                  className="w-4 h-4 accent-[#FC7454] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: LOCATION ACCESS */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#ECF4F4] text-[#FC7454] mx-auto flex items-center justify-center border border-[#BCD4D4]">
              <MapPin className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#1C2C34]">
                We need your location to help
              </h2>
              <p className="text-xs text-[#5A6E78]">
                Your safety is our top priority.
              </p>
            </div>

            <div className="space-y-2 text-left text-xs text-[#1C2C34]">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#FC7454] flex-shrink-0 mt-0.5" />
                <span><strong>Only when you navigate:</strong> We access GPS only during active trips.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#FC7454] flex-shrink-0 mt-0.5" />
                <span><strong>Never shared publicly:</strong> Exact coordinates are never broadcast.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#FC7454] flex-shrink-0 mt-0.5" />
                <span><strong>You control the data:</strong> Clear history anytime with one click.</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: READY TO NAVIGATE */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-full bg-[#ECF4F4] text-[#FC7454] mx-auto flex items-center justify-center border border-[#BCD4D4]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#1C2C34]">
                You're ready to navigate safely
              </h2>
              <p className="text-xs text-[#5A6E78]">
                All set! Find safe routes verified by other women in your community.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#ECF4F4]/70 border border-[#BCD4D4] text-xs text-[#1C2C34] font-semibold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-[#FC7454]" />
                <span>Find Safe Routes</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5A6E78]" />
            </div>
          </div>
        )}

        {/* Bottom Navigation Button */}
        <div className="pt-2">
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>{currentStep === 6 ? 'Start Exploring' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4 text-[#FC7454]" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
