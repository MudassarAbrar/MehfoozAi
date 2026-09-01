/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  MinusCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

export type SentimentType = 'very_unsafe' | 'uncomfortable' | 'neutral' | 'safe' | 'very_safe';

interface SentimentOption {
  id: SentimentType;
  label: string;
  labelUrdu: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  activeBg: string;
}

export const SENTIMENT_OPTIONS: SentimentOption[] = [
  {
    id: 'very_unsafe',
    label: 'Very Unsafe',
    labelUrdu: 'غیر محفوظ',
    icon: ShieldAlert,
    colorClass: 'text-rose-600',
    activeBg: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  {
    id: 'uncomfortable',
    label: 'Uncomfortable',
    labelUrdu: 'بے چین',
    icon: Frown,
    colorClass: 'text-amber-600',
    activeBg: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  {
    id: 'neutral',
    label: 'Neutral',
    labelUrdu: 'عام / مناسب',
    icon: Meh,
    colorClass: 'text-slate-600',
    activeBg: 'bg-slate-100 border-slate-300 text-[#181A20]',
  },
  {
    id: 'safe',
    label: 'Safe',
    labelUrdu: 'محفوظ',
    icon: Smile,
    colorClass: 'text-emerald-600',
    activeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  {
    id: 'very_safe',
    label: 'Very Safe',
    labelUrdu: 'انتہائی محفوظ',
    icon: Sparkles,
    colorClass: 'text-[#9333EA]',
    activeBg: 'bg-[#F5EEFD] border-[#E9D5FF] text-[#9333EA]',
  },
];

interface SentimentPickerProps {
  value: SentimentType;
  onChange: (val: SentimentType) => void;
  isUrdu?: boolean;
  className?: string;
}

export const SentimentPicker: React.FC<SentimentPickerProps> = ({
  value,
  onChange,
  isUrdu = false,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-5 gap-1.5 text-center ${className}`}>
      {SENTIMENT_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
              isSelected
                ? `${opt.activeBg} ring-2 ring-offset-1 ring-[#B886FD] shadow-xs font-bold`
                : 'bg-slate-50 border-slate-200 text-[#6B7280] hover:bg-[#F5EEFD]/60'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center mb-1 ${
              isSelected ? 'bg-white/90' : 'bg-white'
            }`}>
              <Icon className={`w-4 h-4 ${isSelected ? opt.colorClass : 'text-slate-500'}`} />
            </div>
            <span className="text-[10px] leading-tight font-medium">
              {isUrdu ? opt.labelUrdu : opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
