/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Sun, 
  AlertTriangle, 
  Navigation, 
  Clock, 
  Bookmark, 
  ChevronRight, 
  Users, 
  Star, 
  Sparkles,
  Lock,
  Scale,
  ArrowRight,
  Radio,
  Phone,
  PhoneCall,
  Siren,
  ShieldAlert,
  Play,
  Compass,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { ActiveTab, AppLanguage, UserProfile } from '../types';
import { SeatedPhoneWomanArt } from './common/WorkspaceLilacArt';

interface HomeDashboardProps {
  user: UserProfile | null;
  language: AppLanguage;
  onNavigateToTab?: (tab: ActiveTab) => void;
  onOpenCheckIn?: () => void;
  onStartCheckIn?: () => void;
  onStartNavigation: () => void;
  onOpenCrisis: () => void;
  onOpenCommunity?: () => void;
  onOpenAlerts?: () => void;
  onOpenLegalChat?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  language,
  onNavigateToTab,
  onOpenCheckIn,
  onStartCheckIn,
  onStartNavigation,
  onOpenCrisis,
  onOpenCommunity,
  onOpenAlerts,
  onOpenLegalChat
}) => {
  const isUrdu = language === 'ur';
  const userName = user?.safeNickname || user?.fullName?.split(' ')[0] || (isUrdu ? 'عائشہ' : 'Ayesha');

  const triggerCheckIn = onOpenCheckIn || onStartCheckIn || (() => {});

  const handleNav = (tab: ActiveTab) => {
    if (onNavigateToTab) onNavigateToTab(tab);
    else if (tab === 'community' && onOpenCommunity) onOpenCommunity();
    else if (tab === 'alerts' && onOpenAlerts) onOpenAlerts();
    else if (tab === 'assistant' && onOpenLegalChat) onOpenLegalChat();
  };

  const emergencyHelplines = [
    {
      id: 'police',
      name: isUrdu ? 'پولیس' : 'Police 15',
      number: '15',
      desc: isUrdu ? 'سیف سٹی ایمرجنسی' : 'Safe City Police',
      color: 'bg-[#F5EEFD] dark:bg-[#2D1F47] hover:bg-[#EDE9FE] dark:hover:bg-[#3B1D54] text-[#181A20] dark:text-white border border-[#E9D5FF] dark:border-[#581C87]',
      icon: ShieldAlert
    },
    {
      id: 'women',
      name: isUrdu ? 'خواتین ہیلپ لائن' : 'Women Aid 1043',
      number: '1043',
      desc: isUrdu ? 'پنجاب ویمن کمیشن' : 'PCSW Helpline',
      color: 'bg-white dark:bg-[#1E2230] hover:bg-slate-50 dark:hover:bg-[#282E40] text-[#181A20] dark:text-white border border-slate-200 dark:border-slate-700',
      icon: PhoneCall
    },
    {
      id: 'rescue',
      name: isUrdu ? 'ریسکیو 1122' : 'Rescue 1122',
      number: '1122',
      desc: isUrdu ? 'ایمرجنسی و میڈیکل' : 'Medical & Transit',
      color: 'bg-[#EDE9FE] dark:bg-[#31214E] hover:bg-[#DDD6FE] dark:hover:bg-[#3E2963] text-[#181A20] dark:text-white border border-[#C4B5FD] dark:border-[#581C87]',
      icon: Siren
    }
  ];

  const handleCall = (e: React.MouseEvent, num: string) => {
    e.stopPropagation();
    window.location.href = `tel:${num}`;
  };

  return (
    <div className="max-w-xl mx-auto px-3.5 sm:px-6 py-4 space-y-4 text-[#181A20] dark:text-[#F9FAFB]">
      
      {/* 1. GREETING & HERO (Lilac / Lavender Modern Archetype) */}
      <div className="rounded-[32px] bg-white dark:bg-[#181B24] p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3 flex-1">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-[#9333EA] dark:text-[#C084FC] uppercase block">
                {isUrdu ? 'حفاظتی ڈیش بورڈ' : 'WOMEN SAFETY SUITE'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181A20] dark:text-white">
                {isUrdu ? `ہیلو، ${userName}!` : `Hello, ${userName}!`}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 font-normal leading-relaxed mt-0.5">
                {isUrdu ? 'محفوظ راستے، قانونی رہنمائی اور فوری مدد' : 'Find the best safe route, legal assistance & emergency protection.'}
              </p>
            </div>

            {/* Action Pills */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={triggerCheckIn}
                className="py-2.5 px-4 rounded-xl bg-[#181A20] dark:bg-[#C084FC] hover:bg-[#2A2E39] dark:hover:bg-[#D8B4FE] text-white dark:text-[#0F1117] font-bold text-xs tracking-wide transition shadow-xs active:scale-95 cursor-pointer flex items-center space-x-1.5"
              >
                <span>{isUrdu ? 'چیک ان ٹائمر' : 'Start Check-In'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenCrisis}
                className="py-2.5 px-3.5 rounded-xl bg-[#F5EEFD] dark:bg-[#2D1F47] hover:bg-[#EDE9FE] dark:hover:bg-[#3B1D54] text-[#9333EA] dark:text-[#C084FC] font-bold text-xs tracking-wide transition shadow-xs active:scale-95 cursor-pointer flex items-center space-x-1 border border-[#E9D5FF] dark:border-[#581C87]"
              >
                <Radio className="w-3.5 h-3.5 text-[#9333EA] dark:text-[#C084FC]" />
                <span>SOS 15</span>
              </button>
            </div>
          </div>

          {/* Top Right Mini Art Silhouette */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F5EEFD] dark:bg-[#26193E] p-1 flex items-center justify-center flex-shrink-0">
            <SeatedPhoneWomanArt className="w-full h-full object-contain" />
          </div>
        </div>

        {/* 2. FOUR RELEVANT FEATURE BOXES (Matching Screen 2 in Reference) */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-bold text-[#181A20] dark:text-slate-300">Categories & Core Tools</h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: SAFE CORRIDOR (Outlined card with lilac dot) */}
            <div
              onClick={onStartNavigation}
              className="rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-[#B886FD] dark:hover:border-[#C084FC] transition bg-white dark:bg-[#181B24] min-h-[110px] group shadow-2xs"
            >
              <div className="relative">
                <Compass className="w-6 h-6 text-[#181A20] dark:text-slate-100 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#B886FD] dark:bg-[#C084FC]" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-[#181A20] dark:text-white block">
                  {isUrdu ? 'محفوظ راستہ' : 'Safe Corridor'}
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                  {isUrdu ? 'سیف سٹی روٹس' : 'PSCA Monitored'}
                </span>
              </div>
            </div>

            {/* Card 2: LEGAL ADVISOR (Outlined card with lilac dot) */}
            <div
              onClick={() => handleNav('assistant')}
              className="rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-[#B886FD] dark:hover:border-[#C084FC] transition bg-white dark:bg-[#181B24] min-h-[110px] group shadow-2xs"
            >
              <div className="relative">
                <ShieldCheck className="w-6 h-6 text-[#181A20] dark:text-slate-100 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#B886FD] dark:bg-[#C084FC]" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-[#181A20] dark:text-white block">
                  {isUrdu ? 'قانونی AI' : 'Legal AI'}
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                  {isUrdu ? 'پنجاب ایکٹس' : 'Statutory Advisor'}
                </span>
              </div>
            </div>

            {/* Card 3: INCIDENT VAULT (Outlined card with lilac dot) */}
            <div
              onClick={() => handleNav('vault')}
              className="rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-[#B886FD] dark:hover:border-[#C084FC] transition bg-white dark:bg-[#181B24] min-h-[110px] group shadow-2xs"
            >
              <div className="relative">
                <Lock className="w-6 h-6 text-[#181A20] dark:text-slate-100 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#B886FD] dark:bg-[#C084FC]" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-[#181A20] dark:text-white block">
                  {isUrdu ? 'شواہد والٹ' : 'Incident Vault'}
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                  {isUrdu ? 'انکرپٹڈ شواہد' : 'AES-256 Storage'}
                </span>
              </div>
            </div>

            {/* Card 4: ALL / SOS & COMPLAINT BUILDER (Solid Soft Lilac Card) */}
            <div
              onClick={() => handleNav('builder')}
              className="rounded-2xl bg-[#F5EEFD] dark:bg-[#2D1F47] border border-[#EDE9FE] dark:border-[#3B1D54] p-4 flex flex-col items-center justify-center space-y-1.5 cursor-pointer hover:bg-[#EDE9FE] dark:hover:bg-[#3B1D54] transition min-h-[110px] group shadow-2xs"
            >
              <span className="text-sm font-bold text-[#181A20] dark:text-white">
                {isUrdu ? 'تمام سہولیات' : 'All Tools'}
              </span>
              <span className="text-[10px] text-[#9333EA] dark:text-[#C084FC] font-semibold">
                {isUrdu ? 'ایف آئی آر و رپورٹنگ' : 'FIR & Complaint'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EMERGENCY QUICK DIAL */}
      <div className="rounded-[32px] bg-white dark:bg-[#181B24] p-4.5 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5">
            <Phone className="w-3.5 h-3.5 text-[#181A20] dark:text-[#C084FC]" />
            <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-[#181A20] dark:text-white">
              {isUrdu ? 'فوری ایمرجنسی کالز' : 'Emergency Quick Dial'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#6B7280] dark:text-slate-400">
            {isUrdu ? '24/7 براہ راست' : '24/7 Direct'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {emergencyHelplines.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={`tel:${item.number}`}
                onClick={(e) => handleCall(e, item.number)}
                className={`flex flex-col justify-between p-3 rounded-2xl ${item.color} shadow-2xs hover:shadow-xs transition-all active:scale-[0.97] group cursor-pointer text-left overflow-hidden min-w-0`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-white/70 dark:bg-black/40 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#181A20] dark:text-slate-200" />
                  </div>
                  <span className="text-sm sm:text-base font-bold tracking-tight text-[#181A20] dark:text-white">
                    {item.number}
                  </span>
                </div>
                <div className="mt-2 min-w-0">
                  <h4 className="text-xs font-bold leading-tight text-[#181A20] dark:text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-[#6B7280] dark:text-slate-400 truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* 4. FREQUENT SAFE ROUTES (Matching Reference Screen 2 Recent Booking) */}
      <div className="rounded-[32px] bg-white dark:bg-[#181B24] p-4.5 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3.5 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-[#181A20] dark:text-white">
            {isUrdu ? 'حالیہ محفوظ راستے' : 'Recent Safe Corridors'}
          </h3>
          <button 
            onClick={() => handleNav('navigate')}
            className="text-xs font-semibold text-[#9333EA] dark:text-[#C084FC] hover:underline cursor-pointer"
          >
            {isUrdu ? 'تمام دیکھیں' : 'See All'}
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Route 1: Green Garden Corridor */}
          <div 
            onClick={onStartNavigation}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-[#B886FD] dark:hover:border-[#C084FC] bg-white dark:bg-[#181B24] flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold text-[#181A20] dark:text-white">
                  Green Garden Safe Route
                </span>
                <span className="flex items-center space-x-0.5 text-xs font-bold text-[#181A20] dark:text-slate-200">
                  <Star className="w-3.5 h-3.5 fill-[#B886FD] text-[#B886FD] dark:fill-[#C084FC] dark:text-[#C084FC]" />
                  <span>4.6</span>
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>123 Meridian Street, Gulberg Main • 100% Lit</span>
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#181A20] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Route 2 */}
          <div 
            onClick={onStartNavigation}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-[#B886FD] dark:hover:border-[#C084FC] bg-white dark:bg-[#181B24] flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold text-[#181A20] dark:text-white">
                  Mall Road → MM Alam Safe Corridor
                </span>
                <span className="flex items-center space-x-0.5 text-xs font-bold text-[#181A20] dark:text-slate-200">
                  <Star className="w-3.5 h-3.5 fill-[#B886FD] text-[#B886FD] dark:fill-[#C084FC] dark:text-[#C084FC]" />
                  <span>4.9</span>
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Main Commercial Corridor • PSCA Camera Surveillance</span>
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#181A20] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

    </div>
  );
};
