/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

export interface MehfoozLogoProps {
  variant?: 'icon' | 'badge' | 'horizontal' | 'full' | 'hero' | 'stacked' | 'animated-hero';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  className?: string;
  showUrdu?: boolean;
  showTagline?: boolean;
  theme?: 'auto' | 'light' | 'dark';
  animated?: boolean;
  strokeColor?: string;
}

export const MehfoozLogo: React.FC<MehfoozLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showUrdu = true,
  showTagline = true,
  animated = false,
  strokeColor,
}) => {
  // Dimension definitions
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
    hero: 'w-32 h-32 sm:w-44 sm:h-44',
  }[size];

  // The Pure Vector Line Art Logo matching user's uploaded illustration
  // Features: Top arching protective hand with articulated fingers + oval shield outline + flowing woman profile silhouette + hair waves
  const LineArtVector = ({ isHeroAnimated = false }: { isHeroAnimated?: boolean }) => {
    // Default purple stroke matching the app palette (#7C3AED to #9333EA / #C084FC)
    const strokeClass = strokeColor || 'stroke-[#7C3AED] dark:stroke-[#C084FC]';

    return (
      <div
        className={`relative ${iconDimensions} flex items-center justify-center flex-shrink-0 group select-none ${
          animated ? 'transition-transform duration-300 hover:scale-105' : ''
        }`}
      >
        {/* Soft Ambient Lilac/Lavender Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#B886FD]/25 via-[#C084FC]/20 to-[#9333EA]/15 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-80 pointer-events-none" />

        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-sm transition-transform duration-300"
        >
          {/* ========================================================================= */}
          {/* 1. TOP PROTECTIVE ARCHING HAND (Single-Line Contour Art)                  */}
          {/* ========================================================================= */}
          {/* Outer Arch of Hand / Arm */}
          <motion.path
            d="M 42,76 C 42,42, 70,22, 120,22 C 168,22, 196,44, 198,78 C 196,86, 186,88, 178,80 C 172,72, 168,54, 156,46 C 146,38, 124,36, 106,42 C 86,48, 70,62, 58,78 C 50,88, 42,86, 42,76 Z"
            className={strokeClass}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />

          {/* Hand Finger 1 (Index Finger Contour) */}
          <motion.path
            d="M 174,54 C 182,62, 186,72, 184,80"
            className={strokeClass}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          />

          {/* Hand Finger 2 (Middle Finger Contour) */}
          <motion.path
            d="M 160,60 C 168,68, 172,76, 172,84"
            className={strokeClass}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          />

          {/* Hand Finger 3 (Ring Finger Contour) */}
          <motion.path
            d="M 146,64 C 152,72, 156,80, 156,88"
            className={strokeClass}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          />

          {/* Hand Thumb / Palm inner curve */}
          <motion.path
            d="M 130,68 C 136,76, 138,82, 140,90"
            className={strokeClass}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          />

          {/* ========================================================================= */}
          {/* 2. LOWER SHIELD / CIRCULAR ENCLOSURE OUTLINE                              */}
          {/* ========================================================================= */}
          {/* Left Shield Curve with top inward dip */}
          <motion.path
            d="M 40,84 C 36,132, 54,184, 114,218"
            className={strokeClass}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
          />

          {/* Right Shield Curve with bottom sweep */}
          <motion.path
            d="M 200,84 C 204,132, 186,184, 114,218 C 104,218, 96,212, 94,204 C 92,192, 102,180, 116,174"
            className={strokeClass}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.4, delay: 0.3, ease: 'easeInOut' }}
          />

          {/* Top Shield Inward Dip Crest (Where the protective hand rests) */}
          <motion.path
            d="M 40,84 C 54,92, 80,96, 120,76 C 160,96, 186,92, 200,84"
            className={strokeClass}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1, delay: 0.4, ease: 'easeInOut' }}
          />

          {/* ========================================================================= */}
          {/* 3. CENTRAL WOMAN PROFILE SILHOUETTE & FLOWING HAIR (Continuous Line Art)  */}
          {/* ========================================================================= */}
          {/* Outer Flowing Hair Sweep (From top apex down the left and swooping right) */}
          <motion.path
            d="M 120,76 C 114,94, 98,118, 86,142 C 76,162, 78,184, 90,204 C 96,214, 102,216, 106,210 C 112,202, 110,188, 106,176 C 98,154, 108,132, 124,112 C 132,102, 136,90, 136,78"
            className={strokeClass}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.6, delay: 0.5, ease: 'easeInOut' }}
          />

          {/* Inner Flowing Hair Strand Accent */}
          <motion.path
            d="M 120,96 C 108,114, 94,136, 88,158 C 84,172, 86,188, 94,198"
            className={strokeClass}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
          />

          {/* Woman's Facial Profile (Forehead, Elegant Nose, Lips, Chin, Neck Line) */}
          <motion.path
            d="M 136,78 C 142,94, 146,108, 146,116 C 146,120, 148,124, 150,126 C 152,128, 156,131, 160,135 C 156,137, 152,138, 150,140 C 152,142, 154,144, 155,146 C 150,147, 147,149, 146,151 C 148,154, 149,158, 150,161 C 146,165, 141,168, 137,174 C 131,182, 130,192, 131,202"
            className={strokeClass}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.5, delay: 0.6, ease: 'easeInOut' }}
          />

          {/* Neck curve extending gracefully into the bottom loop */}
          <motion.path
            d="M 131,180 C 124,190, 114,194, 102,192"
            className={strokeClass}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          />

          {/* Sparkle of Safety / Truth at apex */}
          <motion.circle
            cx="120"
            cy="76"
            r="3"
            className="fill-[#7C3AED] dark:fill-[#C084FC]"
            initial={isHeroAnimated ? { scale: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { scale: [0, 1.4, 1], opacity: 1 } : false}
            transition={{ duration: 0.6, delay: 1.4, ease: 'easeOut' }}
          />
        </svg>
      </div>
    );
  };

  // 1. Icon Only
  if (variant === 'icon') {
    return <LineArtVector />;
  }

  // 2. Badge (Pill Style)
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#F5EEFD] dark:bg-[#1E1630] border border-[#E9D5FF] dark:border-[#581C87] shadow-xs ${className}`}
      >
        <LineArtVector />
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
        <LineArtVector />
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

  // 4. Hero Animated Variant (Draws in with stroke length + glowing aura)
  if (variant === 'animated-hero' || variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center space-y-4 ${className}`}>
        <div className="relative">
          {/* Animated Halo Rings */}
          <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-[#B886FD]/30 via-[#C084FC]/25 to-[#9333EA]/20 blur-3xl animate-pulse" />
          <LineArtVector isHeroAnimated={true} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center space-x-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#181A20] dark:text-white">
              Mehfooz
            </h1>
            {showUrdu && (
              <span className="text-2xl sm:text-3xl font-serif font-bold px-3.5 py-1 rounded-2xl bg-[#F5EEFD] dark:bg-[#2D1F47] text-[#9333EA] dark:text-[#C084FC] border border-[#E9D5FF] dark:border-[#581C87] shadow-xs">
                محفوظ
              </span>
            )}
          </div>
          {showTagline && (
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.15em' }}
              animate={{ opacity: 1, letterSpacing: '0.28em' }}
              transition={{ duration: 1, delay: 1.1 }}
              className="text-xs sm:text-sm font-extrabold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-[0.28em]"
            >
              INFORM • SUPPORT • PROTECT
            </motion.p>
          )}
        </motion.div>
      </div>
    );
  }

  // 5. Full Variant (Header & Drawer)
  if (variant === 'full') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <LineArtVector />
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
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#6B7280] dark:text-slate-400 uppercase mt-1">
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
      <LineArtVector />
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
          <span className="text-[8.5px] font-bold tracking-[0.16em] text-[#6B7280] dark:text-slate-400 uppercase">
            INFORM • SUPPORT • PROTECT
          </span>
        )}
      </div>
    </div>
  );
};
