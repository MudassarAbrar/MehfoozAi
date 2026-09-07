/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Globe, 
  Key, 
  Bell, 
  LogOut, 
  Trash2, 
  Save, 
  Check, 
  AlertTriangle,
  Lock,
  Sparkles,
  Sliders,
  ChevronRight,
  Plus,
  Compass,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, PunjabDistrict, AppLanguage, UserContact } from '../types';
import { updateStoredProfile, purgeLocalDeviceData, deleteAccountPermanently } from '../utils/auth';

interface UserProfileProps {
  user: UserProfile | null;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  themeMode: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  onQuickExit: () => void;
  onOpenOnboarding?: () => void;
  onOpenSafetyGuide?: () => void;
  onBack?: () => void;
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

export const UserProfileView: React.FC<UserProfileProps> = ({
  user,
  language,
  onLanguageChange,
  themeMode,
  onThemeChange,
  onUpdateProfile,
  onLogout,
  onOpenAuthModal,
  onQuickExit,
  onOpenOnboarding,
  onOpenSafetyGuide,
  onBack
}) => {
  const isUrdu = language === 'ur';

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.fullName || 'Fatima Noor');
  const [safeNickname, setSafeNickname] = useState(user?.safeNickname || 'Fatima');
  const [district, setDistrict] = useState<PunjabDistrict>(user?.district || 'Lahore');
  const [phone, setPhone] = useState(user?.phone || '+92 300 1234567');
  const [stealthPin, setStealthPin] = useState(user?.stealthPin || '1520');
  const [discreetNotifications, setDiscreetNotifications] = useState(user?.discreetNotifications ?? true);

  // Emergency contacts list
  const [contacts, setContacts] = useState<UserContact[]>(
    user?.emergencyContacts && user.emergencyContacts.length > 0
      ? user.emergencyContacts
      : [
          { id: 'c1', name: 'Protiva (Mom)', phone: '+92 300 1234567', relation: 'Mother', isDefaultNotified: true },
          { id: 'c2', name: 'Subodh (Father)', phone: '+92 321 9876543', relation: 'Father', isDefaultNotified: true }
        ]
  );

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Friend');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmLocalPurge, setConfirmLocalPurge] = useState(false);
  const [confirmAccountDelete, setConfirmAccountDelete] = useState(false);
  const [contactPhoneError, setContactPhoneError] = useState<string | null>(null);

  const handleAddContact = () => {
    setContactPhoneError(null);
    if (!newContactName.trim()) return;
    const cleanPhone = newContactPhone.trim().replace(/[\s\-\(\)]/g, '');
    const isPakPhone = /^((\+92|92|0)?3\d{9})$/.test(cleanPhone);
    if (!isPakPhone) {
      setContactPhoneError(
        isUrdu
          ? 'براہ کرم درست پاکستانی نمبر درج کریں (مثال: 03001234567 یا 923001234567+)'
          : 'Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567)'
      );
      return;
    }
    const normalizedPhone = cleanPhone.startsWith('0')
      ? `+92${cleanPhone.slice(1)}`
      : cleanPhone.startsWith('92')
      ? `+${cleanPhone}`
      : cleanPhone.startsWith('+92')
      ? cleanPhone
      : `+92${cleanPhone}`;

    const newC: UserContact = {
      id: `c-${Date.now()}`,
      name: newContactName.trim(),
      phone: normalizedPhone,
      relation: newContactRelation,
      isDefaultNotified: true
    };
    setContacts([...contacts, newC]);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuthModal();
      return;
    }

    const updated: UserProfile = {
      ...user,
      fullName: fullName.trim(),
      safeNickname: safeNickname.trim(),
      district,
      phone: phone.trim(),
      emergencyContacts: contacts,
      emergencyContactName: contacts[0]?.name || '',
      emergencyContactPhone: contacts[0]?.phone || '',
      stealthPin: stealthPin.trim() || '1520',
      discreetNotifications,
      preferredLanguage: language,
      themeMode,
    };

    updateStoredProfile(updated);
    onUpdateProfile(updated);
    // NOTE: the stealth PIN is no longer stored in plaintext localStorage —
    // updateStoredProfile persists only a salted hash (see utils/auth.ts).

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExecuteLocalPurge = () => {
    purgeLocalDeviceData();
    onLogout();
    onQuickExit();
  };

