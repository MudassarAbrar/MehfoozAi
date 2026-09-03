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
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLogo } from './common/AppLogo';
import { PWAInstallButton } from './common/PWAInstallButton';
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
  draftCount = 0,
  vaultCount = 0,
}) => {
  const isUrdu = language === 'ur';
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);

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
    { id: 'navigate', label: 'Navigate', labelUrdu: 'نیویگیٹ', icon: NavIcon },
    { id: 'checkin', label: 'Check-In', labelUrdu: 'چیک ان', icon: Clock },
    { id: 'alerts', label: 'Alerts', labelUrdu: 'الرٹس', icon: AlertTriangle, badge: 2 },
  ];

  const DESKTOP_EXTRA_NAV: NavItem[] = [
    { id: 'contacts', label: 'Contacts', labelUrdu: 'رابطے', icon: Users },
    { id: 'community', label: 'Community', labelUrdu: 'کمیونٹی', icon: HeartHandshake },
    { id: 'profile', label: 'Profile', labelUrdu: 'پروفائل', icon: User },
  ];

  // Secondary Legal & Vault items accessible via top bar or dropdown
  const LEGAL_SUITE: { id: ActiveTab; label: string; labelUrdu: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'assistant', label: 'Unsaid Legal AI', labelUrdu: 'قانونی معاون', icon: Scale },
    { id: 'contacts', label: 'Important Contacts', labelUrdu: 'اہم رابطے', icon: Users },
    { id: 'vault', label: 'Private Vault', labelUrdu: 'پرائیویٹ والٹ', icon: Lock, badge: vaultCount },
    { id: 'builder', label: 'Complaint Drafter', labelUrdu: 'درخواست ڈرافٹ', icon: FileText },
    { id: 'tracking', label: 'My Status', labelUrdu: 'میری اپ ڈیٹس', icon: Clock, badge: draftCount },
    { id: 'directory', label: 'Helplines', labelUrdu: 'ڈائریکٹری', icon: HeartHandshake },
  ];

  return (
    <>
      {/* 1. TOP HEADER / BRAND & SAFETY BAR */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-[#12141C]/95 border-b border-slate-200/80 dark:border-slate-800/80 px-2 sm:px-4 py-2 shadow-xs transition-colors w-full overflow-x-clip">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Brand & Weather Cover Stealth Exit */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 min-w-0 flex-shrink-0">
            <button
              id="nav-quick-exit-btn"
              onClick={onQuickExit}
              className="flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border border-slate-200 dark:border-slate-700 text-[#1C2C34] dark:text-[#F4F4FC] text-xs font-semibold transition group shadow-2xs flex-shrink-0 cursor-pointer"
              title="Stealth Weather Screen (Esc)"
            >
              <CloudSun className="w-4 h-4 text-[#FC7454] group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline font-medium">
                {isUrdu ? 'موسم' : 'Weather'}
              </span>
              <span className="hidden sm:inline md:hidden text-[10px] font-bold">Esc</span>
            </button>

            {/* App Logo */}
            <div 
              onClick={() => onSelectTab('landing')}
              className="cursor-pointer group flex items-center flex-shrink-0"
              title="View Landing Page & Tour"
            >
              <AppLogo variant="horizontal" size="sm" showUrdu={true} className="scale-95 sm:scale-100 origin-left" />
            </div>

            {/* Product Landing Tour Pill */}
            <button
              onClick={() => onSelectTab('landing')}
              className="hidden xl:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#ECF4F4] dark:bg-[#18242A] hover:bg-[#C4DCDC] dark:hover:bg-[#263842] border border-[#BCD4D4] dark:border-[#263842] text-[11px] font-bold text-[#1C2C34] dark:text-[#F4F4FC] transition shadow-2xs whitespace-nowrap flex-shrink-0 cursor-pointer"
            >
              <span>Product Tour</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
            {/* Legal Suite Quick Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] text-[#1C2C34] dark:text-[#F4F4FC] text-xs font-medium border border-slate-200 dark:border-slate-700 transition shadow-2xs flex-shrink-0 whitespace-nowrap cursor-pointer"
                title="Legal Suite"
              >
                <Scale className="w-3.5 h-3.5 text-[#1C2C34] dark:text-[#BCD4D4]" />
                <span className="hidden md:inline">Legal</span>
                <ChevronDown className="w-3 h-3 text-[#5A6E78] dark:text-slate-400" />
              </button>

              <AnimatePresence>
                {isMoreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#18242A] border border-[#BCD4D4]/60 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 z-50 space-y-0.5"
                  >
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                            isSubActive
                              ? 'bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#F4F4FC] font-bold border border-[#BCD4D4] dark:border-[#263842]'
                              : 'text-[#1C2C34] dark:text-slate-200 hover:bg-[#F4F4F4] dark:hover:bg-[#263842]/60'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-3.5 h-3.5 text-[#1C2C34] dark:text-[#BCD4D4]" />
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
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2C34] dark:text-slate-200 hover:bg-[#ECF4F4] dark:hover:bg-[#263842]/60 transition whitespace-nowrap border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-3.5 h-3.5 text-[#FC7454]" />
                          <span>{isUrdu ? 'آف لائن قوانین (Corpus)' : 'Offline Legal Corpus'}</span>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">Offline</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PWA Install Button (Safe offline installation) */}
            <PWAInstallButton language={language} variant="badge" />

            {/* Direct Emergency SOS 15 */}
            <button
              id="nav-crisis-btn"
              onClick={onOpenCrisis}
              className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#ECF4F4] dark:bg-[#18242A] hover:bg-[#C4DCDC] dark:hover:bg-[#263842] text-[#FC7454] dark:text-[#FC7C54] text-xs font-bold transition shadow-xs flex-shrink-0 whitespace-nowrap border border-[#BCD4D4] dark:border-slate-700 cursor-pointer"
              title="Police Helpline 15"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse text-[#FC7454]" />
              <span>15</span>
              <span className="hidden sm:inline font-bold">SOS</span>
            </button>

            {/* Theme toggle */}
            <button
              id="nav-theme-toggle-btn"
              onClick={() => onThemeChange(themeMode === 'light' ? 'dark' : 'light')}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] text-[#1C2C34] dark:text-[#F4F4FC] text-xs border border-slate-200 dark:border-slate-700 transition flex-shrink-0 cursor-pointer"
              title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {themeMode === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              id="nav-language-btn"
              onClick={() => onLanguageChange(language === 'en' ? 'ur' : 'en')}
              className="h-8 px-2 flex items-center space-x-1 rounded-xl bg-slate-50 dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] text-[#1C2C34] dark:text-[#F4F4FC] text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex-shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-[#1C2C34] dark:text-[#BCD4D4]" />
              <span>{language === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {/* Inspector */}
            <button
              id="nav-inspector-btn"
              onClick={onToggleInspector}
              className={`w-8 h-8 flex items-center justify-center rounded-xl border text-xs transition flex-shrink-0 cursor-pointer ${
                inspectorOpen 
                  ? 'bg-[#ECF4F4] dark:bg-[#18242A] border-[#BCD4D4] dark:border-slate-700 text-[#FC7454] dark:text-[#FC7C54]' 
                  : 'bg-slate-50 dark:bg-[#18242A] border-slate-200 dark:border-slate-700 text-[#5A6E78] dark:text-slate-400'
              }`}
              title="Telemetry Inspector"
            >
              <TerminalSquare className="w-4 h-4" />
            </button>
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

          <button
            onClick={onOpenOnboarding}
            className="text-xs font-bold text-[#1C2C34] dark:text-slate-300 hover:text-[#FC7454] dark:hover:text-[#FC7C54] flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#FC7454]" />
            <span>Safety Guide</span>
          </button>
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
    </>
  );
};
