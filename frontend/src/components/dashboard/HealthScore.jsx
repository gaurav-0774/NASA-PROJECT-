// components/dashboard/HealthScore.jsx
// Circular gauge widget displaying the overall composite health score (0-100).

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

export default function HealthScore({ score = 0, size = 180, strokeWidth = 14 }) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = '#22c55e'; // green
  let glowColor = 'rgba(34, 197, 94, 0.4)';
  let statusText = 'Optimal Conditioning';
  let Icon = ShieldCheck;

  if (normalizedScore < 50) {
    color = '#ef4444'; // red
    glowColor = 'rgba(239, 68, 68, 0.5)';
    statusText = 'Contact Flight Surgeon';
    Icon = AlertCircle;
  } else if (normalizedScore < 75) {
    color = '#eab308'; // yellow
    glowColor = 'rgba(234, 179, 8, 0.4)';
    statusText = 'Active Watch Protocol';
    Icon = AlertTriangle;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score indicator */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
            style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-black tracking-tight"
            style={{ color }}
          >
            {normalizedScore}
          </motion.span>
          <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">
            Health Index
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
           style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color }}>
        <Icon className="w-3.5 h-3.5" />
        <span>{statusText}</span>
      </div>
    </div>
  );
}
