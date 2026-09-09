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
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, PunjabDistrict, AppLanguage } from '../types';
import { loginUser, signUpUser, resetUserPassword, resendConfirmationEmail } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onAuthSuccess?: (user: UserProfile) => void;
  onDemoMode?: () => void;
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
  onAuthSuccess,
  onDemoMode,
  language,
  initialMode = 'login',
}) => {
  const handleSuccess = (user: UserProfile, isSignup: boolean = false) => {
    onSuccess(user);
    if (isSignup) {
      onAuthSuccess?.(user);
    }
  };
  const isUrdu = language === 'ur';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

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

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage(isUrdu ? 'پہلے اپنا ای میل درج کریں۔' : 'Enter your email address first.');
      return;
    }
    setErrorMessage(null);
    setResetMessage(null);
    setResetting(true);
    try {
      const result = await resetUserPassword(email);
      if (result.success) {
        setResetMessage(
          isUrdu
            ? 'پاس ورڈ ری سیٹ لنک آپ کے ای میل پر بھیج دیا گیا ہے۔'
            : 'Password reset link sent. Please check your inbox.'
        );
      } else {
        setErrorMessage(result.error || 'Failed to send reset email.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send reset email.');
    } finally {
      setResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await loginUser(email, password);
        if (result.success && result.user) {
          handleSuccess(result.user, false);
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

        if (password.length < 6) {
          setErrorMessage(isUrdu ? 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔' : 'Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        if (!/\d/.test(password)) {
          setErrorMessage(
            isUrdu
              ? 'پاس ورڈ میں کم از کم ایک عدد (نمبر 0-9) ہونا ضروری ہے۔'
              : 'Password must contain at least one number (0-9).'
          );
          setLoading(false);
          return;
        }

        if (phone.trim()) {
          const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
          if (!/^((\+92|92|0)?3\d{9})$/.test(cleanPhone)) {
            setErrorMessage(
              isUrdu
                ? 'براہ کرم درست پاکستانی موبائل نمبر درج کریں (مثال: 03001234567 یا 923001234567+)'
                : 'Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567)'
            );
            setLoading(false);
            return;
          }
        }

        if (emergencyContactPhone.trim()) {
          const cleanEmergencyPhone = emergencyContactPhone.trim().replace(/[\s\-\(\)]/g, '');
          if (!/^((\+92|92|0)?3\d{9})$/.test(cleanEmergencyPhone)) {
            setErrorMessage(
              isUrdu
                ? 'براہ کرم ہنگامی رابطہ کار کا درست پاکستانی موبائل نمبر درج کریں (مثال: 03001234567)'
                : 'Please enter a valid Pakistani mobile number for the emergency contact (e.g. 03001234567)'
            );
            setLoading(false);
            return;
          }
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
          handleSuccess(result.user, true);
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
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5 text-[#1C2C34] my-8"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ECF4F4] text-[#1C2C34] flex items-center justify-center border border-[#BCD4D4]">
              {mode === 'login' ? <LogIn className="w-5 h-5 text-[#FC7454]" /> : <UserPlus className="w-5 h-5 text-[#FC7454]" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C2C34]">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#1C2C34] hover:bg-slate-100 transition cursor-pointer"
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
                ? 'bg-white text-[#1C2C34] font-bold shadow-xs border border-slate-200'
                : 'text-[#6B7280] hover:text-[#1C2C34]'
            }`}
          >
            {isUrdu ? 'لاگ ان' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#1C2C34] font-bold shadow-xs border border-slate-200'
                : 'text-[#6B7280] hover:text-[#1C2C34]'
            }`}
          >
            {isUrdu ? 'رجسٹریشن' : 'Create Account'}
          </button>
        </div>

        {/* Demo Mode Button */}
        {mode === 'login' && onDemoMode && (
          <button
            type="button"
            onClick={() => { onDemoMode(); onClose(); }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FC7454]/10 to-[#FC7454]/5 hover:from-[#FC7454]/20 hover:to-[#FC7454]/10 border border-[#FC7454]/30 text-[#1C2C34] text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FC7454]" />
            <span>{isUrdu ? 'ڈیمو موڈ میں داخل ہوں' : 'Enter Demo Mode'}</span>
          </button>
        )}



        {/* Reset Email Feedback */}
        {resetMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Error or Success Neutral Alert Banner */}
        {errorMessage && (
          (errorMessage.toLowerCase().includes('check your email') || errorMessage.toLowerCase().includes('confirm your email') || errorMessage.toLowerCase().includes('already have an account')) ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-start space-x-2.5 shadow-2xs">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <span className="font-bold text-emerald-950 block">
                  {isUrdu ? 'ای میل تصدیق کی ہدایت' : 'Email Instructions Sent'}
                </span>
                <p className="text-slate-700">{errorMessage}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMessage(null); }}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition"
                  >
                    {isUrdu ? 'لاگ ان کریں' : 'Sign In Now'}
                  </button>
                  {email.trim() && (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          setLoading(true);
                          const res = await resendConfirmationEmail(email);
                          setLoading(false);
                          if (res.success) {
                            setResetMessage(isUrdu ? 'تصدیقی ای میل دوبارہ بھیج دی گئی ہے۔' : 'Confirmation email resent. Check your inbox.');
                          } else {
                            setErrorMessage(res.error || 'Failed to resend confirmation email.');
                          }
                        }}
                        className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold transition"
                      >
                        {isUrdu ? 'دوبارہ ای میل بھیجیں' : 'Resend Email'}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setLoading(true);
                          const res = await resetUserPassword(email);
                          setLoading(false);
                          if (res.success) {
                            setResetMessage(isUrdu ? 'پاس ورڈ ری سیٹ ای میل بھیج دی گئی ہے۔' : 'Password reset email sent. Check your inbox.');
                          } else {
                            setErrorMessage(res.error || 'Failed to send password reset email.');
                          }
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition"
                      >
                        {isUrdu ? 'پاس ورڈ بھول گئے؟' : 'Forgot Password?'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start space-x-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[#1C2C34] font-medium mb-1">
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1C2C34] font-medium mb-1">
                  {isUrdu ? 'پنجاب کا ضلع:' : 'Punjab District:'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as PunjabDistrict)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1C2C34] focus:outline-none focus:border-[#FC7454]"
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
            <label className="block text-[#1C2C34] font-medium mb-1">
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
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1C2C34] font-medium mb-1">
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
                className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-[#1C2C34] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'signup' && (
              <div className="flex items-center space-x-3 mt-1.5 text-[11px]">
                <span className={`flex items-center space-x-1 transition-colors ${password.length >= 6 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  <span>{password.length >= 6 ? '✓' : '•'}</span>
                  <span>{isUrdu ? 'کم از کم 6 حروف' : '6+ characters'}</span>
                </span>
                <span className={`flex items-center space-x-1 transition-colors ${/\d/.test(password) ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  <span>{/\d/.test(password) ? '✓' : '•'}</span>
                  <span>{isUrdu ? 'کم از کم 1 عدد (0-9)' : 'At least 1 number (0-9)'}</span>
                </span>
              </div>
            )}
            {mode === 'login' && (
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetting}
                  className="text-[10px] font-semibold text-[#5A6E78] hover:text-[#FC7454] transition cursor-pointer disabled:opacity-50"
                >
                  {resetting
                    ? (isUrdu ? 'بھیجا جا رہا ہے…' : 'Sending…')
                    : (isUrdu ? 'پاس ورڈ بھول گئیں؟' : 'Forgot password?')}
                </button>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[#1C2C34] font-medium mb-1">
                  {isUrdu ? 'محفوظ فون / واٹس ایپ (اختیاری):' : 'Safe Phone / WhatsApp (Optional):'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1C2C34] font-medium mb-1">
                  {isUrdu ? 'قابل اعتماد ہنگامی رابطہ کار (نام و فون):' : 'Trusted Emergency Contact (Name & Phone):'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Contact Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]"
                  />
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1C2C34] placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-[#ECF4F4] border border-[#BCD4D4] flex items-start space-x-2 text-[11px] text-[#1C2C34]">
            <ShieldCheck className="w-4 h-4 text-[#A4C4C4] flex-shrink-0 mt-0.5" />
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
            className="w-full py-2.5 px-4 rounded-xl bg-[#1C2C34] hover:bg-[#1C2C34]/90 text-white font-bold flex items-center justify-center space-x-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4 text-[#FC7454]" />
                <span>{isUrdu ? 'لاگ ان کریں' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-[#FC7454]" />
                <span>{isUrdu ? 'اکاؤنٹ بنائیں' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
