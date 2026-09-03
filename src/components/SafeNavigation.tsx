/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Bookmark, 
  Home, 
  Briefcase, 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  Volume2, 
  Navigation, 
  ArrowRight, 
  RotateCcw, 
  Sliders, 
  ChevronRight, 
  X, 
  ThumbsUp, 
  ThumbsDown,
  Eye,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, SafeRoute, UserProfile } from '../types';

interface SafeNavigationProps {
  language: AppLanguage;
  user: UserProfile | null;
  onOpenCrisis: () => void;
}

export const SafeNavigation: React.FC<SafeNavigationProps> = ({
  language,
  user,
  onOpenCrisis
}) => {
  const isUrdu = language === 'ur';

  // Navigation workflow state: 'search' | 'route_select' | 'active_trip' | 'arrival_feedback'
  const [navStage, setNavStage] = useState<'search' | 'route_select' | 'active_trip' | 'arrival_feedback'>('search');
  const [destinationQuery, setDestinationQuery] = useState<string>('Gulberg III, Main Boulevard');
  const [selectedRouteType, setSelectedRouteType] = useState<'safest' | 'balanced' | 'fastest'>('safest');
  
  // Active trip simulation state
  const [tripProgress, setTripProgress] = useState<number>(35);
  const [isUnsafeModalOpen, setIsUnsafeModalOpen] = useState<boolean>(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);
  const [emergencySirenPlaying, setEmergencySirenPlaying] = useState<boolean>(false);
  const [feedbackRating, setFeedbackRating] = useState<'safe' | 'concerns' | null>('safe');
  const [feedbackNote, setFeedbackNote] = useState<string>('');

  // Sample routes
  const routes: SafeRoute[] = [
    {
      id: 'route-safest',
      title: 'Via Main Boulevard & Market Corridors',
      from: user?.district ? `${user.district} Center` : 'Dhanmondi / Gulberg 15',
      to: destinationQuery || 'Gulberg Campus',
      routeType: 'safest',
      durationMinutes: 25,
      distanceKm: 3.2,
      safetyScore: 96,
      safetyGrade: 'A+',
      verifiedCount: 12,
      verifiedAgo: '2 hours ago',
      features: {
        wellLitPercent: 92,
        activeWomenCount: 8,
        policePostNearby: true,
        cctvCoveragePercent: 88,
        safeZonesCount: 3
      },
      nextTurnInstruction: 'In 5 min: Turn Right Onto Well-Lit Main Avenue',
      addedTimeMinutes: 3
    },
    {
      id: 'route-balanced',
      title: 'Via Gulshan Circle / Commercial Road',
      from: 'Gulberg 15',
      to: destinationQuery || 'Campus',
      routeType: 'balanced',
      durationMinutes: 18,
      distanceKm: 2.7,
      safetyScore: 88,
      safetyGrade: 'A',
      verifiedCount: 7,
      verifiedAgo: '4 hours ago',
      features: {
        wellLitPercent: 82,
        activeWomenCount: 4,
        policePostNearby: false,
        cctvCoveragePercent: 70,
        safeZonesCount: 2
      },
      nextTurnInstruction: 'In 2 min: Keep Straight Past Shopping Mall'
    },
    {
      id: 'route-fastest',
      title: 'Via Short Alley & Direct Link',
      from: 'Gulberg 15',
      to: destinationQuery || 'Campus',
      routeType: 'fastest',
      durationMinutes: 14,
      distanceKm: 2.1,
      safetyScore: 72,
      safetyGrade: 'B+',
      verifiedCount: 2,
      verifiedAgo: 'Yesterday',
      features: {
        wellLitPercent: 60,
        activeWomenCount: 1,
        policePostNearby: false,
        cctvCoveragePercent: 40,
        safeZonesCount: 1
      },
      nextTurnInstruction: 'In 1 min: Turn Left on Link Road'
    }
  ];

  const currentRoute = routes.find(r => r.routeType === selectedRouteType) || routes[0];

  // Auto trip progression simulation
  useEffect(() => {
    let timer: any;
    if (navStage === 'active_trip') {
      timer = setInterval(() => {
        setTripProgress(prev => {
          if (prev >= 98) {
            clearInterval(timer);
            return 100;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [navStage]);

  const handleStartNavigation = () => {
    setTripProgress(15);
    setNavStage('active_trip');
  };

  const handleArrivedSafely = () => {
    setNavStage('arrival_feedback');
  };

  const handleSubmitFeedback = () => {
    setNavStage('search');
    setFeedbackNote('');
  };

  const emergencyContacts = user?.emergencyContacts && user.emergencyContacts.length > 0 
    ? user.emergencyContacts 
    : [
        { id: 'c1', name: 'Tulsi (Mom)', relation: 'Mother', phone: '+92 300 1234567', isDefaultNotified: true },
        { id: 'c2', name: 'Rudra (Brother)', relation: 'Brother', phone: '+92 321 9876543', isDefaultNotified: true },
        { id: 'c3', name: 'Swapnil Das', relation: 'Best Friend', phone: '+92 333 4567890', isDefaultNotified: false }
      ];

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-4 text-[#1C2C34] dark:text-[#F4F4FC]">
      {/* ========================================================================= */}
      {/* 1. STAGE: SEARCH & SAVED PLACES (Matching Image 8 - Left Screen) */}
      {/* ========================================================================= */}
      {navStage === 'search' && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="rounded-2xl bg-white dark:bg-[#18242A] border border-[#BCD4D4]/60 dark:border-slate-800 p-4 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1C2C34] dark:text-white">
                  {isUrdu ? 'محفوظ راستہ تلاش کریں' : 'Safe Route Navigation'}
                </h2>
                <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 leading-tight mt-0.5">
                  {isUrdu ? 'روشنی اور سی سی ٹی وی تصدیق شدہ' : 'Safety, lighting & verified reviews'}
                </p>
              </div>
            </div>

            {/* Where to Input */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#5A6E78] dark:text-slate-400" />
              <input
                type="text"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                placeholder={isUrdu ? 'کہاں جانا چاہتے ہیں؟ (مثلاً گلبرگ، یونیورسٹی، مال)' : 'Where to? (e.g. University, Mall, Market)'}
                className="w-full bg-slate-50 dark:bg-[#131E24] border border-[#BCD4D4]/60 dark:border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-[#1C2C34] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FC7454] dark:focus:border-[#FC7C54]"
              />
            </div>

            {/* Current Location Pill */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1 text-[#5A6E78] dark:text-slate-400 gap-2">
              <div className="flex items-center space-x-1.5 min-w-0">
                <MapPin className="w-4 h-4 text-[#FC7454] dark:text-[#FC7C54] flex-shrink-0" />
                <span className="font-bold text-[#1C2C34] dark:text-white flex-shrink-0">
                  {isUrdu ? 'مقام:' : 'Start:'}
                </span>
                <span className="font-medium truncate">{user?.district ? `${user.district} 15, Punjab` : 'Gulberg 15, Lahore'}</span>
              </div>
              <button 
                onClick={() => setNavStage('route_select')}
                className="px-3.5 py-2 rounded-xl bg-[#FC7454] hover:bg-[#FC7C54] text-white text-xs font-bold shadow-xs transition whitespace-nowrap flex-shrink-0 cursor-pointer"
              >
                {isUrdu ? 'راستے دیکھیں' : 'Find Routes'}
              </button>
            </div>
          </div>

          {/* Saved Places */}
          <div className="rounded-3xl bg-white dark:bg-[#18242A] border border-[#BCD4D4]/60 dark:border-slate-800 p-5 shadow-xs space-y-3.5 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6E78] dark:text-slate-400">
              {isUrdu ? 'محفوظ کردہ مقامات' : 'Saved Places'}
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setDestinationQuery('Road 15, Residential Block, Lahore');
                  setNavStage('route_select');
                }}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131E24] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border border-[#BCD4D4]/60 dark:border-slate-700/80 flex items-center justify-between transition text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] flex items-center justify-center">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1C2C34] dark:text-white">Home</h4>
                    <p className="text-xs text-[#5A6E78] dark:text-slate-400 font-medium">Road 15, Residential Block, Gulberg</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1C2C34] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => {
                  setDestinationQuery('Gulshan 2 / IT Park Complex');
                  setNavStage('route_select');
                }}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131E24] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border border-[#BCD4D4]/60 dark:border-slate-700/80 flex items-center justify-between transition text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1C2C34] dark:text-white">Work</h4>
                    <p className="text-xs text-[#5A6E78] dark:text-slate-400 font-medium">Gulshan 2 / IT Park Complex</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1C2C34] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => {
                  setDestinationQuery("Mom's House, Sector 10");
                  setNavStage('route_select');
                }}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131E24] hover:bg-[#ECF4F4] dark:hover:bg-[#263842] border border-[#BCD4D4]/60 dark:border-slate-700/80 flex items-center justify-between transition text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1C2C34] dark:text-white">Mom's House</h4>
                    <p className="text-xs text-[#5A6E78] dark:text-slate-400 font-medium">Mirpur 10 / Sector 10, Lahore</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1C2C34] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STAGE: ROUTE SELECTION & COMPARISON */}
      {/* ========================================================================= */}
      {navStage === 'route_select' && (
        <div className="space-y-4">
          {/* Top header navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setNavStage('search')}
              className="flex items-center space-x-1 text-xs font-bold text-[#1C2C34] dark:text-slate-200 hover:underline cursor-pointer"
            >
              <span>← Back</span>
            </button>
            <span className="text-xs font-bold text-[#1C2C34] dark:text-white truncate max-w-[200px] sm:max-w-xs">
              Navigating to: {destinationQuery}
            </span>
            <button className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#18242A] text-[11px] font-bold text-[#1C2C34] dark:text-slate-200 cursor-pointer">
              Compare
            </button>
          </div>

          {/* Route Options Cards */}
          <div className="space-y-3">
            {routes.map((route) => {
              const isSelected = selectedRouteType === route.routeType;
              const isSafest = route.routeType === 'safest';

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteType(route.routeType)}
                  className={`rounded-2xl border p-4 shadow-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#18242A] border-[#FC7454] dark:border-[#FC7C54] ring-2 ring-[#FC7454]/30 shadow-sm'
                      : 'bg-white dark:bg-[#18242A] border-[#BCD4D4]/60 dark:border-slate-800 hover:border-[#BCD4D4]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        {isSafest && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] text-[10px] font-bold tracking-wide uppercase border border-[#BCD4D4] dark:border-[#263842]">
                            Safest Route
                          </span>
                        )}
                        {!isSafest && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#18242A] text-[#1C2C34] dark:text-slate-200 text-[10px] font-bold uppercase">
                            {route.routeType}
                          </span>
                        )}
                        <span className="text-xs text-[#5A6E78] dark:text-slate-400 font-medium">
                          {route.durationMinutes} min • {route.distanceKm} km
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#1C2C34] dark:text-white mt-1.5">
                        {route.title}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#ECF4F4] dark:bg-[#263842] border border-[#BCD4D4] dark:border-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] font-bold text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FC7454] dark:text-[#FC7C54]" />
                        <span>{route.safetyGrade} Safety</span>
                      </div>
                      <p className="text-[10px] text-[#5A6E78] dark:text-slate-400 mt-1">
                        Score: {route.safetyScore}/100
                      </p>
                    </div>
                  </div>

                  {/* Verification Note */}
                  <p className="text-[11px] text-[#1C2C34] dark:text-slate-200 font-semibold mt-2 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-[#FC7454] dark:text-[#FC7C54]" />
                    <span>Verified by {route.verifiedCount} women today • {route.verifiedAgo}</span>
                  </p>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#131E24] text-[#1C2C34] dark:text-slate-300 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FC7454] dark:bg-[#FC7C54]" />
                      <span>Well-lit: {route.features.wellLitPercent}%</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#131E24] text-[#1C2C34] dark:text-slate-300 flex items-center space-x-1">
                      <Radio className="w-2.5 h-2.5 text-[#FC7454] dark:text-[#FC7C54]" />
                      <span>Active: {route.features.activeWomenCount} women</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#131E24] text-[#1C2C34] dark:text-slate-300 flex items-center space-x-1">
                      <ShieldCheck className="w-2.5 h-2.5 text-[#1C2C34] dark:text-slate-300" />
                      <span>Police nearby</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button: Start Navigation */}
          <div className="pt-2">
            <button
              onClick={handleStartNavigation}
              className="w-full py-3.5 rounded-2xl bg-[#FC7454] hover:bg-[#FC7C54] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-white" />
              <span>{isUrdu ? 'نیویگیشن شروع کریں' : 'Start Navigation'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STAGE: ACTIVE TRIP SIMULATION & MAP */}
      {/* ========================================================================= */}
      {navStage === 'active_trip' && (
        <div className="space-y-4">
          {/* Active Navigation Header Card */}
          <div className="rounded-2xl bg-white dark:bg-[#18242A] border border-[#BCD4D4]/60 dark:border-slate-800 p-4 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] font-bold text-[10px] uppercase border border-[#BCD4D4] dark:border-[#263842] flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FC7454] dark:bg-[#FC7C54] animate-ping" />
                  <span>Live Safe Corridor</span>
                </span>
                <span className="text-[11px] text-[#5A6E78] dark:text-slate-400">ETA: {currentRoute.durationMinutes - 5} min</span>
              </div>
              <span className="text-xs font-bold text-[#1C2C34] dark:text-white">
                1.0 km remaining
              </span>
            </div>

            {/* Turn instruction banner */}
            <div className="p-3.5 rounded-xl bg-slate-900 dark:bg-[#0D0F16] border border-slate-800 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-[#FC7454] text-white flex items-center justify-center font-bold text-base">
                  →
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">IN 200 METERS</span>
                  <h4 className="text-xs font-bold text-white">{currentRoute.nextTurnInstruction}</h4>
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-slate-800 dark:bg-slate-800/80 text-[10px] font-bold text-[#BCD4D4]">
                Well-Lit
              </span>
            </div>

            {/* Simulated Live Route Map Corridor */}
            <div className="relative h-44 rounded-2xl bg-gradient-to-b from-[#FCFCFC] to-[#F4F4F4] dark:from-[#131E24] dark:to-[#18242A] border border-[#BCD4D4]/60 dark:border-slate-700/80 overflow-hidden flex flex-col justify-between p-3">
              {/* Map grid lines simulation */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#BCD4D4_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Safe corridor route line */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                <motion.div 
                  className="h-full bg-[#FC7454] dark:bg-[#FC7C54] rounded-full relative"
                  style={{ width: `${tripProgress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-[#0F1117] border-2 border-[#FC7454] dark:border-[#FC7C54] shadow-md animate-pulse" />
                </motion.div>
              </div>

              {/* Landmark Pins */}
              <div className="relative z-10 flex justify-between text-[10px] text-[#1C2C34] dark:text-white font-medium">
                <span className="px-2 py-0.5 rounded bg-white dark:bg-[#18242A] shadow-xs border border-[#BCD4D4]/60 dark:border-slate-700">
                  📍 Gulberg 15 (Start)
                </span>
                <span className="px-2 py-0.5 rounded bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] font-bold shadow-xs border border-[#BCD4D4] dark:border-[#263842] flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-[#FC7454]" />
                  <span>Safe Zone (CCTV Active)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-[#18242A] shadow-xs border border-[#BCD4D4]/60 dark:border-slate-700">
                  🏁 Destination
                </span>
              </div>

              <div className="relative z-10 flex items-center justify-between text-[11px]">
                <span className="text-[#5A6E78] dark:text-slate-400 font-mono text-[10px]">
                  GPS Accuracy: ±3m • Safe corridor active
                </span>
                <span className="text-[#1C2C34] dark:text-white font-bold">
                  {tripProgress}% completed
                </span>
              </div>
            </div>
          </div>

          {/* Dual Action Controls */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {/* 1. I Feel Unsafe Button */}
            <button
              onClick={() => setIsUnsafeModalOpen(true)}
              className="py-3 px-2.5 sm:px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs whitespace-nowrap overflow-hidden cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-700 dark:text-rose-400 flex-shrink-0" />
              <span className="truncate">{isUrdu ? 'غیر محفوظ' : 'Feel Unsafe'}</span>
              <span className="hidden sm:inline font-bold">{isUrdu ? '' : '(SOS)'}</span>
            </button>

            {/* 2. I've Arrived Safely Button */}
            <button
              onClick={handleArrivedSafely}
              className="py-3 px-2.5 sm:px-4 rounded-2xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs hover:shadow-md border border-[#1C2C34] whitespace-nowrap overflow-hidden cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#BCD4D4] flex-shrink-0" />
              <span className="truncate">{isUrdu ? 'بخیریت پہنچ گئی' : 'Arrived Safely'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: WHEN A USER FEELS UNSAFE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isUnsafeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#18242A] border border-[#BCD4D4]/60 dark:border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 text-[#1C2C34] dark:text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C2C34] dark:text-white">
                      {isUrdu ? 'ہم مدد کے لیے حاضر ہیں' : "We're here to help"}
                    </h3>
                    <p className="text-[11px] text-[#5A6E78] dark:text-slate-400">
                      {isUrdu ? 'آپ کیا کرنا چاہیں گی؟' : 'What would you like to do?'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUnsafeModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#1C2C34] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Option 1: Take Safer Route */}
              <button
                onClick={() => {
                  setSelectedRouteType('safest');
                  setIsUnsafeModalOpen(false);
                }}
                className="w-full p-3.5 rounded-2xl bg-[#FCFCFC] dark:bg-[#131E24] border border-[#BCD4D4]/60 dark:border-slate-700 text-left flex items-center justify-between hover:bg-[#ECF4F4] dark:hover:bg-[#263842] transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-[#FC7454]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C2C34] dark:text-white">
                      {isUrdu ? 'زیادہ محفوظ راستہ منتخب کریں' : 'Take Safer Route'}
                    </h4>
                    <p className="text-[10px] text-[#5A6E78] dark:text-slate-400">
                      Re-routes to well-lit avenue with active CCTV & police presence (+3 min)
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#1C2C34] dark:text-slate-300" />
              </button>

              {/* Option 2: Call Emergency Contacts */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1C2C34] dark:text-white flex items-center space-x-1">
                  <PhoneCall className="w-3.5 h-3.5 text-[#FC7454] dark:text-[#FC7C54]" />
                  <span>{isUrdu ? 'قریبی عزیز کو کال کریں' : 'Call Emergency Contact'}</span>
                </h4>
                
                <div className="space-y-1.5">
                  {emergencyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131E24] border border-[#BCD4D4]/40 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-[#1C2C34] dark:text-white">{contact.name}</h5>
                        <p className="text-[10px] text-[#5A6E78] dark:text-slate-400">{contact.relation} • {contact.phone}</p>
                      </div>
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                        className="p-2 rounded-xl bg-[#ECF4F4] dark:bg-[#263842] text-[#FC7454] hover:bg-[#C4DCDC] dark:hover:bg-[#344854] transition shadow-xs cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Option 3: Activate Emergency Mode / SOS */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    setIsEmergencyActive(true);
                    setEmergencySirenPlaying(true);
                    onOpenCrisis();
                    setIsUnsafeModalOpen(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span>{isUrdu ? 'ہنگامی موڈ اور 15 پولیس الرٹ' : 'Activate Emergency Mode & 15 Alert'}</span>
                </button>
                <p className="text-[10px] text-[#5A6E78] dark:text-slate-400 text-center">
                  Instantly sends live location to 3 contacts & connects to Punjab Police 15
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. STAGE: ARRIVAL FEEDBACK MODAL */}
      {/* ========================================================================= */}
      {navStage === 'arrival_feedback' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#18242A] border border-[#BCD4D4]/60 dark:border-slate-800 p-6 shadow-xs text-center space-y-4 text-[#1C2C34] dark:text-white transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#ECF4F4] dark:bg-[#263842] text-[#1C2C34] dark:text-[#BCD4D4] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#FC7454]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1C2C34] dark:text-white">
                {isUrdu ? 'شکر ہے، آپ بخیریت پہنچ گئیں!' : 'Glad you made it safely!'}
              </h3>
              <p className="text-xs text-[#5A6E78] dark:text-slate-400">
                {isUrdu ? 'آپ کی رائے دیگر خواتین کے سفر کو محفوظ بناتی ہے' : 'Your feedback helps make routes safer for everyone'}
              </p>
            </div>

            {/* How did this route feel? */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-[#1C2C34] dark:text-slate-200">
                How did this route feel?
              </span>

              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <button
                  onClick={() => setFeedbackRating('safe')}
                  className={`py-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                    feedbackRating === 'safe'
                      ? 'bg-[#1C2C34] border-[#1C2C34] text-white'
                      : 'bg-slate-50 dark:bg-[#131E24] border border-[#BCD4D4]/60 dark:border-slate-700 text-[#5A6E78] dark:text-slate-400'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 text-[#BCD4D4]" />
                  <span>Safe</span>
                </button>

                <button
                  onClick={() => setFeedbackRating('concerns')}
                  className={`py-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                    feedbackRating === 'concerns'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                      : 'bg-slate-50 dark:bg-[#131E24] border border-[#BCD4D4]/60 dark:border-slate-700 text-[#5A6E78] dark:text-slate-400'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>Concerns</span>
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="text-left space-y-1 pt-2">
              <label className="text-[11px] font-semibold text-[#5A6E78] dark:text-slate-400">
                Add a note (optional):
              </label>
              <input
                type="text"
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Share more about lighting, stalls, or police presence..."
                className="w-full bg-slate-50 dark:bg-[#131E24] border border-[#BCD4D4]/60 dark:border-slate-700 rounded-xl p-2.5 text-xs text-[#1C2C34] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FC7454] dark:focus:border-[#FC7C54]"
              />
            </div>

            {/* Submit & Skip */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSubmitFeedback}
                className="w-full py-3 rounded-2xl bg-[#FC7454] hover:bg-[#FC7C54] text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setNavStage('search')}
                className="text-xs text-[#5A6E78] dark:text-slate-400 hover:text-[#1C2C34] dark:hover:text-white font-medium cursor-pointer"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
