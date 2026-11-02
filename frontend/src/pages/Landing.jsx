// pages/Landing.jsx
// High-impact hero landing page with animated planetary backdrop,
// core capabilities overview, and direct launch into the mission dashboard.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Shield,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Compass,
  Radar
} from 'lucide-react';
import StarField from '../components/common/StarField';
import GlassCard from '../components/common/GlassCard';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Activity,
      title: 'Autonomous Telemetry',
      desc: 'Log and evaluate critical vitals in deep space without waiting for round-trip Earth communication delays.'
    },
    {
      icon: Radar,
      title: 'HRP Risk Engine',
      desc: 'Algorithmic assessment calibrated against NASA Human Research Program data and 5 spaceflight hazards.'
    },
    {
      icon: HeartHandshake,
      title: 'Crew Countermeasures',
      desc: 'Actionable protocols for ARED exercise, sleep hygiene, radiation defense, and psychological resilience.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0e27] text-white overflow-hidden flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      <StarField />

      {/* Atmospheric Glow and Planetary Sphere Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none">
        {/* Outer space radiation aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-purple-600/20 blur-3xl animate-pulse" />
        
        {/* Planetary Silhouette with Atmosphere Edge */}
        <div className="absolute inset-20 rounded-full bg-gradient-to-br from-cyan-900/60 via-slate-900 to-[#0a0e27] border border-cyan-500/20 shadow-[inset_0_0_80px_rgba(34,211,238,0.25)] flex items-center justify-center">
          <div className="w-full h-full rounded-full opacity-40 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.4),transparent_60%)]" />
        </div>
      </div>

      {/* Top Brand Banner */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <Compass className="w-6 h-6 text-cyan-400 animate-spin-slow" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white">ASTRO<span className="text-cyan-400">VITALS</span></span>
            <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              NASA HRP 2026
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="hidden sm:flex items-center gap-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors"
        >
          <span>Direct Telemetry Access</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-6 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Autonomous Medical Decision Support for Deep Space
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight max-w-4xl"
        >
          Health Self-Assessment For <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Long-Duration</span> Spaceflight
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed font-light"
        >
          Empowering lunar and Martian astronauts to monitor vitals, evaluate physiological risk, and combat the 5 spaceflight hazards with instant clinical intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="group relative px-8 py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center gap-3 text-base"
          >
            <span>Launch Mission Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/body-map')}
            className="px-6 py-4 rounded-xl font-semibold text-white border border-white/10 hover:border-cyan-500/40 bg-white/5 hover:bg-white/10 transition-all text-sm backdrop-blur-md"
          >
            Explore Interactive Body Map
          </button>
        </motion.div>

        {/* 3 Core Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left"
        >
          {features.map((feat, idx) => (
            <GlassCard key={idx} hover={true} className="p-6">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 w-fit mb-4">
                <feat.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
            </GlassCard>
          ))}
        </motion.div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="relative z-10 py-6 px-6 text-center text-xs text-gray-500 border-t border-white/5 bg-[#0a0e27]/80 backdrop-blur-md">
        <p className="max-w-3xl mx-auto">
          Built for NASA Space Apps Challenge 2026. For demonstration purposes — not an FDA/NASA-certified medical diagnosis tool. Astronauts must follow flight surgeon instructions and formal Mission Control protocols.
        </p>
      </footer>
    </div>
  );
}
