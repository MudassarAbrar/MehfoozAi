/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HeroAnimatedLogo } from '../landing/HeroAnimatedLogo';
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

  // Exact Line Art Vector Illustration matching media_1788700671258.jpg artwork:
  // 1. Top protective hand arching over with elegant sheltered fingers (warm coral)
  // 2. Woman's profile facing right (forehead, delicate nose, lips, chin, neck) (warm coral)
  // 3. Flowing hair strands swooping in graceful calligraphy S-curves (dark teal, light teal & coral)
  const LineArtVector = ({ isHeroAnimated = false }: { isHeroAnimated?: boolean }) => {
    return (
      <div
        className={`relative ${iconDimensions} flex items-center justify-center flex-shrink-0 group select-none ${
          animated ? 'transition-transform duration-300 hover:scale-105' : ''
        }`}
      >
        <img
          src="/logo.jpg"
          alt="Mehfooz"
          className={`${iconDimensions} object-contain rounded-xl`}
        />
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

  // 4. Hero Animated Variant (Draws in with long streak-in, hair sway, hand stroke & brand title)
  if (variant === 'animated-hero' || variant === 'hero') {
    return <HeroAnimatedLogo showUrdu={showUrdu} className={className} />;
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

