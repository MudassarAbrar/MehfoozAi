/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, PunjabDistrict, AppLanguage } from '../types';
import { loginUser, signUpUser } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  language: AppLanguage;
  initialMode?: 'login' | 'signup';
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

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language,
  initialMode = 'login',
}) => {
  const isUrdu = language === 'ur';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState<PunjabDistrict>('Lahore');
  const [phone, setPhone] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  if (!isOpen) return null;

  const handleDemoFill = () => {
    setEmail('ayesha.rehman@gmail.com');
    setPassword('Mehfooz2026!');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await loginUser(email, password);
        if (result.success && result.user) {
          onSuccess(result.user);
          onClose();
        } else {
          setErrorMessage(result.error || 'Login failed.');
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage(isUrdu ? 'براہ کرم اپنا نام درج کریں۔' : 'Please provide your name.');
          setLoading(false);
          return;
        }

        const result = await signUpUser({
          email,
          password,
          fullName,
          district,
          phone,
          emergencyContactName,
          emergencyContactPhone,
          preferredLanguage: language,
        });

        if (result.success && result.user) {
          onSuccess(result.user);
          onClose();
        } else {
          setErrorMessage(result.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5 text-[#181A20] my-8"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F5EEFD] text-[#9333EA] flex items-center justify-center border border-[#E9D5FF]">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#181A20]">
                {mode === 'login' 
                  ? (isUrdu ? 'لاگ ان کریں' : 'Sign In to Mehfooz') 
                  : (isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Create Secure Profile')}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {isUrdu ? 'پرائیویٹ نوٹس و ڈرافٹس کے تحفظ کے لیے' : 'Protect your encrypted notes & case drafts'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#181A20] hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#181A20] font-bold shadow-xs border border-slate-200'
                : 'text-[#6B7280] hover:text-[#181A20]'
            }`}
          >
            {isUrdu ? 'لاگ ان' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#181A20] font-bold shadow-xs border border-slate-200'
                : 'text-[#6B7280] hover:text-[#181A20]'
            }`}
          >
            {isUrdu ? 'رجسٹریشن' : 'Create Account'}
          </button>
        </div>

        {/* Demo Account Quick Fill Button */}
        {mode === 'login' && (
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2 px-3 rounded-xl bg-[#F5EEFD] hover:bg-[#E9D5FF]/40 border border-[#E9D5FF] text-[#181A20] text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9333EA]" />
            <span>Use Demo Verified Account (ayesha.rehman@gmail.com)</span>
          </button>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[#181A20] font-medium mb-1">
                  {isUrdu ? 'پورا نام / محفوظ نام:' : 'Full Name / Safe Pseudonym:'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ayesha Rehman"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#181A20] placeholder:text-slate-400 focus:outline-none focus:border-[#9333EA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#181A20] font-medium mb-1">
                  {isUrdu ? 'پنجاب کا ضلع:' : 'Punjab District:'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as PunjabDistrict)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#181A20] focus:outline-none focus:border-[#9333EA]"
                  >
                    {PUNJAB_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[#181A20] font-medium mb-1">
              {isUrdu ? 'ای میل ایڈریس:' : 'Email Address:'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#181A20] placeholder:text-slate-400 focus:outline-none focus:border-[#9333EA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#181A20] font-medium mb-1">
              {isUrdu ? 'پاس ورڈ:' : 'Password:'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#181A20] placeholder:text-slate-400 focus:outline-none focus:border-[#9333EA]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-[#181A20] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[#181A20] font-medium mb-1">
                  {isUrdu ? 'محفوظ فون / واٹس ایپ (اختیاری):' : 'Safe Phone / WhatsApp (Optional):'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#181A20] placeholder:text-slate-400 focus:outline-none focus:border-[#9333EA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#181A20] font-medium mb-1">
                  {isUrdu ? 'قابل اعتماد ہنگامی رابطہ کار (نام و فون):' : 'Trusted Emergency Contact (Name & Phone):'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Contact Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#181A20] placeholder:text-slate-400 focus:outline-none focus:border-[#9333EA]"
                  />
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#181A20] placeholder:text-slate-400 focus:outline-none focus:border-[#9333EA]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2 text-[11px] text-[#181A20]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              {isUrdu
                ? 'آپ کا ڈیٹا ویب کرپٹو (Web Crypto API) کے ذریعے اینڈ ٹو اینڈ اینکرپٹ رہتا ہے۔'
                : 'Zero-knowledge storage: Credentials & incidents are encrypted on your local device.'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white font-bold flex items-center justify-center space-x-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4 text-[#B886FD]" />
                <span>{isUrdu ? 'لاگ ان کریں' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-[#B886FD]" />
                <span>{isUrdu ? 'اکاؤنٹ بنائیں' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
