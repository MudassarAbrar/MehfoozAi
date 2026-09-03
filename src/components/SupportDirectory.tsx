/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, 
  PhoneCall, 
  Globe, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Clock, 
  Filter, 
  HeartHandshake,
  Scale,
  Lock,
  MessageSquare,
  AlertOctagon,
  Wifi,
  WifiOff,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { AppLanguage, SupportResource } from '../types';
import { PUNJAB_SUPPORT_DIRECTORY } from '../data/supportDirectory';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { CRITICAL_OFFLINE_HOTLINES, getOfflineReadinessStatus } from '../utils/offlineEmergencyCache';

interface SupportDirectoryProps {
  language: AppLanguage;
  onOpenCrisis: () => void;
}

export const SupportDirectory: React.FC<SupportDirectoryProps> = ({
  language,
  onOpenCrisis
}) => {
  const isOnline = useOnlineStatus();
  const offlineStatus = getOfflineReadinessStatus();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Punjab');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isUrdu = language === 'ur';

  const categories = [
    { key: 'all', label: 'All Services', labelUrdu: 'تمام ادارے' },
    { key: 'emergency', label: 'Emergency 15', labelUrdu: 'ایمرجنسی 15' },
    { key: 'legal_aid', label: 'Free Legal Aid', labelUrdu: 'مفت قانونی مدد' },
    { key: 'police', label: 'Police & VWPS', labelUrdu: 'پولیس و خواتین ڈیسک' },
    { key: 'shelter', label: 'Dar-ul-Aman Shelters', labelUrdu: 'دارالامان پناہ گاہیں' },
    { key: 'cyber_safety', label: 'Cyber Harassment (FIA/DRF)', labelUrdu: 'سائبر ہراسانی ہیلپ' },
    { key: 'workplace_ombudsperson', label: 'Workplace Ombudsperson', labelUrdu: 'محتسب پنجاب' },
    { key: 'counselling', label: 'Psychological Support', labelUrdu: 'نفسیاتی کونسلنگ' },
  ];

  const districts = ['All Punjab', 'Lahore', 'Multan', 'Rawalpindi', 'Faisalabad', 'Gujranwala'];

  const filtered = PUNJAB_SUPPORT_DIRECTORY.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchDist = selectedDistrict === 'All Punjab' || item.district === 'All Punjab' || item.district === selectedDistrict;
    const matchSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.helpline?.includes(searchQuery);
    return matchCat && matchDist && matchSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-3 space-y-4 text-[#1C2C34]">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-[#BCD4D4]/60 p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] text-[#FC7454] flex items-center justify-center border border-[#BCD4D4]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#1C2C34]">
                {isUrdu ? 'پنجاب سپورٹ و قانونی امداد ڈائریکٹری' : 'Punjab Verified Support & Legal Aid Directory'}
              </h2>
            </div>
            <p className="text-xs text-[#5A6E78]">
              {isUrdu 
                ? 'لاہور، ملتان، راولپنڈی سمیت پنجاب بھر کی ہیلپ لائنز، وکلاء، اور پناہ گاہوں کے تصدیق شدہ رابطے۔'
                : 'Verified free legal aid cells, police desks, emergency shelters, and toll-free helplines across Punjab.'}
            </p>
          </div>

          <button
            onClick={onOpenCrisis}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center space-x-1.5 transition self-start sm:self-auto cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>{isUrdu ? 'ایمرجنسی 15 کال' : 'Emergency 15'}</span>
          </button>
        </div>
      </div>

      {/* Offline Reliability & GSM Hotlines Card */}
      <div className="rounded-3xl bg-[#ECF4F4]/70 border border-[#BCD4D4] p-4.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-white text-[#FC7454] flex items-center justify-center border border-[#BCD4D4] shadow-2xs">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xs text-[#1C2C34]">
                  {isUrdu ? 'آف لائن ایمرجنسی کیش فعال ہے' : 'Offline Incident Readiness'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-[#FC7454]/15 text-[#FC7454] border-[#FC7454]/40 animate-pulse'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-[#FC7454]" />}
                  <span>{isOnline ? (isUrdu ? 'آن لائن سنکڈ' : 'Online & Cached') : (isUrdu ? 'آف لائن موڈ' : 'Offline Safe')}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#5A6E78]">
                {isUrdu 
                  ? `${offlineStatus.entriesCount} تصدیق شدہ سپورٹ ڈائریکٹری اور ہیلپ لائنز ڈیوائس پر محفوظ ہیں۔ بغیر ڈیٹا کال ممکن ہے۔`
                  : `All ${offlineStatus.entriesCount} support resources and emergency helplines are pre-cached locally. Phone calls work over GSM without mobile data.`}
              </p>
            </div>
          </div>
        </div>

        {/* 1-Tap GSM Voice Call Hotlines */}
        <div className="pt-2 border-t border-[#BCD4D4]/60">
          <p className="text-[11px] font-bold text-[#1C2C34] mb-2">
            {isUrdu ? 'بغیر انٹرنیٹ فوری کال (1-Tap Direct GSM Dial):' : 'Emergency Voice Hotlines (Direct Cellular Call — No Data Required):'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {CRITICAL_OFFLINE_HOTLINES.map(hotline => (
              <a
                key={hotline.id}
                href={`tel:${hotline.number}`}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-[#BCD4D4] flex flex-col justify-between transition shadow-2xs group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-[#1C2C34]">
                  <span className="truncate">{hotline.name.split(' ')[0]}</span>
                  <PhoneCall className="w-3 h-3 text-[#FC7454] group-hover:scale-110 transition" />
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-black text-[#FC7454] font-mono">{hotline.number}</span>
                  {hotline.is24x7 && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">24/7</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#5A6E78] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'ہیلپ لائن، ادارہ یا سروس تلاش کریں...' : 'Search by organization name, helpline, or topic...'}
            className="w-full bg-white border border-[#BCD4D4]/60 focus:border-[#FC7454] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#1C2C34] placeholder:text-slate-400 focus:outline-none shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(c => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.key 
                  ? 'bg-[#1C2C34] text-white shadow-xs' 
                  : 'bg-white border border-[#BCD4D4]/60 text-[#5A6E78] hover:bg-[#ECF4F4] hover:text-[#1C2C34]'
              }`}
            >
              {isUrdu ? c.labelUrdu : c.label}
            </button>
          ))}
        </div>

        {/* District Filter */}
        <div className="flex items-center space-x-2 text-xs text-[#5A6E78] overflow-x-auto pb-1">
          <span className="font-bold text-[#1C2C34] flex items-center space-x-1 flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#FC7454]" />
            <span>District:</span>
          </span>
          {districts.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                selectedDistrict === d 
                  ? 'bg-[#ECF4F4] text-[#FC7454] font-bold border border-[#BCD4D4]' 
                  : 'text-[#5A6E78] hover:text-[#1C2C34]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-white border border-[#BCD4D4]/60 hover:border-[#FC7454] p-5 shadow-xs flex flex-col justify-between space-y-3 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#ECF4F4] text-[#FC7454] font-bold text-[10px] uppercase border border-[#BCD4D4]">
                      {item.category.replace('_', ' ')}
                    </span>
                    {item.is24x7 && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        24/7
                      </span>
                    )}
                    {item.freeOfCost && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                        Free
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#1C2C34]">
                    {isUrdu ? item.nameUrdu : item.name}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-medium text-[#5A6E78] flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#FC7454]" />
                    <span>{item.district}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#5A6E78] leading-relaxed">
                {isUrdu ? item.descriptionUrdu : item.description}
              </p>

              {item.address && (
                <p className="text-[11px] text-[#5A6E78]">
                  <strong className="text-[#1C2C34]">Location:</strong> {isUrdu && item.addressUrdu ? item.addressUrdu : item.address}
                </p>
              )}
            </div>

            {/* Contact Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                {item.helpline && (
                  <a
                    href={`tel:${item.helpline.replace(/[^0-9]/g, '')}`}
                    className="px-3 py-1.5 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#BCD4D4]" />
                    <span>Helpline: {item.helpline}</span>
                  </a>
                )}

              {item.phone && !item.helpline && (
                <a
                  href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#ECF4F4] text-[#1C2C34] font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#FC7454]" />
                  <span>{item.phone}</span>
                </a>
              )}

              {item.whatsapp && (
                <a
                  href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center space-x-1 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              )}

              {item.website && (
                <a
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1C2C34] text-xs flex items-center space-x-1 transition font-semibold cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portal</span>
                </a>
              )}
              </div>

              <span className="text-[10px] text-[#5A6E78] font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>GSM Voice (Offline)</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
