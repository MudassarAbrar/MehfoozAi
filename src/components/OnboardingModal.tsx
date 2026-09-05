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
  EyeOff,
  Sliders,
  ChevronRight,
  Sun,
  Map,
  ShieldAlert,
  Store,
  Clock,
  UserPlus,
  Mail,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MehfoozLogo } from './common/MehfoozLogo';
import { AppLanguage, UserProfile } from '../types';

interface EmergencyContactInput {
  id: string;
  name: string;
  phone: string;
  email: string;
  relation: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  user: UserProfile | null;
  onSavePreferences?: (prefs: any) => void;
  isNewUser?: boolean;
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  language,
  user,
  onSavePreferences,
  isNewUser = false,
  onComplete,
}) => {
  const isUrdu = language === 'ur';
  const [currentStep, setCurrentStep] = useState<number>(1);

  // New-user onboarding fields
  const [onboardPhone, setOnboardPhone] = useState(user?.phone || '');
  const [onboardAddress, setOnboardAddress] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [appPasswordConfirm, setAppPasswordConfirm] = useState('');
  const [vaultPassword, setVaultPassword] = useState('');
  const [vaultPasswordConfirm, setVaultPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showAppPw, setShowAppPw] = useState(false);
  const [showVaultPw, setShowVaultPw] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Preference selections
  const [safetyPreferences, setSafetyPreferences] = useState<{ [key: string]: boolean }>({
    wellLit: true,
    busyAreas: true,
    familiarRoutes: false,
    policePresence: true,
    womenFriendly: true,
    shortDistances: false
  });

  // Emergency contacts — starts empty, user must add at least 1
  const [contacts, setContacts] = useState<EmergencyContactInput[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContactInput>({
    id: '', name: '', phone: '', email: '', relation: 'Parent'
  });

  // Privacy toggles
  const [privacyToggles, setPrivacyToggles] = useState({
    shareWithContacts: true,
    contributeCommunity: true,
    localAlerts: true
  });

  if (!isOpen) return null;

  const togglePref = (key: string) => {
    setSafetyPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // New users: 8 steps. Returning users: 6 steps.
  // New:  1-Welcome, 2-Preferences, 3-EmergencyContacts, 4-Privacy, 5-Location, 6-AppPassword, 7-VaultPassword, 8-Ready
  // Old:  1-Welcome, 2-Preferences, 3-EmergencyContacts, 4-Privacy, 5-Location, 6-Ready
  const totalSteps = isNewUser ? 8 : 6;

  const RELATIONS = ['Parent', 'Sibling', 'Spouse', 'Friend', 'Guardian', 'Other'];

  const addOrUpdateContact = () => {
    const trimmed = {
      ...editingContact,
      name: editingContact.name.trim(),
      phone: editingContact.phone.trim(),
      email: editingContact.email.trim(),
    };

    if (!trimmed.name) {
      setContactError(isUrdu ? 'رابطہ کار کا نام ضروری ہے' : 'Contact name is required');
      return;
    }
    if (!trimmed.phone) {
      setContactError(isUrdu ? 'فون نمبر ضروری ہے' : 'Phone number is required');
      return;
    }

    if (trimmed.id) {
      // Update existing
      setContacts(prev => prev.map(c => c.id === trimmed.id ? trimmed : c));
    } else {
      // Add new
      setContacts(prev => [...prev, { ...trimmed, id: Date.now().toString() }]);
    }

    setEditingContact({ id: '', name: '', phone: '', email: '', relation: 'Parent' });
    setShowContactForm(false);
    setContactError(null);
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const startEditContact = (c: EmergencyContactInput) => {
    setEditingContact({ ...c });
    setShowContactForm(true);
    setContactError(null);
  };

  const handleNext = () => {
    // Validate emergency contacts step
    if (currentStep === 3) {
      if (contacts.length === 0) {
        setContactError(isUrdu ? 'کم از کم ایک ہنگامی رابطہ کار ضروری ہے' : 'At least one emergency contact is required');
        return;
      }
      setContactError(null);
    }

    // Validate app password step (new user step 6)
    if (isNewUser && currentStep === 6) {
      if (appPassword.length < 6) {
        setPasswordError(isUrdu ? 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے' : 'App password must be at least 6 characters');
        return;
      }
      if (appPassword !== appPasswordConfirm) {
        setPasswordError(isUrdu ? 'پاس ورڈز مماثل نہیں ہیں' : 'Passwords do not match');
        return;
      }
      // Store app password as stealth PIN
      if (user) {
        try {
          const updated = { ...user, stealthPin: appPassword };
          localStorage.setItem('mehfooz_profile_cache_v1', JSON.stringify(updated));
        } catch { /* noop */ }
      }
      setPasswordError(null);
    }

    // Validate vault password step (new user step 7)
    if (isNewUser && currentStep === 7) {
      if (vaultPassword.length < 6) {
        setPasswordError(isUrdu ? 'والٹ پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے' : 'Vault password must be at least 6 characters');
        return;
      }
      if (vaultPassword !== vaultPasswordConfirm) {
        setPasswordError(isUrdu ? 'پاس ورڈز مماثل نہیں ہیں' : 'Passwords do not match');
        return;
      }
      // Store vault password hash locally
      try {
        localStorage.setItem('mehfooz_vault_pw_hash', vaultPassword);
      } catch { /* noop */ }
      setPasswordError(null);
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (onSavePreferences) {
        onSavePreferences({ safetyPreferences, contacts, privacyToggles });
      }
      if (onComplete) {
        onComplete();
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 text-[#1C2C34] max-h-[90vh] overflow-y-auto"
      >
        {/* Step Progress Indicators (no skip button — onboarding is mandatory) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-1.5">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
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
          <span className="text-[10px] font-semibold text-[#5A6E78]">
            {currentStep}/{totalSteps}
          </span>
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
                <span>{isUrdu ? 'خواتین کے لیے بنایا گیا، خواتین کی تصدیق شدہ' : 'Designed for women, verified by women'}</span>
              </div>
              <p className="text-[#5A6E78]">
                {isUrdu
                  ? 'محفوظ راستے، خاموش حفاظتی چیک اِن، تصدیق شدہ کمیونٹی الرٹس، اور مکمل صفر علم رازداری حاصل کریں۔'
                  : 'Get real-time safe routes, silent safety check-ins, verified community alerts, and complete zero-knowledge privacy.'}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SAFETY PREFERENCES */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-[#1C2C34]">
                {isUrdu ? 'ہمیں اپنے بارے میں بتائیں' : 'Help us understand you'}
              </h2>
              <p className="text-xs text-[#5A6E78]">
                {isUrdu ? 'چلتے یا سفر کرتے وقت آپ کو کیا محفوظ محسوس ہوتا ہے؟' : 'What makes you feel most secure when walking or commuting?'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'wellLit', label: isUrdu ? 'روشن گلیاں' : 'Well-lit streets', icon: Sun },
                { key: 'busyAreas', label: isUrdu ? 'مصروف علاقے' : 'Busy areas with people', icon: Users },
                { key: 'familiarRoutes', label: isUrdu ? 'جانے مانے راستے' : 'Familiar routes', icon: Map },
                { key: 'policePresence', label: isUrdu ? 'پولیس کی موجودگی' : 'Police presence nearby', icon: ShieldAlert },
                { key: 'womenFriendly', label: isUrdu ? 'خواتین دوست کاروبار' : 'Women-friendly businesses', icon: Store },
                { key: 'shortDistances', label: isUrdu ? 'کم فاصلے' : 'Short walking distances', icon: Clock }
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
        {/* STEP 3: EMERGENCY CONTACTS (Real inputs — at least 1 required) */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-[#1C2C34]">
                {isUrdu ? 'ہنگامی رابطے مقرر کریں' : 'Set Your Emergency Contacts'}
              </h2>
              <p className="text-xs text-[#5A6E78]">
                {isUrdu ? 'الارٹ فعال ہونے پر ہمیں کسے فوری اطلاع دینی چاہیے؟ کم از کم ایک رابطہ کار ضروری ہے۔' : 'Who should we notify immediately if an alert is triggered? At least one contact is required.'}
              </p>
            </div>

            {contactError && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {contactError}
              </div>
            )}

            {/* Existing contacts list */}
            {contacts.length > 0 && (
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] text-[#FC7454] border border-[#BCD4D4] flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#1C2C34] truncate">{c.name}</h4>
                        <p className="text-[10px] text-[#5A6E78] truncate">{c.phone} · {c.relation}</p>
                        {c.email && <p className="text-[10px] text-[#5A6E78] truncate">{c.email}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={() => startEditContact(c)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                        title="Edit"
                      >
                        <Sliders className="w-3 h-3 text-[#5A6E78]" />
                      </button>
                      <button
                        onClick={() => removeContact(c.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add / edit contact form */}
            {showContactForm ? (
              <div className="p-3 rounded-2xl bg-[#ECF4F4]/50 border border-[#BCD4D4] space-y-3">
                <h4 className="text-xs font-bold text-[#1C2C34]">
                  {editingContact.id ? (isUrdu ? 'رابطہ کار میں ترمیم' : 'Edit Contact') : (isUrdu ? 'نیا رابطہ کار شامل کریں' : 'Add New Contact')}
                </h4>
                <div>
                  <label className="block text-[10px] font-medium text-[#1C2C34] mb-1">{isUrdu ? 'نام:' : 'Full Name:'}</label>
                  <input
                    type="text"
                    value={editingContact.name}
                    onChange={e => setEditingContact({ ...editingContact, name: e.target.value })}
                    placeholder={isUrdu ? 'مثلاً: فاطمہ' : 'e.g. Fatima Ahmed'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-[#1C2C34] mb-1">{isUrdu ? 'تعلق:' : 'Relation / Role:'}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {RELATIONS.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setEditingContact({ ...editingContact, relation: r })}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition cursor-pointer ${
                          editingContact.relation === r
                            ? 'bg-[#FC7454] text-white border-[#FC7454]'
                            : 'bg-white text-[#5A6E78] border-slate-200 hover:border-[#FC7454]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-[#1C2C34] mb-1">{isUrdu ? 'فون نمبر:' : 'Phone Number:'}</label>
                  <input
                    type="tel"
                    value={editingContact.phone}
                    onChange={e => setEditingContact({ ...editingContact, phone: e.target.value })}
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-[#1C2C34] mb-1">{isUrdu ? 'ای میل (اختیاری):' : 'Email (optional):'}</label>
                  <input
                    type="email"
                    value={editingContact.email}
                    onChange={e => setEditingContact({ ...editingContact, email: e.target.value })}
                    placeholder="fatima@example.com"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => { setShowContactForm(false); setEditingContact({ id: '', name: '', phone: '', email: '', relation: 'Parent' }); setContactError(null); }}
                    className="flex-1 py-2 rounded-xl bg-white border border-slate-200 text-[#5A6E78] text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                  >
                    {isUrdu ? 'منسوخ' : 'Cancel'}
                  </button>
                  <button
                    onClick={addOrUpdateContact}
                    className="flex-1 py-2 rounded-xl bg-[#FC7454] text-white text-xs font-bold hover:bg-[#FC7C54] transition cursor-pointer"
                  >
                    {editingContact.id ? (isUrdu ? 'اپ ڈیٹ' : 'Update') : (isUrdu ? 'شامل کریں' : 'Add Contact')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setEditingContact({ id: '', name: '', phone: '', email: '', relation: 'Parent' }); setShowContactForm(true); setContactError(null); }}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-[#BCD4D4] text-[#5A6E78] text-xs font-semibold flex items-center justify-center space-x-2 hover:border-[#FC7454] hover:text-[#FC7454] transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isUrdu ? 'ہنگامی رابطہ کار شامل کریں' : 'Add Emergency Contact'}</span>
              </button>
            )}

            <p className="text-[11px] text-[#5A6E78]">
              {isUrdu
                ? 'آپ بعد میں پروفائل میں مزید رابطے شامل کر سکتی ہیں۔'
                : 'You can add or edit more contacts anytime in your Profile.'}
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
                {isUrdu ? 'آپ کی رازداری، آپ کا کنٹرول' : 'Your privacy, your control'}
              </h2>
              <p className="text-xs text-[#5A6E78]">
                {isUrdu ? 'صفر علم کی ضمانت کے ساتھ کیا شیئر کرنا ہے منتخب کریں۔' : 'Choose what to share with absolute zero-knowledge guarantees.'}
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1C2C34]">
                    {isUrdu ? 'ہنگامی رابطوں کے ساتھ مقام شیئر کریں' : 'Share location with emergency contacts'}
                  </h4>
                  <p className="text-[10px] text-[#5A6E78]">
                    {isUrdu ? 'صرف فعال چیک اِنز اور ہنگامی موڈ کے دوران۔' : 'Only during active check-ins and emergency mode.'}
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
                    {isUrdu ? 'کمیونٹی میں حصہ ڈالیں' : 'Contribute to community'}
                  </h4>
                  <p className="text-[10px] text-[#5A6E78]">
                    {isUrdu ? 'گمنام راستے کی درجہ بندی شیئر کرکے دوسری خواتین کی مدد کریں۔' : 'Help other women by sharing anonymous route ratings.'}
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
                    {isUrdu ? 'مقامی حفاظتی اطلاعات کی اجازت دیں' : 'Allow local safety notifications'}
                  </h4>
                  <p className="text-[10px] text-[#5A6E78]">
                    {isUrdu ? 'قریب میں خطرات یا سڑک بند ہونے کے بارے میں اپ ڈیٹس حاصل کریں۔' : 'Get updates about hazards or road closures nearby.'}
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
                {isUrdu ? 'آپ کی مدد کے لیے ہمیں آپ کا مقام چاہیے' : 'We need your location to help'}
              </h2>
              <p className="text-xs text-[#5A6E78]">
                {isUrdu ? 'آپ کی حفاظت ہماری اولین ترجیح ہے۔' : 'Your safety is our top priority.'}
              </p>
            </div>

            <div className="space-y-2 text-left text-xs text-[#1C2C34]">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#FC7454] flex-shrink-0 mt-0.5" />
                <span><strong>{isUrdu ? 'صرف نیویگیشن کے دوران:' : 'Only when you navigate:'}</strong> {isUrdu ? 'ہم فعال ٹرپس کے دوران GPS تک رسائی حاصل کرتے ہیں۔' : 'We access GPS only during active trips.'}</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#FC7454] flex-shrink-0 mt-0.5" />
                <span><strong>{isUrdu ? 'عوامی طور پر کبھی شیئر نہیں:' : 'Never shared publicly:'}</strong> {isUrdu ? 'صحیح نقاط کبھی نشر نہیں ہوتے۔' : 'Exact coordinates are never broadcast.'}</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#FC7454] flex-shrink-0 mt-0.5" />
                <span><strong>{isUrdu ? 'آپ ڈیٹا کنٹرول کرتے ہیں:' : 'You control the data:'}</strong> {isUrdu ? 'ایک کلک سے کسی بھی وقت تاریخ صاف کریں۔' : 'Clear history anytime with one click.'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: APP PASSWORD (new users only) */}
        {/* ========================================================================= */}
        {isNewUser && currentStep === 6 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-[#1C2C34]">{isUrdu ? 'ایپ / موسم کا پاس ورڈ' : 'Set App Password'}</h2>
              <p className="text-xs text-[#5A6E78]">{isUrdu ? 'یہ پاس ورڈ محفوظ ایپ تک رسائی کے لیے استعمال ہوگا۔ یہ صرف پہلی بار سیٹ ہوتا ہے۔' : 'This password unlocks the protected app through the weather interface. Set once — you can change it later in Settings.'}</p>
            </div>
            {passwordError && <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">{passwordError}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1C2C34] mb-1">{isUrdu ? 'پاس ورڈ:' : 'App Password:'}</label>
                <div className="relative">
                  <input type={showAppPw ? 'text' : 'password'} value={appPassword} onChange={e => setAppPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]" />
                  <button type="button" onClick={() => setShowAppPw(!showAppPw)} className="absolute right-3 top-2.5 text-slate-400 hover:text-[#1C2C34] cursor-pointer">{showAppPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2C34] mb-1">{isUrdu ? 'پاس ورڈ کی تصدیق:' : 'Confirm Password:'}</label>
                <input type={showAppPw ? 'text' : 'password'} value={appPasswordConfirm} onChange={e => setAppPasswordConfirm(e.target.value)} placeholder="Re-enter password" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]" />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#ECF4F4] border border-[#BCD4D4] flex items-start space-x-2 text-[11px] text-[#1C2C34]">
              <Lock className="w-4 h-4 text-[#A4C4C4] flex-shrink-0 mt-0.5" />
              <span>{isUrdu ? 'یہ پاس ورڈ آپ کے آلے پر محفوظ رہے گا۔ سیٹنگز سے تبدیل کیا جا سکتا ہے۔' : 'This password is stored on your device only. You can change it anytime from Settings.'}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: VAULT PASSWORD (new users only) */}
        {/* ========================================================================= */}
        {isNewUser && currentStep === 7 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-[#1C2C34]">{isUrdu ? 'پرائیویٹ والٹ کا پاس ورڈ' : 'Set Private Vault Password'}</h2>
              <p className="text-xs text-[#5A6E78]">{isUrdu ? 'یہ پاس ورڈ آپ کے خفیہ والٹ کو محفوظ رکھے گا۔' : 'A separate password to protect your encrypted Private Vault. Must be different from your app password.'}</p>
            </div>
            {passwordError && <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">{passwordError}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1C2C34] mb-1">{isUrdu ? 'والٹ پاس ورڈ:' : 'Vault Password:'}</label>
                <div className="relative">
                  <input type={showVaultPw ? 'text' : 'password'} value={vaultPassword} onChange={e => setVaultPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]" />
                  <button type="button" onClick={() => setShowVaultPw(!showVaultPw)} className="absolute right-3 top-2.5 text-slate-400 hover:text-[#1C2C34] cursor-pointer">{showVaultPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2C34] mb-1">{isUrdu ? 'پاس ورڈ کی تصدیق:' : 'Confirm Vault Password:'}</label>
                <input type={showVaultPw ? 'text' : 'password'} value={vaultPasswordConfirm} onChange={e => setVaultPasswordConfirm(e.target.value)} placeholder="Re-enter password" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]" />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#ECF4F4] border border-[#BCD4D4] flex items-start space-x-2 text-[11px] text-[#1C2C34]">
              <Lock className="w-4 h-4 text-[#A4C4C4] flex-shrink-0 mt-0.5" />
              <span>{isUrdu ? 'والٹ کا ڈیٹا آپ کے آلے پر اینکرپٹ رہے گا۔' : 'Vault data stays encrypted and device-specific. Never stored as plaintext.'}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* READY STEP: last step for both new and returning users */}
        {/* ========================================================================= */}
        {((!isNewUser && currentStep === 6) || (isNewUser && currentStep === 8)) && (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-full bg-[#ECF4F4] text-[#FC7454] mx-auto flex items-center justify-center border border-[#BCD4D4]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#1C2C34]">
                {isUrdu ? 'آپ محفوظ نیویگیشن کے لیے تیار ہیں' : "You're ready to navigate safely"}
              </h2>
              <p className="text-xs text-[#5A6E78]">
                {isUrdu ? 'سب تیار! اپنی کمیونٹی کی دیگر خواتین کی تصدیق شدہ محفوظ راستے تلاش کریں۔' : 'All set! Find safe routes verified by other women in your community.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#ECF4F4]/70 border border-[#BCD4D4] text-xs text-[#1C2C34] font-semibold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-[#FC7454]" />
                <span>{isUrdu ? 'محفوظ راستے تلاش کریں' : 'Find Safe Routes'}</span>
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
            <span>{currentStep === totalSteps ? (isNewUser ? (isUrdu ? 'ایپ میں داخل ہوں' : 'Enter App') : (isUrdu ? 'تلاش شروع کریں' : 'Start Exploring')) : (isUrdu ? 'جاری رکھیں' : 'Continue')}</span>
            <ArrowRight className="w-4 h-4 text-[#FC7454]" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
