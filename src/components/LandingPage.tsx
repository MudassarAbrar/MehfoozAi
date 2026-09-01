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
  Check
} from 'lucide-react';
import { MehfoozLogo } from './common/MehfoozLogo';
import { AbstractSafetyShieldArt } from './landing/AbstractArt';
import { PhoneMockupShowcase } from './landing/PhoneMockupShowcase';
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

  // Top progress bar scale & scroll percentage
  const scrollLineHeight = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  // Interactive Live Simulator State
  const [simulatorMode, setSimulatorMode] = useState<'routing' | 'legal' | 'vault' | 'sos'>('routing');
  const [simQuery, setSimQuery] = useState<string>('What is Section 4 PPWVA protection order?');
  const [simRouteType, setSimRouteType] = useState<'safest' | 'fastest'>('safest');
  const [simSosArmed, setSimSosArmed] = useState<boolean>(false);

  // Key Milestones along the scroll journey
  const SCROLL_WAYPOINTS = [
    { id: 'hero', label: 'Origin', title: 'Mehfooz Mission' },
    { id: 'interactive-suite', label: 'Experience', title: 'Visual Suite' },
    { id: 'features', label: 'Security', title: '6 Safety Layers' },
    { id: 'simulator', label: 'Engine', title: 'Live Testing' },
    { id: 'safety-network', label: 'Crisis', title: 'Punjab Helplines' },
    { id: 'launch', label: 'Access', title: 'Start Protection' },
  ];

  // Statistics
  const STATS = [
    { label: 'Punjab Emergency Dispatch', value: '< 30s', sub: 'Integrated with 15 PSCA' },
    { label: 'Verified Safe Corridors', value: '1,420+', sub: 'Lahore, Rawalpindi, Multan' },
    { label: 'PPWVA Statutory Accuracy', value: '100%', sub: 'Zero-hallucination legal citations' },
    { label: 'Local AES-256 Vault', value: 'Zero-Log', sub: 'Client cryptographic key derivation' },
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
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-[#9333EA] dark:text-[#C084FC]',
      description:
        'Routes pedestrians through verified well-lit avenues, active commercial zones, safe haven verified shops, and PSCA Safe City camera coverage.',
      tab: 'navigate' as ActiveTab
    },
    {
      icon: Scale,
      title: 'Punjab AI Legal Advisor',
      titleUrdu: 'پنجاب قانونی معاون',
      tag: 'RAG STATUTORY ENGINE',
      color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400',
      description:
        'Grounding on PPWVA 2016, PECA Cyber Laws, and PCSW protections. Synthesizes legal advice and builds police complaint drafts with formal legal citations.',
      tab: 'assistant' as ActiveTab
    },
    {
      icon: Lock,
      title: 'Zero-Knowledge Incident Vault',
      titleUrdu: 'خفیہ انکرپٹڈ والٹ',
      tag: 'AES-256 CLIENT ENCRYPTION',
      color: 'from-fuchsia-500/20 to-pink-500/10 border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400',
      description:
        'Capture voice memos, harassment timelines, and photographic evidence. Encrypted locally with your custom stealth PIN before any network sync.',
      tab: 'vault' as ActiveTab
    },
    {
      icon: Clock,
      title: 'Silent Destination Check-In',
      titleUrdu: 'خودکار منزل کا چیک ان',
      tag: 'FAILSAFE GUARDIAN TIMERS',
      color: 'from-purple-500/20 to-violet-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
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
      className="min-h-screen bg-[#FDFBFE] dark:bg-[#0F1117] text-[#181A20] dark:text-slate-100 font-sans transition-colors selection:bg-[#9333EA] selection:text-white relative"
    >
      {/* ========================================================================= */}
      {/* GLOBAL SCROLL PROGRESS TOP BAR                                            */}
      {/* ========================================================================= */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9333EA] via-[#B886FD] to-[#C084FC] origin-left z-50 shadow-sm"
        style={{ scaleX: smoothProgress }}
      />

      {/* ========================================================================= */}
      {/* 1. STICKY TOP NAVIGATION BAR                                              */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-[#12141C]/95 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo with the Line Art Icon */}
          <div className="cursor-pointer" onClick={() => onLaunchApp('home')}>
            <MehfoozLogo variant="horizontal" size="md" showUrdu={true} showTagline={true} />
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-[#6B7280] dark:text-slate-300">
            <a href="#interactive-suite" className="hover:text-[#9333EA] dark:hover:text-[#C084FC] transition-colors">
              Interface Suite
            </a>
            <a href="#features" className="hover:text-[#9333EA] dark:hover:text-[#C084FC] transition-colors">
              Security Pillars
            </a>
            <a href="#simulator" className="hover:text-[#9333EA] dark:hover:text-[#C084FC] transition-colors">
              Live Simulator
            </a>
            <a href="#safety-network" className="hover:text-[#9333EA] dark:hover:text-[#C084FC] transition-colors">
              Punjab Helplines
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(isUrdu ? 'en' : 'ur')}
              className="px-2.5 py-1.5 rounded-xl bg-[#F5EEFD] dark:bg-[#1E1630] hover:bg-[#EDE9FE] dark:hover:bg-[#2D1F47] text-xs font-bold text-[#181A20] dark:text-[#E9D5FF] border border-[#E9D5FF] dark:border-[#581C87] transition flex items-center space-x-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#9333EA] dark:text-[#C084FC]" />
              <span>{isUrdu ? 'English' : 'اردو'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => onThemeChange(themeMode === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#2A2F40] text-[#181A20] dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Toggle Theme"
            >
              {themeMode === 'light' ? <Moon className="w-4 h-4 text-[#9333EA]" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Stealth Weather Cover Button */}
            <button
              onClick={onOpenWeather}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/80 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <CloudSun className="w-4 h-4 text-sky-500" />
              <span>Weather Cover</span>
            </button>

            {/* Main Launch App CTA */}
            <button
              onClick={() => onLaunchApp('home')}
              className="px-4 sm:px-5 py-2 rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#9333EA]/20 hover:shadow-lg transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
            >
              <span>Launch Mehfooz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PERSISTENT SCROLL-FOLLOWING LIFELINE TRACK (Left / Spine Indicator)    */}
      {/* ========================================================================= */}
      {/* On Desktop: Left-fixed aesthetic timeline with the active glowing bead    */}
      <div className="hidden xl:block fixed left-8 top-32 bottom-20 z-30 pointer-events-none select-none">
        <div className="relative h-full flex flex-col items-center">
          {/* Background Track */}
          <div className="w-[3px] h-full bg-slate-200/80 dark:bg-slate-800/80 rounded-full" />

          {/* Active Animated Progress Line */}
          <motion.div
            className="absolute top-0 w-[3px] bg-gradient-to-b from-[#9333EA] via-[#B886FD] to-[#C084FC] rounded-full shadow-[0_0_12px_rgba(147,51,234,0.6)]"
            style={{ height: scrollLineHeight }}
          />

          {/* Glowing Tracker Bead that follows scroll */}
          <motion.div
            className="absolute -left-[6.5px] w-4 h-4 rounded-full bg-white dark:bg-[#181A20] border-2 border-[#9333EA] dark:border-[#C084FC] shadow-[0_0_14px_#9333EA] flex items-center justify-center pointer-events-auto"
            style={{
              top: scrollLineHeight,
              transform: 'translateY(-50%)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#9333EA] dark:bg-[#C084FC] animate-ping" />
          </motion.div>

          {/* Waypoint markers */}
          <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-auto">
            {SCROLL_WAYPOINTS.map((wp, idx) => (
              <a
                key={wp.id}
                href={`#${wp.id}`}
                className="group flex items-center space-x-3 -ml-2 text-left transition-transform hover:scale-105"
                title={wp.title}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white dark:bg-[#181A20] border-2 border-slate-300 dark:border-slate-700 group-hover:border-[#9333EA] group-hover:bg-[#F5EEFD] dark:group-hover:bg-[#2D1F47] transition shadow-xs" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 dark:bg-[#181A20]/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-[#181A20] dark:text-white shadow-xs whitespace-nowrap">
                  {wp.label} • {wp.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HERO SECTION WITH ANIMATED LINE ART LOGO & SCROLL CONNECTOR            */}
      {/* ========================================================================= */}
      <section id="hero" className="relative pt-8 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        {/* Abstract Background Layer in Lilac Palette */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25">
          <AbstractSafetyShieldArt className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* 3A. HERO ANIMATED LINE-ART ILLUSTRATED LOGO */}
            <div className="flex justify-center pt-2">
              <MehfoozLogo variant="animated-hero" size="hero" showUrdu={true} showTagline={true} />
            </div>

            {/* Top Mission Pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#F5EEFD] dark:bg-[#2D1F47] border border-[#E9D5FF] dark:border-[#581C87] shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#9333EA] dark:text-[#C084FC]" />
              <span className="text-xs font-black tracking-wider text-[#181A20] dark:text-white uppercase">
                Punjab Women & Citizen Safety Ecosystem • پنجاب محفوظ
              </span>
            </motion.div>

            {/* Main Punchy Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-[#181A20] dark:text-white leading-[1.1]"
            >
              Every Step Protected.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9333EA] via-[#B886FD] to-[#C084FC] dark:from-[#C084FC] dark:to-[#E9D5FF]">
                Every Word Heard.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="text-lg sm:text-xl text-[#4B5563] dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
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
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#9333EA] hover:bg-[#7E22CE] text-white font-black text-base shadow-xl shadow-[#9333EA]/25 hover:shadow-2xl transition-all flex items-center justify-center space-x-2 group active:scale-95 cursor-pointer"
              >
                <span>Launch Full Application</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={onOpenWeather}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white dark:bg-[#181A20] hover:bg-slate-50 dark:hover:bg-[#202430] text-[#181A20] dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-base shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
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
                  className="p-4 rounded-2xl bg-white/90 dark:bg-[#181A20]/90 backdrop-blur-md border border-[#E9D5FF]/60 dark:border-slate-800 shadow-xs hover:border-[#9333EA] transition"
                >
                  <p className="text-2xl sm:text-3xl font-serif font-black text-[#181A20] dark:text-white">
                    {stat.value}
                  </p>
                  <h4 className="text-xs font-bold text-[#181A20] dark:text-slate-200 mt-1">
                    {stat.label}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
                    {stat.sub}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Scroll Down Visual Pulse Anchor */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="pt-10 flex flex-col items-center space-y-2 text-[#9333EA] dark:text-[#C084FC]"
            >
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#6B7280] dark:text-slate-400">
                Scroll to Explore Lifeline
              </span>
              <div className="w-5 h-9 rounded-full border-2 border-[#9333EA] dark:border-[#C084FC] flex items-start justify-center p-1">
                <motion.div
                  animate={{ y: [0, 14, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-1.5 h-1.5 rounded-full bg-[#9333EA] dark:bg-[#C084FC]"
                />
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
        className="border-y border-[#E9D5FF]/80 dark:border-slate-800 bg-[#FDFBFE] dark:bg-[#12141C]/80 relative"
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
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F5EEFD] dark:bg-[#2D1F47] border border-[#E9D5FF] dark:border-[#581C87] shadow-xs">
            <Layers className="w-4 h-4 text-[#9333EA] dark:text-[#C084FC]" />
            <span className="text-xs font-bold text-[#181A20] dark:text-white uppercase tracking-wider">
              Comprehensive Protection Layers
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#181A20] dark:text-white">
            Designed for Punjab's Ground Realities
          </h2>
          <p className="text-base sm:text-lg text-[#6B7280] dark:text-slate-300">
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
                className="p-6 rounded-3xl bg-white dark:bg-[#181A20] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-[#B886FD] transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${pillar.color} border shadow-xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">
                      {pillar.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-lg font-bold text-[#181A20] dark:text-white">
                        {pillar.title}
                      </h3>
                      <span className="text-xs text-[#9333EA] dark:text-[#C084FC] font-serif font-bold">
                        {pillar.titleUrdu}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 leading-relaxed">
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
                    className="text-xs font-bold text-[#9333EA] dark:text-[#C084FC] hover:text-[#7E22CE] flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Open Module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-2 h-2 rounded-full bg-[#9333EA] animate-pulse" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. LIVE INTERACTIVE SIMULATOR (Try before launching)                      */}
      {/* ========================================================================= */}
      <section id="simulator" className="py-20 bg-[#12141C] text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#9333EA]/20 border border-[#9333EA]/40">
              <Zap className="w-4 h-4 text-[#C084FC]" />
              <span className="text-xs font-bold text-[#E9D5FF] uppercase tracking-wider">
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
                      ? 'bg-[#9333EA] text-white shadow-lg shadow-[#9333EA]/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Playground Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#181B24] border border-[#2D1F47] shadow-2xl">
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
                        simRouteType === 'safest' ? 'bg-[#9333EA] text-white shadow-xs' : 'text-slate-400'
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
                  <div className={`p-4 rounded-2xl border ${simRouteType === 'safest' ? 'bg-[#2D1F47]/60 border-[#9333EA]' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#C084FC]">Route 1: Safe Corridor</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#9333EA]/30 text-[#E9D5FF] text-[10px] font-bold">Grade A+ (98/100)</span>
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
                      className="mt-3 py-2 px-3 rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition shadow-xs"
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
                  <span className="text-xs text-[#C084FC] font-semibold">PPWVA 2016 & PECA Grounded</span>
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
                            ? 'bg-[#9333EA] text-white border-[#C084FC]'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-[#C084FC] font-bold">
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
                        className="text-[#C084FC] hover:text-[#E9D5FF] font-bold cursor-pointer"
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
                <div className="w-12 h-12 rounded-2xl bg-[#9333EA]/20 text-[#C084FC] mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Client-Side Zero-Knowledge Encryption</h4>
                <p className="text-xs text-slate-400 max-w-xl mx-auto">
                  Every voice memo, photograph, and timeline record is encrypted locally with your custom 4-digit PIN before storage. No plain-text data ever leaves your device.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 max-w-md mx-auto font-mono text-[11px] text-[#C084FC] border border-[#2D1F47]">
                  AES-GCM-256: 8f9b2a1c0d4e... [KEY DERIVED FROM STEALTH PIN]
                </div>
                <button
                  onClick={() => onLaunchApp('vault')}
                  className="py-2.5 px-5 rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer shadow-md"
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
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F5EEFD] dark:bg-[#2D1F47] border border-[#E9D5FF] dark:border-[#581C87] shadow-xs">
            <HeartHandshake className="w-4 h-4 text-[#9333EA] dark:text-[#C084FC]" />
            <span className="text-xs font-bold text-[#181A20] dark:text-white uppercase tracking-wider">
              Integrated Helplines
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#181A20] dark:text-white">
            Direct Link to Punjab Crisis Services
          </h2>
          <p className="text-base text-[#6B7280] dark:text-slate-300">
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
              color: 'text-[#9333EA] dark:text-[#C084FC] bg-[#F5EEFD] dark:bg-[#2D1F47] border-[#E9D5FF] dark:border-[#581C87]'
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
              className="p-5 rounded-3xl bg-white dark:bg-[#181A20] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-[#B886FD] transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${item.color}`}>
                    {item.badge}
                  </span>
                  <span className="text-xl font-serif font-black text-[#181A20] dark:text-white">
                    {item.number}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#181A20] dark:text-white mt-1">
                  {item.name}
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <a
                href={`tel:${item.number}`}
                className="mt-4 w-full py-2 rounded-xl bg-[#F5EEFD] dark:bg-[#1E1630] hover:bg-[#EDE9FE] dark:hover:bg-[#2D1F47] text-[#181A20] dark:text-[#E9D5FF] border border-[#E9D5FF] dark:border-[#581C87] text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#9333EA] dark:text-[#C084FC]" />
                <span>Call {item.number} Now</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER CALL TO ACTION                                                  */}
      {/* ========================================================================= */}
      <footer id="launch" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141C] py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <MehfoozLogo variant="horizontal" size="md" showUrdu={true} showTagline={true} />
            <p className="text-xs text-[#6B7280] dark:text-slate-400 max-w-sm text-center md:text-left">
              Mehfooz — Privacy-first safety ecosystem empowering women across Punjab, Pakistan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenWeather}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 text-xs font-bold text-[#181A20] dark:text-slate-200 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <CloudSun className="w-4 h-4 text-sky-500" />
              <span>Weather Disguise</span>
            </button>

            <button
              onClick={() => onLaunchApp('home')}
              className="px-6 py-2.5 rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white text-xs font-bold shadow-md shadow-[#9333EA]/20 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Launch Mehfooz App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] dark:text-slate-400">
          <p>© 2026 Mehfooz SafePath. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Zero-Knowledge Encrypted • Non-Profit Public Safety</p>
        </div>
      </footer>
    </div>
  );
};
