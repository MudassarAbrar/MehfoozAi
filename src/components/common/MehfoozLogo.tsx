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
  showTagline = false,
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
    hero: 'w-36 h-36 sm:w-48 sm:h-48',
  }[size];

  // Exact Line Art Vector Illustration from reference artwork:
  // 1. Protective hand arching over top with articulated fingers & thumb sheltering from above (warm coral)
  // 2. Woman's profile facing right (forehead, delicate nose, lips, chin, neck) (warm coral)
  // 3. Flowing hair strands swooping in graceful calligraphy S-curves (deep teal & medium teal)
  const LineArtVector = ({ isHeroAnimated = false }: { isHeroAnimated?: boolean }) => {
    // Colors matching the palette: Soft Coral (#FC7454 / #FC7C54) and Soft Teal (#A4C4C4 / #BCD4D4)
    const coralStroke = strokeColor || 'stroke-[#FC7454] dark:stroke-[#FC7C54]';
    const darkTealStroke = strokeColor || 'stroke-[#A4C4C4] dark:stroke-[#BCD4D4]';
    const mediumTealStroke = strokeColor || 'stroke-[#BCD4D4] dark:stroke-[#C4DCDC]';

    return (
      <div
        className={`relative ${iconDimensions} flex items-center justify-center flex-shrink-0 group select-none ${
          animated ? 'transition-transform duration-300 hover:scale-105' : ''
        }`}
      >
        {/* Subtle ambient aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FC7454]/15 via-[#BCD4D4]/10 to-[#A4C4C4]/10 blur-xl opacity-70 pointer-events-none" />

        <svg
          viewBox="0 0 320 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 transition-transform duration-300"
        >
          {/* ========================================================================= */}
          {/* 1. TOP PROTECTIVE HAND (Warm Coral Line Art)                              */}
          {/* ========================================================================= */}
          {/* Top Wrist Arch sweeping up & over knuckles into index finger */}
          <motion.path
            d="M 62,112 C 72,82 108,40 162,30 C 198,24 238,30 268,48 C 288,60 302,75 308,88 C 310,93 307,96 301,93 C 288,83 270,70 248,62"
            className={coralStroke}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />

          {/* Lower Wrist Line */}
          <motion.path
            d="M 76,150 C 90,122 118,98 148,84"
            className={coralStroke}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.0, delay: 0.2, ease: 'easeInOut' }}
          />

          {/* Thumb Curving Underneath */}
          <motion.path
            d="M 148,84 C 168,74 194,68 216,70 C 223,71 224,75 219,77 C 208,82 190,88 172,94"
            className={coralStroke}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
          />

          {/* Thumb Fingernail Crease */}
          <motion.path
            d="M 211,69 C 215,71 217,74 214,76"
            className={coralStroke}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
          />

          {/* Index Finger Sheltering Tip */}
          <motion.path
            d="M 248,62 C 268,71 290,86 304,102 C 308,107 305,110 299,107 C 287,98 271,85 256,78"
            className={coralStroke}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          />

          {/* Middle Finger Sheltering Tip */}
          <motion.path
            d="M 256,78 C 271,87 289,102 299,115 C 303,119 300,122 295,119 C 284,111 269,98 259,88"
            className={coralStroke}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          />

          {/* Ring / Drooping Finger Tip */}
          <motion.path
            d="M 260,90 C 272,99 284,111 290,120 C 293,124 290,126 286,123 C 277,117 267,106 260,97"
            className={coralStroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}
          />

          {/* ========================================================================= */}
          {/* 2. FLOWING HAIR STRANDS (Deep & Medium Teal Line Art)                      */}
          {/* ========================================================================= */}
          {/* Outer Flowing Teal Hair Strand */}
          <motion.path
            d="M 210,72 C 196,110 165,155 136,198 C 112,238 100,276 102,306 C 104,318 110,326 122,330"
            className={darkTealStroke}
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.6, delay: 0.3, ease: 'easeInOut' }}
          />

          {/* Inner Teal Hair Strand */}
          <motion.path
            d="M 204,114 C 188,152 160,196 136,240 C 120,270 115,295 118,314"
            className={mediumTealStroke}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.4, delay: 0.5, ease: 'easeInOut' }}
          />

          {/* Front Framing Hair Strand (Coral) */}
          <motion.path
            d="M 218,100 C 206,140 182,185 158,230 C 144,258 136,282 136,302"
            className={coralStroke}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.3, delay: 0.6, ease: 'easeInOut' }}
          />

          {/* ========================================================================= */}
          {/* 3. WOMAN'S FACIAL PROFILE & NECK (Warm Coral Line Art)                    */}
          {/* ========================================================================= */}
          {/* Profile: Forehead, Nose, Lips, Chin, Jawline, Throat & Neck Curl */}
          <motion.path
            d="M 218,92 C 225,108 232,122 234,134 C 235,142 233,148 232,152 C 234,160 242,172 254,184 C 257,187 257,190 253,192 C 246,196 242,200 244,204 C 248,206 251,208 251,210 C 248,211 244,212 245,214 C 248,216 249,219 247,222 C 244,226 242,229 243,232 C 246,237 248,243 246,248 C 243,255 235,260 226,262 C 208,266 188,268 174,284 C 160,300 164,320 180,335"
            className={coralStroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={isHeroAnimated ? { pathLength: 0, opacity: 0 } : false}
            animate={isHeroAnimated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.8, delay: 0.7, ease: 'easeInOut' }}
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
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#ECF4F4] dark:bg-[#182329] border border-[#BCD4D4] dark:border-[#2A3C44] shadow-xs ${className}`}
      >
        <LineArtVector />
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-serif font-black tracking-wide text-[#1C2C34] dark:text-[#F4F4FC]">
            Mehfooz
          </span>
          {showUrdu && (
            <span className="text-[11px] font-bold text-[#FC7454] dark:text-[#FC7C54] font-serif">
              محفوظ
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. Stacked / Vertical (Clean & Uncluttered)
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center space-y-2 ${className}`}>
        <LineArtVector />
        <div className="flex items-center justify-center space-x-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#1C2C34] dark:text-[#F4F4FC]">
            Mehfooz
          </h2>
          {showUrdu && (
            <span className="text-lg font-serif font-bold text-[#FC7454] dark:text-[#FC7C54]">
              محفوظ
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. Hero Animated Variant (Draws in with stroke length + clean brand name)
  if (variant === 'animated-hero' || variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center space-y-3 ${className}`}>
        <div className="relative">
          <LineArtVector isHeroAnimated={true} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex items-center justify-center space-x-3"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#1C2C34] dark:text-[#F4F4FC]">
            Mehfooz
          </h1>
          {showUrdu && (
            <span className="text-xl sm:text-2xl font-serif font-bold px-3 py-0.5 rounded-xl bg-[#ECF4F4] dark:bg-[#1A282E] text-[#FC7454] dark:text-[#FC7C54] border border-[#BCD4D4] dark:border-[#2A3C44] shadow-xs">
              محفوظ
            </span>
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
        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-serif font-black tracking-tight text-[#1C2C34] dark:text-[#F4F4FC] leading-none">
            Mehfooz
          </span>
          {showUrdu && (
            <span className="text-sm font-serif font-bold text-[#FC7454] dark:text-[#FC7C54] leading-none">
              محفوظ
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default 'horizontal' - Clean & spacious, no headline underneath
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <LineArtVector />
      <div className="flex items-baseline space-x-1.5">
        <span className="text-lg font-serif font-black tracking-tight text-[#1C2C34] dark:text-[#F4F4FC] leading-tight">
          Mehfooz
        </span>
        {showUrdu && (
          <span className="text-xs font-serif font-bold text-[#FC7454] dark:text-[#FC7C54]">
            محفوظ
          </span>
        )}
      </div>
    </div>
  );
};

