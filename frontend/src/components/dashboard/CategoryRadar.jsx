// components/dashboard/CategoryRadar.jsx
// Recharts radar chart displaying holistic physiological and cognitive health across 5 core categories.

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function CategoryRadar({ categories = {} }) {
  const radarData = [
    {
      category: 'Cardiovascular',
      score: categories?.cardiovascular?.score ?? 80,
      fullMark: 100
    },
    {
      category: 'Bone & Muscle',
      score: categories?.bone_muscle?.score ?? 85,
      fullMark: 100
    },
    {
      category: 'Immune System',
      score: categories?.immune?.score ?? 75,
      fullMark: 100
    },
    {
      category: 'Nutrition & GI',
      score: categories?.nutrition?.score ?? 90,
      fullMark: 100
    },
    {
      category: 'Mental Health',
      score: categories?.mental_health?.score ?? 70,
      fullMark: 100
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-cyan-500/40 px-3 py-2 rounded-lg shadow-xl text-xs backdrop-blur-md">
          <p className="font-semibold text-cyan-400">{data.category}</p>
          <p className="text-white font-bold text-sm mt-0.5">{data.score} / 100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.15)" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 9 }}
            stroke="rgba(255, 255, 255, 0.1)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Conditioning Score"
            dataKey="score"
            stroke="#22d3ee"
            fill="#06b6d4"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
