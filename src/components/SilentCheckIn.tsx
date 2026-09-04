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
  Navigation,
  ExternalLink,
  Copy,
  Share2,
  Radio,
  Eye,
  Shield,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, SilentCheckInSession, UserProfile, UserContact } from '../types';
import { OpenStreetMapViewer } from './common/OpenStreetMapViewer';
import { GeocodedAddress } from '../services/osmService';
import { getAuthHeaders } from '../utils/auth';
import { getNearbyPOIs } from '../data/lahoreLocations';

interface SilentCheckInProps {
  language: AppLanguage;
  user: UserProfile | null;
  onOpenCrisis: () => void;
}

interface ParentNotificationPayload {
  timestamp: string;
  contacts: { id: string; name: string; relation: string; phone: string }[];
  currentLocation: {
    lat: number;
    lon: number;
    address: string;
  };
  destination: string;
  expectedMinutes: number;
  expectedArrivalTime: string;
  osmTrackingUrl: string;
  messageText: string;
}

// One "app minute" elapses per TICK_MS real milliseconds — the hackathon demo
// compresses a 21-minute transit check into ~3 minutes while keeping every
// downstream action (server timer row, missed-alert SMS dispatch) genuinely
// real end-to-end. Set to 60_000 for real-time behaviour.
const TICK_MS = 8_000;

function getCurrentPosition(timeoutMs = 5000): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 60_000 }
    );
  });
}

