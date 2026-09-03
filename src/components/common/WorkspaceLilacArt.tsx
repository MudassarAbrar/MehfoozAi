/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Reclining / Seated Character with Phone on Stacked Cushions & Soft Lilac Backdrop
 * Matches Screen 1 from the uploaded UI reference exactly!
 */
export const SeatedPhoneWomanArt: React.FC<{ className?: string }> = ({ className = 'w-64 h-64' }) => {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Soft Mint Glow */}
        <radialGradient id="lilacGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ECF4F4" />
          <stop offset="100%" stopColor="#BCD4D4" />
        </radialGradient>
      </defs>

      {/* 1. Large Soft Mint Background Circle */}
      <circle cx="160" cy="140" r="95" fill="#ECF4F4" />
      
      {/* 2. Top Right Small Decorative Accent Dot */}
      <circle cx="240" cy="80" r="4" fill="#FC7454" />
      <circle cx="85" cy="180" r="3" fill="#BCD4D4" />

      {/* 3. Location Pin Marker Inside Mint Sun */}
      <g transform="translate(115, 80)">
        <path
          d="M20 5C11.7157 5 5 11.7157 5 20C5 31.25 20 45 20 45C20 45 35 31.25 35 20C35 11.7157 28.2843 5 20 5Z"
          fill="#FCFCFC"
          stroke="#1C2C34"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="20" r="6" fill="#BCD4D4" stroke="#1C2C34" strokeWidth="2" />
      </g>

      {/* 4. Three Stacked Pillows / Cushions (Matching Reference Illustration) */}
      {/* Top Cushion (Soft White) */}
      <g transform="translate(45, 175)">
        <path
          d="M10 25 C 40 10, 190 10, 220 25 C 200 45, 30 45, 10 25 Z"
          fill="#FCFCFC"
          stroke="#1C2C34"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="25" r="2.5" fill="#1C2C34" />
        <circle cx="220" cy="25" r="2.5" fill="#1C2C34" />
      </g>

      {/* Middle Cushion (Soft Teal) */}
      <g transform="translate(40, 200)">
        <path
          d="M10 25 C 40 8, 200 8, 230 25 C 210 48, 30 48, 10 25 Z"
          fill="#BCD4D4"
          stroke="#1C2C34"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="25" r="2.5" fill="#1C2C34" />
        <circle cx="230" cy="25" r="2.5" fill="#1C2C34" />
      </g>

      {/* Bottom Cushion (Dark Charcoal) */}
      <g transform="translate(42, 230)">
        <path
          d="M10 25 C 40 8, 195 8, 225 25 C 205 48, 30 48, 10 25 Z"
          fill="#1C2C34"
          stroke="#1C2C34"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="25" r="2.5" fill="#1C2C34" />
        <circle cx="225" cy="25" r="2.5" fill="#1C2C34" />
      </g>

      {/* 5. Seated Figure in Clean Modern Minimalist Line Art */}
      <g transform="translate(90, 85)">
        {/* Head with Short Stylized Hair */}
        <circle cx="130" cy="20" r="14" fill="#FCFCFC" stroke="#1C2C34" strokeWidth="2.5" />
        {/* Hair shape */}
        <path
          d="M120 18 C120 10 128 8 138 8 C144 8 144 14 142 20 C138 16 130 16 120 18 Z"
          fill="#1C2C34"
        />

        {/* Neck */}
        <path d="M126 34 L126 40" stroke="#1C2C34" strokeWidth="2.5" strokeLinecap="round" />

        {/* Torso / Top (Coral Accent Vest) */}
        <path
          d="M110 48 C125 40 135 40 145 48 L142 85 C130 90 115 90 105 85 Z"
          fill="#FC7454"
          stroke="#1C2C34"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Reclining Legs (Dark Charcoal Trousers) */}
        <path
          d="M105 85 C75 80 35 110 0 115 C-5 125 5 135 18 132 C45 125 80 110 115 95 Z"
          fill="#1C2C34"
          stroke="#1C2C34"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Feet / Shoes in White Line Art */}
        <path
          d="M-5 115 C-12 115 -18 122 -14 128 C-10 132 0 130 5 124 Z"
          fill="#FCFCFC"
          stroke="#1C2C34"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Arms Holding Smartphone */}
        {/* Right Arm */}
        <path
          d="M140 50 C145 65 140 80 120 82"
          fill="none"
          stroke="#1C2C34"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Left Arm bending forward to phone */}
        <path
          d="M115 50 C105 65 100 75 105 80"
          fill="none"
          stroke="#1C2C34"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Smartphone */}
        <rect
          x="100"
          y="65"
          width="9"
          height="18"
          rx="2"
          transform="rotate(15 100 65)"
          fill="#1C2C34"
        />
      </g>
    </svg>
  );
};

/**
 * Hanging Lamp & Wavy Ceiling Line Decor
 * Matches Screen 3 header illustration from uploaded reference
 */
export const PendantLampDecor: React.FC<{ className?: string }> = ({ className = 'w-full h-24' }) => {
  return (
    <svg viewBox="0 0 280 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Decorative Wavy Lines on Ceiling */}
      <path
        d="M20 15 C 60 45, 90 -10, 140 25 C 190 60, 230 10, 260 20"
        stroke="#1C2C34"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <circle cx="95" cy="18" r="2" fill="#1C2C34" opacity="0.5" />
      <circle cx="210" cy="35" r="2" fill="#1C2C34" opacity="0.5" />

      {/* Hanging Wire for Lamp */}
      <path d="M225 0 L225 35" stroke="#1C2C34" strokeWidth="1.5" />
      <circle cx="225" cy="35" r="3" fill="#1C2C34" />

      {/* Pendant Lamp Fixture */}
      <path
        d="M210 50 C210 40 240 40 240 50 L248 60 C248 63 202 63 202 60 Z"
        fill="#1C2C34"
      />
      {/* Lamp Light Bulb Glow */}
      <ellipse cx="225" cy="61" rx="14" ry="4" fill="#FCFCFC" />
      <circle cx="225" cy="62" r="3" fill="#FC7454" />
    </svg>
  );
};
