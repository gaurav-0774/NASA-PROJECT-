// components/layout/TopBar.jsx — Top bar with mission day, environment badge, health score, and settings
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronDown, Rocket } from 'lucide-react';
import { useMission } from '../../context/MissionContext';

export default function TopBar() {
  const { missionDay, environment, setEnvironment, healthSummary, environments, loading } = useMission();
  const [envDropdownOpen, setEnvDropdownOpen] = useState(false);

  const currentEnv = environments.find((e) => e.id === environment) || environments[0];

  const overallScore = healthSummary?.overallScore ?? healthSummary?.overall_score ?? 0;
  const scoreColor =
    overallScore > 75 ? 'text-green-400 border-green-400' :
    overallScore > 50 ? 'text-yellow-400 border-yellow-400' :
    'text-red-400 border-red-400';
  const scoreBgColor =
    overallScore > 75 ? 'bg-green-400/10' :
    overallScore > 50 ? 'bg-yellow-400/10' :
    'bg-red-400/10';

  return (
    <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-6 relative z-30">
      {/* Left: Mission Day */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 lg:ml-0 ml-12">
          <Rocket className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-gray-400">Mission Day</span>
          <motion.span
            key={missionDay}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-white"
          >
            {missionDay}
          </motion.span>
        </div>
      </div>

      {/* Center: Environment */}
      <div className="relative">
        <button
          onClick={() => setEnvDropdownOpen(!envDropdownOpen)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors"
          style={{ color: currentEnv.color }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentEnv.color }} />
          {currentEnv.name}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <AnimatePresence>
          {envDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 glass rounded-xl border border-white/10 overflow-hidden"
              style={{ background: 'rgba(10, 14, 39, 0.95)' }}
            >
              {environments.map((env) => (
                <button
                  key={env.id}
                  onClick={() => {
                    setEnvironment(env.id);
                    setEnvDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors ${
                    env.id === environment ? 'bg-white/5' : ''
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: env.color }} />
                  <span style={{ color: env.color }}>{env.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Health Score + Settings */}
      <div className="flex items-center gap-4">
        {/* Health Score Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${scoreColor} ${scoreBgColor}`}>
          <div className={`w-3 h-3 rounded-full border-2 ${scoreColor}`} />
          <span className={`text-sm font-bold ${scoreColor.split(' ')[0]}`}>
            {loading ? '—' : overallScore}
          </span>
        </div>

        <button className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
