// pages/Charts.jsx
// Telemetry Trend Visualizer displaying historical telemetry curves,
// shaded reference bands, critical limit lines, and mission progression.

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Activity,
  Heart,
  Moon,
  Dumbbell,
  Smile,
  Shield,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import IndicatorChart from '../components/charts/IndicatorChart';
import CategoryRadar from '../components/dashboard/CategoryRadar';
import GlassCard from '../components/common/GlassCard';
import { api } from '../services/api';
import { useMission } from '../context/MissionContext';

export default function Charts() {
  const { healthSummary } = useMission();
  const [history, setHistory] = useState([]);
  const [days, setDays] = useState(30);
  const [selectedIndicator, setSelectedIndicator] = useState('sleep_hours');
  const [loading, setLoading] = useState(true);

  const indicatorsMeta = {
    heart_rate: { name: 'Heart Rate', unit: 'bpm', normalRange: { min: 60, max: 100 }, criticalRange: { min: 50, max: 120 } },
    blood_pressure_systolic: { name: 'Systolic Blood Pressure', unit: 'mmHg', normalRange: { min: 90, max: 120 }, criticalRange: { min: 80, max: 140 } },
    blood_pressure_diastolic: { name: 'Diastolic Blood Pressure', unit: 'mmHg', normalRange: { min: 60, max: 80 }, criticalRange: { min: 50, max: 90 } },
    sleep_hours: { name: 'Sleep Duration', unit: 'hours', normalRange: { min: 7.0, max: 9.0 }, criticalRange: { min: 4.0, max: 12.0 } },
    exercise_minutes: { name: 'ARED / Cardio Countermeasure', unit: 'min', normalRange: { min: 120, max: 180 }, criticalRange: { min: 60, max: 300 } },
    mood: { name: 'Behavioral Health / Mood', unit: 'scale', normalRange: { min: 3, max: 5 }, criticalRange: { min: 1, max: 5 } },
    spo2: { name: 'Blood Oxygen (SpO2)', unit: '%', normalRange: { min: 95, max: 100 }, criticalRange: { min: 90, max: 100 } },
    body_temperature: { name: 'Core Temperature', unit: '°C', normalRange: { min: 36.1, max: 37.2 }, criticalRange: { min: 35.0, max: 38.5 } },
    blood_glucose: { name: 'Blood Glucose', unit: 'mg/dL', normalRange: { min: 70, max: 100 }, criticalRange: { min: 60, max: 140 } },
    hydration: { name: 'Hydration Score', unit: 'scale', normalRange: { min: 3, max: 5 }, criticalRange: { min: 1, max: 5 } }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getHealthHistory(days)
      .then((res) => {
        if (isMounted) setHistory(res.data.logs || []);
      })
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [days]);

  const activeMeta = indicatorsMeta[selectedIndicator] || indicatorsMeta.sleep_hours;

  // Calculate statistics from current filtered slice
  const values = history.map(h => Number(h[selectedIndicator])).filter(v => !isNaN(v));
  const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '--';
  const min = values.length > 0 ? Math.min(...values).toFixed(1) : '--';
  const max = values.length > 0 ? Math.max(...values).toFixed(1) : '--';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.length ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
  const secondAvg = secondHalf.length ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
  const diff = secondAvg - firstAvg;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            Longitudinal Telemetry Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mission Health Trends & Biometrics
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track multi-week physiological trends to identify subtle progressive deconditioning.
          </p>
        </div>

        {/* Days Period Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass border border-white/10 self-start sm:self-auto">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                days === d
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {Object.entries(indicatorsMeta).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setSelectedIndicator(key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedIndicator === key
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                : 'glass border-white/5 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            {meta.name}
          </button>
        ))}
      </div>

      {/* Main Chart Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{activeMeta.name}</span>
              <span className="text-xs font-mono text-cyan-400">({activeMeta.unit})</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Green shaded band denotes nominal baseline range ({activeMeta.normalRange.min} - {activeMeta.normalRange.max} {activeMeta.unit})
            </p>
          </div>

          {/* Trend Tag */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            {Math.abs(diff) < 0.2 ? (
              <>
                <Minus className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Trend: Stable</span>
              </>
            ) : diff > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300">Trend: Upward (+{diff.toFixed(1)})</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300">Trend: Declining ({diff.toFixed(1)})</span>
              </>
            )}
          </div>
        </div>

        {/* Recharts Component */}
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <IndicatorChart
            data={history}
            dataKey={selectedIndicator}
            name={activeMeta.name}
            unit={activeMeta.unit}
            normalRange={activeMeta.normalRange}
            criticalRange={activeMeta.criticalRange}
          />
        )}

        {/* Statistical Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] font-mono uppercase text-gray-400">Average ({days}d)</p>
            <p className="text-xl font-bold text-white mt-1">{avg} <span className="text-xs font-normal text-gray-400">{activeMeta.unit}</span></p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] font-mono uppercase text-gray-400">Minimum</p>
            <p className="text-xl font-bold text-cyan-400 mt-1">{min} <span className="text-xs font-normal text-gray-400">{activeMeta.unit}</span></p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] font-mono uppercase text-gray-400">Maximum</p>
            <p className="text-xl font-bold text-purple-400 mt-1">{max} <span className="text-xs font-normal text-gray-400">{activeMeta.unit}</span></p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] font-mono uppercase text-gray-400">Nominal Range</p>
            <p className="text-xl font-bold text-green-400 mt-1">{activeMeta.normalRange.min}-{activeMeta.normalRange.max}</p>
          </div>
        </div>
      </GlassCard>

      {/* Holistic System Balance Comparison */}
      <GlassCard className="p-6">
        <h3 className="text-base font-bold text-white mb-1">
          Holistic Physiological Envelope Comparison
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Current cross-system equilibrium across Cardiovascular, Musculoskeletal, Immune, Nutrition, and Neuropsych domains.
        </p>
        <CategoryRadar categories={healthSummary?.categories} />
      </GlassCard>
    </div>
  );
}
