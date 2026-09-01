/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CloudSun, 
  ShieldAlert, 
  Languages, 
  TerminalSquare, 
  PhoneCall,
  Lock,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { MehfoozLogo } from './common/MehfoozLogo';
import { AppLanguage } from '../types';

interface QuickExitBarProps {
  onQuickExit: () => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onOpenCrisis: () => void;
  onToggleInspector: () => void;
  inspectorOpen: boolean;
}

export const QuickExitBar: React.FC<QuickExitBarProps> = ({
  onQuickExit,
  language,
  onLanguageChange,
  onOpenCrisis,
  onToggleInspector,
  inspectorOpen,
}) => {
  return (
    <div className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-[#12141C]/95 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 shadow-xs transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Safe Brand / Return Button */}
        <div className="flex items-center space-x-3">
          <button
            id="quick-exit-weather-btn"
            onClick={onQuickExit}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F5EEFD] dark:bg-[#2D1F47] hover:bg-[#EDE9FE] dark:hover:bg-[#3B1D54] border border-[#E9D5FF] dark:border-[#581C87] text-[#181A20] dark:text-[#E9D5FF] text-xs font-bold transition group shadow-xs cursor-pointer"
            title="Immediately return to Weather app (Esc)"
          >
            <CloudSun className="w-4 h-4 text-[#9333EA] dark:text-[#C084FC] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">
              {language === 'ur' ? 'موسم پر واپس جائیں' : 'Return to Weather'}
            </span>
            <span className="sm:hidden">Exit</span>
          </button>

          <MehfoozLogo variant="badge" size="xs" showUrdu={true} />
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Direct Emergency SOS Trigger */}
          <button
            id="quick-sos-15-btn"
            onClick={onOpenCrisis}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Direct Emergency 15"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>15</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'ur' : 'en')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#2A2F40] text-[#181A20] dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition shadow-xs cursor-pointer"
            title="Toggle English / اردو"
          >
            <Languages className="w-3.5 h-3.5 text-[#9333EA] dark:text-[#C084FC]" />
            <span>{language === 'en' ? 'اردو' : 'English'}</span>
          </button>

          {/* Hackathon Judge Inspector Drawer Toggle */}
          <button
            onClick={onToggleInspector}
            className={`p-1.5 rounded-xl border text-xs transition shadow-xs cursor-pointer ${
              inspectorOpen 
                ? 'bg-[#181A20] dark:bg-[#C084FC] border-[#181A20] dark:border-[#C084FC] text-[#B886FD] dark:text-[#0F1117] font-bold' 
                : 'bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#2A2F40] border-slate-200 dark:border-slate-700 text-[#6B7280] dark:text-slate-400 hover:text-[#181A20] dark:hover:text-white'
            }`}
            title="Judge & Developer Telemetry Inspector"
          >
            <TerminalSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
