/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface MehfoozLogoProps {
  variant?: 'icon' | 'badge' | 'horizontal' | 'full' | 'hero' | 'stacked';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  className?: string;
  showUrdu?: boolean;
  showTagline?: boolean;
  theme?: 'auto' | 'light' | 'dark';
  animated?: boolean;
}

export const MehfoozLogo: React.FC<MehfoozLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showUrdu = true,
  showTagline = true,
  animated = false,
}) => {
  // Dimension definitions
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24',
    hero: 'w-28 h-28 sm:w-36 sm:h-36',
  }[size];

  // The Pure SVG Line Art & Illustrated Vector Logo
  const LogoVector = () => (
    <div
      className={`relative ${iconDimensions} flex items-center justify-center flex-shrink-0 group select-none ${
        animated ? 'transition-transform duration-300 hover:scale-105' : ''
      }`}
    >
      {/* Ambient Lilac/Lavender Glow for depth */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#B886FD]/30 via-[#C084FC]/25 to-[#9333EA]/20 blur-md group-hover:blur-lg transition-all duration-300 opacity-75 dark:opacity-90" />

      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-sm transition-transform duration-300"
      >
        <defs>
          {/* Top Protective Hand Gradients */}
          <linearGradient id="handGradLight" x1="40" y1="20" x2="160" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>

          <linearGradient id="handStrokeGrad" x1="40" y1="20" x2="160" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EDE9FE" />
            <stop offset="50%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#7E22CE" />
          </linearGradient>

          {/* Shield Left Section (Deep Twilight / Indigo Lilac) */}
          <linearGradient id="shieldLeftGrad" x1="30" y1="60" x2="100" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B2667" />
            <stop offset="60%" stopColor="#251642" />
            <stop offset="100%" stopColor="#18112C" />
          </linearGradient>

          {/* Shield Right Section (Teal-Lavender Harmonic Shadow / Rich Amethyst) */}
          <linearGradient id="shieldRightGrad" x1="100" y1="60" x2="170" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#581C87" />
            <stop offset="50%" stopColor="#3B0764" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Woman Profile Silhouette Glow & Fill */}
          <linearGradient id="womanProfileGrad" x1="70" y1="50" x2="130" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FAF5FF" />
            <stop offset="100%" stopColor="#EDE9FE" />
          </linearGradient>

          {/* Accent Line Glow Filter */}
          <filter id="vectorGlow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ========================================================================= */}
        {/* 1. TOP PROTECTIVE ARCHING HAND (Illustrated Line Art + Fill)             */}
        {/* ========================================================================= */}
        {/* Base filled shape for protective hand */}
        <path
          d="M38 68 C36 44, 52 24, 76 16 C98 8, 128 10, 150 24 C162 32, 170 44, 168 56 C166 64, 158 68, 150 62 C146 56, 142 44, 134 38 C124 30, 106 28, 92 34 C76 40, 64 54, 56 68 C50 78, 42 76, 38 68 Z"
          fill="url(#handGradLight)"
          stroke="url(#handStrokeGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hand finger articulation & palm contour line strokes */}
        <path
          d="M152 38 C160 44, 164 52, 164 58"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M140 44 C146 50, 150 56, 152 64"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M128 50 C134 54, 137 60, 138 68"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M116 56 C120 60, 122 66, 123 72"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Protective upper halo arc stroke */}
        <path
          d="M48 40 C70 18, 130 18, 158 40"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1 4"
          opacity="0.6"
        />

        {/* ========================================================================= */}
        {/* 2. LOWER SHIELD / EMBLEM BODY (Curved Left & Right Slices)               */}
        {/* ========================================================================= */}
        {/* Left Shield Half (Deep Twilight Violet) */}
        <path
          d="M36 68 C34 98, 48 140, 100 178 L100 58 C80 58, 54 62, 36 68 Z"
          fill="url(#shieldLeftGrad)"
          stroke="#B886FD"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Right Shield Half (Amethyst Deep Plum) */}
        <path
          d="M164 68 C166 98, 152 140, 100 178 L100 58 C120 58, 146 62, 164 68 Z"
          fill="url(#shieldRightGrad)"
          stroke="#9333EA"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Shield Outer Outline Contour Accent */}
        <path
          d="M36 68 C34 104, 50 148, 100 180 C150 148, 166 104, 164 68"
          stroke="#E9D5FF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />

        {/* ========================================================================= */}
        {/* 3. WOMAN PROFILE SILHOUETTE & FLOWING HAIR (Central Line Art & Form)     */}
        {/* ========================================================================= */}
        {/* Hair waves swooping upward into the apex */}
        <path
          d="M100 54 C104 62, 108 72, 116 78 C124 84, 126 94, 124 104 C120 120, 106 130, 96 142 C90 150, 88 162, 92 172 C80 162, 70 146, 68 130 C66 112, 74 96, 86 86 C94 78, 98 66, 100 54 Z"
          fill="url(#womanProfileGrad)"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Distinctive Face Profile Silhouette (Forehead, Nose, Lips, Chin, Neck) */}
        <path
          d="M116 78 C116 84, 120 90, 122 94 C124 97, 128 100, 132 104 C128 106, 124 107, 122 108 C124 110, 127 112, 128 114 C123 115, 120 117, 119 119 C121 122, 122 126, 123 129 C119 133, 114 136, 110 142 C104 150, 103 160, 104 172"
          fill="url(#womanProfileGrad)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Additional Graceful Hair Strand (Flowing Left Accent) */}
        <path
          d="M88 94 C78 106, 76 122, 82 136 C86 146, 92 154, 94 164"
          stroke="#EDE9FE"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gentle Facial Contour Highlights (Line Art Elegance) */}
        <path
          d="M102 88 C108 94, 112 102, 114 112"
          stroke="#C084FC"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Small safety star / sparkle near hair crest */}
        <circle cx="100" cy="50" r="2.5" fill="#FFFFFF" filter="url(#vectorGlow)" />
      </svg>
    </div>
  );

  // 1. Icon Only
  if (variant === 'icon') {
    return <LogoVector />;
  }

  // 2. Badge (Pill Style)
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#F5EEFD] dark:bg-[#1E1630] border border-[#E9D5FF] dark:border-[#581C87] shadow-xs ${className}`}
      >
        <LogoVector />
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-serif font-black tracking-wide text-[#181A20] dark:text-white">
            Mehfooz
          </span>
          {showUrdu && (
            <span className="text-[11px] font-bold text-[#9333EA] dark:text-[#C084FC] font-serif">
              محفوظ
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. Stacked / Vertical (Matching user's logo badge layout)
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center space-y-2.5 ${className}`}>
        <LogoVector />
        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#181A20] dark:text-white">
              Mehfooz
            </h2>
            {showUrdu && (
              <span className="text-lg font-serif font-bold text-[#9333EA] dark:text-[#C084FC]">
                محفوظ
              </span>
            )}
          </div>
          {showTagline && (
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#6B7280] dark:text-slate-400 uppercase">
              INFORM • SUPPORT • PROTECT
            </p>
          )}
        </div>
      </div>
    );
  }

  // 4. Hero Variant (Large, expressive on landing page & cover)
  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center space-y-4 ${className}`}>
        <div className="relative">
          {/* Animated Ambient Aura */}
          <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-[#B886FD]/30 via-[#C084FC]/25 to-[#9333EA]/20 blur-2xl animate-pulse" />
          <LogoVector />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-center space-x-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#181A20] dark:text-white">
              Mehfooz
            </h1>
            {showUrdu && (
              <span className="text-2xl sm:text-3xl font-serif font-bold px-3 py-0.5 rounded-2xl bg-[#F5EEFD] dark:bg-[#2D1F47] text-[#9333EA] dark:text-[#C084FC] border border-[#E9D5FF] dark:border-[#581C87]">
                محفوظ
              </span>
            )}
          </div>
          {showTagline && (
            <p className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#6B7280] dark:text-slate-300 uppercase">
              INFORM • SUPPORT • PROTECT
            </p>
          )}
        </div>
      </div>
    );
  }

  // 5. Full Variant (Header & Drawer)
  if (variant === 'full') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <LogoVector />
        <div className="flex flex-col">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-serif font-black tracking-tight text-[#181A20] dark:text-white leading-none">
              Mehfooz
            </span>
            {showUrdu && (
              <span className="text-sm font-serif font-bold text-[#9333EA] dark:text-[#C084FC] leading-none">
                محفوظ
              </span>
            )}
          </div>
          {showTagline && (
            <span className="text-[9px] font-bold tracking-[0.18em] text-[#6B7280] dark:text-slate-400 uppercase mt-1">
              INFORM • SUPPORT • PROTECT
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default 'horizontal'
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <LogoVector />
      <div className="flex flex-col">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-lg font-serif font-black tracking-tight text-[#181A20] dark:text-white leading-tight">
            Mehfooz
          </span>
          {showUrdu && (
            <span className="text-xs font-serif font-bold text-[#9333EA] dark:text-[#C084FC]">
              محفوظ
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-[8.5px] font-bold tracking-[0.14em] text-[#6B7280] dark:text-slate-400 uppercase">
            INFORM • SUPPORT • PROTECT
          </span>
        )}
      </div>
    </div>
  );
};
