/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

export type WeatherTheme = 'day' | 'night' | 'sunset' | 'rainy';

interface LandscapeIllustrationProps {
  theme: WeatherTheme;
  interactive?: boolean;
}

export const LandscapeIllustration: React.FC<LandscapeIllustrationProps> = ({ theme }) => {
  const isNight = theme === 'night';
  const isSunset = theme === 'sunset';
  const isRainy = theme === 'rainy';

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 400 700"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Day Gradients */}
          <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87B9F8" />
            <stop offset="35%" stopColor="#B4D5FB" />
            <stop offset="55%" stopColor="#FAD3C3" />
            <stop offset="75%" stopColor="#F5C7AF" />
            <stop offset="100%" stopColor="#E9B7A6" />
          </linearGradient>

          {/* Sunset Gradients */}
          <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A659E" />
            <stop offset="30%" stopColor="#9C6B98" />
            <stop offset="55%" stopColor="#DE7B74" />
            <stop offset="75%" stopColor="#F6A373" />
            <stop offset="100%" stopColor="#F9CC8B" />
          </linearGradient>

          {/* Night Gradients */}
          <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E2A68" />
            <stop offset="30%" stopColor="#2D3177" />
            <stop offset="55%" stopColor="#43377E" />
            <stop offset="80%" stopColor="#553D7C" />
            <stop offset="100%" stopColor="#6C457D" />
          </linearGradient>

          {/* Rainy Sky */}
          <linearGradient id="rainySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4B607A" />
            <stop offset="40%" stopColor="#6B8099" />
            <stop offset="70%" stopColor="#8E9DAE" />
            <stop offset="100%" stopColor="#A8B4C0" />
          </linearGradient>

          {/* Sun / Moon Glow Gradients */}
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF7E6" stopOpacity="1" />
            <stop offset="40%" stopColor="#FDB871" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#F97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="50%" stopColor="#E2E8F0" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#94A3B8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
          </radialGradient>

          {/* Hill Gradients - Layer 1 (Far Background) */}
          <linearGradient id="farHillsDay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8E5D8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D9B7B5" />
          </linearGradient>

          <linearGradient id="farHillsNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5E4E8C" />
            <stop offset="100%" stopColor="#463A75" />
          </linearGradient>

          {/* Hill Gradients - Layer 2 (Mid-Far Background) */}
          <linearGradient id="midFarHillsDay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C99AA3" />
            <stop offset="60%" stopColor="#A67B8E" />
            <stop offset="100%" stopColor="#8E637D" />
          </linearGradient>

          <linearGradient id="midFarHillsNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#493D77" />
            <stop offset="100%" stopColor="#362E61" />
          </linearGradient>

          {/* Hill Gradients - Layer 3 (Midground) */}
          <linearGradient id="midHillsDay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#875E7E" />
            <stop offset="40%" stopColor="#6C4D70" />
            <stop offset="100%" stopColor="#563E63" />
          </linearGradient>

          <linearGradient id="midHillsNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#372F66" />
            <stop offset="100%" stopColor="#252150" />
          </linearGradient>

          {/* Hill Gradients - Layer 4 (Foreground Tuscan Greens/Purples) */}
          <linearGradient id="foreHillsDay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7E9B89" />
            <stop offset="40%" stopColor="#5E7C74" />
            <stop offset="100%" stopColor="#405B5C" />
          </linearGradient>

          <linearGradient id="foreHillsNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D355F" />
            <stop offset="50%" stopColor="#1F264C" />
            <stop offset="100%" stopColor="#141B3B" />
          </linearGradient>

          {/* Soft Filter for Moon Aura */}
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. SKY BACKGROUND */}
        <rect
          width="400"
          height="700"
          fill={
            isNight
              ? 'url(#nightSky)'
              : isSunset
              ? 'url(#sunsetSky)'
              : isRainy
              ? 'url(#rainySky)'
              : 'url(#daySky)'
          }
        />

        {/* 2. STARS & SHOOTING STARS (Night Mode) */}
        {isNight && (
          <g id="stars-layer" opacity="0.85">
            {/* Stars cluster */}
            <circle cx="65" cy="120" r="1" fill="#FFFFFF" opacity="0.9" />
            <circle cx="110" cy="85" r="1.5" fill="#FFFFFF" opacity="0.95" />
            <circle cx="160" cy="140" r="0.8" fill="#FFFFFF" opacity="0.7" />
            <circle cx="210" cy="95" r="1.2" fill="#FFFFFF" opacity="0.8" />
            <circle cx="270" cy="130" r="1" fill="#FFFFFF" opacity="0.9" />
            <circle cx="340" cy="90" r="1.5" fill="#FFFFFF" opacity="0.95" />
            <circle cx="370" cy="160" r="0.8" fill="#FFFFFF" opacity="0.6" />
            <circle cx="80" cy="200" r="1" fill="#FFFFFF" opacity="0.75" />
            <circle cx="310" cy="220" r="1.2" fill="#FFFFFF" opacity="0.85" />
            <circle cx="250" cy="180" r="0.8" fill="#FFFFFF" opacity="0.6" />
            <circle cx="50" cy="70" r="1.2" fill="#FFFFFF" opacity="0.8" />
            <circle cx="180" cy="60" r="1" fill="#FFFFFF" opacity="0.9" />
            <circle cx="320" cy="50" r="1" fill="#FFFFFF" opacity="0.7" />

            {/* Glowing twinkle stars */}
            <g transform="translate(90, 160) scale(0.6)">
              <polygon points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="#FFFFFF" />
            </g>
            <g transform="translate(340, 115) scale(0.7)">
              <polygon points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="#FFFFFF" />
            </g>
            <g transform="translate(230, 240) scale(0.5)">
              <polygon points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="#FFFFFF" />
            </g>

            {/* Shooting Star Streak across right sky (Matching Image 2) */}
            <g opacity="0.9">
              <line
                x1="360"
                y1="190"
                x2="280"
                y2="240"
                stroke="url(#moonGlow)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="60"
              />
              <circle cx="280" cy="240" r="2" fill="#FFFFFF" filter="url(#softGlow)" />
            </g>
          </g>
        )}

        {/* 3. CELESTIAL BODIES (SUN / MOON) */}
        {!isNight && !isRainy && (
          <g id="sun-layer">
            {/* Ambient Sun Corona */}
            <circle cx="305" cy="275" r="70" fill="url(#sunGlow)" opacity="0.55" />
            {/* Core Sun */}
            <circle cx="305" cy="275" r="32" fill="#FDBA74" opacity="0.95" />
            <circle cx="305" cy="275" r="28" fill="#FFF7ED" opacity="0.98" />

            {/* Birds Soaring (Matching Image 1 & 3) */}
            <g opacity="0.75" stroke="#4A3B4E" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M235,210 Q240,205 245,210 Q250,205 255,210" />
              <path d="M275,215 Q279,211 283,215 Q287,211 291,215" transform="scale(0.85) translate(40, 30)" />
              <path d="M225,230 Q228,227 231,230 Q234,227 237,230" transform="scale(0.7) translate(100, 80)" />
            </g>
          </g>
        )}

        {isNight && (
          <g id="moon-layer">
            {/* Luminous Moon (Matching Image 2) */}
            <circle cx="170" cy="290" r="60" fill="url(#moonGlow)" opacity="0.3" filter="url(#softGlow)" />
            <circle cx="170" cy="290" r="34" fill="#FFFFFF" opacity="0.98" />
            {/* Soft moon craters */}
            <circle cx="160" cy="285" r="5" fill="#E2E8F0" opacity="0.5" />
            <circle cx="175" cy="298" r="7" fill="#E2E8F0" opacity="0.4" />
            <circle cx="180" cy="282" r="4" fill="#E2E8F0" opacity="0.4" />
          </g>
        )}

        {/* 4. FAR BACKGROUND MISTY HILLS */}
        <g id="far-hills">
          <path
            d="M-20,330 Q80,285 200,310 T420,315 L420,440 L-20,440 Z"
            fill={isNight ? 'url(#farHillsNight)' : 'url(#farHillsDay)'}
            opacity="0.8"
          />
          {/* Subtle haze contour */}
          <path
            d="M-10,340 Q110,310 240,330 T410,335"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.4"
            fill="none"
          />
        </g>

        {/* 5. MID-BACKGROUND ROLLING RIDGES (Layer 2) */}
        <g id="mid-far-hills">
          <path
            d="M-20,365 Q110,315 270,360 T420,340 L420,500 L-20,500 Z"
            fill={isNight ? 'url(#midFarHillsNight)' : 'url(#midFarHillsDay)'}
          />
          {/* Texture lines across ridge */}
          <path
            d="M0,375 Q130,335 290,370"
            stroke={isNight ? '#6D5B99' : '#D0A0AD'}
            strokeWidth="0.8"
            strokeDasharray="2,3"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M40,390 Q170,350 330,385"
            stroke={isNight ? '#6D5B99' : '#D0A0AD'}
            strokeWidth="0.8"
            strokeDasharray="2,4"
            fill="none"
            opacity="0.5"
          />
        </g>

        {/* 6. MIDGROUND SLOPING HILLS (Layer 3) */}
        <g id="mid-hills">
          <path
            d="M-20,420 Q140,380 290,440 T420,410 L420,600 L-20,600 Z"
            fill={isNight ? 'url(#midHillsNight)' : 'url(#midHillsDay)'}
          />
          {/* Farmhouse on mid hill (Right) */}
          <g transform="translate(320, 395) scale(0.65)" opacity={isNight ? '0.85' : '1'}>
            <rect x="0" y="8" width="16" height="12" fill={isNight ? '#2A244D' : '#E8DDD0'} />
            <polygon points="-2,8 8,0 18,8" fill={isNight ? '#5E3A52' : '#C05A46'} />
            <rect x="18" y="11" width="12" height="9" fill={isNight ? '#241F42' : '#DCD0C0'} />
            <polygon points="16,11 24,5 32,11" fill={isNight ? '#4C3044' : '#A94836'} />
            {isNight && (
              <circle cx="8" cy="14" r="1.5" fill="#FDE047" opacity="0.9" />
            )}
          </g>
        </g>

        {/* 7. FOREGROUND ROLLING VINEYARDS & TUSCAN VALLEYS (Layer 4) */}
        <g id="fore-hills">
          {/* Left slope */}
          <path
            d="M-20,470 Q90,430 200,480 Q290,520 420,460 L420,700 L-20,700 Z"
            fill={isNight ? 'url(#foreHillsNight)' : 'url(#foreHillsDay)'}
          />

          {/* Right overlapping slope */}
          <path
            d="M420,510 Q280,480 150,540 Q60,570 -20,530 L-20,700 L420,700 Z"
            fill={isNight ? '#161D3D' : '#3B5752'}
            opacity="0.92"
          />

          {/* Terraced vineyard striping / fields */}
          <g opacity={isNight ? '0.4' : '0.45'} stroke={isNight ? '#3D4A80' : '#88AC95'} strokeWidth="1" fill="none">
            <path d="M10,485 Q90,455 170,495" strokeDasharray="3,3" />
            <path d="M20,505 Q100,475 180,515" strokeDasharray="3,3" />
            <path d="M40,525 Q110,498 175,535" strokeDasharray="3,3" />
            <path d="M250,520 Q320,490 390,505" strokeDasharray="3,3" />
            <path d="M270,540 Q330,515 385,530" strokeDasharray="3,3" />
          </g>

          {/* Tuscan Villa / Cottage complex (Left Foreground - Matching Image 1 & 2) */}
          <g transform="translate(45, 500) scale(0.85)" opacity={isNight ? '0.9' : '1'}>
            {/* Main house */}
            <rect x="0" y="8" width="22" height="15" fill={isNight ? '#1C2347' : '#F5EBE1'} />
            <polygon points="-2,8 11,-1 24,8" fill={isNight ? '#593246' : '#C75D46'} />
            {/* Side barn */}
            <rect x="23" y="11" width="14" height="12" fill={isNight ? '#161B3B' : '#E2D5C7'} />
            <polygon points="21,11 30,5 39,11" fill={isNight ? '#462737' : '#B14F3A'} />
            {/* Cypress trees around house */}
            <path d="M-6,22 C-6,14 -4,6 -3,0 C-2,6 0,14 0,22 Z" fill={isNight ? '#0E132B' : '#2A433A'} />
            <path d="M42,22 C42,15 44,8 45,3 C46,8 48,15 48,22 Z" fill={isNight ? '#0E132B' : '#2A433A'} />
            <path d="M48,23 C48,17 50,11 51,7 C52,11 54,17 54,23 Z" fill={isNight ? '#0E132B' : '#20352E'} />

            {/* Glowing cozy window light at night */}
            {isNight && (
              <>
                <rect x="4" y="12" width="3.5" height="4" fill="#FDE047" opacity="0.9" />
                <rect x="13" y="12" width="3.5" height="4" fill="#FDE047" opacity="0.9" />
                <rect x="27" y="14" width="3" height="3" fill="#FDE047" opacity="0.75" />
              </>
            )}
          </g>

          {/* 8. SERPENTINE WHITE WINDING ROAD (Iconic feature of Tuscany - Matching all mockups) */}
          <path
            d="M275,515 C260,525 240,528 220,530 C180,535 220,548 245,555 C275,562 250,580 200,590 C150,600 130,620 170,640 C210,660 220,680 200,700"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isNight ? '0.75' : '0.92'}
          />
          {/* Subtle road edge shadow */}
          <path
            d="M275,515 C260,525 240,528 220,530 C180,535 220,548 245,555 C275,562 250,580 200,590 C150,600 130,620 170,640 C210,660 220,680 200,700"
            fill="none"
            stroke={isNight ? '#0B0F24' : '#283B37'}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* Additional Cypress trees along the road */}
          <path d="M285,530 C285,520 287,510 288,504 C289,510 291,520 291,530 Z" fill={isNight ? '#0E132B' : '#2A433A'} />
          <path d="M190,560 C190,550 192,540 193,534 C194,540 196,550 196,560 Z" fill={isNight ? '#0E132B' : '#233931'} />
          <path d="M265,580 C265,568 267,556 268,548 C269,556 271,568 271,580 Z" fill={isNight ? '#0E132B' : '#2A433A'} />
        </g>
      </svg>
    </div>
  );
};
