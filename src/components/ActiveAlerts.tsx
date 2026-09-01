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
  Eye,
  Radio
} from 'lucide-react';
import { motion } from 'motion/react';
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

  const [alerts, setAlerts] = useState<ActiveAlertItem[]>([
    {
      id: 'alert-1',
      type: 'harassment',
      title: 'Harassment Reported',
      titleUrdu: 'ہراساں کرنے کی اطلاع',
      severity: 'critical',
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

  const filteredAlerts = activeFilter === 'nearby' 
    ? alerts.filter(a => a.distanceKm <= 1.0)
    : alerts;

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-4 text-[#181A20]">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5EEFD] flex items-center justify-center text-[#9333EA] border border-[#E9D5FF] shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#181A20]">
                {isUrdu ? 'فعال الرٹس' : 'Active Community Alerts'}
              </h2>
              <p className="text-xs text-[#6B7280] font-medium">
                {isUrdu ? 'ریئل ٹائم حفاظتی انتباہات اور محفوظ راستے' : 'Real-time street safety updates verified by local women'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#B886FD]" />
            <span>{isUrdu ? 'رپورٹ' : 'Report'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metric Pills */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <span className="text-xl sm:text-2xl font-black text-rose-600 block">8</span>
          <span className="text-[11px] sm:text-xs text-[#6B7280] font-bold truncate block">Active</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <span className="text-xl sm:text-2xl font-black text-[#9333EA] block">3</span>
          <span className="text-[11px] sm:text-xs text-[#6B7280] font-bold truncate block">Priority</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <span className="text-xl sm:text-2xl font-black text-[#181A20] block">215</span>
          <span className="text-[11px] sm:text-xs text-[#6B7280] font-bold truncate block">Helped</span>
        </div>
      </div>

      {/* 3. Filter Pills */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#181A20] text-white shadow-xs'
              : 'bg-white text-[#6B7280] hover:bg-[#F5EEFD] border border-slate-200 hover:text-[#181A20]'
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setActiveFilter('nearby')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeFilter === 'nearby'
              ? 'bg-[#181A20] text-white shadow-xs'
              : 'bg-white text-[#6B7280] hover:bg-[#F5EEFD] border border-slate-200 hover:text-[#181A20]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#9333EA]" />
          <span>Nearby (2)</span>
        </button>
      </div>

      {/* 4. Alert Cards List */}
      <div className="space-y-3.5">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isHigh = alert.severity === 'high';

          return (
            <div
              key={alert.id}
              className="rounded-3xl bg-white border border-slate-200 hover:border-[#E9D5FF] p-5 shadow-xs space-y-3.5 transition-all"
            >
              {/* Card Header with Severity Pill */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                    isCritical 
                      ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                      : isHigh 
                      ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                      : 'bg-[#F5EEFD] text-[#9333EA] border border-[#E9D5FF]'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#181A20]">
                      {isUrdu && alert.titleUrdu ? alert.titleUrdu : alert.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-[#6B7280] font-medium mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{alert.timeAgo}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 text-[#181A20] font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#9333EA]" />
                        <span>{alert.distanceKm} km away</span>
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isCritical 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                    : isHigh 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                    : 'bg-[#F5EEFD] text-[#9333EA] border border-[#E9D5FF]'
                }`}>
                  {alert.severity}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#181A20] font-medium leading-relaxed bg-[#F8F9FD] p-4 rounded-2xl border border-slate-100">
                {isUrdu && alert.descriptionUrdu ? alert.descriptionUrdu : alert.description}
              </p>

              {/* Location & Navigate Safer Route Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5 max-w-[60%]">
                  <span className="text-[10px] text-[#6B7280] uppercase font-mono font-bold">Location</span>
                  <p className="text-sm font-bold text-[#181A20] truncate">
                    {alert.locationName}
                  </p>
                </div>

                <button
                  onClick={onStartNavigation}
                  className="px-4 py-2.5 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-[#B886FD]" />
                  <span>{isUrdu ? 'محفوظ راستہ لیں' : 'Navigate'}</span>
                </button>
              </div>

              {/* Footer / Community Verification */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-[#6B7280]">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified</span>
                  </span>
                  <span>•</span>
                  <span className="text-[#6B7280] font-medium">by {alert.reporterName || 'Community'}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1 text-[#181A20] font-semibold">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{alert.affectedWomenCount} reported</span>
                  </span>
                  <span className="flex items-center space-x-1 text-[#181A20] font-bold">
                    <ThumbsUp className="w-3.5 h-3.5 text-[#9333EA]" />
                    <span>34</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
