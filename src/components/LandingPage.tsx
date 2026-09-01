/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  MapPin
} from 'lucide-react';
import { AppLogo } from './common/AppLogo';
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

  // Interactive Live Simulator State
  const [simulatorMode, setSimulatorMode] = useState<'routing' | 'legal' | 'vault' | 'sos'>('routing');
  const [simQuery, setSimQuery] = useState<string>('What is Section 4 PPWVA protection order?');
  const [simRouteType, setSimRouteType] = useState<'safest' | 'fastest'>('safest');
  const [simSosArmed, setSimSosArmed] = useState<boolean>(false);

  // Statistics
  const STATS = [
    { label: 'Punjab Emergency Response', value: '< 30s', sub: 'Integrated with 15 PSCA' },
    { label: 'Verified Safe Corridors', value: '1,420+', sub: 'Lahore, Rawalpindi, Multan' },
    { label: 'PPWVA Statutory Accuracy', value: '100%', sub: 'Zero-hallucination legal RAG' },
    { label: 'Local AES-256 Vault', value: 'Zero-Log', sub: 'Client cryptographic hashing' },
  ];

  const CORE_PILLARS = [
    {
      icon: CloudSun,
      title: 'Stealth Weather Cover',
      titleUrdu: 'خفیہ موسم کی اسکرین',
      tag: 'DISCREET SECURITY',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
      description:
        'Looks and behaves like an authentic Tuscany meteorological station. Double-tapping the temperature opens your safety ecosystem discreetly.',
      tab: 'home' as ActiveTab,
      isWeather: true
    },
    {
      icon: Navigation,
      title: 'Safe Corridor Navigation',
      titleUrdu: 'محفوظ راستے اور سروے',
      tag: 'PSCA & LIGHTING HEATMAPS',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      description:
        'Routes pedestrians through verified well-lit streets, active commercial centers, safe haven businesses, and PSCA Safe City camera coverage.',
      tab: 'navigate' as ActiveTab
    },
    {
      icon: Scale,
      title: 'Punjab AI Legal Advisor',
      titleUrdu: 'پنجاب قانونی معاون',
      tag: 'RAG STATUTORY ENGINE',
      color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400',
      description:
        'Grounding on PPWVA 2016, PECA Cyber Laws, and PCSW protections. Synthesizes legal advice and builds police complaint drafts with formal legal citations.',
      tab: 'assistant' as ActiveTab
    },
    {
      icon: Lock,
      title: 'Zero-Knowledge Incident Vault',
      titleUrdu: 'خفیہ انکرپٹڈ والٹ',
      tag: 'AES-256 CLIENT ENCRYPTION',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
      description:
        'Capture voice memos, harassment timelines, and photographic records. Encrypted on your device before any network transmission occurs.',
      tab: 'vault' as ActiveTab
    },
    {
      icon: Clock,
      title: 'Silent Destination Check-In',
      titleUrdu: 'خودکار منزل کا چیک ان',
      tag: 'FAILSAFE GUARDIAN TIMERS',
      color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400',
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-[#67AC5C] selection:text-white">
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="cursor-pointer" onClick={() => onLaunchApp('home')}>
            <AppLogo variant="horizontal" size="md" showUrdu={true} />
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-[#67AC5C] transition-colors">
              Features
            </a>
            <a href="#interactive-suite" className="hover:text-[#67AC5C] transition-colors">
              Live Mockups
            </a>
            <a href="#simulator" className="hover:text-[#67AC5C] transition-colors">
              Simulator
            </a>
            <a href="#safety-network" className="hover:text-[#67AC5C] transition-colors">
              Punjab Helplines
            </a>
            <a href="#privacy" className="hover:text-[#67AC5C] transition-colors">
              Privacy & Zero-Knowledge
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(isUrdu ? 'en' : 'ur')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1"
            >
              <Globe className="w-3.5 h-3.5 text-[#67AC5C]" />
              <span>{isUrdu ? 'English' : 'اردو'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => onThemeChange(themeMode === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
              title="Toggle Theme"
            >
              {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Stealth Weather Cover Button */}
            <button
              onClick={onOpenWeather}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold transition shadow-2xs"
            >
              <CloudSun className="w-4 h-4 text-sky-500" />
              <span>Weather Disguise</span>
            </button>

            {/* Main Launch App CTA */}
            <button
              onClick={() => onLaunchApp('home')}
              className="px-4 sm:px-5 py-2 rounded-xl bg-[#67AC5C] hover:bg-[#58974e] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 active:scale-98"
            >
              <span>Launch SafePath</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH ABSTRACT 3D ART & SCROLL ANIMATIONS */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Abstract Background Layer */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25">
          <AbstractSafetyShieldArt className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#EBF7E7] dark:bg-emerald-950/70 border border-[#67AC5C]/30 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#67AC5C]" />
              <span className="text-xs font-black tracking-wider text-[#3B8031] dark:text-emerald-300 uppercase">
                Punjab Women & Citizen Safety Ecosystem • پنجاب محفوظ
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              Every Step Protected.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#67AC5C] via-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300">
                Every Word Heard.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              The complete safety network combining <strong>discreet weather cover</strong>, <strong>smart corridor navigation</strong>, <strong>grounded Punjab legal statutory AI</strong>, and <strong>zero-knowledge incident evidence lockers</strong>.
            </motion.p>

            {/* Hero CTA Button Deck */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4"
            >
              <button
                onClick={() => onLaunchApp('home')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#67AC5C] hover:bg-[#58974e] text-white font-black text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 group active:scale-98"
              >
                <span>Launch Full Application</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={onOpenWeather}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-base shadow-md transition flex items-center justify-center space-x-2"
              >
                <CloudSun className="w-5 h-5 text-amber-500" />
                <span>Test Tuscany Stealth Mode</span>
              </button>
            </motion.div>

            {/* Key Stat Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-10 text-left"
            >
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
                >
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {stat.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {stat.sub}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PHONE MOCKUP SHOWCASE (Every Feature In Detail) */}
      <section id="interactive-suite" className="border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
        <PhoneMockupShowcase
          onLaunchAppTab={(tabKey) => onLaunchApp(tabKey as ActiveTab)}
          onOpenWeather={onOpenWeather}
        />
      </section>

      {/* 4. SIX PILLARS FEATURE GRID */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EBF7E7] dark:bg-emerald-950/60 border border-[#67AC5C]/30 shadow-2xs">
            <Layers className="w-4 h-4 text-[#67AC5C]" />
            <span className="text-xs font-bold text-[#3B8031] dark:text-emerald-300 uppercase tracking-wider">
              Comprehensive Protection Layers
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Designed for Punjab's Ground Realities
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
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
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${pillar.color} border shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {pillar.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {pillar.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-serif">
                        {pillar.titleUrdu}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
                    className="text-xs font-bold text-[#67AC5C] hover:text-[#528d49] flex items-center space-x-1"
                  >
                    <span>Open Module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. LIVE INTERACTIVE SIMULATOR (Try before launching) */}
      <section id="simulator" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Live Simulator
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    simulatorMode === m.id
                      ? 'bg-[#67AC5C] text-white shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Playground Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl">
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        simRouteType === 'safest' ? 'bg-[#67AC5C] text-white' : 'text-slate-400'
                      }`}
                    >
                      Safe Corridor (Recommended)
                    </button>
                    <button
                      onClick={() => setSimRouteType('fastest')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        simRouteType === 'fastest' ? 'bg-slate-700 text-white' : 'text-slate-400'
                      }`}
                    >
                      Fastest Direct
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-2xl border ${simRouteType === 'safest' ? 'bg-emerald-950/40 border-[#67AC5C]' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-400">Route 1: Safe Corridor</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Grade A+ (98/100)</span>
                    </div>
                    <p className="text-xs text-slate-300">100% Well Lit • 18 PSCA Cameras • 3 Police Posts</p>
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
                      className="mt-3 py-2 px-3 rounded-xl bg-[#67AC5C] text-white text-xs font-bold flex items-center justify-center space-x-1"
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
                  <span className="text-xs text-sky-400">PPWVA 2016 & PECA Grounded</span>
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
                        className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                          simQuery === q
                            ? 'bg-sky-500 text-white border-sky-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-sky-400 font-bold">
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
                        className="text-sky-400 hover:text-sky-300 font-bold"
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
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Client-Side Zero-Knowledge Encryption</h4>
                <p className="text-xs text-slate-400 max-w-xl mx-auto">
                  Every voice memo, photograph, and timeline record is encrypted locally with your custom 4-digit PIN before storage. No plain-text data ever leaves your device.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 max-w-md mx-auto font-mono text-[11px] text-emerald-400 border border-slate-800">
                  AES-GCM-256: 8f9b2a1c0d4e... [KEY DERIVED FROM STEALTH PIN]
                </div>
                <button
                  onClick={() => onLaunchApp('vault')}
                  className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center space-x-1.5"
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
                    className={`py-3 px-6 rounded-2xl text-xs font-black uppercase tracking-wider transition ${
                      simSosArmed
                        ? 'bg-rose-600 text-white shadow-lg animate-pulse'
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

      {/* 6. OFFICIAL PUNJAB EMERGENCY DIRECTORY MATRIX */}
      <section id="safety-network" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EBF7E7] dark:bg-emerald-950/60 border border-[#67AC5C]/30 shadow-2xs">
            <HeartHandshake className="w-4 h-4 text-[#67AC5C]" />
            <span className="text-xs font-bold text-[#3B8031] dark:text-emerald-300 uppercase tracking-wider">
              Integrated Helplines
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Direct Link to Punjab Crisis Services
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
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
              color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
            },
            {
              name: 'Punjab Women Helpline (PCSW)',
              number: '1043',
              desc: 'Dedicated harassment, legal support, and crisis counseling.',
              badge: '24/7 Toll-Free',
              color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
            },
            {
              name: 'Rescue 1122 Emergency',
              number: '1122',
              desc: 'Paramedic, ambulance, and disaster medical response.',
              badge: 'Immediate Medical',
              color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
            },
            {
              name: 'FIA Cyber Crime Wing',
              number: '9911',
              desc: 'Online harassment, blackmail, and unauthorized picture leaks.',
              badge: 'Federal Cyber Unit',
              color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${item.color}`}>
                    {item.badge}
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {item.number}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <a
                href={`tel:${item.number}`}
                className="mt-4 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#67AC5C]" />
                <span>Call {item.number} Now</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FOOTER CALL TO ACTION */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <AppLogo variant="horizontal" size="md" />
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center md:text-left">
              Mehfooz — Privacy-first safety ecosystem empowering women across Punjab, Pakistan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenWeather}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center space-x-1.5"
            >
              <CloudSun className="w-4 h-4 text-sky-500" />
              <span>Weather Disguise</span>
            </button>

            <button
              onClick={() => onLaunchApp('home')}
              className="px-6 py-2.5 rounded-xl bg-[#67AC5C] hover:bg-[#58974e] text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
            >
              <span>Launch Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 Mehfooz SafePath. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Zero-Knowledge Encrypted • Non-Profit Public Safety</p>
        </div>
      </footer>
    </div>
  );
};
