/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Home, 
  Navigation as NavIcon, 
  Users, 
  Clock, 
  AlertTriangle, 
  Scale, 
  Lock, 
  FileText, 
  HeartHandshake, 
  User, 
  Sun, 
  Moon, 
  Languages, 
  PhoneCall, 
  TerminalSquare, 
  CloudSun,
  ShieldCheck,
  ChevronDown,
  BookOpen,
  SlidersHorizontal,
  X,
  ExternalLink,
  Mail,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Instagram,
  Sparkles,
  Activity,
  Settings,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLogo } from './common/AppLogo';
import { PWAInstallButton } from './common/PWAInstallButton';
import { SocialLinksRow, AdminContactBox, OFFICIAL_LINKS } from './common/OfficialLinks';
import { ActiveTab, AppLanguage, UserProfile } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  themeMode: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenCrisis: () => void;
  onQuickExit: () => void;
  onToggleInspector: () => void;
  inspectorOpen: boolean;
  onOpenOnboarding: () => void;
  onOpenOfflineCorpus?: () => void;
  onChangePassword?: (target: 'app' | 'vault' | 'email') => void;
  draftCount?: number;
  vaultCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  language,
  onLanguageChange,
  themeMode,
  onThemeChange,
  user,
  onOpenAuthModal,
  onOpenCrisis,
  onQuickExit,
  onToggleInspector,
  inspectorOpen,
  onOpenOnboarding,
  onOpenOfflineCorpus,
  onChangePassword,
  draftCount = 0,
  vaultCount = 0,
}) => {
  const isUrdu = language === 'ur';
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);

  interface NavItem {
    id: ActiveTab;
    label: string;
    labelUrdu: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
    badge?: number;
  }

  // Primary bottom/desktop nav with AI Chat prominent
  const PRIMARY_NAV: NavItem[] = [
    { id: 'home', label: 'Home', labelUrdu: 'ہوم', icon: Home },
    { id: 'assistant', label: 'AI Legal', labelUrdu: 'قانونی AI', icon: Scale, highlight: true },
    { id: 'navigate', label: 'Safe Corridor', labelUrdu: 'محفوظ راستہ', icon: NavIcon },
    { id: 'checkin', label: 'Check-In', labelUrdu: 'چیک ان', icon: Clock },
    { id: 'alerts', label: 'Alerts', labelUrdu: 'الرٹس', icon: AlertTriangle, badge: 2 },
  ];

  const DESKTOP_EXTRA_NAV: NavItem[] = [
    { id: 'contacts', label: 'Contacts', labelUrdu: 'رابطے', icon: Users },
    { id: 'community', label: 'Community', labelUrdu: 'کمیونٹی', icon: HeartHandshake },
    { id: 'profile', label: 'Profile', labelUrdu: 'پروفائل', icon: User },
  ];

  // Settings gear items (#35, #36)
  const SETTINGS_ITEMS = [
    { id: 'profile', label: 'Profile & Account', labelUrdu: 'پروفائل اور اکاؤنٹ', icon: User },
    { id: 'vault', label: 'Private Vault', labelUrdu: 'پرائیویٹ والٹ', icon: Lock },
    { id: 'profile' as ActiveTab, label: 'App Password', labelUrdu: 'ایپ پاس ورڈ', icon: Lock, isPasswordLink: true, passwordType: 'app' },
    { id: 'profile' as ActiveTab, label: 'Vault Password', labelUrdu: 'والٹ پاس ورڈ', icon: Lock, isPasswordLink: true, passwordType: 'vault' },
    { id: 'profile' as ActiveTab, label: 'Email & Password', labelUrdu: 'ای میل اور پاس ورڈ', icon: Mail, isPasswordLink: true, passwordType: 'email' },
  ];

  // Secondary Legal & Vault items accessible via top bar or dropdown
  const LEGAL_SUITE: { id: ActiveTab; label: string; labelUrdu: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'assistant', label: 'Unsaid Legal AI', labelUrdu: 'قانونی معاون', icon: Scale },
    { id: 'contacts', label: 'Important Contacts', labelUrdu: 'اہم رابطے', icon: Users },
    { id: 'vault', label: 'Private Vault', labelUrdu: 'پرائیویٹ والٹ', icon: Lock, badge: vaultCount },
    { id: 'builder', label: 'Complaint Drafter', labelUrdu: 'درخواست ڈرافٹ', icon: FileText },
    { id: 'tracking', label: 'My Status', labelUrdu: 'میری اپ ڈیٹس', icon: Clock, badge: draftCount },
    { id: 'directory', label: 'Helplines', labelUrdu: 'ڈائریکٹری', icon: HeartHandshake },
    { id: 'api_monitor', label: 'API Monitor', labelUrdu: 'اے پی آئی مانیٹر', icon: Activity }
  ];

  return (
    <>
      {/* 1. TOP HEADER / BRAND & SAFETY BAR (Streamlined & Decluttered) */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-[#12141C]/95 border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-6 py-2.5 shadow-xs transition-colors w-full overflow-x-clip">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & Stealth Weather Disguise */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0">
            {/* Quick Exit Weather Disguise (Vital Safety Requirement) */}
            <button
              id="nav-quick-exit-btn"
              onClick={onQuickExit}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border border-slate-200 dark:border-slate-700 text-[#1C2C34] dark:text-[#F4F4FC] text-xs font-semibold transition group shadow-2xs flex-shrink-0 cursor-pointer"
              title="Stealth Weather Screen (Esc)"
            >
              <CloudSun className="w-4 h-4 text-[#FC7454] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-medium">
                {isUrdu ? 'موسم' : 'Weather'}
              </span>
              <span className="hidden sm:inline text-[10px] font-mono px-1 py-0.2 rounded bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Esc</span>
            </button>

            {/* App Logo: icon-only below sm so every header action (SOS, language,
                menu) stays on screen on small phones; full wordmark from sm up */}
            <div 
              onClick={() => onSelectTab('landing')}
              className="cursor-pointer group flex items-center flex-shrink-0"
              title="Mehfooz (محفوظ) - Return to Overview"
            >
              <span className="inline-flex sm:hidden">
                <AppLogo variant="icon" size="sm" />
              </span>
              <span className="hidden sm:inline-flex">
                <AppLogo variant="horizontal" size="sm" showUrdu={true} className="scale-95 sm:scale-100 origin-left" />
              </span>
            </div>
          </div>

          {/* Right Action Controls: Highly focused and uncluttered */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* 1. Direct Emergency SOS 15 */}
            <button
              id="nav-crisis-btn"
              onClick={onOpenCrisis}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#FC7454] hover:bg-[#FC7C54] text-white text-xs font-bold transition shadow-xs flex-shrink-0 whitespace-nowrap cursor-pointer"
              title="Police Helpline 15"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse text-white" />
              <span>15</span>
              <span className="font-extrabold">SOS</span>
            </button>

            {/* 2. Language Switcher: Simple one-touch accessibility */}
            <button
              id="nav-language-btn"
              onClick={() => onLanguageChange(language === 'en' ? 'ur' : 'en')}
              className="h-8 px-2.5 flex items-center space-x-1.5 rounded-xl bg-slate-100 dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] text-[#1C2C34] dark:text-[#F4F4FC] text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex-shrink-0 whitespace-nowrap cursor-pointer"
              title={language === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
            >
              <Languages className="w-3.5 h-3.5 text-[#1C2C34] dark:text-[#BCD4D4]" />
              <span>{language === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {/* 3. Unified Hub Menu Button */}
            <div className="relative">
              <button
                id="nav-hub-menu-btn"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`h-8 px-2.5 flex items-center space-x-1.5 rounded-xl border text-xs font-semibold transition flex-shrink-0 whitespace-nowrap cursor-pointer ${
                  isMoreMenuOpen
                    ? 'bg-[#ECF4F4] dark:bg-[#263842] text-[#FC7454] border-[#BCD4D4] dark:border-slate-600'
                    : 'bg-slate-100 dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] text-[#1C2C34] dark:text-[#F4F4FC] border-slate-200 dark:border-slate-700'
                }`}
                title="Suite Menu & Support"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">{isUrdu ? 'مینو' : 'Menu'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Hub Popover */}
              <AnimatePresence>
                {isMoreMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMoreMenuOpen(false)} 
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-88 max-w-[calc(100vw-24px)] max-h-[85vh] overflow-y-auto bg-white dark:bg-[#18242A] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-3"
                    >
                      {/* Section 1: Settings Gear (#35, #36) */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A6E78] dark:text-slate-400 px-1 mb-1.5 flex items-center gap-1.5">
                          <Settings className="w-3 h-3" />
                          <span>{isUrdu ? 'سیٹنگز' : 'Settings'}</span>
                        </div>
                        <div className="space-y-1">
                          {SETTINGS_ITEMS.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={`${item.id}-${idx}`}
                                onClick={() => {
                                  if (item.isPasswordLink && item.passwordType) {
                                    // Password management buttons — open dedicated flow
                                    if (item.passwordType === 'email') {
                                      onOpenAuthModal();
                                    } else {
                                      onChangePassword?.(item.passwordType as 'app' | 'vault');
                                    }
                                  } else {
                                    onSelectTab(item.id);
                                  }
                                  setIsMoreMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                                  activeTab === item.id
                                    ? 'bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#F4F4FC] font-bold border border-[#BCD4D4] dark:border-[#263842]'
                                    : 'text-[#1C2C34] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#263842]/60'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-3.5 h-3.5 text-[#FC7454] dark:text-[#BCD4D4]" />
                                  <span>{isUrdu ? item.labelUrdu : item.label}</span>
                                </div>
                              </button>
                            );
                          })}
                          {/* Help option (#36) */}
                          <button
                            onClick={() => { onOpenOnboarding(); setIsMoreMenuOpen(false); }}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#1C2C34] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#263842]/60 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <HelpCircle className="w-3.5 h-3.5 text-[#FC7454] dark:text-[#BCD4D4]" />
                              <span>{isUrdu ? 'مدد' : 'Help'}</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Quick Settings (Theme, Inspector, PWA) */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A6E78] dark:text-slate-400 px-1 mb-1.5">
                          {isUrdu ? 'ظاہری سیٹنگز' : 'Display'}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {/* Theme Mode Toggle */}
                          <button
                            onClick={() => onThemeChange(themeMode === 'light' ? 'dark' : 'light')}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#121A1E] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-[#1C2C34] dark:text-[#F4F4FC] transition cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              {themeMode === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                              <span>{themeMode === 'light' ? 'Dark' : 'Light'}</span>
                            </span>
                            <span className="text-[10px] text-[#5A6E78] dark:text-slate-400">{themeMode === 'light' ? 'Off' : 'On'}</span>
                          </button>

                          {/* Telemetry Inspector */}
                          <button
                            onClick={() => {
                              onToggleInspector();
                              setIsMoreMenuOpen(false);
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                              inspectorOpen
                                ? 'bg-[#ECF4F4] dark:bg-[#263842] text-[#FC7454] border-[#BCD4D4] dark:border-slate-600'
                                : 'bg-slate-50 dark:bg-[#121A1E] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border-slate-200/80 dark:border-slate-700/80 text-[#1C2C34] dark:text-[#F4F4FC]'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <TerminalSquare className="w-3.5 h-3.5" />
                              <span>Inspector</span>
                            </span>
                            <span className="text-[10px] text-[#5A6E78] dark:text-slate-400">{inspectorOpen ? 'Open' : 'Logs'}</span>
                          </button>
                        </div>

                        {/* PWA Install & Safety Guide */}
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <PWAInstallButton language={language} variant="badge" className="w-full justify-center" />
                          <button
                            onClick={() => {
                              onOpenOnboarding();
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full py-1.5 px-2 rounded-xl bg-slate-50 dark:bg-[#121A1E] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-[#1C2C34] dark:text-[#F4F4FC] flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#FC7454]" />
                            <span>{isUrdu ? 'رہنما گائیڈ' : 'Safety Guide'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Section 2: Legal & Protection Suite */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A6E78] dark:text-slate-400 px-1 mb-1.5">
                          {isUrdu ? 'قانونی اور حفاظتی ٹولز' : 'Legal & Protection Suite'}
                        </div>
                        <div className="space-y-1">
                          {LEGAL_SUITE.map((sub) => {
                            const Icon = sub.icon;
                            const isSubActive = activeTab === sub.id;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  onSelectTab(sub.id);
                                  setIsMoreMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                                  isSubActive
                                    ? 'bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#F4F4FC] font-bold border border-[#BCD4D4] dark:border-[#263842]'
                                    : 'text-[#1C2C34] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#263842]/60'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-3.5 h-3.5 text-[#FC7454] dark:text-[#BCD4D4]" />
                                  <span>{isUrdu ? sub.labelUrdu : sub.label}</span>
                                </div>
                                {sub.badge !== undefined && sub.badge > 0 && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-[#FC7454] text-white text-[9px] font-bold">
                                    {sub.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}

                          {onOpenOfflineCorpus && (
                            <button
                              onClick={() => {
                                onOpenOfflineCorpus();
                                setIsMoreMenuOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#1C2C34] dark:text-slate-200 hover:bg-[#ECF4F4] dark:hover:bg-[#263842]/60 transition cursor-pointer"
                            >
                              <div className="flex items-center space-x-2">
                                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{isUrdu ? 'آف لائن قوانین (Corpus)' : 'Offline Legal Corpus'}</span>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">Zero-Net</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Section 3: Official Social Channels & Admin Support */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A6E78] dark:text-slate-400 px-1 mb-1.5">
                          {isUrdu ? 'رابطہ اور سوشل چینلز' : 'Official Channels & Admin'}
                        </div>

                        {/* Admin Email Box with 1-click copy */}
                        <AdminContactBox language={language} compact={true} className="mb-2" />

                        {/* Social Links Row */}
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[11px] text-[#5A6E78] dark:text-slate-400">
                            {isUrdu ? 'ہمیں فالو کریں:' : 'Follow Mehfooz:'}
                          </span>
                          <SocialLinksRow size="sm" />
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* 2. DESKTOP / TABLET SECONDARY NAVIGATION BAR */}
      <nav aria-label="Desktop Navigation" className="hidden md:block bg-white/90 dark:bg-[#12141C]/90 border-b border-slate-200/80 dark:border-slate-800/80 sticky top-[53px] z-30 backdrop-blur-md px-4 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between py-2.5">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
            {[...PRIMARY_NAV, ...DESKTOP_EXTRA_NAV].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`desktop-nav-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1C2C34] dark:bg-[#BCD4D4] text-white dark:text-[#1C2C34] shadow-xs'
                      : 'text-[#5A6E78] dark:text-slate-400 hover:text-[#1C2C34] dark:hover:text-[#F4F4FC] hover:bg-[#ECF4F4] dark:hover:bg-[#18242A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{isUrdu ? item.labelUrdu : item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#FC7454] text-white' : 'bg-[#1C2C34] dark:bg-slate-700 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="text-xs font-bold text-[#1C2C34] dark:text-slate-300 hover:text-[#FC7454] dark:hover:text-[#FC7C54] flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#FC7454]" />
              <span>{isUrdu ? 'رابطہ و سوشل' : 'Admin & Socials'}</span>
            </button>

            <button
              onClick={onOpenOnboarding}
              className="text-xs font-bold text-[#1C2C34] dark:text-slate-300 hover:text-[#FC7454] dark:hover:text-[#FC7C54] flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#FC7454]" />
              <span>Safety Guide</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/98 dark:bg-[#12141C]/98 border-t border-slate-200/80 dark:border-slate-800/80 backdrop-blur-lg px-3 py-1.5 shadow-lg transition-colors">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[50px] cursor-pointer ${
                  isActive
                    ? 'text-[#1C2C34] dark:text-[#BCD4D4] font-black'
                    : 'text-[#5A6E78] dark:text-slate-400 hover:text-[#1C2C34] dark:hover:text-[#F4F4FC] font-semibold'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-105 text-[#1C2C34] dark:text-[#BCD4D4]' : 'stroke-[2px]'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#FC7454] text-white text-[10px] font-black flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] tracking-tight truncate max-w-full mt-1 font-bold">
                  {isUrdu ? item.labelUrdu : item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-[#FC7454] dark:bg-[#BCD4D4] mt-0.5"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. OFFICIAL LINKS & ADMIN SUPPORT MODAL */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#18242A] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-[#FC7454]" />
                  <h3 className="text-lg font-bold text-[#1C2C34] dark:text-[#F4F4FC]">
                    {isUrdu ? 'رابطہ اور آفیشل لنکس' : 'Official Channels & Admin'}
                  </h3>
                </div>
                <p className="text-xs text-[#5A6E78] dark:text-slate-400">
                  {isUrdu 
                    ? 'محفوظ اے آئی پلیٹ فارم کے بارے میں مدد یا فیڈبیک کے لیے ایڈمن سے رابطہ کریں یا ہمارے سوشل ہینڈلز فالو کریں۔'
                    : 'Connect directly with the Mehfooz administration or follow our official social handles for protection updates.'
                  }
                </p>
              </div>

              {/* Admin Email Box */}
              <div className="mb-4">
                <AdminContactBox language={language} />
              </div>

              {/* Social Channels */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121A1E] border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-bold text-[#1C2C34] dark:text-slate-200 mb-2">
                  {isUrdu ? 'آفیشل سوشل ہینڈلز' : 'Official Social Profiles'}
                </div>
                <div className="space-y-2">
                  <a
                    href={OFFICIAL_LINKS.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border border-slate-200 dark:border-slate-700 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                      <span className="text-xs font-semibold text-[#1C2C34] dark:text-slate-200">Twitter / X (@MehfoozAii)</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1C2C34] dark:group-hover:text-white" />
                  </a>

                  <a
                    href={OFFICIAL_LINKS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border border-slate-200 dark:border-slate-700 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                      <span className="text-xs font-semibold text-[#1C2C34] dark:text-slate-200">LinkedIn (Mehfooz AI)</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1C2C34] dark:group-hover:text-white" />
                  </a>

                  <a
                    href={OFFICIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border border-slate-200 dark:border-slate-700 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Instagram className="w-4 h-4 text-[#E4405F]" />
                      <span className="text-xs font-semibold text-[#1C2C34] dark:text-slate-200">Instagram (@mehfoozai)</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1C2C34] dark:group-hover:text-white" />
                  </a>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsSupportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white text-xs font-bold transition cursor-pointer"
                >
                  {isUrdu ? 'بند کریں' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
