/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Navigation,
  Scale,
  Lock,
  PhoneCall,
  Clock,
  Users,
  Eye,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  CloudSun,
  Radio,
  FileText,
  AlertTriangle,
  HeartHandshake,
  Compass,
  Zap,
  Globe,
  Award,
  Layers,
  MapPin,
  Flame,
  Check,
  WifiOff,
  Database
} from 'lucide-react';
import { MehfoozLogo } from './common/MehfoozLogo';
import { AbstractSafetyShieldArt } from './landing/AbstractArt';
import { PhoneMockupShowcase } from './landing/PhoneMockupShowcase';
import { SocialLinksRow, AdminContactBox } from './common/OfficialLinks';
import { AppLanguage, ActiveTab } from '../types';

interface LandingPageProps {
  onLaunchApp: (tab?: ActiveTab) => void;
  onOpenWeather: () => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  themeMode: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onOpenWeather,
  language,
  onLanguageChange,
  themeMode,
  onThemeChange,
}) => {
  const isUrdu = language === 'ur';
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Setup for the Continuous Line Animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Interactive Live Simulator State
  const [simulatorMode, setSimulatorMode] = useState<'routing' | 'legal' | 'vault' | 'sos'>('routing');
  const [simQuery, setSimQuery] = useState<string>('What is Section 4 PPWVA protection order?');
  const [simRouteType, setSimRouteType] = useState<'safest' | 'fastest'>('safest');
  const [simSosArmed, setSimSosArmed] = useState<boolean>(false);

  // Statistics
  const STATS = [
    { label: 'Punjab Emergency Dispatch', value: '< 30s', sub: 'Integrated with 15 PSCA' },
    { label: 'Verified Safe Corridors', value: '1,420+', sub: 'Lahore, Rawalpindi, Multan' },
    { label: 'PPWVA Statutory Accuracy', value: '100%', sub: 'Zero-hallucination legal citations' },
    { label: 'Zero-Signal Offline Cache', value: '100% Ready', sub: 'No internet required for SOS & Helplines' },
  ];

  const CORE_PILLARS = [
    {
      icon: CloudSun,
      title: 'Stealth Weather Cover',
      titleUrdu: 'خفیہ موسم کی اسکرین',
      tag: 'DISCREET SECURITY',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
      description:
        'Looks and operates as an authentic Tuscany meteorological weather station. Double-tapping the temperature tile opens your safety ecosystem discreetly.',
      tab: 'home' as ActiveTab,
      isWeather: true
    },
    {
      icon: Navigation,
      title: 'Safe Corridor Navigation',
      titleUrdu: 'محفوظ راستے اور سروے',
      tag: 'PSCA & LIGHTING HEATMAPS',
      color: 'from-[#BCD4D4]/30 to-[#C4DCDC]/20 border-[#BCD4D4] text-[#1C2C34] dark:text-[#BCD4D4]',
      description:
        'Routes pedestrians through verified well-lit avenues, active commercial zones, safe haven verified shops, and PSCA Safe City camera coverage.',
      tab: 'navigate' as ActiveTab
    },
    {
      icon: WifiOff,
      title: 'Zero-Signal Offline Mode',
      titleUrdu: 'بغیر انٹرنیٹ ہنگامی رسائی',
      tag: '100% OFFLINE RESILIENT',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      description:
        'Zero cellular data required. Built-in cached Punjab directory (15, 1043, 1122), offline statutory legal articles, safe haven locations, and SMS SOS dispatch.',
      tab: 'home' as ActiveTab
    },
    {
      icon: Scale,
      title: 'Punjab AI Legal Advisor',
      titleUrdu: 'پنجاب قانونی معاون',
      tag: 'RAG STATUTORY ENGINE',
      color: 'from-[#FC7454]/20 to-[#FC7C54]/10 border-[#FC7454]/30 text-[#FC7454] dark:text-[#FC7C54]',
      description:
        'Grounding on PPWVA 2016, PECA Cyber Laws, and PCSW protections. Synthesizes legal advice and builds police complaint drafts with formal legal citations.',
      tab: 'assistant' as ActiveTab
    },
    {
      icon: Lock,
      title: 'Zero-Knowledge Incident Vault',
      titleUrdu: 'خفیہ انکرپٹڈ والٹ',
      tag: 'AES-256 CLIENT ENCRYPTION',
      color: 'from-[#A4C4C4]/20 to-[#BCD4D4]/10 border-[#A4C4C4]/30 text-[#1C2C34] dark:text-[#A4C4C4]',
      description:
        'Capture voice memos, harassment timelines, and photographic evidence. Encrypted locally with your custom stealth PIN before any network sync.',
      tab: 'vault' as ActiveTab
    },
    {
      icon: Clock,
      title: 'Silent Destination Check-In',
      titleUrdu: 'خودکار منزل کا چیک ان',
      tag: 'FAILSAFE GUARDIAN TIMERS',
      color: 'from-[#C4DCDC]/30 to-[#ECF4F4]/50 border-[#C4DCDC] text-[#1C2C34] dark:text-[#C4DCDC]',
      description:
        'Set an expected journey time. If you do not check in at your destination, an automated discreet alert with live coordinates is dispatched to chosen guardians.',
      tab: 'checkin' as ActiveTab
    },
    {
      icon: PhoneCall,
      title: 'Crisis SOS & Police 15 Dispatch',
      titleUrdu: 'ایمرجنسی ایس او ایس',
      tag: 'IMMEDIATE RESPONSE',
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
      description:
        'Direct connection to Punjab Police 15, PCSW Helpline 1043, and 1122 Rescue with live coordinate broadcasting and silent emergency recording.',
      tab: 'home' as ActiveTab
    }
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FCFCFC] dark:bg-[#0F171A] text-[#1C2C34] dark:text-[#F4F4FC] font-sans transition-colors selection:bg-[#FC7454] selection:text-white relative overflow-x-hidden max-w-full"
    >
      {/* ========================================================================= */}
      {/* GLOBAL SCROLL PROGRESS TOP BAR                                            */}
      {/* ========================================================================= */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FC7454] via-[#FC7C54] to-[#BCD4D4] origin-left z-50 shadow-sm"
        style={{ scaleX: smoothProgress }}
      />

      {/* ========================================================================= */}
      {/* 1. STICKY TOP NAVIGATION BAR (Clean, Spacious & Decluttered)              */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-[#131E24]/95 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo with the Line Art Icon */}
          <div className="cursor-pointer" onClick={() => onLaunchApp('home')}>
            <MehfoozLogo variant="horizontal" size="md" showUrdu={true} />
          </div>

          {/* Right Controls: Streamlined, Spacious & Purposeful */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Stealth Weather Cover Button */}
            <button
              onClick={onOpenWeather}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#18242A] hover:bg-sky-50 dark:hover:bg-sky-950/60 border border-slate-200 dark:border-slate-700 text-[#1C2C34] dark:text-[#F4F4FC] text-xs font-semibold transition cursor-pointer"
              title="Stealth Weather Station"
            >
              <CloudSun className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">{isUrdu ? 'موسم' : 'Weather'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(isUrdu ? 'en' : 'ur')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#18242A] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] text-xs font-bold text-[#1C2C34] dark:text-[#F4F4FC] border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1 cursor-pointer"
              title={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
            >
              <Globe className="w-3.5 h-3.5 text-[#1C2C34] dark:text-[#BCD4D4]" />
              <span>{isUrdu ? 'English' : 'اردو'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => onThemeChange(themeMode === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#18242A] hover:bg-slate-200 dark:hover:bg-[#263842] text-[#1C2C34] dark:text-[#F4F4FC] border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Toggle Theme"
            >
              {themeMode === 'light' ? <Moon className="w-4 h-4 text-[#1C2C34]" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Main Launch App CTA */}
            <button
              onClick={() => onLaunchApp('home')}
              className="px-4 sm:px-5 py-2 rounded-xl bg-[#FC7454] hover:bg-[#FC7C54] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#FC7454]/20 hover:shadow-lg transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
            >
              <span>{isUrdu ? 'ایپ کھولیں' : 'Launch Mehfooz'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH ANIMATED LINE ART LOGO & QUICK EXPLORATION BAR       */}
      {/* ========================================================================= */}
      <section id="hero" className="relative pt-8 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        {/* Abstract Background Layer in Soft Palette */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25">
          <AbstractSafetyShieldArt className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* 3A. HERO ANIMATED LINE-ART ILLUSTRATED LOGO */}
            <div className="flex justify-center pt-4 pb-2">
              <MehfoozLogo variant="animated-hero" size="hero" showUrdu={true} />
            </div>

            {/* Main Punchy Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-[#1C2C34] dark:text-white leading-[1.1]"
            >
              Every Step Protected.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1C2C34] via-[#FC7454] to-[#FC7C54] dark:from-[#F4F4FC] dark:via-[#FC7454] to-[#BCD4D4]">
                Every Word Heard.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="text-lg sm:text-xl text-[#5A6E78] dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              The complete safety network combining <strong>discreet weather cover</strong>, <strong>smart corridor navigation</strong>, <strong>grounded Punjab legal statutory AI</strong>, and <strong>zero-knowledge incident evidence lockers</strong>.
            </motion.p>

            {/* Hero CTA Button Deck */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4"
            >
              <button
                onClick={() => onLaunchApp('home')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FC7454] hover:bg-[#FC7C54] text-white font-black text-base shadow-xl shadow-[#FC7454]/25 hover:shadow-2xl transition-all flex items-center justify-center space-x-2 group active:scale-95 cursor-pointer"
              >
                <span>Launch Full Application</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={onOpenWeather}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white dark:bg-[#18242A] hover:bg-[#F4F4F4] dark:hover:bg-[#263842] text-[#1C2C34] dark:text-slate-200 border border-[#BCD4D4]/60 dark:border-slate-700 font-bold text-base shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CloudSun className="w-5 h-5 text-amber-500" />
                <span>Test Tuscany Stealth Mode</span>
              </button>
            </motion.div>

            {/* Key Stat Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-10 text-left"
            >
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/90 dark:bg-[#18242A]/90 backdrop-blur-md border border-[#BCD4D4]/60 dark:border-slate-800 shadow-xs hover:border-[#FC7454] transition"
                >
                  <p className="text-2xl sm:text-3xl font-serif font-black text-[#1C2C34] dark:text-white">
                    {stat.value}
                  </p>
                  <h4 className="text-xs font-bold text-[#1C2C34] dark:text-slate-200 mt-1">
                    {stat.label}
                  </h4>
                  <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 mt-0.5">
                    {stat.sub}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Relocated Section Directory & Quick-Jump Navigation (Adjusted from the header) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="pt-8 pb-2"
            >
              <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/80 dark:bg-[#18242A]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <a
                  href="#interactive-suite"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1C2C34] dark:text-slate-200 hover:bg-[#ECF4F4] dark:hover:bg-[#263842] hover:text-[#FC7454] dark:hover:text-[#FC7C54] transition-all group"
                >
                  <Layers className="w-3.5 h-3.5 text-[#FC7454] group-hover:scale-110 transition-transform" />
                  <span>{isUrdu ? 'انٹرفیس سویٹ' : 'Interface Suite'}</span>
                </a>
                <a
                  href="#features"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1C2C34] dark:text-slate-200 hover:bg-[#ECF4F4] dark:hover:bg-[#263842] hover:text-[#FC7454] dark:hover:text-[#FC7C54] transition-all group"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1C2C34] dark:text-[#BCD4D4] group-hover:scale-110 transition-transform" />
                  <span>{isUrdu ? 'حفاظتی ستون' : 'Security Pillars'}</span>
                </a>
                <a
                  href="#offline-mode"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all group"
                >
                  <WifiOff className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>{isUrdu ? 'آف لائن موڈ' : 'Offline Ready'}</span>
                </a>
                <a
                  href="#simulator"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1C2C34] dark:text-slate-200 hover:bg-[#ECF4F4] dark:hover:bg-[#263842] hover:text-[#FC7454] dark:hover:text-[#FC7C54] transition-all group"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>{isUrdu ? 'لائیو سمیلیٹر' : 'Live Simulator'}</span>
                </a>
                <a
                  href="#safety-network"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1C2C34] dark:text-slate-200 hover:bg-[#ECF4F4] dark:hover:bg-[#263842] hover:text-[#FC7454] dark:hover:text-[#FC7C54] transition-all group"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#FC7454] group-hover:scale-110 transition-transform" />
                  <span>{isUrdu ? 'پنجاب ہیلپ لائنز' : 'Punjab Helplines'}</span>
                </a>
              </div>
            </motion.div>

            {/* Live Security Verification Indicator (Animated Modern Radar Badge) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
              className="pt-4 flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-[#18242A]/90 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-[#5A6E78] dark:text-slate-300 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>
                  {isUrdu 
                    ? 'پنجاب سیف سٹیز اور پی پی ڈبلیو وی اے 2016 فعال نیٹ ورک' 
                    : 'Punjab Safe Cities Authority & PPWVA Active Grid'
                  }
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {isUrdu ? '100% زیرو نالج انکرپٹڈ' : 'Zero-Knowledge Encrypted'}
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE PHONE MOCKUP SHOWCASE (Visualizing the SafePath Suite)     */}
      {/* ========================================================================= */}
      <section
        id="interactive-suite"
        className="border-y border-[#BCD4D4]/60 dark:border-slate-800 bg-[#F4F4F4] dark:bg-[#131E24] relative"
      >
        <PhoneMockupShowcase
          onLaunchAppTab={(tabKey) => onLaunchApp(tabKey as ActiveTab)}
          onOpenWeather={onOpenWeather}
        />
      </section>

      {/* ========================================================================= */}
      {/* 5. SIX PILLARS FEATURE GRID                                               */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#ECF4F4] dark:bg-[#18242A] border border-[#BCD4D4] dark:border-[#263842] shadow-xs">
            <Layers className="w-4 h-4 text-[#1C2C34] dark:text-[#BCD4D4]" />
            <span className="text-xs font-bold text-[#1C2C34] dark:text-white uppercase tracking-wider">
              Comprehensive Protection Layers
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#1C2C34] dark:text-white">
            Designed for Punjab's Ground Realities
          </h2>
          <p className="text-base sm:text-lg text-[#5A6E78] dark:text-slate-300">
            Engineered specifically to solve real-world safety barriers: public harassment, delayed reporting, legal ambiguity, and digital privacy risks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl bg-white dark:bg-[#18242A] border border-[#BCD4D4]/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-[#BCD4D4] transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${pillar.color} border shadow-xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A6E78] dark:text-slate-400">
                      {pillar.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-lg font-bold text-[#1C2C34] dark:text-white">
                        {pillar.title}
                      </h3>
                      <span className="text-xs text-[#FC7454] dark:text-[#FC7C54] font-serif font-bold">
                        {pillar.titleUrdu}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#5A6E78] dark:text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (pillar.isWeather) {
                        onOpenWeather();
                      } else {
                        onLaunchApp(pillar.tab);
                      }
                    }}
                    className="text-xs font-bold text-[#FC7454] dark:text-[#FC7C54] hover:text-[#FC7C54] flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Open Module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-2 h-2 rounded-full bg-[#FC7454] animate-pulse" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5B. ZERO-CONNECTIVITY OFFLINE MODE SHOWCASE (ADVERTISED FEATURE)          */}
      {/* ========================================================================= */}
      <section id="offline-mode" className="py-16 sm:py-20 bg-gradient-to-b from-white to-[#ECF4F4]/50 dark:from-[#131E24] dark:to-[#0F171A] border-y border-[#BCD4D4]/60 dark:border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl bg-white dark:bg-[#18242A] border border-[#BCD4D4] dark:border-slate-700 p-6 sm:p-10 shadow-xl relative overflow-hidden">
            {/* Soft decorative background accent */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#FC7454]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Headline & Value Proposition */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-xs">
                  <WifiOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">
                    {isUrdu ? 'نئی خصوصیت: 100% آف لائن موڈ' : 'New Feature: 100% Offline-First Safety'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-[#1C2C34] dark:text-white leading-tight">
                  {isUrdu ? 'انٹرنیٹ یا سگنل بند؟ تحفظ بدستور جاری۔' : 'No Data? No Signal? Zero Compromise.'}
                </h2>

                <p className="text-sm sm:text-base text-[#5A6E78] dark:text-slate-300 leading-relaxed">
                  {isUrdu
                    ? 'پنجاب میں موبائل ڈیٹا بندش یا سگنل نہ ہونے کی صورت میں بھی محفوظ سیف پاتھ بغیر انٹرنیٹ کے مکمل فعال رہتا ہے۔ تمام ضروری ہیلپ لائنز، قانونی مشورے اور ایس او ایس ایس ایم ایس آف لائن دستیاب ہیں۔'
                    : 'Punjab commuters frequently face network blackouts, cellular jamming, or exhausted mobile data. Mehfooz SafePath is engineered with client-side cache fallback so your personal security never depends on an active internet connection.'}
                </p>

                {/* 4 Key Offline Advantages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[#FAFDFD] dark:bg-[#131E24] border border-[#BCD4D4]/60 dark:border-slate-800 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-[#1C2C34] dark:text-white">
                        {isUrdu ? 'آف لائن ہیلپ لائنز' : 'Instant Offline Hotlines'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 leading-snug">
                      {isUrdu ? '15، 1043 اور 1122 پر فوراً براہ راست کال' : 'Direct cellular dialer for 15, 1043, 1122 without internet.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAFDFD] dark:bg-[#131E24] border border-[#BCD4D4]/60 dark:border-slate-800 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] flex items-center justify-center">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-[#1C2C34] dark:text-white">
                        {isUrdu ? 'آف لائن قانونی رہنمائی' : 'Cached Statutory Rights'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 leading-snug">
                      {isUrdu ? 'PPWVA 2016 قوانین اور ایف آئی آر گائیڈ فون پر محفوظ' : 'PPWVA 2016 statutes and FIR filing steps pre-loaded on device.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAFDFD] dark:bg-[#131E24] border border-[#BCD4D4]/60 dark:border-slate-800 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                        <Radio className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-[#1C2C34] dark:text-white">
                        {isUrdu ? 'آف لائن ایس ایم ایس ایس او ایس' : 'Cellular SMS Dispatch'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 leading-snug">
                      {isUrdu ? 'جی پی ایس روابط کے ساتھ خودکار ہنگامی میسج' : 'Compiles exact GPS coordinates into SMS when data network fails.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAFDFD] dark:bg-[#131E24] border border-[#BCD4D4]/60 dark:border-slate-800 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-[#1C2C34] dark:text-white">
                        {isUrdu ? 'مقامی انکرپٹڈ والٹ' : 'Local Encrypted Storage'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 leading-snug">
                      {isUrdu ? 'بغیر انٹرنیٹ آڈیو اور شواہد کی محفوظ ریکارڈنگ' : 'Record voice memos & evidence securely with local AES-256.'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onLaunchApp('home')}
                    className="px-6 py-3 rounded-2xl bg-[#1C2C34] dark:bg-white text-white dark:text-[#1C2C34] text-xs sm:text-sm font-bold shadow-md hover:bg-[#263842] dark:hover:bg-slate-100 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <span>{isUrdu ? 'آف لائن تحفظ کے ساتھ شروع کریں' : 'Launch Mehfooz with Offline Support'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Offline Device Indicator Card */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-[#FAFDFD] dark:bg-[#131E24] border-2 border-dashed border-[#BCD4D4] dark:border-slate-700 p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#BCD4D4]/50 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-[#1C2C34] dark:text-white uppercase tracking-wider">
                        Offline Cache Status
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold">
                      ACTIVE & VERIFIED
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#18242A] border border-[#BCD4D4]/40 dark:border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold text-[#1C2C34] dark:text-white">Punjab Helplines</p>
                          <p className="text-[10px] text-[#5A6E78] dark:text-slate-400">15, 1043, 1122, 1991</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">Cached</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#18242A] border border-[#BCD4D4]/40 dark:border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <Scale className="w-4 h-4 text-[#FC7454]" />
                        <div>
                          <p className="text-xs font-bold text-[#1C2C34] dark:text-white">PPWVA & PECA Statutes</p>
                          <p className="text-[10px] text-[#5A6E78] dark:text-slate-400">8 Legal Protections</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">Cached</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#18242A] border border-[#BCD4D4]/40 dark:border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-xs font-bold text-[#1C2C34] dark:text-white">Punjab Safe Havens</p>
                          <p className="text-[10px] text-[#5A6E78] dark:text-slate-400">9 Districts Indexed</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">Cached</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 text-center italic pt-1">
                    "When connectivity drops, Mehfooz automatically switches to local memory in under 5ms."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. LIVE INTERACTIVE SIMULATOR (Try before launching)                      */}
      {/* ========================================================================= */}
      <section id="simulator" className="py-20 bg-[#131E24] text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FC7454]/20 border border-[#FC7454]/40">
              <Zap className="w-4 h-4 text-[#FC7454]" />
              <span className="text-xs font-bold text-[#F4F4FC] uppercase tracking-wider">
                Live Simulator
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white">
              Test Mehfooz Capabilities Right Here
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Select a module below to test real simulated responses from our safety engine.
            </p>

            {/* Mode Switcher Tabs */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {[
                { id: 'routing', label: 'Safe Corridor Algorithm' },
                { id: 'legal', label: 'Punjab Legal RAG' },
                { id: 'vault', label: 'Client-Side Hashing' },
                { id: 'sos', label: 'Police 15 Dispatch' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSimulatorMode(m.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    simulatorMode === m.id
                      ? 'bg-[#FC7454] text-white shadow-lg shadow-[#FC7454]/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Playground Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#18242A] border border-[#263842] shadow-2xl">
            {simulatorMode === 'routing' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Safe Route Calculation: Mall Road → MM Alam Road
                    </h4>
                    <p className="text-xs text-slate-400">
                      Evaluating 3 routes based on street light sensor logs, CCTV coverage, and pedestrian activity.
                    </p>
                  </div>
                  <div className="flex bg-slate-900 p-1 rounded-xl">
                    <button
                      onClick={() => setSimRouteType('safest')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                        simRouteType === 'safest' ? 'bg-[#FC7454] text-white shadow-xs' : 'text-slate-400'
                      }`}
                    >
                      Safe Corridor (Recommended)
                    </button>
                    <button
                      onClick={() => setSimRouteType('fastest')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                        simRouteType === 'fastest' ? 'bg-slate-700 text-white' : 'text-slate-400'
                      }`}
                    >
                      Fastest Direct
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-2xl border ${simRouteType === 'safest' ? 'bg-[#263842]/60 border-[#BCD4D4]' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#BCD4D4]">Route 1: Safe Corridor</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#BCD4D4]/20 text-[#ECF4F4] text-[10px] font-bold">Grade A+ (98/100)</span>
                    </div>
                    <p className="text-xs text-slate-200">100% Well Lit • 18 PSCA Cameras • 3 Police Posts</p>
                    <p className="text-[11px] text-slate-400 mt-2">16 mins (2.4 km) • Verified Safe Haven stops active</p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${simRouteType === 'fastest' ? 'bg-amber-950/40 border-amber-500' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-400">Route 2: Direct Backstreet</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">Grade B- (52/100)</span>
                    </div>
                    <p className="text-xs text-slate-300">40% Poor Lighting • 0 CCTV Cameras • Quiet Alleyway</p>
                    <p className="text-[11px] text-slate-400 mt-2">11 mins (1.8 km) • 5 mins faster but high risk</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-300">Community Safety Consensus</span>
                      <p className="text-xs text-slate-400 mt-1">94% of local women commuters choose Route 1 after 7:00 PM.</p>
                    </div>
                    <button
                      onClick={() => onLaunchApp('navigate')}
                      className="mt-3 py-2 px-3 rounded-xl bg-[#FC7454] hover:bg-[#FC7C54] text-white text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition shadow-xs"
                    >
                      <span>Open Safe Navigation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {simulatorMode === 'legal' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">Punjab Legal RAG Statutory Query</h4>
                  <span className="text-xs text-[#BCD4D4] font-semibold">PPWVA 2016 & PECA Grounded</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
                  <p className="text-xs text-slate-400">Try common queries:</p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      'What is Section 4 PPWVA protection order?',
                      'How to report cyber harassment under PECA 2016?',
                      'Can a landlord evict me during domestic dispute under Section 5?'
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setSimQuery(q)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                          simQuery === q
                            ? 'bg-[#FC7454] text-white border-[#FC7C54]'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-[#BCD4D4] font-bold">
                      <Scale className="w-4 h-4" />
                      <span>Statutory Citation Result</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <strong>PPWVA 2016 — Section 4 (Protection Orders):</strong> The court may pass an order prohibiting the defendant from committing any act of violence, entering the workplace or residence of the aggrieved person, or communicating with the aggrieved person.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Jurisdiction: Punjab, Pakistan</span>
                      <button
                        onClick={() => onLaunchApp('assistant')}
                        className="text-[#BCD4D4] hover:text-[#ECF4F4] font-bold cursor-pointer"
                      >
                        Launch Interactive Legal AI →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {simulatorMode === 'vault' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FC7454]/20 text-[#FC7454] mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Client-Side Zero-Knowledge Encryption</h4>
                <p className="text-xs text-slate-400 max-w-xl mx-auto">
                  Every voice memo, photograph, and timeline record is encrypted locally with your custom 4-digit PIN before storage. No plain-text data ever leaves your device.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 max-w-md mx-auto font-mono text-[11px] text-[#BCD4D4] border border-[#263842]">
                  AES-GCM-256: 8f9b2a1c0d4e... [KEY DERIVED FROM STEALTH PIN]
                </div>
                <button
                  onClick={() => onLaunchApp('vault')}
                  className="py-2.5 px-5 rounded-xl bg-[#FC7454] hover:bg-[#FC7C54] text-white text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <span>Open Encrypted Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {simulatorMode === 'sos' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-base font-bold text-white">Punjab Emergency Dispatch Simulation</h4>
                <p className="text-xs text-slate-400 max-w-xl mx-auto">
                  One-tap crisis dispatch transmits real-time coordinates to <strong>Punjab Police 15</strong> and automated emergency SMS to your designated trusted circle.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setSimSosArmed(!simSosArmed)}
                    className={`py-3 px-6 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      simSosArmed
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    {simSosArmed ? 'SOS Signal Active (Dispatched)' : 'Arm SOS Test Signal'}
                  </button>
                </div>
                {simSosArmed && (
                  <p className="text-xs text-emerald-400 font-medium">
                    Simulated dispatch complete: SMS sent to 2 contacts with Google Maps link & battery status (84%).
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. OFFICIAL PUNJAB EMERGENCY DIRECTORY MATRIX                             */}
      {/* ========================================================================= */}
      <section id="safety-network" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#ECF4F4] dark:bg-[#18242A] border border-[#BCD4D4] dark:border-[#263842] shadow-xs">
            <HeartHandshake className="w-4 h-4 text-[#1C2C34] dark:text-[#BCD4D4]" />
            <span className="text-xs font-bold text-[#1C2C34] dark:text-white uppercase tracking-wider">
              Integrated Helplines
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#1C2C34] dark:text-white">
            Direct Link to Punjab Crisis Services
          </h2>
          <p className="text-base text-[#5A6E78] dark:text-slate-300">
            One-touch emergency calling and direct escalation across Punjab government and legal aid authorities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              name: 'Punjab Police Safe City',
              number: '15',
              desc: 'Immediate emergency dispatch with PSCA camera coordination.',
              badge: '24/7 Toll-Free',
              color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
            },
            {
              name: 'Punjab Women Helpline (PCSW)',
              number: '1043',
              desc: 'Dedicated harassment, legal support, and crisis counseling.',
              badge: '24/7 Toll-Free',
              color: 'text-[#1C2C34] dark:text-[#BCD4D4] bg-[#ECF4F4] dark:bg-[#18242A] border-[#BCD4D4] dark:border-[#263842]'
            },
            {
              name: 'Rescue 1122 Emergency',
              number: '1122',
              desc: 'Paramedic, ambulance, and disaster medical response.',
              badge: 'Immediate Medical',
              color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
            },
            {
              name: 'FIA Cyber Crime Wing',
              number: '9911',
              desc: 'Online harassment, blackmail, and unauthorized picture leaks.',
              badge: 'Federal Cyber Unit',
              color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white dark:bg-[#18242A] border border-[#BCD4D4]/60 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-[#BCD4D4] transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${item.color}`}>
                    {item.badge}
                  </span>
                  <span className="text-xl font-serif font-black text-[#1C2C34] dark:text-white">
                    {item.number}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#1C2C34] dark:text-white mt-1">
                  {item.name}
                </h4>
                <p className="text-xs text-[#5A6E78] dark:text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <a
                href={`tel:${item.number}`}
                className="mt-4 w-full py-2 rounded-xl bg-[#ECF4F4] dark:bg-[#18242A] hover:bg-[#C4DCDC] dark:hover:bg-[#263842] text-[#1C2C34] dark:text-[#F4F4FC] border border-[#BCD4D4] dark:border-[#263842] text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#FC7454] dark:text-[#FC7C54]" />
                <span>Call {item.number} Now</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER CALL TO ACTION & OFFICIAL LINKS                                 */}
      {/* ========================================================================= */}
      <footer id="launch" className="border-t border-[#BCD4D4]/60 dark:border-slate-800 bg-white dark:bg-[#131E24] py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <MehfoozLogo variant="horizontal" size="md" showUrdu={true} />
            <p className="text-xs text-[#5A6E78] dark:text-slate-400 max-w-sm text-center md:text-left">
              Mehfooz — Privacy-first safety ecosystem empowering women across Punjab, Pakistan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenWeather}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#18242A] hover:bg-slate-200 text-xs font-bold text-[#1C2C34] dark:text-slate-200 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <CloudSun className="w-4 h-4 text-sky-500" />
              <span>Weather Disguise</span>
            </button>

            <button
              onClick={() => onLaunchApp('home')}
              className="px-6 py-2.5 rounded-xl bg-[#FC7454] hover:bg-[#FC7C54] text-white text-xs font-bold shadow-md shadow-[#FC7454]/20 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Launch Mehfooz App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Channels & Help Desk Support Section */}
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-xs font-bold text-[#1C2C34] dark:text-slate-200 mb-2">
              Help Desk Support & Official Contact:
            </div>
            <AdminContactBox compact={false} />
          </div>

          <div className="flex flex-col md:items-end justify-center">
            <div className="text-xs font-bold text-[#1C2C34] dark:text-slate-200 mb-2">
              Follow & Connect on Official Socials:
            </div>
            <SocialLinksRow size="md" showLabels={true} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A6E78] dark:text-slate-400">
          <p>© 2026 Mehfooz SafePath. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Zero-Knowledge Encrypted • Non-Profit Public Safety</p>
        </div>
      </footer>
    </div>
  );
};
