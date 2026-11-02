// pages/Learn.jsx
// Educational knowledge hub detailing the 5 NASA Spaceflight Hazards,
// physiological indicators, spaceflight measurement methodologies, and HRP research.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Radiation,
  Users,
  Compass,
  Orbit,
  Box,
  Heart,
  Search,
  Activity,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';

export default function Learn() {
  const [searchTerm, setSearchTerm] = useState('');

  const hazards = [
    {
      id: 'radiation',
      icon: Radiation,
      color: '#f97316',
      title: '1. Space Radiation',
      summary: 'Galactic Cosmic Rays (GCR) and Solar Particle Events (SPE)',
      details: 'Deep space radiation penetrates vehicle hulls, causing ionizing cellular damage, DNA double-strand breaks, increased cancer risk, and central nervous system degradation. Without Earth’s magnetosphere, cumulative exposure on a Mars mission can approach 1 Sievert.',
      countermeasures: 'Polyethylene hydrogen-rich shielding, storm shelters during solar flares, active pharmaceutical radioprotectants.'
    },
    {
      id: 'isolation',
      icon: Users,
      color: '#a855f7',
      title: '2. Isolation & Confinement',
      summary: 'Psychological stress in confined habitat volumes',
      details: 'Living in close quarters with the same crew for years leads to circadian rhythm desynchrony, sleep deprivation, sensory monotony, interpersonal tension, and cognitive fatigue. Mental health self-assessment is essential when Earth psychologists are 20+ light-minutes away.',
      countermeasures: 'Dynamic circadian LED lighting, private sleep pods, VR relaxation environments, structured crew debriefs.'
    },
    {
      id: 'distance',
      icon: Compass,
      color: '#3b82f6',
      title: '3. Distance from Earth',
      summary: 'Extreme latency and no emergency evacuation',
      details: 'On the ISS, emergency return takes hours; on Mars, return takes 6-9 months and radio signals lag up to 24 minutes each way. Astronauts must perform autonomous surgical, diagnostic, and psychiatric triage without real-time Houston guidance.',
      countermeasures: 'Autonomous AI decision-support software (AstroVitals), compact ultrasound diagnostics, 3D medical printing.'
    },
    {
      id: 'gravity',
      icon: Orbit,
      color: '#22d3ee',
      title: '4. Altered Gravity Fields',
      summary: 'Microgravity (0g), Lunar (0.16g), Martian (0.38g)',
      details: 'Zero-g causes cephalic fluid shifts (leading to Spaceflight-Associated Neuro-ocular Syndrome / SANS), cardiovascular deconditioning, and rapid bone mineral density loss of 1% to 1.5% monthly in the hip and spine.',
      countermeasures: 'Daily 2.5h resistive exercise (ARED), lower body negative pressure (LBNP), dietary bisphosphonates, high-sodium fluid loading.'
    },
    {
      id: 'environment',
      icon: Box,
      color: '#10b981',
      title: '5. Hostile / Closed Environments',
      summary: 'Life support dynamics, microbial drift, and toxic dust',
      details: 'Habitats are closed ecosystems where toxic gases, carbon dioxide pockets, microbial biofilms, and abrasive lunar/Martian regolith pose persistent hazards to respiratory and immune systems.',
      countermeasures: 'HEPA and catalytic air revitalization, strict planetary protection dust airlocks, antimicrobial surface coatings.'
    }
  ];

  const indicatorsInfo = [
    {
      name: 'Heart Rate & Blood Pressure',
      measure: 'Ultrasound cuff / wearable bio-harness',
      why: 'In zero-g, blood shifts upward, fooling the body into believing blood volume is too high. This triggers diuresis and reduced cardiac stroke volume.',
      hazard: 'Altered Gravity'
    },
    {
      name: 'Bone Density & Mass',
      measure: 'Space Linear Acceleration Mass Measurement Device (SLAMMD)',
      why: 'Without gravity mechanical loading, osteoclasts break down bone matrix faster than osteoblasts build it, excreting calcium into urine and raising kidney stone risks.',
      hazard: 'Altered Gravity'
    },
    {
      name: 'Sleep Rest & Circadian Cycles',
      measure: 'Actigraphy wrist monitors and daily sleep logs',
      why: 'Orbiting Earth entails 16 sunrises every 24 hours. Mars has a 24.6-hour sol. Melatonin release becomes disrupted without strict artificial lighting schedules.',
      hazard: 'Isolation & Confinement'
    },
    {
      name: 'SpO2 & Core Temperature',
      measure: 'Infrared forehead sensor and pulse oximeter',
      why: 'Microgravity alters the body’s convective heat dissipation (astronauts run ~1°C warmer during exercise). CO2 buildup in stagnant corners reduces blood oxygen.',
      hazard: 'Hostile Closed Environments'
    },
    {
      name: 'Behavioral & Mood Index',
      measure: 'Self-assessment questionnaires and voice stress analysis',
      why: 'Long-duration isolation causes subtle psychological drift. Tracking subjective mood allows autonomous early detection before clinical depression emerges.',
      hazard: 'Isolation / Distance from Earth'
    }
  ];

  const filteredHazards = hazards.filter(h =>
    h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIndicators = indicatorsInfo.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.why.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            NASA Human Research Program (HRP)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Space Medicine Knowledge Base
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Understanding the physiological challenges of long-duration spaceflight and the scientific rationale behind AstroVitals.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hazards & vitals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* SECTION 1: NASA 5 SPACEFLIGHT HAZARDS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">NASA's 5 Spaceflight Hazards (R-I-D-G-E)</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredHazards.map((hazard) => (
            <GlassCard key={hazard.id} className="p-6 border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-2xl shrink-0"
                  style={{ backgroundColor: `${hazard.color}20`, color: hazard.color }}
                >
                  <hazard.icon className="w-6 h-6" />
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-base font-bold text-white">{hazard.title}</h3>
                    <span className="text-xs font-mono" style={{ color: hazard.color }}>
                      {hazard.summary}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                    {hazard.details}
                  </p>

                  <div className="mt-2 pt-2 border-t border-white/5 text-xs text-cyan-300 flex items-start gap-1.5">
                    <span className="font-bold text-white shrink-0">HRP Countermeasures:</span>
                    <span className="text-gray-300">{hazard.countermeasures}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* SECTION 2: HOW VITALS ARE MEASURED IN SPACE */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Telemetry & Spaceflight Measurement Protocols</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIndicators.map((item, idx) => (
            <GlassCard key={idx} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {item.hazard}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  {item.why}
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 text-[11px] text-gray-400">
                <strong className="text-cyan-400">Measurement Tech:</strong> {item.measure}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
