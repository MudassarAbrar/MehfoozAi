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
  AlertOctagon
} from 'lucide-react';
import { AppLanguage, SupportResource } from '../types';
import { PUNJAB_SUPPORT_DIRECTORY } from '../data/supportDirectory';

interface SupportDirectoryProps {
  language: AppLanguage;
  onOpenCrisis: () => void;
}

export const SupportDirectory: React.FC<SupportDirectoryProps> = ({
  language,
  onOpenCrisis
}) => {
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
    <div className="max-w-4xl mx-auto px-4 py-3 space-y-4 text-[#181A20]">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#F5EEFD] text-[#9333EA] flex items-center justify-center border border-[#E9D5FF]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#181A20]">
                {isUrdu ? 'پنجاب سپورٹ و قانونی امداد ڈائریکٹری' : 'Punjab Verified Support & Legal Aid Directory'}
              </h2>
            </div>
            <p className="text-xs text-[#6B7280]">
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

      {/* Filter & Search Controls */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'ہیلپ لائن، ادارہ یا سروس تلاش کریں...' : 'Search by organization name, helpline, or topic...'}
            className="w-full bg-white border border-slate-200 focus:border-[#9333EA] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#181A20] placeholder:text-slate-400 focus:outline-none shadow-xs"
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
                  ? 'bg-[#181A20] text-white shadow-xs' 
                  : 'bg-white border border-slate-200 text-[#6B7280] hover:bg-[#F5EEFD] hover:text-[#181A20]'
              }`}
            >
              {isUrdu ? c.labelUrdu : c.label}
            </button>
          ))}
        </div>

        {/* District Filter */}
        <div className="flex items-center space-x-2 text-xs text-[#6B7280] overflow-x-auto pb-1">
          <span className="font-bold text-[#181A20] flex items-center space-x-1 flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#9333EA]" />
            <span>District:</span>
          </span>
          {districts.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                selectedDistrict === d 
                  ? 'bg-[#F5EEFD] text-[#9333EA] font-bold border border-[#E9D5FF]' 
                  : 'text-[#6B7280] hover:text-[#181A20]'
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
            className="rounded-3xl bg-white border border-slate-200 hover:border-[#E9D5FF] p-5 shadow-xs flex flex-col justify-between space-y-3 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#F5EEFD] text-[#9333EA] font-bold text-[10px] uppercase border border-[#E9D5FF]">
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
                  <h3 className="text-sm font-bold text-[#181A20]">
                    {isUrdu ? item.nameUrdu : item.name}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-medium text-[#6B7280] flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#9333EA]" />
                    <span>{item.district}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#6B7280] leading-relaxed">
                {isUrdu ? item.descriptionUrdu : item.description}
              </p>

              {item.address && (
                <p className="text-[11px] text-[#6B7280]">
                  <strong className="text-[#181A20]">Location:</strong> {isUrdu && item.addressUrdu ? item.addressUrdu : item.address}
                </p>
              )}
            </div>

            {/* Contact Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100">
              {item.helpline && (
                <a
                  href={`tel:${item.helpline.replace(/[^0-9]/g, '')}`}
                  className="px-3 py-1.5 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#B886FD]" />
                  <span>Helpline: {item.helpline}</span>
                </a>
              )}

              {item.phone && !item.helpline && (
                <a
                  href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#181A20] font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#9333EA]" />
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
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#181A20] text-xs flex items-center space-x-1 transition font-semibold cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portal</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