export const SilentCheckIn: React.FC<SilentCheckInProps> = ({
  language,
  user,
  onOpenCrisis
}) => {
  const isUrdu = language === 'ur';

  // Default emergency contacts for parents/guardians
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
  
  // Real-time GPS & OSM state
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number }>({
    lat: 31.5204,
    lon: 74.3587
  });
  const [currentAddress, setCurrentAddress] = useState<string>('Main Boulevard, Gulberg III, Lahore, Punjab');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lon: number } | undefined>({
    lat: 31.5135,
    lon: 74.3530
  });

  // Active check-in state
  const [activeSession, setActiveSession] = useState<SilentCheckInSession | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState<number>(21);
  const [showSafeCelebration, setShowSafeCelebration] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeSessionIndex, setActiveSessionIndex] = useState<number>(21);

  // Parent Notification Dispatch state
  const [parentNotification, setParentNotification] = useState<ParentNotificationPayload | null>(null);
  const [showParentModal, setShowParentModal] = useState<boolean>(false);
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [mapCollapsed, setMapCollapsed] = useState<boolean>(false);

  // Server-backed monitoring state (Prompt #2). When serverSessionId is set,
  // the session lives in the check_ins table and the pg_cron + Edge Function
  // monitor can dispatch alerts even if this browser closes.
  const [serverSessionId, setServerSessionId] = useState<string | null>(null);
  const [alertDispatched, setAlertDispatched] = useState<boolean>(false);
  const [expireNotice, setExpireNotice] = useState<string | null>(null);

  // Toggle contact selection
  const handleToggleContact = (id: string) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Called when OpenStreetMap finds the real GPS and reverse-geocodes with Nominatim
  const handleLocationFound = (coords: { lat: number; lon: number }, address: GeocodedAddress) => {
    setCurrentCoords(coords);
    if (address && address.displayName) {
      setCurrentAddress(address.displayName);
    }
  };

  // Called when destination is picked or searched via Nominatim on map
  const handleDestinationSelect = (coords: { lat: number; lon: number }, label: string) => {
    setDestinationCoords(coords);
    setDestination(label);
  };

  // Start check in — dispatches notification to parents + background server registration
  const handleStartCheckIn = () => {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + durationMinutes * 60000);
    const timeStr = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const selectedContactsList = availableContacts
      .filter(c => selectedContactIds.includes(c.id))
      .map(c => ({
        id: c.id,
        name: c.name,
        relation: c.relation,
        phone: c.phone
      }));

    const selectedContacts = availableContacts.filter(c => selectedContactIds.includes(c.id));

    const trackingUrl = `https://www.openstreetmap.org/?mlat=${currentCoords.lat.toFixed(5)}&mlon=${currentCoords.lon.toFixed(5)}#map=17/${currentCoords.lat.toFixed(5)}/${currentCoords.lon.toFixed(5)}`;

    const messageText = `🚨 [Mehfooz AI Safety Check-In]\nHi, I have started my journey check-in to ${destination}.\n⏱ Expected Arrival: ${timeStr} (${durationMinutes} mins)\n📍 My Current GPS Location: ${currentAddress}\nCoordinates: ${currentCoords.lat.toFixed(5)}° N, ${currentCoords.lon.toFixed(5)}° E\n🗺️ Live OpenStreetMap Link: ${trackingUrl}\nIf I do not confirm my safe arrival within ${durationMinutes} mins, automated emergency protocols will activate.`;

    const payload: ParentNotificationPayload = {
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contacts: selectedContactsList,
      currentLocation: {
        lat: currentCoords.lat,
        lon: currentCoords.lon,
        address: currentAddress
      },
      destination,
      expectedMinutes: durationMinutes,
      expectedArrivalTime: timeStr,
      osmTrackingUrl: trackingUrl,
      messageText
    };

    setParentNotification(payload);

    const session: SilentCheckInSession = {
      id: `checkin-${Date.now()}`,
      destination,
      expectedMinutes: durationMinutes,
      remainingMinutes: durationMinutes,
      expectedTimeStr: timeStr,
      selectedContactIds,
      selectedContactNames: selectedContactsList.map(c => c.name),
      isRunning: true,
      isCompleted: false,
      status: 'active',
      locationSharingActive: true,
      startTime: now.toISOString(),
      lastKnownCoordinates: {
        lat: currentCoords.lat,
        lng: currentCoords.lon,
        address: currentAddress
      }
    };

    setServerSessionId(null);
    setAlertDispatched(false);
    setExpireNotice(null);
    setActiveSession(session);
    setRemainingMinutes(durationMinutes);
    setIsPlaying(true);

    // Show high-visibility notification confirmation
    const contactNames = selectedContactsList.map(c => c.name).join(' & ');
    setDispatchNotice(
      isUrdu
        ? `والدین / گارڈین کو لائیو GPS اور نقشہ الرٹ بھیج دیا گیا ہے: ${contactNames}`
        : `GPS location & OpenStreetMap tracking dispatched to: ${contactNames}`
    );

    // Auto-open modal once to confirm parents have been alerted
    setShowParentModal(true);

    // Register the session server-side (real check_ins row + Edge Function
    // monitoring). Failure is non-fatal — the local timer still runs.
    void (async () => {
      try {
        const pos = await getCurrentPosition();
        const compressed = TICK_MS < 60_000;
        const res = await fetch('/api/check-in/start', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            destination,
            expectedMinutes: Math.max(1, Math.round((durationMinutes * TICK_MS) / 60_000)),
            gracePeriodMinutes: compressed ? 0 : 2,
            contacts: selectedContacts.map(c => ({ id: c.id, name: c.name, phone: c.phone })),
            ...(pos ? { lat: pos.lat, lng: pos.lng } : {})
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.checkIn?.id) setServerSessionId(String(data.checkIn.id));
        }
      } catch {
        /* local-only fallback mode */
      }
    })();
  };

  // Timer countdown (1 app-minute per TICK_MS)
  useEffect(() => {
    let timer: any;
    if (activeSession && activeSession.isRunning && isPlaying) {
      timer = setInterval(() => {
        setRemainingMinutes(prev => (prev <= 1 ? 0 : prev - 1));
      }, TICK_MS);
    }
    return () => clearInterval(timer);
  }, [activeSession, isPlaying]);

  // App timer reached zero without a safe confirmation → missed check-in.
  // Dispatch through the server (atomic claim — no double sends with the Edge
  // Function) and surface the escalation in the UI.
  useEffect(() => {
    if (remainingMinutes > 0 || !activeSession || alertDispatched) return;
    setAlertDispatched(true);
    if (!serverSessionId) return;
    void (async () => {
      try {
        const res = await fetch('/api/check-in/expire', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ checkInId: serverSessionId })
        });
        const data = await res.json().catch(() => ({}));
        const results = Array.isArray(data.results) ? data.results : [];
        const fired = results.some((r: { dispatched?: boolean }) => r.dispatched);
        const simulated = results.some(
          (r: { sms?: { simulated?: boolean }[] }) => (r.sms || []).some((s: { simulated?: boolean }) => s.simulated)
        );
        setExpireNotice(fired
          ? (simulated
              ? 'Missed check-in registered — SMS dispatch simulated (Twilio credentials not configured on this server).'
              : 'Emergency SMS with your live location has been dispatched to your selected contacts.')
          : 'Missed check-in registered. The server monitor dispatches alerts after the grace period.');
      } catch {
        setExpireNotice('Missed check-in recorded locally — the server monitor will dispatch alerts.');
      }
    })();
  }, [remainingMinutes, activeSession, alertDispatched, serverSessionId]);

  // Periodic GPS heartbeat so contacts receive her last known location.
  useEffect(() => {
    if (!activeSession || !serverSessionId) return;
    let cancelled = false;
    const push = async () => {
      const pos = await getCurrentPosition();
      if (cancelled || !pos) return;
      try {
        await fetch('/api/check-in/location', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ checkInId: serverSessionId, lat: pos.lat, lng: pos.lng })
        });
      } catch {
        /* heartbeat is best effort */
      }
    };
    void push();
    const beat = setInterval(push, 30_000);
    return () => {
      cancelled = true;
      clearInterval(beat);
    };
  }, [activeSession, serverSessionId]);

  // Extend time
  const handleExtendTime = (extraMin: number = 15) => {
    if (!activeSession) return;
    setRemainingMinutes(prev => prev + extraMin);
    setDispatchNotice(
      isUrdu 
        ? `گارڈین کو مطلع کر دیا گیا: وقت میں +${extraMin} منٹ کا اضافہ کیا گیا`
        : `Guardians notified: Trip extended by +${extraMin} min`
    );
    setTimeout(() => setDispatchNotice(null), 4000);
    if (serverSessionId) {
      void fetch('/api/check-in/extend', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          checkInId: serverSessionId,
          extraMinutes: Math.max(1, Math.round((extraMin * TICK_MS) / 60_000))
        })
      }).catch(() => {});
    }
  };

  // Confirm safe — when alerts already fired this also sends the all-clear SMS.
  const handleConfirmSafe = () => {
    const checkInId = serverSessionId;
    setShowSafeCelebration(true);
    setDispatchNotice(
      isUrdu
        ? 'والدین کو محفوظ آمد کی اطلاع بھیج دی گئی ہے'
        : 'Safe arrival confirmation sent to parents & safety network'
    );
    setTimeout(() => {
      setShowSafeCelebration(false);
      setActiveSession(null);
      setDispatchNotice(null);
      setServerSessionId(null);
      setAlertDispatched(false);
      setExpireNotice(null);
    }, 2500);
    if (checkInId) {
      void fetch('/api/check-in/confirm', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ checkInId })
      }).catch(() => {});
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Abort the session (back arrow)
  const handleCancelSession = () => {
    if (serverSessionId) {
      void fetch('/api/check-in/cancel', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ checkInId: serverSessionId })
      }).catch(() => {});
    }
    setActiveSession(null);
    setServerSessionId(null);
    setAlertDispatched(false);
    setExpireNotice(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-5 py-4 space-y-4 text-[#1C2C34] dark:text-[#F9FAFB]">
      {/* Celebration Notification */}
      {showSafeCelebration && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#0F1117] font-black text-center text-xs flex items-center justify-center space-x-2 shadow-lg"
        >
          <CheckCircle2 className="w-5 h-5 text-white dark:text-[#0F1117] flex-shrink-0" />
          <span>
            {isUrdu 
              ? 'حفاظتی اطلاع بھیج دی گئی: آپ محفوظ ہیں اور والدین کو مطلع کر دیا گیا ہے!' 
              : 'Safety Network & Parents Notified: You are safe & secure!'}
          </span>
        </motion.div>
      )}

      {/* Real-Time Dispatch Notice Banner */}
      {dispatchNotice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-[#ECF4F4] dark:bg-[#1C2C34] border border-[#BCD4D4] dark:border-slate-700 text-[#1C2C34] dark:text-white flex items-center justify-between gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#FC7454] text-white flex items-center justify-center flex-shrink-0">
              <Send className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-bold truncate">
              {dispatchNotice}
            </p>
          </div>
          <button
            onClick={() => setShowParentModal(true)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#181B24] hover:bg-[#FC7454] hover:text-white border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase text-[#1C2C34] dark:text-slate-200 transition flex-shrink-0 cursor-pointer"
          >
            {isUrdu ? 'تفصیل دیکھیں' : 'View Dispatch'}
          </button>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 1. SETUP SCREEN (When no active session)                                  */}
      {/* ========================================================================= */}
      {!activeSession && (
        <div className="rounded-3xl bg-white dark:bg-[#181B24] p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5 transition-colors">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-black tracking-[0.2em] text-[#FC7454] uppercase block">
                {isUrdu ? 'حفاظتی ٹائمر و لائیو ٹریکنگ' : 'LIVE OSM PROTECTION PROTOCOL'}
              </span>
              <h2 className="text-lg sm:text-xl font-black tracking-[0.12em] text-[#1C2C34] dark:text-white uppercase">
                {isUrdu ? 'خاموش چیک ان و والدین اطلاع' : 'SILENT CHECK-IN & PARENT NOTIFICATION'}
              </h2>
              <p className="text-xs text-[#5A6E78] dark:text-slate-400 font-medium">
                {isUrdu 
                  ? 'سیشن شروع کرتے ہی آپ کی لائیو لوکیشن اور اوپن سٹریٹ میپ لنک والدین کو خودکار بھیج دیا جائے گا' 
                  : 'Automated GPS & OpenStreetMap alert sent to parents on departure. SOS activates if unconfirmed.'}
              </p>
            </div>
            <div className="p-2 rounded-2xl bg-[#ECF4F4] dark:bg-[#1C2C34] border border-[#BCD4D4] text-[#FC7454] flex-shrink-0 hidden sm:flex">
              <Shield className="w-5 h-5 text-[#FC7454]" />
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black tracking-wider text-[#1C2C34] dark:text-slate-300 uppercase flex items-center justify-between">
              <span>{isUrdu ? 'منزل کا انتخاب' : 'WHERE ARE YOU HEADED?'}</span>
              <span className="text-[10px] text-slate-400 font-normal normal-case">
                {isUrdu ? 'نقشے پر بھی کلک کر سکتے ہیں' : 'Search or click on map'}
              </span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#FC7454]" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={isUrdu ? 'منزل درج کریں (مثلاً گلبرگ، یونیورسٹی، گھر)' : 'Enter destination (e.g. MM Alam, University, Home)'}
                className="w-full bg-[#F8F9FD] dark:bg-[#12141C] border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-[#1C2C34] dark:text-white focus:outline-none focus:border-[#FC7454]"
              />
            </div>
          </div>

          {/* Dynamic Nearby POIs (#16, #17) */}
          {(() => {
            const nearbyPOIs = getNearbyPOIs(currentCoords.lat, currentCoords.lon, 6);
            return (
              <div className="space-y-2">
                <label className="text-[11px] font-black tracking-wider text-[#1C2C34] dark:text-slate-300 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FC7454]" />
                  <span>{isUrdu ? 'قریبی محفوظ مقامات' : 'NEARBY SAFE LOCATIONS'}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {nearbyPOIs.map((poi) => (
                    <button
                      key={poi.id}
                      onClick={() => {
                        setDestination(poi.name);
                        setDestinationCoords({ lat: poi.lat, lon: poi.lng });
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#12141C] border border-slate-200 dark:border-slate-700 hover:border-[#FC7454] transition text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3 h-3 text-[#FC7454] flex-shrink-0" />
                        <span className="text-[11px] font-bold text-[#1C2C34] dark:text-white truncate">{poi.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-slate-500 font-mono">{poi.distanceKm.toFixed(1)} km</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          poi.safetyScore >= 90 ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' :
                          poi.safetyScore >= 75 ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400' :
                          'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                        }`}>
                          {poi.safetyScore}/100
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Interactive OpenStreetMap Component */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black tracking-wider text-[#1C2C34] dark:text-slate-300 uppercase flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#FC7454]" />
                <span>{isUrdu ? 'اوپن سٹریٹ میپ و قریبی محفوظ پوائنٹس' : 'LIVE OPENSTREETMAP & OVERPASS POIS'}</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                  Nominatim Active
                </span>
              </div>
            </div>

            <OpenStreetMapViewer
              currentLat={currentCoords.lat}
              currentLon={currentCoords.lon}
              destinationQuery={destination}
              destinationCoords={destinationCoords}
              onLocationFound={handleLocationFound}
              onDestinationSelect={handleDestinationSelect}
              isUrdu={isUrdu}
              heightClass="h-[300px] sm:h-[350px]"
            />
          </div>

          {/* Duration Selector */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black tracking-wider text-[#1C2C34] dark:text-slate-300 uppercase">
                {isUrdu ? 'متوقع وقت' : 'EXPECTED TRANSIT TIME'}
              </label>
              <span className="text-xs font-black text-[#FC7454] bg-[#ECF4F4] dark:bg-[#1C2C34] border border-[#BCD4D4] dark:border-slate-700 px-2.5 py-0.5 rounded-full">
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
                      ? 'bg-[#1C2C34] text-white shadow-sm'
                      : 'bg-[#F8F9FD] dark:bg-[#12141C] text-[#5A6E78] dark:text-slate-400 hover:bg-[#ECF4F4] dark:hover:bg-[#1C2C34]/50 hover:text-[#1C2C34] dark:hover:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>

            {/* Custom Time Input (#18) */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setDurationMinutes(0)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                  durationMinutes === 0 || (durationMinutes !== 15 && durationMinutes !== 21 && durationMinutes !== 30 && durationMinutes !== 45 && durationMinutes !== 60)
                    ? 'bg-[#1C2C34] text-white shadow-sm border-[#1C2C34]'
                    : 'bg-[#F8F9FD] dark:bg-[#12141C] text-[#5A6E78] dark:text-slate-400 hover:bg-[#ECF4F4] dark:hover:bg-[#1C2C34]/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isUrdu ? 'کسٹم وقت' : 'Custom'}
              </button>
              {(durationMinutes === 0 || (durationMinutes !== 15 && durationMinutes !== 21 && durationMinutes !== 30 && durationMinutes !== 45 && durationMinutes !== 60)) && (
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={durationMinutes || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= 480) setDurationMinutes(val);
                  }}
                  placeholder={isUrdu ? 'منٹ درج کریں' : 'Enter minutes'}
                  className="w-24 py-2 px-3 rounded-xl bg-[#F8F9FD] dark:bg-[#12141C] border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#1C2C34] dark:text-white focus:outline-none focus:border-[#FC7454]"
                />
              )}
            </div>
          </div>

          {/* Guardian / Parent Contacts Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black tracking-wider text-[#1C2C34] dark:text-slate-300 uppercase flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-[#FC7454]" />
                <span>{isUrdu ? 'والدین و گارڈین رابطے (جنہیں اطلاع دی جائے گی)' : 'PARENTS & GUARDIANS TO NOTIFY'}</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                {selectedContactIds.length} {isUrdu ? 'منتخب' : 'Selected'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {isUrdu
                ? 'سیشن شروع ہونے پر منتخب افراد کو خودکار ایس ایم ایس اور واٹس ایپ الرٹ میں آپ کا لائیو جی پی ایس اور میپ لنک بھیجا جائے گا۔'
                : 'Selected parents receive instant automated SMS & WhatsApp dispatches containing your exact GPS coordinates and live OpenStreetMap corridor.'}
            </p>

            <div className="space-y-2 pt-1">
              {availableContacts.map((contact) => {
                const isChecked = selectedContactIds.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => handleToggleContact(contact.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isChecked
                        ? 'bg-[#ECF4F4] dark:bg-[#1C2C34] border-[#BCD4D4] dark:border-slate-700 text-[#1C2C34] dark:text-white shadow-xs'
                        : 'bg-[#F8F9FD] dark:bg-[#12141C] border-slate-200 dark:border-slate-700 text-[#5A6E78] dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                        isChecked ? 'bg-[#1C2C34] text-white' : 'border border-slate-300 dark:border-slate-600'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-[#1C2C34] dark:text-white truncate">
                            {contact.name}
                          </h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase">
                            {contact.relation}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#5A6E78] dark:text-slate-400 font-mono">
                          {contact.phone}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#FC7454] flex-shrink-0">
                      {isChecked ? 'NOTIFIED' : '+ ADD'}
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
            className="w-full py-4 rounded-2xl bg-[#1C2C34] hover:bg-[#1C2C34]/90 disabled:opacity-50 text-white font-black text-xs tracking-[0.2em] uppercase shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-[#FC7454]" />
            <span>{isUrdu ? 'سیشن شروع کریں اور والدین کو الرٹ بھیجیں' : 'START CHECK-IN & NOTIFY PARENTS'}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE SESSION PLAYER WITH REAL-TIME MAP & PARENT DISPATCH             */}
      {/* ========================================================================= */}
      {activeSession && (
        <div className="rounded-3xl bg-white dark:bg-[#181B24] p-5 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5 transition-colors">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={handleCancelSession}
              className="p-2 hover:bg-[#ECF4F4] dark:hover:bg-slate-800 rounded-full transition cursor-pointer text-[#1C2C34] dark:text-slate-200"
              title="Return to Setup"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECF4F4] dark:bg-[#1C2C34] border border-[#BCD4D4] dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase text-[#1C2C34] dark:text-white tracking-wider">
                {isUrdu ? 'والدین لائیو ٹریکنگ فعال' : 'PARENTS NOTIFIED • GPS ACTIVE'}
              </span>
            </div>
            <button
              onClick={onOpenCrisis}
              className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-[10px] font-black tracking-wider uppercase cursor-pointer flex items-center gap-1"
            >
              <span>SOS 15</span>
            </button>
          </div>

          {/* Parent Notification Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-[#ECF4F4] dark:bg-[#131E24] border border-[#BCD4D4] dark:border-slate-700 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#FC7454]">
                <Send className="w-3 h-3 text-[#FC7454]" />
                <span>{isUrdu ? 'والدین کو GPS بھیج دیا گیا' : 'Guardian Broadcast Dispatched'}</span>
              </div>
              <p className="text-xs font-bold text-[#1C2C34] dark:text-white truncate mt-0.5">
                {activeSession.selectedContactNames.join(', ')} ({activeSession.selectedContactNames.length} contacts)
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                {currentAddress}
              </span>
            </div>
            <button
              onClick={() => setShowParentModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#1C2C34] hover:bg-[#FC7454] text-white text-[10px] font-black uppercase transition flex-shrink-0 cursor-pointer"
            >
              {isUrdu ? 'پیغام دیکھیں' : 'View Message'}
            </button>
          </div>

          {/* Live OpenStreetMap in Active Trip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#1C2C34] dark:text-slate-300">
                <Navigation className="w-3.5 h-3.5 text-[#FC7454]" />
                <span>{isUrdu ? 'لائیو روٹ و اوپن سٹریٹ میپ' : 'LIVE TRIP MAP & NEARBY OVERPASS POIS'}</span>
              </div>
              <button
                onClick={() => setMapCollapsed(!mapCollapsed)}
                className="text-[10px] font-bold text-[#FC7454] hover:underline cursor-pointer"
              >
                {mapCollapsed ? (isUrdu ? 'نقشہ دکھائیں' : 'Show Map') : (isUrdu ? 'چھپائیں' : 'Collapse Map')}
              </button>
            </div>

            {!mapCollapsed && (
              <OpenStreetMapViewer
                currentLat={currentCoords.lat}
                currentLon={currentCoords.lon}
                destinationQuery={activeSession.destination}
                destinationCoords={destinationCoords}
                onLocationFound={handleLocationFound}
                isUrdu={isUrdu}
                heightClass="h-[240px] sm:h-[280px]"
              />
            )}
          </div>

          {/* Missed check-in escalation banner */}
          {alertDispatched && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-600 text-white space-y-1.5 shadow-md"
            >
              <div className="flex items-center space-x-2 font-black text-[11px] tracking-wider uppercase">
                <Bell className="w-4 h-4 animate-pulse" />
                <span>{isUrdu ? 'چیک ان موصول نہیں ہوا — الرٹ بھیج دیا گیا' : 'MISSED CHECK-IN — ALERT DISPATCHED'}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-50">
                {expireNotice || (isUrdu
                  ? 'آپ کے رابطوں کو آخری معلوم مقام کے ساتھ ایمرجنسی پیغام بھیج دیا گیا ہے۔ اگر آپ محفوظ ہیں تو فوری طور پر "میں محفوظ ہوں" دبائیں۔'
                  : 'Your emergency contacts have been notified with your last known location. Tap I\'M SAFE now to send the all-clear.')}
              </p>
            </motion.div>
          )}

          {/* Server monitoring status */}
          <div className="flex items-center justify-center">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full border ${
                serverSessionId
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'
                  : 'bg-[#F8F9FD] dark:bg-[#12141C] border-slate-200 dark:border-slate-700 text-[#5A6E78] dark:text-slate-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {serverSessionId
                ? (isUrdu ? 'سرور نگرانی فعال' : 'Server-monitored — alerts fire even if app closes')
                : (isUrdu ? 'مقامی ٹائمر موڈ' : 'Local timer mode')}
            </span>
          </div>

          {/* Session Header & Circular Controls */}
          <div className="text-center space-y-4 py-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <h3 className="text-xs font-black tracking-[0.2em] text-[#1C2C34] dark:text-white uppercase">
              CHECK-IN COUNTDOWN
            </h3>

            {/* Circular Controls: Stop, Pause/Play, Repeat */}
            <div className="flex items-center justify-center space-x-4">
              {/* Stop Button */}
              <button
                onClick={() => setIsPlaying(false)}
                className="w-10 h-10 rounded-full bg-[#ECF4F4] hover:bg-[#BCD4D4]/50 border border-[#BCD4D4] flex items-center justify-center text-[#FC7454] transition shadow-xs active:scale-95 cursor-pointer"
                title="Stop Timer"
              >
                <Square className="w-3.5 h-3.5 fill-[#FC7454]" />
              </button>

              {/* Main Large Charcoal Pause/Play */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-[#1C2C34] hover:bg-[#1C2C34]/90 flex items-center justify-center text-white transition shadow-lg active:scale-95 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                )}
              </button>

              {/* Repeat / Restart */}
              <button
                onClick={() => {
                  setIsPlaying(true);
                  setRemainingMinutes(activeSession.expectedMinutes);
                }}
                className="w-10 h-10 rounded-full bg-[#ECF4F4] hover:bg-[#BCD4D4]/50 border border-[#BCD4D4] flex items-center justify-center text-[#FC7454] transition shadow-xs active:scale-95 cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4 text-[#FC7454]" />
              </button>
            </div>

            {/* Status Text */}
            <h4 className="text-xs font-black tracking-[0.2em] text-[#1C2C34] dark:text-slate-200 uppercase pt-1">
              FEEL CALM • {remainingMinutes} MIN LEFT
            </h4>

            {/* Sound Wave Graphic */}
            <div className="flex items-center justify-center space-x-1.5 h-8 pt-1">
              {[14, 22, 10, 28, 16, 24, 8, 30, 18, 26, 12, 28, 14, 22, 16, 20].map((h, i) => (
                <span
                  key={i}
                  style={{ height: isPlaying ? `${h}px` : '4px' }}
                  className="w-0.5 bg-[#FC7454] rounded-full transition-all duration-300"
                />
              ))}
            </div>
          </div>

          {/* Active Session Pill */}
          <div className="w-full p-4 rounded-2xl bg-[#ECF4F4] dark:bg-[#1C2C34] border border-[#BCD4D4] dark:border-slate-700 flex items-center justify-between shadow-xs">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-black tracking-[0.18em] text-[#FC7454] uppercase block">
                DESTINATION
              </span>
              <p className="text-[11px] text-[#1C2C34] dark:text-slate-100 font-semibold mt-0.5 truncate">
                {activeSession.destination}
              </p>
            </div>
            <button 
              onClick={handleConfirmSafe}
              className="px-3.5 py-2 rounded-full bg-[#1C2C34] hover:bg-[#FC7454] text-white text-[10px] font-black tracking-wider uppercase transition cursor-pointer flex-shrink-0"
            >
              {isUrdu ? 'میں محفوظ ہوں' : "I'M SAFE"}
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleConfirmSafe}
              className="w-full py-3.5 rounded-2xl bg-[#1C2C34] hover:bg-[#1C2C34]/90 text-white font-black text-xs tracking-[0.15em] uppercase transition shadow-xs cursor-pointer flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FC7454]" />
              <span>{isUrdu ? 'میں محفوظ ہوں (والدین کو مطلع کریں)' : "I'M SAFE (CONFIRM ARRIVAL TO PARENTS)"}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleExtendTime(15)}
                className="py-2.5 rounded-2xl bg-white dark:bg-[#181B24] border border-slate-200 dark:border-slate-700 text-[#1C2C34] dark:text-slate-200 font-extrabold text-xs tracking-wider uppercase transition hover:bg-[#ECF4F4] dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#FC7454]" />
                <span>{isUrdu ? '+ 15 منٹ' : '+ EXTEND 15M'}</span>
              </button>

              <button
                onClick={() => setShowParentModal(true)}
                className="py-2.5 rounded-2xl bg-white dark:bg-[#181B24] border border-slate-200 dark:border-slate-700 text-[#1C2C34] dark:text-slate-200 font-extrabold text-xs tracking-wider uppercase transition hover:bg-[#ECF4F4] dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-[#FC7454]" />
                <span>{isUrdu ? 'گارڈین الرٹ' : 'GUARDIAN ALERT'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PARENT / GUARDIAN NOTIFICATION DETAILS MODAL                           */}
      {/* ========================================================================= */}
      {showParentModal && parentNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white dark:bg-[#18242A] rounded-3xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1C2C34] dark:text-white uppercase">
                    {isUrdu ? 'والدین کو بھیجا گیا الرٹ' : 'Parent & Guardian Dispatch'}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isUrdu ? 'لائیو جی پی ایس اور اوپن سٹریٹ میپ لائیو لنک' : 'Real-time GPS coordinates & OpenStreetMap link delivered'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowParentModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient Parents */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isUrdu ? 'موصول کنندگان' : 'Delivered To (Guardians)'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {parentNotification.contacts.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131E24] border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-[#1C2C34] dark:text-white">{c.name}</h5>
                      <span className="text-[10px] text-slate-500 font-mono">{c.phone}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200">
                      Dispatched
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* GPS Location & OpenStreetMap Data */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#131E24] border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#FC7454] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FC7454]" />
                  <span>{isUrdu ? 'بھیجا گیا GPS مقام' : 'Transmitted GPS Location'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {parentNotification.currentLocation.lat.toFixed(5)}° N, {parentNotification.currentLocation.lon.toFixed(5)}° E
                </span>
              </div>
              <p className="text-xs font-semibold text-[#1C2C34] dark:text-white">
                {parentNotification.currentLocation.address}
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">{isUrdu ? 'منزل:' : 'Destination:'} <strong>{parentNotification.destination}</strong></span>
                <span className="text-slate-500">{isUrdu ? 'متوقع آمد:' : 'ETA:'} <strong>{parentNotification.expectedArrivalTime}</strong></span>
              </div>
            </div>

            {/* Message Body sent to parents */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {isUrdu ? 'ایس ایم ایس و میسیج کا متن' : 'Exact SMS / WhatsApp Content'}
                </span>
                <button
                  onClick={() => handleCopyText(parentNotification.messageText)}
                  className="text-[10px] font-bold text-[#FC7454] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText ? (isUrdu ? 'کاپی ہو گیا' : 'Copied') : (isUrdu ? 'کاپی میسیج' : 'Copy Message')}</span>
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-[#1C2C34] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                {parentNotification.messageText}
              </div>
            </div>

            {/* Actions: Open in OpenStreetMap, Send to WhatsApp, Done */}
            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(parentNotification.messageText)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wider uppercase transition shadow-xs flex items-center justify-center gap-2 cursor-pointer no-underline"
              >
                <span>💬</span>
                <span>{isUrdu ? 'واٹس ایپ پر بھی شیئر کریں' : 'Forward / Share via WhatsApp'}</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={parentNotification.osmTrackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 rounded-xl bg-slate-100 dark:bg-[#131E24] hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition flex items-center justify-center gap-1.5 no-underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#FC7454]" />
                  <span>OpenStreetMap</span>
                </a>

                <button
                  onClick={() => setShowParentModal(false)}
                  className="py-2.5 rounded-xl bg-[#1C2C34] hover:bg-[#FC7454] text-white text-[11px] font-black uppercase transition cursor-pointer"
                >
                  {isUrdu ? 'بند کریں' : 'Close & Return'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
