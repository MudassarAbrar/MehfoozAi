/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Navigation, 
  Users, 
  ThumbsUp, 
  Share2, 
  Plus, 
  Filter, 
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Eye,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveAlertItem, AppLanguage, UserProfile } from '../types';

interface ActiveAlertsProps {
  language: AppLanguage;
  user: UserProfile | null;
  onStartNavigation: () => void;
  onOpenReportModal: () => void;
}

export const ActiveAlerts: React.FC<ActiveAlertsProps> = ({
  language,
  user,
  onStartNavigation,
  onOpenReportModal
}) => {
  const isUrdu = language === 'ur';
  const [activeFilter, setActiveFilter] = useState<'all' | 'nearby'>('all');
  const [expandedAlertIds, setExpandedAlertIds] = useState<Set<string>>(new Set());
  const [upvotedAlerts, setUpvotedAlerts] = useState<Record<string, boolean>>({});
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<ActiveAlertItem[]>([
    {
      id: 'alert-1',
      type: 'harassment',
      title: 'Harassment Reported',
      titleUrdu: 'ہراساں کرنے کی اطلاع',
      severity: 'critical',
      tag: 'Avoid Crossing',
      tagUrdu: 'راستہ بدلیں',
      tagline: 'Avoid unlit tea stall corner • Use illuminated college avenue',
      taglineUrdu: 'کھوکھے کے پاس سے نہ گزریں • مرکزی روشن سڑک اختیار کریں',
      timeAgo: '12 min ago',
      distanceKm: 0.3,
      locationName: 'Mirpur Road / Near City College Crossing',
      district: user?.district || 'Lahore',
      description: 'Multiple women reported verbal harassment near the tea stall. Group of 3-4 men making inappropriate comments. Avoid this area if possible.',
      descriptionUrdu: 'چائے کے کھوکھے کے قریب 3 سے 4 افراد کی جانب سے آوازیں کسنے کی اطلاع ملی ہے۔ ممکن ہو تو اس راستے سے گریز کریں۔',
      affectedWomenCount: 8,
      verifiedCount: 12,
      reporterName: 'Fatima K.'
    },
    {
      id: 'alert-2',
      type: 'suspicious',
      title: 'Suspicious Activity',
      titleUrdu: 'مشکوک نقل و حرکت',
      severity: 'high',
      tag: 'Hazard Ahead',
      tagUrdu: 'تاریک سڑک',
      tagline: '200m blackout stretch • Walk along active commercial shopfronts',
      taglineUrdu: 'آگے اسٹریٹ لائٹس بند • دکانوں کے سامنے والے فٹ پاتھ پر رہیں',
      timeAgo: '25 min ago',
      distanceKm: 0.8,
      locationName: 'Commercial Market Alley, Block B',
      district: user?.district || 'Lahore',
      description: 'Unlit stretch with non-functional streetlights and 2 idling motorcycles without plates. Police helpline 15 informed.',
      descriptionUrdu: 'اسٹریٹ لائٹس بند ہیں اور بغیر نمبر پلیٹ مشکوک موٹرسائیکلیں موجود ہیں۔ 15 کو مطلع کر دیا گیا ہے۔',
      affectedWomenCount: 5,
      verifiedCount: 7,
      reporterName: 'Ayesha M.'
    },
    {
      id: 'alert-3',
      type: 'construction',
      title: 'Road Construction & Detour',
      titleUrdu: 'سڑک پر تعمیراتی کام',
      severity: 'medium',
      tag: 'Safe Bypass',
      tagUrdu: 'روشن متبادل',
      tagline: 'Sidewalk closed • Proceed via lighted service road',
      taglineUrdu: 'فٹ پاتھ پر کام جاری • روشن سروس روڈ سے گزریں',
      timeAgo: '1 hour ago',
      distanceKm: 1.4,
      locationName: 'Main Boulevard Underpass Link',
      district: user?.district || 'Lahore',
      description: 'Digging work ongoing. Sidewalk blocked for pedestrians. Use the well-lit service road instead.',
      descriptionUrdu: 'کھدائی کی وجہ سے فٹ پاتھ بند ہے۔ برائے مہربانی روشن سروس روڈ کا استعمال کریں۔',
      affectedWomenCount: 14,
      verifiedCount: 19,
      reporterName: 'Zainab T.'
    }
  ]);

  const toggleExpand = (id: string) => {
    setExpandedAlertIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (expandedAlertIds.size === filteredAlerts.length) {
      setExpandedAlertIds(new Set());
    } else {
      setExpandedAlertIds(new Set(filteredAlerts.map(a => a.id)));
    }
  };

  const toggleUpvote = (id: string) => {
    setUpvotedAlerts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleShare = (alert: ActiveAlertItem) => {
    const text = `Safety Alert: ${alert.title} at ${alert.locationName}. Verified on Mehfooz SafePath.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToast(alert.id);
      setTimeout(() => setCopiedToast(null), 2500);
    }
  };

  const filteredAlerts = activeFilter === 'nearby' 
    ? alerts.filter(a => a.distanceKm <= 1.0)
    : alerts;

  const allExpanded = filteredAlerts.length > 0 && expandedAlertIds.size === filteredAlerts.length;

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-4 text-[#1C2C34]">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-white border border-[#BCD4D4]/60 p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ECF4F4] flex items-center justify-center text-[#FC7454] border border-[#BCD4D4] shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C2C34]">
                {isUrdu ? 'فعال الرٹس' : 'Active Community Alerts'}
              </h2>
              <p className="text-[11px] text-[#5A6E78] font-medium leading-tight mt-0.5">
                {isUrdu ? 'تصدیق شدہ حفاظتی انتباہات' : 'Verified street safety updates'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#BCD4D4]" />
            <span>{isUrdu ? 'رپورٹ' : 'Report'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metric Pills */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-3 rounded-2xl bg-white border border-[#BCD4D4]/60 text-center shadow-xs">
          <span className="text-xl sm:text-2xl font-black text-rose-600 block">8</span>
          <span className="text-[11px] sm:text-xs text-[#5A6E78] font-bold truncate block">Active</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-[#BCD4D4]/60 text-center shadow-xs">
          <span className="text-xl sm:text-2xl font-black text-[#FC7454] block">3</span>
          <span className="text-[11px] sm:text-xs text-[#5A6E78] font-bold truncate block">Priority</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-[#BCD4D4]/60 text-center shadow-xs">
          <span className="text-xl sm:text-2xl font-black text-[#1C2C34] block">215</span>
          <span className="text-[11px] sm:text-xs text-[#5A6E78] font-bold truncate block">Helped</span>
        </div>
      </div>

      {/* 3. Filter Pills & Expand Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#1C2C34] text-white shadow-xs'
                : 'bg-white text-[#5A6E78] hover:bg-[#ECF4F4] border border-[#BCD4D4]/60 hover:text-[#1C2C34]'
            }`}
          >
            {isUrdu ? `تمام (${alerts.length})` : `All (${alerts.length})`}
          </button>
          <button
            onClick={() => setActiveFilter('nearby')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeFilter === 'nearby'
                ? 'bg-[#1C2C34] text-white shadow-xs'
                : 'bg-white text-[#5A6E78] hover:bg-[#ECF4F4] border border-[#BCD4D4]/60 hover:text-[#1C2C34]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#FC7454]" />
            <span>{isUrdu ? 'قریبی (2)' : 'Nearby (2)'}</span>
          </button>
        </div>

        <button
          onClick={toggleAll}
          className="text-[11px] font-bold text-[#5A6E78] hover:text-[#1C2C34] px-2.5 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer flex items-center space-x-1"
        >
          <span>
            {allExpanded 
              ? (isUrdu ? 'سب مختصر کریں' : 'Collapse All') 
              : (isUrdu ? 'سب تفصیل دیکھیں' : 'Expand All')}
          </span>
          {allExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {copiedToast && (
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
          {isUrdu ? 'الرٹ کلپ بورڈ پر کاپی ہو گیا!' : 'Alert information copied to clipboard!'}
        </div>
      )}

      {/* 4. Alert Cards List - Limited/Precise Preview with Dropdown Details */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isHigh = alert.severity === 'high';
          const isExpanded = expandedAlertIds.has(alert.id);
          const alertText = isUrdu && alert.descriptionUrdu ? alert.descriptionUrdu : alert.description;
          const alertTag = isUrdu && alert.tagUrdu ? alert.tagUrdu : alert.tag || (isUrdu ? 'مشورہ' : 'Advisory');
          const alertTagline = isUrdu && alert.taglineUrdu ? alert.taglineUrdu : alert.tagline || alertText;
          const upvoted = !!upvotedAlerts[alert.id];
          const totalUpvotes = (alert.verifiedCount || 12) + (upvoted ? 1 : 0);

          return (
            <div
              key={alert.id}
              className={`rounded-2xl sm:rounded-3xl bg-white border transition-all duration-200 shadow-xs overflow-hidden ${
                isExpanded
                  ? 'border-[#FC7454]/80 shadow-md ring-1 ring-[#FC7454]/10'
                  : 'border-[#BCD4D4]/60 hover:border-[#BCD4D4] hover:shadow-xs'
              }`}
            >
              {/* Clickable Header Area: Limited & Precise Text */}
              <div 
                onClick={() => toggleExpand(alert.id)}
                className="p-4 sm:p-5 cursor-pointer select-none space-y-2 hover:bg-[#F9FCFC]/60 transition-colors"
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(alert.id);
                  }
                }}
              >
                {/* Top Row: Severity Icon, Title, Time & Distance, Severity Badge & Chevron */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 ${
                      isCritical 
                        ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                        : isHigh 
                        ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                        : 'bg-[#ECF4F4] text-[#FC7454] border border-[#BCD4D4]'
                    }`}>
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-[#1C2C34] leading-tight truncate">
                        {isUrdu && alert.titleUrdu ? alert.titleUrdu : alert.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#5A6E78] font-medium mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-[#5A6E78]" />
                          <span>{alert.timeAgo}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1 text-[#1C2C34] font-semibold">
                          <MapPin className="w-3 h-3 text-[#FC7454]" />
                          <span>{alert.distanceKm} km</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline text-[#5A6E78] truncate max-w-[180px]">
                          {alert.locationName.split('/')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Dropdown Chevron */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isCritical 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : isHigh 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-[#ECF4F4] text-[#FC7454] border border-[#BCD4D4]'
                    }`}>
                      {alert.severity}
                    </span>
                    <div 
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isExpanded 
                          ? 'bg-[#1C2C34] text-white rotate-180' 
                          : 'bg-[#ECF4F4] text-[#1C2C34] hover:bg-[#BCD4D4]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* LIMITED & PRECISE TEXT: Minimal tag line with actionable advisory */}
                <p className="text-xs text-[#5A6E78] font-normal leading-snug pl-1 flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                    isCritical 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200/80' 
                      : isHigh 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/80' 
                      : 'bg-[#ECF4F4] text-[#1C2C34] border border-[#BCD4D4]/80'
                  }`}>
                    {alertTag}
                  </span>
                  <span className="font-semibold text-[#1C2C34] truncate">
                    {alertTagline}
                  </span>
                </p>

                {/* Compact Footer Status (when collapsed) */}
                {!isExpanded && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#5A6E78]">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'تصدیق شدہ' : 'Verified'}</span>
                      </span>
                      <span>•</span>
                      <span>{alert.affectedWomenCount} {isUrdu ? 'رپورٹ' : 'reported'}</span>
                    </div>

                    <span className="text-[11px] font-bold text-[#FC7454] hover:underline flex items-center space-x-1">
                      <span>{isUrdu ? 'مکمل تفصیل دیکھیں' : 'View Full Scenario'}</span>
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>

              {/* DROPDOWN EXPANDED SCENARIO */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-[#BCD4D4]/40 bg-[#FAFDFD]"
                  >
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Full Scenario Box */}
                      <div className="p-4 rounded-2xl bg-[#F4F4FC] border border-[#BCD4D4]/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#FC7454] flex items-center space-x-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-[#FC7454]" />
                            <span>{isUrdu ? 'مکمل رپورٹ شدہ صورتحال' : 'Full Incident Scenario'}</span>
                          </span>
                          <span className="text-[10px] font-semibold text-[#5A6E78] bg-white px-2 py-0.5 rounded-md border border-[#BCD4D4]/40">
                            {isUrdu ? 'کمیونٹی سگنل' : 'Real-time Signal'}
                          </span>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-[#1C2C34] font-medium leading-relaxed">
                          {alertText}
                        </p>

                        <div className="pt-2 border-t border-[#BCD4D4]/30 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A6E78]">
                          <span className="font-semibold text-rose-700">
                            {isUrdu 
                              ? 'حفاظتی مشورہ: روشن راستہ اختیار کریں اور ایمرجنسی میں 15 ملائیں۔' 
                              : 'Safety Advisory: Divert to well-lit corridor or call 15 for Dolphin patrol.'}
                          </span>
                        </div>
                      </div>

                      {/* Location Details & Navigation Action */}
                      <div className="p-3.5 rounded-2xl bg-white border border-[#BCD4D4]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-[#5A6E78] uppercase font-mono font-bold tracking-wider">
                            {isUrdu ? 'مقام اور قربت' : 'Exact Location'}
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-[#1C2C34] flex items-center space-x-1.5">
                            <MapPin className="w-4 h-4 text-[#FC7454] flex-shrink-0" />
                            <span>{alert.locationName}</span>
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={onStartNavigation}
                            className="px-4 py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Navigation className="w-3.5 h-3.5 text-[#BCD4D4]" />
                            <span>{isUrdu ? 'محفوظ راستہ لیں' : 'Navigate Safer Route'}</span>
                          </button>

                          <button
                            onClick={() => handleShare(alert)}
                            className="p-2 rounded-xl bg-[#ECF4F4] hover:bg-[#C4DCDC] text-[#1C2C34] transition cursor-pointer"
                            title={isUrdu ? 'شیئر الرٹ' : 'Share Alert'}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Community Verification & Upvotes */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-[#5A6E78]">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'تصدیق شدہ' : 'Verified'}</span>
                          </span>
                          <span>•</span>
                          <span className="text-[#5A6E78] font-medium">
                            {isUrdu ? `رپورٹر: ${alert.reporterName || 'کمیونٹی'}` : `by ${alert.reporterName || 'Community'}`}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1 text-[#1C2C34] font-semibold">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>{alert.affectedWomenCount} {isUrdu ? 'رپورٹس' : 'reports'}</span>
                          </span>

                          <button
                            onClick={() => toggleUpvote(alert.id)}
                            className={`flex items-center space-x-1 font-bold px-2.5 py-1 rounded-xl transition cursor-pointer text-xs ${
                              upvoted
                                ? 'bg-[#FC7454] text-white shadow-xs'
                                : 'bg-white border border-[#BCD4D4]/60 text-[#1C2C34] hover:bg-[#ECF4F4]'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3 text-[#FC7454]" />
                            <span>{totalUpvotes}</span>
                          </button>
                        </div>
                      </div>

                      {/* Collapse Handle Button */}
                      <div className="text-center pt-1">
                        <button
                          onClick={() => toggleExpand(alert.id)}
                          className="text-[11px] font-bold text-[#5A6E78] hover:text-[#1C2C34] inline-flex items-center space-x-1 transition cursor-pointer px-3 py-1 rounded-lg hover:bg-slate-100"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'تفصیل چھپائیں' : 'Collapse Scenario'}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
