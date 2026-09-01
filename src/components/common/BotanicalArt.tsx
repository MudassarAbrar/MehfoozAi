/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Serene Meditation & Safety Figure with Foliage
 * Matches the lilac/lavender/charcoal palette
 */
export const SereneWomanIllustration: React.FC<{ className?: string }> = ({ className = 'w-64 h-64' }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Soft Lilac Ambient Circle */}
        <radialGradient id="lilacGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C084FC" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#E9D5FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Top Left Floating Sun/Circle */}
      <circle cx="130" cy="110" r="55" fill="#DDD6FE" />
      {/* Top Right Floating Accent Dot */}
      <circle cx="310" cy="150" r="14" fill="#C084FC" />

      {/* Background Soft Organic Backdrop */}
      <path
        d="M60 220C60 160 140 130 200 130C280 130 350 180 350 260C350 340 260 370 190 370C110 370 60 300 60 220Z"
        fill="#F5EEFD"
      />

      {/* Foliage Elements */}
      {/* Left Palm Leaf Fronds */}
      <g transform="translate(40, 140) rotate(-25)">
        <path d="M10 150 Q 80 80 160 20" stroke="#7E22CE" strokeWidth="4" strokeLinecap="round" />
        {/* Palm Leaflets */}
        <path d="M30 130 Q 5 110 0 90 Q 25 110 40 120 Z" fill="#9333EA" />
        <path d="M50 110 Q 20 85 10 65 Q 40 85 60 100 Z" fill="#A855F7" />
        <path d="M70 90 Q 35 60 25 40 Q 60 60 80 80 Z" fill="#C084FC" />
        <path d="M90 70 Q 55 40 45 20 Q 80 40 100 60 Z" fill="#7E22CE" />
        <path d="M110 50 Q 75 20 65 0 Q 100 20 120 40 Z" fill="#9333EA" />
        <path d="M130 30 Q 105 10 95 -10 Q 120 10 140 25 Z" fill="#A855F7" />
      </g>

      {/* Right Side Tropical Palm Leaves */}
      <g transform="translate(220, 160) rotate(35)">
        <path d="M10 150 Q 80 80 160 20" stroke="#7E22CE" strokeWidth="4" strokeLinecap="round" />
        <path d="M30 130 Q 10 105 5 85 Q 30 105 45 120 Z" fill="#9333EA" />
        <path d="M50 110 Q 25 80 15 60 Q 45 80 65 100 Z" fill="#A855F7" />
        <path d="M70 90 Q 40 55 30 35 Q 65 55 85 80 Z" fill="#C084FC" />
        <path d="M90 70 Q 60 35 50 15 Q 85 35 105 60 Z" fill="#A855F7" />
      </g>

      {/* Cutout Silhouette Behind Right Shoulder */}
      <path
        d="M290 190 C330 190 350 230 340 270 C330 300 290 310 270 300 C270 290 280 275 285 260 C270 265 260 255 265 240 C250 245 245 235 250 220 C240 220 235 210 240 200 C260 190 275 190 290 190 Z"
        fill="#EDE9FE"
      />

      {/* Sitting Woman Figure */}
      <g transform="translate(130, 95)">
        {/* Long Flowing Dark Hair (Back) */}
        <path
          d="M70 40 C30 50 20 100 25 145 C30 180 55 200 70 190 C60 150 50 110 70 70 Z"
          fill="#181A20"
        />
        
        {/* Head & Neck */}
        <circle cx="72" cy="52" r="18" fill="#F4D0C2" />
        
        {/* Hair Bun / Flowing Locks (Front) */}
        <path
          d="M70 30 C50 30 45 50 50 75 C55 100 65 110 75 110 C85 110 90 90 90 65 C90 40 85 30 70 30 Z"
          fill="#181A20"
        />

        {/* Arms In Anjali Mudra / Prayer Posture */}
        <path
          d="M48 95 C35 105 30 120 40 135 C50 145 65 130 70 115 Z"
          fill="#F4D0C2"
        />
        <path
          d="M96 95 C109 105 114 120 104 135 C94 145 79 130 74 115 Z"
          fill="#F4D0C2"
        />
        {/* Hands Together */}
        <path
          d="M67 95 C67 85 77 85 77 95 L75 115 L69 115 Z"
          fill="#E6BDB0"
        />

        {/* Torso / Top */}
        <path
          d="M58 85 L86 85 L84 120 L60 120 Z"
          fill="#FAF5FF"
        />
        {/* Waist Accent */}
        <path
          d="M62 120 L82 120 L80 130 L64 130 Z"
          fill="#DDD6FE"
        />

        {/* Crossed Legs in Lotus / Meditation Posture */}
        {/* Left Leg */}
        <path
          d="M64 130 C30 135 10 160 15 180 C20 195 50 200 70 190 C60 170 60 150 64 130 Z"
          fill="#6B21A8"
        />
        {/* Right Leg */}
        <path
          d="M80 130 C114 135 134 160 129 180 C124 195 94 200 74 190 C84 170 84 150 80 130 Z"
          fill="#6B21A8"
        />

        {/* Subtle Pattern Dots on Pants */}
        <g fill="#A855F7">
          <circle cx="35" cy="165" r="2" />
          <circle cx="45" cy="175" r="2" />
          <circle cx="28" cy="180" r="1.5" />
          <circle cx="105" cy="165" r="2" />
          <circle cx="95" cy="175" r="2" />
          <circle cx="112" cy="180" r="1.5" />
        </g>
      </g>

      {/* Foreground Foliage Stems Framed Around Base */}
      <g transform="translate(100, 240)">
        <path d="M0 60 Q 60 20 120 0" stroke="#581C87" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 50 Q 5 35 0 20 Q 25 35 35 45 Z" fill="#7E22CE" />
        <path d="M50 35 Q 35 15 30 0 Q 55 20 65 30 Z" fill="#9333EA" />
        <path d="M80 20 Q 65 0 60 -15 Q 85 5 95 15 Z" fill="#6B21A8" />
      </g>
    </svg>
  );
};