  const handleExecuteAccountDeletion = async () => {
    await deleteAccountPermanently();
    onLogout();
    onQuickExit();
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4 text-[#1C2C34]">
        <div className="rounded-[28px] bg-white border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#ECF4F4] text-[#FC7454] border border-[#BCD4D4] mx-auto flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#1C2C34]">
              {isUrdu ? 'آپ گیسٹ موڈ میں ہیں' : 'Guest Mode Active'}
            </h2>
            <p className="text-xs text-[#5A6E78] max-w-sm mx-auto font-medium">
              {isUrdu
                ? 'اپنے محفوظ مقامات، ہنگامی رابطوں اور سیٹنگز کو محفوظ رکھنے کے لیے لاگ ان کریں۔'
                : 'Sign in to sync your saved places, trusted emergency contacts, and personalized safe routes.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={onOpenAuthModal}
              className="w-full py-3.5 rounded-2xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {isUrdu ? 'لاگ ان یا سائن اپ کریں' : 'Sign In / Register Profile'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-4 text-[#1C2C34]">
      {/* Profile Header Card */}
      <div className="rounded-[28px] bg-white border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ECF4F4] text-[#FC7454] border border-[#BCD4D4] flex items-center justify-center font-black text-base shadow-xs">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-[#1C2C34]">
                  {fullName}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Verified
                </span>
              </div>
              <p className="text-xs text-[#5A6E78] flex items-center space-x-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-[#FC7454]" />
                <span>{district}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onBack || (() => window.history.back())}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1C2C34] font-semibold text-xs flex items-center space-x-1 transition cursor-pointer"
              title="Back to Previous Page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'واپس' : 'Back'}</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1C2C34] font-semibold text-xs flex items-center space-x-1 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#FC7454]" />
              <span>{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>



      {/* Save Success Alert */}
      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2 font-bold"
        >
          <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>
            {isUrdu ? 'ترتیبات کامیابی سے محفوظ ہو گئیں!' : 'Profile & safety settings updated!'}
          </span>
        </motion.div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        {/* Section 1: Personal Details */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-3.5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6E78] flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-[#FC7454]" />
            <span>Personal Information</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#1C2C34] font-semibold mb-1">
                Full Name:
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#1C2C34] focus:outline-none focus:border-[#FC7454]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[#1C2C34] font-semibold mb-1">
                  Safe Nickname:
                </label>
                <input
                  type="text"
                  value={safeNickname}
                  onChange={(e) => setSafeNickname(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#1C2C34] focus:outline-none focus:border-[#FC7454]"
                />
              </div>

              <div>
                <label className="block text-[#1C2C34] font-semibold mb-1">
                  Primary District:
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as PunjabDistrict)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#1C2C34] focus:outline-none focus:border-[#FC7454]"
                >
                  {PUNJAB_DISTRICTS.map((d) => (
                     <option key={d} value={d}>
                       {d}
                     </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3 pt-1">
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#FC7454]" />
            <span>Save Profile & Preferences</span>
          </button>





          {/* Data Privacy & Purge Triggers (ISSUE 23 & 24) */}
          <div className="pt-3 border-t border-slate-100 space-y-3 text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A6E78]">
              {isUrdu ? 'ڈیٹا کنٹرول اور سیکیورٹی وائپ' : 'Data Privacy & Device Sanitization'}
            </div>

            {/* 1. Local Device Purge */}
            {!confirmLocalPurge ? (
              <div>
                <button
                  type="button"
                  onClick={() => setConfirmLocalPurge(true)}
                  className="text-xs text-amber-700 hover:underline font-semibold flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'اس ڈیوائس سے لوکل ڈیٹا صاف کریں' : 'Clear Data From This Device'}</span>
                </button>
                <p className="text-[10px] text-[#5A6E78] mt-0.5">
                  {isUrdu
                    ? 'صرف اس موبائل سے کیشڈ والٹ اور چابیاں مٹاتا ہے۔ آن لائن اکاؤنٹ محفوظ رہے گا۔'
                    : 'Wipes cached keys and local vault from this device. Remote account remains safe.'}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <p className="text-xs text-amber-900 font-medium">
                  {isUrdu
                    ? 'کیا آپ واقعی اس ڈیوائس سے تمام لوکل ڈیٹا اور فعال سیشن ختم کرنا چاہتے ہیں؟'
                    : 'Clear cached vault and encryption keys from this browser/device only?'}
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={handleExecuteLocalPurge}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
                  >
                    {isUrdu ? 'ہاں، لوکل ڈیٹا مٹائیں' : 'Confirm Local Device Wipe'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmLocalPurge(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 text-[#1C2C34] text-xs font-semibold cursor-pointer"
                  >
                    {isUrdu ? 'منسوخ' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Permanent Account Deletion */}
            {user && (
              <div className="pt-1">
                {!confirmAccountDelete ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setConfirmAccountDelete(true)}
                      className="text-xs text-rose-600 hover:underline font-semibold flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'اکاؤنٹ اور تمام کلاؤڈ ریکارڈز مستقل ڈیلیٹ کریں' : 'Permanently Delete Account & Cloud Records'}</span>
                    </button>
                    <p className="text-[10px] text-rose-500/80 mt-0.5">
                      {isUrdu
                        ? 'کلاؤڈ سے تمام شکایات، شواہد اور پروفائل کو ناقابل واپسی طور پر تباہ کر دیتا ہے۔'
                        : 'Irreversibly destroys all cloud incidents, complaints, check-ins, and profile data.'}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                    <p className="text-xs text-rose-900 font-bold">
                      {isUrdu
                        ? 'انتباہ: یہ عمل ناقابل واپسی ہے۔ آپ کا تمام ڈیٹا مستقل ختم ہو جائے گا۔'
                        : 'Warning: This action is permanent and cannot be undone. All cloud data will be wiped.'}
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={handleExecuteAccountDeletion}
                        className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                      >
                        {isUrdu ? 'مستقل ڈیلیٹ کریں' : 'Confirm Permanent Deletion'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmAccountDelete(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 text-[#1C2C34] text-xs font-semibold cursor-pointer"
                      >
                        {isUrdu ? 'منسوخ' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
