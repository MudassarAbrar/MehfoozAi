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
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLogo } from './common/AppLogo';
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
              className="flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#181B24] hover:bg-[#F5EEFD] dark:hover:bg-[#26193E] border border-slate-200 dark:border-slate-700 text-[#181A20] dark:text-slate-200 text-xs font-semibold transition group shadow-2xs flex-shrink-0 cursor-pointer"
              title="Stealth Weather Screen (Esc)"
            >
              <CloudSun className="w-4 h-4 text-[#B886FD] group-hover:scale-110 transition-transform" />
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
              className="hidden xl:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#F5EEFD] dark:bg-[#26193E] hover:bg-[#EDE9FE] dark:hover:bg-[#31214E] border border-[#E9D5FF] dark:border-[#581C87] text-[11px] font-bold text-[#181A20] dark:text-[#E9D5FF] transition shadow-2xs whitespace-nowrap flex-shrink-0 cursor-pointer"
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
                className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-[#181B24] hover:bg-[#F5EEFD] dark:hover:bg-[#26193E] text-[#181A20] dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition shadow-2xs flex-shrink-0 whitespace-nowrap cursor-pointer"
                title="Legal Suite"
              >
                <Scale className="w-3.5 h-3.5 text-[#181A20] dark:text-[#C084FC]" />
                <span className="hidden md:inline">Legal</span>
                <ChevronDown className="w-3 h-3 text-[#6B7280] dark:text-slate-400" />
              </button>

              <AnimatePresence>
                {isMoreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#181B24] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 z-50 space-y-0.5"
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
                              ? 'bg-[#F5EEFD] dark:bg-[#2D1F47] text-[#181A20] dark:text-[#F9FAFB] font-bold border border-[#E9D5FF] dark:border-[#581C87]'
                              : 'text-[#181A20] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#221834]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-3.5 h-3.5 text-[#181A20] dark:text-[#C084FC]" />
                            <span>{isUrdu ? sub.labelUrdu : sub.label}</span>
                          </div>
                          {sub.badge !== undefined && sub.badge > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#B886FD] text-white text-[9px] font-bold">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct Emergency SOS 15 */}
            <button
              id="nav-crisis-btn"
              onClick={onOpenCrisis}
              className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#F5EEFD] dark:bg-[#2D1F47] hover:bg-[#EDE9FE] dark:hover:bg-[#3B1D54] text-[#9333EA] dark:text-[#C084FC] text-xs font-bold transition shadow-xs flex-shrink-0 whitespace-nowrap border border-[#E9D5FF] dark:border-[#581C87] cursor-pointer"
              title="Police Helpline 15"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse text-[#9333EA] dark:text-[#C084FC]" />
              <span>15</span>
              <span className="hidden sm:inline font-bold">SOS</span>
            </button>

            {/* Theme toggle */}
            <button
              id="nav-theme-toggle-btn"
              onClick={() => onThemeChange(themeMode === 'light' ? 'dark' : 'light')}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#181B24] hover:bg-[#F5EEFD] dark:hover:bg-[#26193E] text-[#181A20] dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 transition flex-shrink-0 cursor-pointer"
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
              className="h-8 px-2 flex items-center space-x-1 rounded-xl bg-slate-50 dark:bg-[#181B24] hover:bg-[#F5EEFD] dark:hover:bg-[#26193E] text-[#181A20] dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex-shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-[#181A20] dark:text-[#C084FC]" />
              <span>{language === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {/* Inspector */}
            <button
              id="nav-inspector-btn"
              onClick={onToggleInspector}
              className={`w-8 h-8 flex items-center justify-center rounded-xl border text-xs transition flex-shrink-0 cursor-pointer ${
                inspectorOpen 
                  ? 'bg-[#F5EEFD] dark:bg-[#2D1F47] border-[#E9D5FF] dark:border-[#581C87] text-[#9333EA] dark:text-[#C084FC]' 
                  : 'bg-slate-50 dark:bg-[#181B24] border-slate-200 dark:border-slate-700 text-[#6B7280] dark:text-slate-400'
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
                      ? 'bg-[#181A20] dark:bg-[#C084FC] text-white dark:text-[#0F1117] shadow-xs'
                      : 'text-[#6B7280] dark:text-slate-400 hover:text-[#181A20] dark:hover:text-[#F9FAFB] hover:bg-[#F5EEFD] dark:hover:bg-[#1E2230]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{isUrdu ? item.labelUrdu : item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#B886FD] dark:bg-[#0F1117] text-white dark:text-[#C084FC]' : 'bg-[#181A20] dark:bg-slate-700 text-white'
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
            className="text-xs font-bold text-[#181A20] dark:text-slate-300 hover:text-[#9333EA] dark:hover:text-[#C084FC] flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#B886FD]" />
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
                    ? 'text-[#181A20] dark:text-[#C084FC] font-black'
                    : 'text-[#6B7280] dark:text-slate-400 hover:text-[#181A20] dark:hover:text-[#F9FAFB] font-semibold'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-105 text-[#181A20] dark:text-[#C084FC]' : 'stroke-[2px]'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#B886FD] text-white text-[10px] font-black flex items-center justify-center">
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
                    className="w-1.5 h-1.5 rounded-full bg-[#B886FD] dark:bg-[#C084FC] mt-0.5"
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
