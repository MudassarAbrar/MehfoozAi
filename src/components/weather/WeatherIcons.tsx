/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type WeatherConditionType = 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'night_clear' | 'thunder' | 'fog';

interface WeatherIconProps {
  condition: WeatherConditionType;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition,
  className = '',
  size = 'md'
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  const dim = sizeMap[size];

  switch (condition) {
    case 'sunny':
      return (
        <svg viewBox="0 0 36 36" className={`${dim} ${className} text-amber-400`} fill="none" stroke="currentColor">
          {/* Central Sun Circle */}
          <circle cx="18" cy="18" r="7" fill="currentColor" />
          {/* Radiating 8 Rays */}
          <line x1="18" y1="4" x2="18" y2="7.5" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="18" y1="28.5" x2="18" y2="32" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="4" y1="18" x2="7.5" y2="18" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28.5" y1="18" x2="32" y2="18" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8.1" y1="8.1" x2="10.6" y2="10.6" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="25.4" y1="25.4" x2="27.9" y2="27.9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8.1" y1="27.9" x2="10.6" y2="25.4" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="25.4" y1="10.6" x2="27.9" y2="8.1" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'partly_cloudy':
      return (
        <svg viewBox="0 0 36 36" className={`${dim} ${className}`} fill="none">
          {/* Sun peeking from top-left */}
          <circle cx="13" cy="13" r="5.5" fill="#FBBF24" />
          <line x1="13" y1="3.5" x2="13" y2="5.5" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="5.5" y1="13" x2="7.5" y2="13" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="7.7" y1="7.7" x2="9.2" y2="9.2" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.3" y1="7.7" x2="16.8" y2="9.2" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />

          {/* Clean Outline Cloud (Matching Image 1 & 3) */}
          <path
            d="M12,25 C9.5,25 7.5,23 7.5,20.5 C7.5,18.2 9.2,16.4 11.4,16.1 C12.2,13.2 14.8,11 18,11 C22,11 25.2,14 25.5,18 C27.5,18.3 29,20 29,22 C29,23.7 27.7,25 26,25 Z"
            fill="#FFFFFF"
            stroke="#475569"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'rainy':
      return (
        <svg viewBox="0 0 36 36" className={`${dim} ${className}`} fill="none">
          {/* Rain Cloud */}
          <path
            d="M11,19 C8.8,19 7,17.2 7,15 C7,13 8.5,11.3 10.5,11.1 C11.2,8.6 13.5,6.8 16.2,6.8 C19.8,6.8 22.7,9.5 23,13 C24.8,13.3 26.2,14.8 26.2,16.6 C26.2,18.1 25,19 23.5,19 Z"
            fill="#FFFFFF"
            stroke="#475569"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* 4 Angled Raindrops (Matching Image 1, 2, 3) */}
          <line x1="10" y1="23" x2="8" y2="28" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <line x1="15" y1="23" x2="13" y2="28" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="23" x2="18" y2="28" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <line x1="25" y1="23" x2="23" y2="28" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'night_clear':
      return (
        <svg viewBox="0 0 36 36" className={`${dim} ${className}`} fill="none">
          <path
            d="M22 6C15.3726 6 10 11.3726 10 18C10 24.6274 15.3726 30 22 30C25.5683 30 28.7619 28.4418 30.9395 25.9622C23.5 25.5 17.5 19.5 17.5 12C17.5 9.7 18.2 7.6 19.4 5.8C20.2 6 21.1 6 22 6Z"
            fill="#FDE047"
          />
          <polygon points="27,10 28,12 30,13 28,14 27,16 26,14 24,13 26,12" fill="#FFFFFF" />
        </svg>
      );

    case 'thunder':
      return (
        <svg viewBox="0 0 36 36" className={`${dim} ${className}`} fill="none">
          <path
            d="M10,18 C8,18 6.5,16.5 6.5,14.5 C6.5,12.7 7.8,11.2 9.6,11 C10.3,8.7 12.4,7 15,7 C18.3,7 21,9.5 21.3,12.7 C23,13 24.2,14.3 24.2,16 C24.2,17.3 23.2,18 21.8,18 Z"
            fill="#E2E8F0"
            stroke="#475569"
            strokeWidth="1.8"
          />
          <polygon points="17,19 13,26 17,26 15,32 21,24 17,24" fill="#FACC15" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 36 36" className={`${dim} ${className}`} fill="none" stroke="currentColor">
          <circle cx="18" cy="18" r="6" fill="#F59E0B" stroke="#F59E0B" />
        </svg>
      );
  }
};