/**
 * Stylized Abstract Woman Face & Hijab Profile Contour Art
 */
export const ProfileSilhouetteArt: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Lilac Backdrop Shape */}
      <path
        d="M20 30 C60 0 160 10 180 50 C200 90 190 150 150 170 C100 190 30 170 10 130 C-10 90 -10 60 20 30 Z"
        fill="#DDD6FE"
      />
      {/* Woman's Face / Modest Wrap Silhouette */}
      <path
        d="M120 50 C100 50 85 65 85 85 C85 105 100 120 115 125 L115 145 C90 140 70 120 70 90 C70 60 90 40 120 40 C150 40 170 60 170 90 C170 120 150 145 125 150 L125 130 C140 125 155 105 155 85 C155 65 140 50 120 50 Z"
        fill="#F5EEFD"
      />
      <circle cx="110" cy="85" r="16" fill="#F4D0C2" />
    </svg>
  );
};

/**
 * Botanical Palm Fronds Vector for Card Accents
 */
export const PalmFrondsArt: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#7E22CE'
}) => {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 110 Q 60 60 110 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 95 Q 5 80 0 65 Q 20 80 35 90 Z" fill={color} />
      <path d="M45 80 Q 20 60 15 45 Q 40 60 55 75 Z" fill={color} />
      <path d="M65 60 Q 40 40 35 25 Q 60 40 75 55 Z" fill={color} />
      <path d="M85 40 Q 60 20 55 5 Q 80 20 95 35 Z" fill={color} />
      <path d="M105 20 Q 85 5 80 -10 Q 100 5 110 15 Z" fill={color} />
    </svg>
  );
};

/**
 * Monstera Leaf Silhouette
 */
export const MonsteraLeafArt: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#9333EA'
}) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M50 10 C30 10 15 25 15 45 C15 55 20 60 25 60 C22 50 25 40 32 35 C30 45 35 55 42 60 C40 50 45 40 54 35 C52 45 58 55 68 58 C68 45 74 38 82 35 C80 48 85 55 90 50 C95 45 90 25 75 15 C65 10 58 10 50 10 Z"
        fill={color}
      />
      <path d="M50 10 L50 90" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
};
