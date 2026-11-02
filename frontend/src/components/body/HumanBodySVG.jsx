// components/body/HumanBodySVG.jsx
// Interactive SVG human body figure with anatomical regions that glow green/yellow/red
// based on evaluated clinical status and highlight on selection.

import React from 'react';
import { motion } from 'framer-motion';

export default function HumanBodySVG({
  partStatuses = {},
  selectedPart = 'heart',
  onPartClick = () => {}
}) {
  const getStatusColor = (partId) => {
    const status = partStatuses[partId] || 'green';
    switch (status) {
      case 'red': return { fill: '#ef4444', stroke: '#f87171', glow: 'rgba(239, 68, 68, 0.7)' };
      case 'yellow': return { fill: '#eab308', stroke: '#fde047', glow: 'rgba(234, 179, 8, 0.7)' };
      default: return { fill: '#10b981', stroke: '#34d399', glow: 'rgba(16, 185, 129, 0.5)' };
    }
  };

  const systems = [
    { id: 'brain', label: 'Brain / Neuro', x: 200, y: 55 },
    { id: 'eyes', label: 'Eyes (SANS)', x: 200, y: 78 },
    { id: 'heart', label: 'Heart & Cardio', x: 185, y: 165 },
    { id: 'lungs', label: 'Lungs & Resp', x: 200, y: 155 },
    { id: 'immune_system', label: 'Immune & Lymph', x: 200, y: 205 },
    { id: 'digestive', label: 'GI & Digestion', x: 200, y: 250 },
    { id: 'bones_muscles', label: 'Bones & Muscle Frame', x: 200, y: 350 },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto select-none py-2">
      <svg
        viewBox="0 0 400 560"
        className="w-full h-auto max-h-[540px] drop-shadow-2xl"
      >
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bodyBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.4" />
          </radialGradient>
        </defs>

        {/* Anatomical Background Silhouette */}
        <g opacity="0.4" stroke="#334155" strokeWidth="1.5" fill="url(#bodyBg)">
          {/* Head & Neck */}
          <path d="M 180,45 C 180,25 220,25 220,45 C 220,70 215,85 210,95 L 210,110 L 190,110 L 190,95 C 185,85 180,70 180,45 Z" />
          {/* Torso */}
          <path d="M 160,115 L 240,115 L 230,280 L 170,280 Z" />
          {/* Arms */}
          <path d="M 160,115 L 125,180 L 105,270 L 115,275 L 138,190 L 165,135 Z" />
          <path d="M 240,115 L 275,180 L 295,270 L 285,275 L 262,190 L 235,135 Z" />
          {/* Legs */}
          <path d="M 170,280 L 160,400 L 155,510 L 175,510 L 188,400 L 195,290 Z" />
          <path d="M 230,280 L 240,400 L 245,510 L 225,510 L 212,400 L 205,290 Z" />
        </g>

        {/* --- INTERACTIVE SYSTEM OVERLAYS --- */}

        {/* 1. BRAIN & NERVOUS SYSTEM */}
        {(() => {
          const { fill, stroke } = getStatusColor('brain');
          const isSelected = selectedPart === 'brain';
          return (
            <g
              onClick={() => onPartClick('brain')}
              className="cursor-pointer group transition-all"
            >
              <ellipse
                cx="200"
                cy="50"
                rx="22"
                ry="20"
                fill={fill}
                fillOpacity={isSelected ? 0.65 : 0.3}
                stroke={stroke}
                strokeWidth={isSelected ? 3 : 1.5}
                filter="url(#neon-glow)"
                className="transition-all duration-300 group-hover:fill-opacity-70"
              />
              {/* Brain Gyri Details */}
              <path
                d="M 190,45 Q 200,38 210,45 Q 200,55 190,45 Z M 192,54 Q 200,60 208,54"
                stroke={stroke}
                strokeWidth="1.2"
                fill="none"
              />
            </g>
          );
        })()}

        {/* 2. EYES / VISUAL SYSTEM (SANS) */}
        {(() => {
          const { fill, stroke } = getStatusColor('eyes');
          const isSelected = selectedPart === 'eyes';
          return (
            <g
              onClick={() => onPartClick('eyes')}
              className="cursor-pointer group"
            >
              <ellipse
                cx="192"
                cy="68"
                rx="5"
                ry="4"
                fill={fill}
                fillOpacity={isSelected ? 0.9 : 0.6}
                stroke={stroke}
                strokeWidth={isSelected ? 2 : 1}
              />
              <ellipse
                cx="208"
                cy="68"
                rx="5"
                ry="4"
                fill={fill}
                fillOpacity={isSelected ? 0.9 : 0.6}
                stroke={stroke}
                strokeWidth={isSelected ? 2 : 1}
              />
            </g>
          );
        })()}

        {/* 3. LUNGS & RESPIRATORY */}
        {(() => {
          const { fill, stroke } = getStatusColor('lungs');
          const isSelected = selectedPart === 'lungs';
          return (
            <g
              onClick={() => onPartClick('lungs')}
              className="cursor-pointer group"
            >
              {/* Left Lung */}
              <path
                d="M 175,135 C 165,145 162,175 174,185 C 182,185 186,170 185,140 Z"
                fill={fill}
                fillOpacity={isSelected ? 0.6 : 0.25}
                stroke={stroke}
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter="url(#neon-glow)"
                className="transition-all duration-300 group-hover:fill-opacity-60"
              />
              {/* Right Lung */}
              <path
                d="M 225,135 C 235,145 238,175 226,185 C 218,185 214,170 215,140 Z"
                fill={fill}
                fillOpacity={isSelected ? 0.6 : 0.25}
                stroke={stroke}
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter="url(#neon-glow)"
                className="transition-all duration-300 group-hover:fill-opacity-60"
              />
            </g>
          );
        })()}

        {/* 4. HEART & CARDIOVASCULAR */}
        {(() => {
          const { fill, stroke } = getStatusColor('heart');
          const isSelected = selectedPart === 'heart';
          return (
            <g
              onClick={() => onPartClick('heart')}
              className="cursor-pointer group"
            >
              <path
                d="M 194,152 C 190,146 178,148 178,158 C 178,168 194,178 194,178 C 194,178 210,168 210,158 C 210,148 198,146 194,152 Z"
                fill={fill}
                fillOpacity={isSelected ? 0.9 : 0.6}
                stroke={stroke}
                strokeWidth={isSelected ? 3 : 2}
                filter="url(#neon-glow)"
                className="transition-all duration-300 group-hover:scale-110 origin-center"
              />
            </g>
          );
        })()}

        {/* 5. IMMUNE & LYMPHATIC SYSTEM */}
        {(() => {
          const { fill, stroke } = getStatusColor('immune_system');
          const isSelected = selectedPart === 'immune_system';
          return (
            <g
              onClick={() => onPartClick('immune_system')}
              className="cursor-pointer group"
            >
              <circle
                cx="200"
                cy="195"
                r="14"
                fill={fill}
                fillOpacity={isSelected ? 0.7 : 0.3}
                stroke={stroke}
                strokeWidth={isSelected ? 2.5 : 1.5}
                strokeDasharray="3 3"
                className="transition-all duration-300 group-hover:fill-opacity-60"
              />
              <path
                d="M 200,185 L 200,205 M 190,195 L 210,195"
                stroke={stroke}
                strokeWidth="1.5"
              />
            </g>
          );
        })()}

        {/* 6. DIGESTIVE SYSTEM */}
        {(() => {
          const { fill, stroke } = getStatusColor('digestive');
          const isSelected = selectedPart === 'digestive';
          return (
            <g
              onClick={() => onPartClick('digestive')}
              className="cursor-pointer group"
            >
              <path
                d="M 185,225 Q 200,215 215,225 Q 220,245 200,255 Q 180,245 185,225 Z"
                fill={fill}
                fillOpacity={isSelected ? 0.65 : 0.3}
                stroke={stroke}
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter="url(#neon-glow)"
                className="transition-all duration-300 group-hover:fill-opacity-60"
              />
              <path
                d="M 190,235 Q 200,245 210,235"
                stroke={stroke}
                strokeWidth="1.5"
                fill="none"
              />
            </g>
          );
        })()}

        {/* 7. BONES & MUSCULOSKELETAL FRAME */}
        {(() => {
          const { fill, stroke } = getStatusColor('bones_muscles');
          const isSelected = selectedPart === 'bones_muscles';
          return (
            <g
              onClick={() => onPartClick('bones_muscles')}
              className="cursor-pointer group"
            >
              {/* Spine */}
              <line
                x1="200" y1="110" x2="200" y2="280"
                stroke={stroke}
                strokeWidth={isSelected ? 4 : 2.5}
                strokeDasharray="4 2"
              />
              {/* Arm Bones / Muscles */}
              <path
                d="M 155,145 L 120,220 M 245,145 L 280,220"
                stroke={stroke}
                strokeWidth={isSelected ? 3.5 : 2}
                strokeLinecap="round"
                opacity={isSelected ? 0.9 : 0.6}
              />
              {/* Leg Bones / Femurs */}
              <path
                d="M 180,310 L 165,460 M 220,310 L 235,460"
                stroke={stroke}
                strokeWidth={isSelected ? 4 : 2.5}
                strokeLinecap="round"
                opacity={isSelected ? 0.9 : 0.6}
              />
            </g>
          );
        })()}

        {/* Labels & System Callout Lines */}
        <g className="text-[10px] fill-gray-400 font-mono select-none pointer-events-none">
          <text x="50" y="55">BRAIN</text>
          <line x1="90" y1="52" x2="175" y2="52" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />

          <text x="315" y="72">EYES / SANS</text>
          <line x1="225" y1="68" x2="310" y2="68" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />

          <text x="50" y="165">HEART</text>
          <line x1="90" y1="162" x2="175" y2="162" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />

          <text x="315" y="150">LUNGS</text>
          <line x1="235" y1="150" x2="310" y2="150" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />

          <text x="50" y="235">DIGESTION</text>
          <line x1="110" y1="232" x2="180" y2="232" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />

          <text x="315" y="380">SKELETON / ARED</text>
          <line x1="235" y1="380" x2="310" y2="380" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />
        </g>
      </svg>

      <div className="flex flex-wrap gap-2 justify-center mt-3">
        {systems.map((s) => {
          const status = partStatuses[s.id] || 'green';
          const isSelected = selectedPart === s.id;
          const statusBg =
            status === 'red' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
            status === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
            'bg-green-500/20 text-green-400 border-green-500/40';

          return (
            <button
              key={s.id}
              onClick={() => onPartClick(s.id)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${statusBg} ${
                isSelected ? 'ring-2 ring-cyan-400 scale-105 font-bold' : 'hover:scale-102 opacity-80'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
