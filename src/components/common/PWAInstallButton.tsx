/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2, Shield } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'badge' | 'button' | 'pill';
  language?: 'en' | 'ur';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'pill',
  language = 'en'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const isUrdu = language === 'ur';

  // If already running in standalone PWA mode, suppress install button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'badge') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          id="pwa-install-badge-btn"
          aria-label={isUrdu ? 'ایپ انسٹال کریں' : 'Install Safe App'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FC7454] text-white hover:bg-[#E55938] transition shadow-xs cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'ایپ محفوظ کریں' : 'Install App'}</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        id="pwa-install-action-btn"
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#ECF4F4] text-[#1C2C34] hover:bg-[#BCD4D4]/40 border border-[#BCD4D4] transition shadow-2xs cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4 text-[#FC7454]" />
        <span>{isUrdu ? 'محفوظ آف لائن ایپ انسٹال کریں' : 'Install Offline App'}</span>
      </button>
    );
  }

  // iOS Safari flow (renders custom guidance modal)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          id="pwa-install-ios-btn"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#ECF4F4] text-[#1C2C34] hover:bg-[#BCD4D4]/40 border border-[#BCD4D4] transition shadow-2xs cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-[#FC7454]" />
          <span>{isUrdu ? 'آئی فون پر انسٹال کریں' : 'Install on iPhone'}</span>
        </button>

        {showIOSGuide && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-pwa-title"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#BCD4D4]/80 text-[#1C2C34] space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#ECF4F4] flex items-center justify-center text-[#FC7454] border border-[#BCD4D4]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="ios-pwa-title" className="font-extrabold text-base text-[#1C2C34]">
                      {isUrdu ? 'آئی فون / آئی پیڈ پر انسٹال کریں' : 'Install on iPhone / iPad'}
                    </h3>
                    <p className="text-xs text-[#5A6E78]">
                      {isUrdu ? 'آف لائن ایمرجنسی رسائی کے لیے' : 'For zero-network offline emergency access'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-[#5A6E78] hover:text-[#1C2C34] p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 bg-[#ECF4F4]/50 p-4 rounded-2xl border border-[#BCD4D4]/50 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FC7454] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-[#1C2C34]">
                      {isUrdu ? 'سفاری ٹول بار میں شیئر بٹن دبائیں' : 'Tap the Share icon in Safari'}
                    </p>
                    <p className="text-[#5A6E78] mt-0.5 flex items-center gap-1">
                      <Share className="w-3.5 h-3.5 inline text-[#FC7454]" />
                      <span>{isUrdu ? 'سفاری کے نچلے مینو میں موجود ہوتا ہے' : 'Located at bottom of your Safari browser bar'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FC7454] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-[#1C2C34]">
                      {isUrdu ? 'ہوم اسکرین میں شامل کریں پر ٹیپ کریں' : 'Tap "Add to Home Screen"'}
                    </p>
                    <p className="text-[#5A6E78] mt-0.5 flex items-center gap-1">
                      <PlusSquare className="w-3.5 h-3.5 inline text-[#FC7454]" />
                      <span>{isUrdu ? 'اسکرول کر کے آپشن منتخب کریں' : 'Scroll down the share sheet and tap Add'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1C2C34] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <p className="font-semibold text-[#1C2C34]">
                      {isUrdu ? 'بغیر انٹرنیٹ استعمال کے لیے تیار' : 'Offline Ready'}
                    </p>
                    <p className="text-[#5A6E78] mt-0.5">
                      {isUrdu 
                        ? 'ہیلپ لائنز، دارالامان اور قوانین انٹرنیٹ بند ہونے پر بھی کام کریں گے۔' 
                        : 'Helplines, police desks, and legal corpus will work even without cell signal.'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#1C2C34] text-white hover:bg-[#2C3E48] transition cursor-pointer"
              >
                {isUrdu ? 'سمجھ آ گئی' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
