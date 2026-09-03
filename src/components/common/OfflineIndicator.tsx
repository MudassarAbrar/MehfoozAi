/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, PhoneCall, ShieldAlert, X, ChevronRight } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { AppLanguage } from '../../types';

interface OfflineIndicatorProps {
  language?: AppLanguage;
  onOpenDirectory?: () => void;
  onOpenCrisis?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  language = 'en',
  onOpenDirectory,
  onOpenCrisis
}) => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const isUrdu = language === 'ur';

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setIsDismissed(false); // Reset dismissal on new offline event
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // If back online, show brief toast
  if (showReconnected) {
    return (
      <div 
        id="online-reconnected-toast"
        className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-[#1C2C34] px-4 py-2.5 text-xs font-bold text-white shadow-xl border border-[#BCD4D4]/50 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Wifi className="w-3.5 h-3.5" />
        </div>
        <span>{isUrdu ? 'انٹرنیٹ بحال ہو گیا ہے' : 'Connection Restored • Online Mode Active'}</span>
      </div>
    );
  }

  // If currently offline
  if (!isOnline && !isDismissed) {
    return (
      <div 
        id="offline-safety-banner"
        role="status"
        aria-live="polite"
        className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-2xl bg-white border-2 border-[#FC7454] p-3.5 shadow-xl text-[#1C2C34] animate-in fade-in slide-in-from-bottom-3 duration-300"
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] text-[#FC7454] flex items-center justify-center shrink-0 border border-[#BCD4D4]">
              <WifiOff className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FC7454] animate-pulse" />
                <h4 className="font-extrabold text-xs text-[#1C2C34]">
                  {isUrdu ? 'آف لائن سیفٹی موڈ فعال ہے' : 'Offline Safety Mode Active'}
                </h4>
              </div>
              <p className="text-[11px] text-[#5A6E78] leading-tight">
                {isUrdu 
                  ? 'موبائل ڈیٹا منقطع ہونے کے باوجود پنجاب سپورٹ ڈائریکٹری، ہیلپ لائنز اور قانونی آرڈرز محفوظ اور قابلِ رسائی ہیں۔'
                  : 'Support directories, emergency hotlines, and Punjab legal statutes remain fully accessible without internet.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-[#5A6E78] hover:text-[#1C2C34] p-1 rounded-lg hover:bg-slate-100 transition shrink-0 cursor-pointer"
            aria-label="Dismiss offline alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick action bar */}
        <div className="mt-2.5 pt-2 border-t border-[#BCD4D4]/40 flex items-center justify-between gap-2 text-xs">
          <a
            href="tel:15"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-[#FC7454] text-white hover:bg-[#E55938] transition shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'کال 15 (بغیر انٹرنیٹ)' : 'Call 15 (No Data Needed)'}</span>
          </a>

          {onOpenDirectory && (
            <button
              onClick={onOpenDirectory}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1C2C34] hover:text-[#FC7454] transition cursor-pointer"
            >
              <span>{isUrdu ? 'ڈائریکٹری کھولیں' : 'Open Directory'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
