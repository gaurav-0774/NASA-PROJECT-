// pages/BodyMap.jsx
// Interactive Anatomical Systems Map with real-time glowing physiological states,
// linked telemetry readout, and prioritized medical actions.

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Activity, Sparkles, HelpCircle } from 'lucide-react';
import HumanBodySVG from '../components/body/HumanBodySVG';
import BodyPartPanel from '../components/body/BodyPartPanel';
import GlassCard from '../components/common/GlassCard';
import { useMission } from '../context/MissionContext';

export default function BodyMap() {
  const [selectedPart, setSelectedPart] = useState('heart');
  const [partStatuses, setPartStatuses] = useState({
    brain: 'yellow',
    heart: 'yellow',
    lungs: 'green',
    bones_muscles: 'green',
    immune_system: 'yellow',
    eyes: 'yellow',
    digestive: 'green'
  });
  const { healthSummary } = useMission();

  // Dynamically update body part statuses from indicators
  useEffect(() => {
    if (!healthSummary?.indicators) return;

    const indList = healthSummary.indicators;
    const getStatus = (ids) => {
      const match = indList.filter(i => ids.includes(i.id));
      if (match.some(m => m.status === 'red')) return 'red';
      if (match.some(m => m.status === 'yellow')) return 'yellow';
      return 'green';
    };

    setPartStatuses({
      brain: getStatus(['mood', 'sleep_hours']),
      heart: getStatus(['heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'exercise_minutes']),
      lungs: getStatus(['spo2', 'exercise_minutes']),
      bones_muscles: getStatus(['weight', 'exercise_minutes', 'body_temperature']),
      immune_system: getStatus(['body_temperature', 'sleep_hours', 'blood_glucose']),
      eyes: getStatus(['blood_pressure_systolic']),
      digestive: getStatus(['blood_glucose', 'weight', 'hydration'])
    });
  }, [healthSummary]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Interactive Anatomical Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Astronaut Physiological Systems Map
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Click any organ or anatomical system to inspect microgravity deconditioning and countermeasure protocols.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 p-3 rounded-xl glass border border-white/10 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> Nominal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" /> Watch
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> Critical
          </span>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: SVG Figure Canvas */}
        <div className="lg:col-span-5 xl:col-span-6">
          <GlassCard className="p-6 flex flex-col items-center justify-center relative overflow-hidden bg-slate-950/60">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">
                Full-Body Physiological Visualization
              </span>
              <span className="text-xs font-mono text-cyan-400">
                ACTIVE: {selectedPart.toUpperCase()}
              </span>
            </div>

            <HumanBodySVG
              partStatuses={partStatuses}
              selectedPart={selectedPart}
              onPartClick={(id) => setSelectedPart(id)}
            />

            <div className="w-full mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Glow color reflects real-time algorithm evaluation based on NASA reference ranges.</span>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Deep Clinical Inspector Panel */}
        <div className="lg:col-span-7 xl:col-span-6 min-h-[600px]">
          <BodyPartPanel partId={selectedPart} />
        </div>
      </div>
    </div>
  );
}
