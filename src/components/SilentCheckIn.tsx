/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  X, 
  AlertCircle, 
  Check, 
  Bell, 
  PhoneCall, 
  Sparkles,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Square,
  Menu
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppLanguage, SilentCheckInSession, UserProfile, UserContact } from '../types';

interface SilentCheckInProps {
  language: AppLanguage;
  user: UserProfile | null;
  onOpenCrisis: () => void;
}

export const SilentCheckIn: React.FC<SilentCheckInProps> = ({
  language,
  user,
  onOpenCrisis
}) => {
  const isUrdu = language === 'ur';

  // Default contacts
  const defaultContacts: UserContact[] = [
    { id: 'c1', name: 'Ayesha (Mom)', relation: 'Mother', phone: '+92 300 1234567', isDefaultNotified: true },
    { id: 'c2', name: 'Zain (Brother)', relation: 'Brother', phone: '+92 321 9876543', isDefaultNotified: true },
    { id: 'c3', name: 'Fatima (Friend)', relation: 'Friend', phone: '+92 333 4567890', isDefaultNotified: false }
  ];

  const availableContacts = user?.emergencyContacts && user.emergencyContacts.length > 0
    ? user.emergencyContacts
    : defaultContacts;

  // Setup form states
  const [destination, setDestination] = useState<string>('Gulberg Main → MM Alam');
  const [durationMinutes, setDurationMinutes] = useState<number>(21);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(['c1', 'c2']);
  
  // Active check-in state
  const [activeSession, setActiveSession] = useState<SilentCheckInSession | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState<number>(21);
  const [showSafeCelebration, setShowSafeCelebration] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeSessionIndex, setActiveSessionIndex] = useState<number>(21);

  // Toggle contact selection
  const handleToggleContact = (id: string) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Start check in
  const handleStartCheckIn = () => {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + durationMinutes * 60000);
    const timeStr = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const selectedNames = availableContacts
      .filter(c => selectedContactIds.includes(c.id))
      .map(c => c.name);

    const session: SilentCheckInSession = {
      id: `checkin-${Date.now()}`,
      destination,
      expectedMinutes: durationMinutes,
      remainingMinutes: durationMinutes,
      expectedTimeStr: timeStr,
      selectedContactIds,
      selectedContactNames: selectedNames,
      isRunning: true,
      isCompleted: false,
      status: 'active',
      locationSharingActive: true,
      startTime: now.toISOString()
    };

    setActiveSession(session);
    setRemainingMinutes(durationMinutes);
    setIsPlaying(true);
  };

  // Timer countdown simulation
  useEffect(() => {
    let timer: any;
    if (activeSession && activeSession.isRunning && isPlaying) {
      timer = setInterval(() => {
        setRemainingMinutes(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 8000);
    }
    return () => clearInterval(timer);
  }, [activeSession, isPlaying]);

  // Extend time
  const handleExtendTime = (extraMin: number = 15) => {
    if (!activeSession) return;
    setRemainingMinutes(prev => prev + extraMin);
  };

  // Confirm safe
  const handleConfirmSafe = () => {
    setShowSafeCelebration(true);
    setTimeout(() => {
      setShowSafeCelebration(false);
      setActiveSession(null);
    }, 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-3.5 sm:px-6 py-4 space-y-4 text-[#181A20] dark:text-[#F9FAFB]">
      {/* Celebration Notification */}
      {showSafeCelebration && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-3xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#0F1117] font-black text-center text-xs flex items-center justify-center space-x-2 shadow-md"
        >
          <CheckCircle2 className="w-5 h-5 text-white dark:text-[#0F1117]" />
          <span>{isUrdu ? 'حفاظتی اطلاع بھیج دی گئی: آپ محفوظ ہیں!' : 'Safety Network Notified: You are safe & secure!'}</span>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 1. SETUP SCREEN (When no active session)                                  */}
      {/* ========================================================================= */}
      {!activeSession && (
        <div className="rounded-3xl bg-white dark:bg-[#181B24] p-5 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-5 transition-colors">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[11px] font-black tracking-[0.2em] text-[#9333EA] dark:text-[#C084FC] uppercase block">
              {isUrdu ? 'حفاظتی ٹائمر' : 'PROTECTION PROTOCOL'}
            </span>
            <h2 className="text-lg sm:text-xl font-black tracking-[0.12em] text-[#181A20] dark:text-white uppercase">
              {isUrdu ? 'خاموش چیک ان سیشن' : 'SILENT ARRIVAL CHECK-IN'}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium">
              {isUrdu ? 'اگر آپ وقت پر نہ پہنچیں تو فوری الرٹ بھیج دیا جائے گا' : 'Automated emergency dispatch if destination is not confirmed'}
            </p>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black tracking-wider text-[#181A20] dark:text-slate-300 uppercase">
              {isUrdu ? 'منزل کا انتخاب' : 'WHERE ARE YOU HEADED?'}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#9333EA] dark:text-[#C084FC]" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination (e.g. MM Alam, University, Home)"
                className="w-full bg-[#F8F9FD] dark:bg-[#12141C] border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-[#181A20] dark:text-white focus:outline-none focus:border-[#9333EA] dark:focus:border-[#C084FC]"
              />
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black tracking-wider text-[#181A20] dark:text-slate-300 uppercase">
                {isUrdu ? 'متوقع وقت' : 'EXPECTED TRANSIT TIME'}
              </label>
              <span className="text-xs font-black text-[#9333EA] dark:text-[#C084FC] bg-[#F5EEFD] dark:bg-[#2D1F47] border border-[#E9D5FF] dark:border-[#581C87] px-2.5 py-0.5 rounded-full">
                {durationMinutes} min
              </span>
            </div>

            {/* Presets */}
            <div className="flex space-x-2 pt-1">
              {[15, 21, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setDurationMinutes(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    durationMinutes === m
                      ? 'bg-[#181A20] dark:bg-[#C084FC] text-white dark:text-[#0F1117] shadow-xs'
                      : 'bg-[#F8F9FD] dark:bg-[#12141C] text-[#6B7280] dark:text-slate-400 hover:bg-[#F5EEFD] dark:hover:bg-[#26193E] hover:text-[#181A20] dark:hover:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-black tracking-wider text-[#181A20] dark:text-slate-300 uppercase flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-[#9333EA] dark:text-[#C084FC]" />
              <span>{isUrdu ? 'گارڈین رابطے' : 'WHO SHOULD WE NOTIFY?'}</span>
            </label>

            <div className="space-y-2">
              {availableContacts.map((contact) => {
                const isChecked = selectedContactIds.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => handleToggleContact(contact.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isChecked
                        ? 'bg-[#F5EEFD] dark:bg-[#2D1F47] border-[#E9D5FF] dark:border-[#581C87] text-[#181A20] dark:text-white'
                        : 'bg-[#F8F9FD] dark:bg-[#12141C] border-slate-200 dark:border-slate-700 text-[#6B7280] dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${
                        isChecked ? 'bg-[#181A20] dark:bg-[#C084FC] text-white dark:text-[#0F1117]' : 'border border-slate-300 dark:border-slate-600'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-white dark:text-[#0F1117]" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#181A20] dark:text-white">
                          {contact.name}
                        </h4>
                        <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                          {contact.relation} • {contact.phone}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#9333EA] dark:text-[#C084FC]">
                      {isChecked ? 'SELECTED' : '+ ADD'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartCheckIn}
            disabled={!destination.trim() || selectedContactIds.length === 0}
            className="w-full py-4 rounded-2xl bg-[#181A20] dark:bg-[#C084FC] hover:bg-slate-800 dark:hover:bg-[#D8B4FE] disabled:opacity-50 text-white dark:text-[#0F1117] font-black text-xs tracking-[0.2em] uppercase shadow-md transition-all active:scale-98 cursor-pointer"
          >
            {isUrdu ? 'سیشن شروع کریں' : 'START SESSION'}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE SESSION PLAYER (Screen 3 Design)                                */}
      {/* ========================================================================= */}
      {activeSession && (
        <div className="rounded-3xl bg-white dark:bg-[#181B24] p-6 sm:p-7 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6 transition-colors">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setActiveSession(null)}
              className="p-2 hover:bg-[#F5EEFD] dark:hover:bg-[#26193E] rounded-full transition cursor-pointer text-[#181A20] dark:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-16 h-1.5 bg-[#B886FD] dark:bg-[#C084FC] rounded-full" />
            <button
              onClick={onOpenCrisis}
              className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-[10px] font-black tracking-wider uppercase cursor-pointer"
            >
              SOS 15
            </button>
          </div>

          {/* Session Header & Circular Controls */}
          <div className="text-center space-y-4 py-2">
            <h3 className="text-xs font-black tracking-[0.2em] text-[#181A20] dark:text-white uppercase">
              SESSION {activeSessionIndex}
            </h3>

            {/* Circular Controls: Stop, Pause/Play, Repeat */}
            <div className="flex items-center justify-center space-x-4">
              {/* Stop Button */}
              <button
                onClick={() => setIsPlaying(false)}
                className="w-10 h-10 rounded-full bg-[#F5EEFD] dark:bg-[#2D1F47] hover:bg-[#E9D5FF] dark:hover:bg-[#3B1D54] flex items-center justify-center text-[#9333EA] dark:text-[#C084FC] transition shadow-xs active:scale-95 cursor-pointer"
                title="Stop Timer"
              >
                <Square className="w-3.5 h-3.5 fill-[#9333EA] dark:fill-[#C084FC]" />
              </button>

              {/* Main Large Charcoal Pause/Play */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-[#181A20] dark:bg-[#C084FC] hover:bg-slate-800 dark:hover:bg-[#D8B4FE] flex items-center justify-center text-white dark:text-[#0F1117] transition shadow-lg active:scale-95 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-white dark:fill-[#0F1117]" />
                ) : (
                  <Play className="w-6 h-6 fill-white dark:fill-[#0F1117] ml-0.5" />
                )}
              </button>

              {/* Repeat / Restart */}
              <button
                onClick={() => {
                  setIsPlaying(true);
                  setRemainingMinutes(activeSession.expectedMinutes);
                }}
                className="w-10 h-10 rounded-full bg-[#F5EEFD] dark:bg-[#2D1F47] hover:bg-[#E9D5FF] dark:hover:bg-[#3B1D54] flex items-center justify-center text-[#9333EA] dark:text-[#C084FC] transition shadow-xs active:scale-95 cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4 text-[#9333EA] dark:text-[#C084FC]" />
              </button>
            </div>

            {/* Status Text */}
            <h4 className="text-xs font-black tracking-[0.2em] text-[#181A20] dark:text-slate-200 uppercase pt-1">
              FEEL CALM • {remainingMinutes} MIN LEFT
            </h4>

            {/* Sound Wave Graphic */}
            <div className="flex items-center justify-center space-x-1.5 h-8 pt-1">
              {[14, 22, 10, 28, 16, 24, 8, 30, 18, 26, 12, 28, 14, 22, 16, 20].map((h, i) => (
                <span
                  key={i}
                  style={{ height: isPlaying ? `${h}px` : '4px' }}
                  className="w-0.5 bg-[#9333EA] dark:bg-[#C084FC] rounded-full transition-all duration-300"
                />
              ))}
            </div>
          </div>

          {/* Active Session Pills */}
          <div className="space-y-3 pt-2">
            {/* Active Pill (Solid Lavender / Lilac) */}
            <div className="w-full p-4 rounded-2xl bg-[#F5EEFD] dark:bg-[#2D1F47] border border-[#E9D5FF] dark:border-[#581C87] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-black tracking-[0.18em] text-[#9333EA] dark:text-[#C084FC] uppercase block">
                  SESSION {activeSessionIndex}
                </span>
                <p className="text-[11px] text-[#181A20] dark:text-slate-100 font-semibold mt-0.5">
                  {activeSession.destination}
                </p>
              </div>
              <button 
                onClick={handleConfirmSafe}
                className="px-3 py-1.5 rounded-full bg-[#181A20] dark:bg-[#C084FC] text-white dark:text-[#0F1117] text-[10px] font-black tracking-wider uppercase hover:scale-105 transition cursor-pointer"
              >
                I'M SAFE
              </button>
            </div>

            {/* Secondary Session Pills */}
            {[22, 23, 24].map((num) => (
              <div
                key={num}
                onClick={() => {
                  setActiveSessionIndex(num);
                  setRemainingMinutes(num);
                  setIsPlaying(true);
                }}
                className="w-full p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#12141C] hover:bg-[#F5EEFD] dark:hover:bg-[#26193E] border border-slate-100 dark:border-slate-800 flex items-center justify-between transition cursor-pointer group"
              >
                <span className="text-xs font-bold tracking-[0.18em] text-[#6B7280] dark:text-slate-400 group-hover:text-[#181A20] dark:group-hover:text-white uppercase">
                  SESSION {num}
                </span>
                <button className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-[#181A20] dark:group-hover:bg-[#C084FC] text-slate-600 dark:text-slate-300 group-hover:text-white dark:group-hover:text-[#0F1117] flex items-center justify-center transition-colors">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleConfirmSafe}
              className="w-full py-3.5 rounded-2xl bg-[#181A20] dark:bg-[#C084FC] hover:bg-slate-800 dark:hover:bg-[#D8B4FE] text-white dark:text-[#0F1117] font-black text-xs tracking-[0.15em] uppercase transition shadow-xs cursor-pointer flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#B886FD] dark:text-[#0F1117]" />
              <span>{isUrdu ? 'میں محفوظ ہوں (چیک ان مکمل)' : "I'M SAFE (CONFIRM ARRIVAL)"}</span>
            </button>

            <button
              onClick={() => handleExtendTime(15)}
              className="w-full py-2.5 rounded-2xl bg-white dark:bg-[#181B24] border border-slate-200 dark:border-slate-700 text-[#181A20] dark:text-slate-200 font-extrabold text-xs tracking-wider uppercase transition hover:bg-[#F5EEFD] dark:hover:bg-[#26193E] cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#9333EA] dark:text-[#C084FC]" />
              <span>{isUrdu ? '+ 15 منٹ بڑھائیں' : '+ EXTEND 15 MIN'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
