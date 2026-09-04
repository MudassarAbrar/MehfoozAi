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
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, PunjabDistrict, AppLanguage, UserContact } from '../types';
import { updateStoredProfile, purgeAllUserData } from '../utils/auth';

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
  onOpenOnboarding
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
  const [confirmPurge, setConfirmPurge] = useState(false);

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const newC: UserContact = {
      id: `c-${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
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

  const handleExecutePurge = () => {
    purgeAllUserData();
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
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="w-full py-3.5 rounded-2xl bg-[#F8F9FD] hover:bg-[#ECF4F4] text-[#1C2C34] font-bold text-xs border border-slate-200 transition cursor-pointer"
              >
                View Safety Onboarding Guide
              </button>
            )}
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

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1C2C34] font-semibold text-xs flex items-center space-x-1 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Safety Onboarding Walkthrough Banner */}
      {onOpenOnboarding && (
        <div 
          onClick={onOpenOnboarding}
          className="rounded-2xl bg-[#ECF4F4] border border-[#BCD4D4] p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#BCD4D4]/30 transition"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FC7454] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C2C34]">
                Replay Safety Onboarding Guide
              </h4>
              <p className="text-[10px] text-[#5A6E78]">
                Review safety preferences, network & privacy controls
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#FC7454]" />
        </div>
      )}

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

        {/* Section 2: Emergency Network Contacts */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6E78] flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-[#FC7454]" />
              <span>Emergency Contacts Network</span>
            </h3>
            <span className="text-[10px] text-[#5A6E78] font-semibold">{contacts.length} added</span>
          </div>

          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] text-[#1C2C34] border border-[#BCD4D4] flex items-center justify-center font-bold text-xs">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C2C34]">{contact.name}</h4>
                    <p className="text-[10px] text-[#5A6E78]">{contact.relation} • {contact.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveContact(contact.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Contact Row */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-dashed border-[#BCD4D4] space-y-2">
            <span className="text-[11px] font-bold text-[#1C2C34]">
              + Add Trusted Contact
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Name (e.g. Mom)"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[#1C2C34]"
              />
              <input
                type="tel"
                placeholder="Phone (+92...)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[#1C2C34]"
              />
            </div>
            <button
              type="button"
              onClick={handleAddContact}
              disabled={!newContactName.trim() || !newContactPhone.trim()}
              className="w-full py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Add Contact to Safety Network
            </button>
          </div>
        </div>

        {/* Section 3: Stealth PIN & Appearance */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-3.5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6E78] flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#FC7454]" />
            <span>Security & Cover Settings</span>
          </h3>

          <div className="space-y-2.5">
            {/* Stealth PIN */}
            <div className="p-3.5 rounded-2xl bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1C2C34] flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-[#FC7454]" />
                  <span>Stealth Weather PIN</span>
                </h4>
                <p className="text-[10px] text-[#5A6E78]">PIN to reveal app from weather cover</p>
              </div>
              <input
                type="text"
                maxLength={6}
                value={stealthPin}
                onChange={(e) => setStealthPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-20 font-mono font-bold text-center px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-[#1C2C34] focus:border-[#FC7454] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#FC7454]" />
            <span>Save Profile & Preferences</span>
          </button>

          {/* Purge Safety Trigger */}
          <div className="text-center pt-2">
            {!confirmPurge ? (
              <button
                type="button"
                onClick={() => setConfirmPurge(true)}
                className="text-xs text-rose-600 hover:underline font-semibold flex items-center justify-center space-x-1 mx-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Emergency Purge All Local Data</span>
              </button>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={handleExecutePurge}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm Wipe Everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmPurge(false)}
                  className="px-3 py-2 rounded-xl bg-slate-200 text-[#1C2C34] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
