/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Search, X, ShieldCheck, Scale, ExternalLink, HardDrive, CheckCircle2 } from 'lucide-react';
import { getOfflineLegalCorpus } from '../../utils/offlineEmergencyCache';
import { AppLanguage } from '../../types';

interface OfflineLegalCorpusModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
}

export const OfflineLegalCorpusModal: React.FC<OfflineLegalCorpusModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAct, setSelectedAct] = useState<string>('all');

  if (!isOpen) return null;

  const isUrdu = language === 'ur';
  const legalCorpus = getOfflineLegalCorpus();

  const acts = [
    { key: 'all', label: 'All Punjab Acts', labelUrdu: 'تمام قوانین' },
    { key: 'PPWVA', label: 'PPWVA 2016 (Violence Against Women)', labelUrdu: 'پنجاب تحفظ نسواں ایکٹ 2016' },
    { key: 'PECA', label: 'PECA 2016 (Cyber Crime)', labelUrdu: 'پیکا سائبر کرائم ایکٹ 2016' },
    { key: 'Workplace', label: 'Workplace Act 2010', labelUrdu: 'کام کی جگہ پر ہراسانی ایکٹ 2010' },
    { key: 'PPC', label: 'Penal Code (PPC 506/509)', labelUrdu: 'مجموعہ تعزیراتِ پاکستان' },
  ];

  const filtered = legalCorpus.filter(article => {
    const matchesAct = selectedAct === 'all' || article.actTitle.toLowerCase().includes(selectedAct.toLowerCase());
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || (
      article.actTitle.toLowerCase().includes(q) ||
      article.section.toLowerCase().includes(q) ||
      article.title.toLowerCase().includes(q) ||
      (article.titleUrdu && article.titleUrdu.includes(q)) ||
      article.summary.toLowerCase().includes(q) ||
      (article.summaryUrdu && article.summaryUrdu.includes(q)) ||
      article.keywords.some(k => k.toLowerCase().includes(q))
    );
    return matchesAct && matchesQuery;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-legal-title"
    >
      <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white border border-[#BCD4D4] shadow-2xl flex flex-col overflow-hidden text-[#1C2C34]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#BCD4D4]/60 flex items-start justify-between gap-3 bg-[#ECF4F4]/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ECF4F4] text-[#FC7454] flex items-center justify-center border border-[#BCD4D4]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="offline-legal-title" className="font-extrabold text-base text-[#1C2C34]">
                  {isUrdu ? 'آف لائن پنجاب قانونی انسائیکلوپیڈیا' : 'Offline Punjab Legal Corpus'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-emerald-600" />
                  <span>{isUrdu ? 'ڈیوائس پر کیشڈ' : 'Cached Locally'}</span>
                </span>
              </div>
              <p className="text-xs text-[#5A6E78] mt-0.5">
                {isUrdu 
                  ? 'انٹرنیٹ یا موبائل ڈیٹا نہ ہونے کی صورت میں بھی پنجاب کے تمام تر تحفظاتی احکامات اور تعزیرات پڑھیں۔' 
                  : 'Instant statutory reference for PPWVA 2016, PECA 2016, and protection remedies with zero data connection.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#5A6E78] hover:text-[#1C2C34] hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Act Filters */}
        <div className="p-4 border-b border-[#BCD4D4]/40 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-[#5A6E78] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUrdu ? 'قانون، دفعہ یا ہراسانی کی قسم تلاش کریں...' : 'Search legal section, penalty, or protection order...'}
              className="w-full bg-[#ECF4F4]/30 border border-[#BCD4D4]/60 focus:border-[#FC7454] rounded-xl py-2 pl-10 pr-4 text-xs text-[#1C2C34] placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {acts.map(act => (
              <button
                key={act.key}
                onClick={() => setSelectedAct(act.key)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedAct === act.key
                    ? 'bg-[#1C2C34] text-white shadow-2xs'
                    : 'bg-slate-100 text-[#5A6E78] hover:bg-slate-200'
                }`}
              >
                {isUrdu ? act.labelUrdu : act.label}
              </button>
            ))}
          </div>
        </div>

        {/* Articles List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#5A6E78]">
              {isUrdu ? 'کوئی متعلقہ قانون نہیں ملا۔' : 'No statutes matched your search query.'}
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div key={item.id || idx} className="pt-3.5 first:pt-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-[#ECF4F4] text-[#FC7454] font-bold text-[10px] border border-[#BCD4D4]">
                        {item.actTitle}
                      </span>
                      <span className="text-xs font-bold text-[#1C2C34] font-mono">
                        {item.section}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-[#1C2C34]">
                      {isUrdu && item.titleUrdu ? item.titleUrdu : item.title}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-[#5A6E78] leading-relaxed">
                  {isUrdu && item.summaryUrdu ? item.summaryUrdu : item.summary}
                </p>

                {item.remedies && item.remedies.length > 0 && (
                  <div className="bg-[#ECF4F4]/50 p-2.5 rounded-xl border border-[#BCD4D4]/40 text-[11px] space-y-1">
                    <span className="font-bold text-[#1C2C34] block">
                      {isUrdu ? 'فوری قانونی علاج و احکامات:' : 'Statutory Remedies Available:'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[#5A6E78]">
                      {item.remedies.map((rem, rIdx) => (
                        <li key={rIdx}>{rem}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#BCD4D4]/60 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#5A6E78] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isUrdu ? `${filtered.length} دفعات ڈیوائس پر محفوظ ہیں` : `${filtered.length} provisions stored locally`}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-[#1C2C34] text-white hover:bg-[#2C3E48] transition cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
