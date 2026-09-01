/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

export const AbstractSafetyShieldArt: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Floating Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Modern Layered Vector Geometric Art */}
      <svg
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain select-none"
      >
        <defs>
          <linearGradient id="absGrad1" x1="100" y1="100" x2="700" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8AD67E" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#67AC5C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2E6925" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="absGrad2" x1="700" y1="150" x2="200" y2="550" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#0EA5E9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="absGradGold" x1="400" y1="200" x2="500" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
          </linearGradient>

          <filter id="absGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Wave Ribbon 1 */}
        <motion.path
          animate={{
            d: [
              "M50,300 C200,180 350,420 500,280 C650,140 750,320 800,250 L800,600 L0,600 Z",
              "M50,320 C220,220 340,380 520,310 C660,180 730,290 800,280 L800,600 L0,600 Z",
              "M50,300 C200,180 350,420 500,280 C650,140 750,320 800,250 L800,600 L0,600 Z"
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          fill="url(#absGrad1)"
        />

        {/* Dynamic Wave Ribbon 2 */}
        <motion.path
          animate={{
            d: [
              "M0,380 C180,480 320,220 480,360 C640,500 720,340 800,420 L800,600 L0,600 Z",
              "M0,350 C190,440 310,260 490,340 C620,460 740,380 800,390 L800,600 L0,600 Z",
              "M0,380 C180,480 320,220 480,360 C640,500 720,340 800,420 L800,600 L0,600 Z"
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          fill="url(#absGrad2)"
        />

        {/* Geometric Isometric Floating Elements */}
        {/* Isometric Shield Ring */}
        <motion.g
          animate={{ y: [-8, 8, -8], rotate: [-1, 2, -1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <polygon
            points="400,120 520,180 520,320 400,390 280,320 280,180"
            fill="none"
            stroke="url(#absGrad1)"
            strokeWidth="3"
            strokeDasharray="8 6"
          />
          <polygon
            points="400,150 490,200 490,300 400,355 310,300 310,200"
            fill="rgba(103,172,92,0.06)"
            stroke="#67AC5C"
            strokeWidth="2"
          />
        </motion.g>

        {/* Floating Glowing Sphere Node 1 */}
        <motion.circle
          cx="260"
          cy="220"
          r="16"
          fill="url(#absGradGold)"
          filter="url(#absGlow)"
          animate={{ y: [-12, 12, -12], scale: [0.95, 1.1, 0.95] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Glowing Sphere Node 2 */}
        <motion.circle
          cx="540"
          cy="260"
          r="22"
          fill="#38BDF8"
          filter="url(#absGlow)"
          animate={{ y: [10, -14, 10], scale: [1.05, 0.9, 1.05] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbiting Satellite Path */}
        <ellipse
          cx="400"
          cy="260"
          rx="240"
          ry="70"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          transform="rotate(-12 400 260)"
        />

        {/* Floating Micro Nodes */}
        {[
          { cx: 160, cy: 340, r: 6, fill: '#67AC5C' },
          { cx: 620, cy: 190, r: 8, fill: '#F59E0B' },
          { cx: 340, cy: 430, r: 5, fill: '#38BDF8' },
          { cx: 480, cy: 100, r: 7, fill: '#8AD67E' },
          { cx: 680, cy: 390, r: 9, fill: '#0EA5E9' }
        ].map((node, i) => (
          <motion.circle
            key={i}
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill={node.fill}
            animate={{
              y: [i % 2 === 0 ? -10 : 10, i % 2 === 0 ? 10 : -10],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </svg>
    </div>
  );
};
