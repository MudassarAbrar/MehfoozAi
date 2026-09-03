/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Menu,
  Shield,
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
  ArrowRight,
  Lock,
  PhoneCall,
  Search,
  Star,
  Wifi,
  Coffee,
  Sun,
  ShieldCheck,
  Calendar,
  Layers,
  Home as HomeIcon,
  Users,
  Compass
} from 'lucide-react';
import {
  SeatedPhoneWomanArt,
  PendantLampDecor
} from '../common/WorkspaceLilacArt';

interface PhoneMockupShowcaseProps {
  onLaunchAppTab: (tab: string) => void;
  onOpenWeather: () => void;
}

export const PhoneMockupShowcase: React.FC<PhoneMockupShowcaseProps> = ({
  onLaunchAppTab,
  onOpenWeather,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('Feb 08');
  const [selectedSlot, setSelectedSlot] = useState<string>('2 PM - 4 PM');

  return (
    <div className="w-full relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#FCFCFC]">
      {/* Background Soft Mint & Teal Ambient Circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#ECF4F4] rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#C4DCDC] rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-[#BCD4D4] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FC7454]" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1C2C34]">
              Women Safety & Legal Protection Suite
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1C2C34]">
            Experience Mehfooz
          </h2>
          <p className="text-base sm:text-lg text-[#5A6E78] font-medium leading-relaxed max-w-2xl mx-auto">
            A serene soft-teal aesthetic paired with verified safe corridors, offline statutory legal AI, encrypted vault evidence, and instant emergency dispatch.
          </p>
        </div>

        {/* 3-Phone Mockup Showcase Matching Exact Reference Image */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-center justify-center max-w-6xl mx-auto">
          
          {/* ============================================================ */}
          {/* PHONE 1: ONBOARDING & WELCOME (LEFT SCREEN IN REFERENCE)     */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[340px] sm:max-w-[360px] mx-auto bg-[#FCFCFC] rounded-[44px] shadow-2xl p-6 border-4 border-[#F4F4F4] flex flex-col justify-between min-h-[640px] relative overflow-hidden group"
          >
            {/* Phone Speaker Pill Notch */}
            <div className="w-20 h-4 bg-[#F4F4F4] rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#BCD4D4]" />
            </div>

            {/* Center Vector Artwork: Woman on cushions with phone & location pin */}
            <div className="my-auto relative flex items-center justify-center py-2">
              <SeatedPhoneWomanArt className="w-64 h-64 object-contain transition-transform duration-500 group-hover:scale-105" />
            </div>

            {/* Bottom Content Matching Reference */}
            <div className="space-y-4 pt-2 pb-2 text-center">
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-[#1C2C34] leading-snug">
                  Choose The Best<br />Safe Path For You
                </h3>
                <p className="text-xs text-[#5A6E78] font-normal max-w-xs mx-auto">
                  Verified well-lit streets, emergency check-ins, and Punjab statutory legal protections.
                </p>
              </div>

              {/* Charcoal "Get Started" Pill Button */}
              <button
                onClick={() => onLaunchAppTab('home')}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#1C2C34] hover:bg-[#2A3C44] text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </motion.div>

          {/* ============================================================ */}
          {/* PHONE 2: CATEGORIES & DASHBOARD (CENTER SCREEN IN REFERENCE) */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full max-w-[340px] sm:max-w-[360px] mx-auto bg-[#FCFCFC] rounded-[44px] shadow-2xl p-6 border-4 border-[#F4F4F4] flex flex-col justify-between min-h-[640px] relative overflow-hidden"
          >
            {/* Phone Speaker Pill Notch */}
            <div className="w-20 h-4 bg-[#F4F4F4] rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#BCD4D4]" />
            </div>

            {/* Top Heading & Menu Bars */}
            <div className="flex items-start justify-between gap-2 pb-1">
              <h3 className="text-xl font-bold tracking-tight text-[#1C2C34] leading-tight max-w-[210px]">
                Find The Best<br />Safe Route For You
              </h3>
              <button
                onClick={() => onLaunchAppTab('home')}
                className="p-2 hover:bg-[#F4F4F4] rounded-xl transition text-[#1C2C34] cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Box Matching Reference */}
            <div
              onClick={() => onLaunchAppTab('navigate')}
              className="w-full py-2.5 px-4 rounded-xl border border-[#BCD4D4] bg-white flex items-center space-x-2.5 text-xs text-[#5A6E78] shadow-2xs hover:border-[#FC7454] transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#A4C4C4]" />
              <span>Search safe routes, police stations...</span>
            </div>

            {/* Categories Section Heading */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-bold text-[#1C2C34]">Categories</h4>

              {/* 2x2 Category Grid Matching Reference */}
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Safe Corridors */}
                <div
                  onClick={() => onLaunchAppTab('navigate')}
                  className="rounded-2xl border border-[#BCD4D4]/60 p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-[#FC7454] transition bg-white min-h-[105px]"
                >
                  <div className="relative">
                    <Compass className="w-6 h-6 text-[#1C2C34]" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FC7454]" />
                  </div>
                  <span className="text-xs font-semibold text-[#1C2C34]">Corridor</span>
                </div>

                {/* 2. Legal AI */}
                <div
                  onClick={() => onLaunchAppTab('assistant')}
                  className="rounded-2xl border border-[#BCD4D4]/60 p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-[#FC7454] transition bg-white min-h-[105px]"
                >
                  <div className="relative">
                    <ShieldCheck className="w-6 h-6 text-[#1C2C34]" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FC7454]" />
                  </div>
                  <span className="text-xs font-semibold text-[#1C2C34]">Legal AI</span>
                </div>

                {/* 3. Incident Vault */}
                <div
                  onClick={() => onLaunchAppTab('vault')}
                  className="rounded-2xl border border-[#BCD4D4]/60 p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-[#FC7454] transition bg-white min-h-[105px]"
                >
                  <div className="relative">
                    <Lock className="w-6 h-6 text-[#1C2C34]" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FC7454]" />
                  </div>
                  <span className="text-xs font-semibold text-[#1C2C34]">Vault</span>
                </div>

                {/* 4. All / SOS */}
                <div
                  onClick={() => onLaunchAppTab('home')}
                  className="rounded-2xl bg-[#ECF4F4] border border-[#BCD4D4] p-4 flex flex-col items-center justify-center space-y-1 cursor-pointer hover:bg-[#C4DCDC] transition min-h-[105px]"
                >
                  <span className="text-base font-bold text-[#1C2C34]">All</span>
                  <span className="text-[10px] text-[#FC7454] font-semibold">SOS & Tools</span>
                </div>
              </div>
            </div>

            {/* Recent Safe Corridor */}
            <div className="space-y-2 pt-1 pb-1">
              <h4 className="text-xs font-bold text-[#1C2C34]">Recent Safe Corridor</h4>

              {/* Recent Booking Card */}
              <div
                onClick={() => onLaunchAppTab('navigate')}
                className="w-full p-4 rounded-2xl border border-[#BCD4D4]/60 bg-white hover:border-[#FC7454] transition cursor-pointer shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1C2C34]">
                    Green Garden Safe Route
                  </span>
                  <span className="flex items-center space-x-1 text-xs font-bold text-[#1C2C34]">
                    <Star className="w-3.5 h-3.5 fill-[#FC7454] text-[#FC7454]" />
                    <span>4,6</span>
                  </span>
                </div>
                <p className="text-xs text-[#5A6E78] flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#A4C4C4]" />
                  <span>123 Meridian Street, Gulberg</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* ============================================================ */}
          {/* PHONE 3: DETAIL & TRANSIT BOOKING (RIGHT SCREEN IN REFERENCE)*/}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-[340px] sm:max-w-[360px] mx-auto bg-[#FCFCFC] rounded-[44px] shadow-2xl border-4 border-[#F4F4F4] flex flex-col justify-between min-h-[640px] relative overflow-hidden"
          >
            {/* Top Soft Mint Header with Hanging Wire Decor */}
            <div className="bg-[#ECF4F4] px-5 pt-3 pb-6 relative">
              {/* Phone Speaker Pill Notch */}
              <div className="w-20 h-4 bg-white/70 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#BCD4D4]" />
              </div>

              {/* Back Button */}
              <div className="flex items-center justify-between relative z-10">
                <button
                  onClick={() => onLaunchAppTab('home')}
                  className="p-1 hover:bg-white/60 rounded-full transition text-[#1C2C34] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Pendant Lamp Line Art Decor */}
              <div className="absolute top-0 right-2 w-48 h-20 pointer-events-none">
                <PendantLampDecor className="w-full h-full" />
              </div>
            </div>

            {/* Bottom Card White Overlay */}
            <div className="-mt-4 bg-[#FCFCFC] rounded-t-[32px] p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div>
                {/* Title & Star Rating */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#1C2C34]">
                      Green Garden
                    </h3>
                    <p className="text-xs text-[#5A6E78] flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#A4C4C4]" />
                      <span>123 Meridian Street, Gulberg</span>
                    </p>
                  </div>
                  <span className="flex items-center space-x-1 text-xs font-bold text-[#1C2C34]">
                    <Star className="w-3.5 h-3.5 fill-[#FC7454] text-[#FC7454]" />
                    <span>4,6</span>
                  </span>
                </div>

                {/* Book Now / Transit Window Section */}
                <div className="space-y-2 pt-2.5">
                  <h4 className="text-xs font-bold text-[#1C2C34]">Schedule Transit</h4>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Date Pill */}
                    <div className="p-2 px-3 rounded-xl border border-[#BCD4D4]/60 flex items-center justify-between text-xs text-[#1C2C34] font-semibold cursor-pointer hover:border-[#FC7454]">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#A4C4C4]" />
                        <span>{selectedDay}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-[#A4C4C4] rotate-90" />
                    </div>

                    {/* Time Pill */}
                    <div className="p-2 px-3 rounded-xl border border-[#BCD4D4]/60 flex items-center justify-between text-xs text-[#1C2C34] font-semibold cursor-pointer hover:border-[#FC7454]">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#A4C4C4]" />
                        <span className="text-[11px] truncate">{selectedSlot}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-[#A4C4C4] rotate-90" />
                    </div>
                  </div>

                  {/* Coral Action Button */}
                  <button
                    onClick={() => onLaunchAppTab('navigate')}
                    className="w-full py-3 px-4 rounded-2xl bg-[#FC7454] hover:bg-[#FC7C54] text-white font-bold text-xs tracking-wide transition shadow-sm active:scale-95 cursor-pointer mt-1"
                  >
                    Start Safe Transit
                  </button>
                </div>

                {/* Details Section */}
                <div className="space-y-1 pt-2">
                  <h4 className="text-xs font-bold text-[#1C2C34]">Details</h4>
                  <p className="text-[11px] text-[#5A6E78] leading-relaxed">
                    Verified illuminated transit path with Punjab Safe City surveillance and automated guardian check-ins... <span className="font-semibold text-[#1C2C34] cursor-pointer">See more</span>
                  </p>
                </div>

                {/* Amenities Icons */}
                <div className="flex items-center space-x-4 pt-1 text-center">
                  <div className="space-y-0.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F4F4] flex items-center justify-center mx-auto text-[#1C2C34]">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] text-[#5A6E78]">Wi-Fi</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F4F4] flex items-center justify-center mx-auto text-[#1C2C34]">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] text-[#5A6E78]">CCTV</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F4F4] flex items-center justify-center mx-auto text-[#1C2C34]">
                      <Sun className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] text-[#5A6E78]">Lit</span>
                  </div>
                </div>

                {/* Crowd Rate / Safety Bar Chart */}
                <div className="space-y-1.5 pt-2">
                  <h4 className="text-xs font-bold text-[#1C2C34]">Crowd & Safety Rate</h4>
                  <div className="flex items-end justify-between h-10 px-2 pt-1">
                    {[
                      { time: '9am', h: 'h-3', color: 'bg-[#ECF4F4]' },
                      { time: '11am', h: 'h-6', color: 'bg-[#C4DCDC]' },
                      { time: '12am', h: 'h-8', color: 'bg-[#FC7454]' },
                      { time: '2pm', h: 'h-4', color: 'bg-[#ECF4F4]' },
                      { time: '4pm', h: 'h-5', color: 'bg-[#BCD4D4]' },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center space-y-1">
                        <div className={`w-4 ${bar.h} ${bar.color} rounded-sm transition-all`} />
                        <span className="text-[9px] text-[#5A6E78]">{bar.time}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-center text-[#5A6E78] pt-0.5">
                    Most safe & active on <span className="font-semibold text-[#1C2C34]">Monday</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
