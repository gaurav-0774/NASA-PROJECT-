// pages/MoodCheckin.jsx
// Behavioral health check-in terminal designed to counter isolation,
// confinement stress, and communication latency on long-duration interplanetary missions.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  HeartHandshake,
  PhoneCall,
  Volume2,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Smile,
  Send,
  Activity
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';
import { useMission } from '../context/MissionContext';

export default function MoodCheckin() {
  const { refreshSummary } = useMission();

  const [form, setForm] = useState({
    mood: 4,
    stress: 2,
    isolation: 2,
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await api.submitMood(form);
      setResult(res.data);
      await refreshSummary();
    } catch (err) {
      console.error('Mood checkin failed:', err);
      setErrorMsg(err.response?.data?.error || err.message || 'Check-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const moodLevels = [
    { val: 1, label: 'Distressed / Depressed', emoji: '😫' },
    { val: 2, label: 'Fatigued / Low', emoji: '😟' },
    { val: 3, label: 'Balanced / Neutral', emoji: '😐' },
    { val: 4, label: 'Positive / Energetic', emoji: '😊' },
    { val: 5, label: 'Peak Motivation', emoji: '🤩' }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 mb-2">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          Autonomous Behavioral Health Protocol
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Mental Health & Confinement Check-In
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Self-evaluate cognitive wellness and emotional balance under deep space isolation.
        </p>
      </div>

      {/* Result Panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-6 rounded-2xl border ${
              result.status === 'red'
                ? 'bg-red-950/60 border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
                : result.status === 'yellow'
                ? 'bg-yellow-950/60 border-yellow-500/40'
                : 'bg-purple-950/40 border-purple-500/40'
            } space-y-4`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-purple-300">
                  Behavioral Evaluation Score: {result.compositeScore}/100
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{result.summary}</h3>
              </div>
              <StatusBadge status={result.status} />
            </div>

            {/* Emergency Flight Psychologist Escalation Prompt */}
            {result.urgentEscalation && (
              <div className="p-4 rounded-xl bg-red-900/40 border border-red-500/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
                  <div className="text-xs text-red-100">
                    <strong>Flight Psychologist Protocol:</strong> Recommend requesting a private behavioral consultation (BHC) or scheduling a crew peer conversation.
                  </div>
                </div>
                <button
                  onClick={() => alert('Encrypted private video channel with Ground Flight Psychologist scheduled in next comm pass.')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shrink-0 transition-colors"
                >
                  Schedule Comm Pass
                </button>
              </div>
            )}

            {/* Calming Tips Carousel/List */}
            <div className="pt-3 border-t border-white/10">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Evidence-Based Spaceflight Calming Exercises
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {result.calmingTips?.map((tip, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-purple-200">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-sm text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Slider / Buttons */}
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              1. Overall Emotional State / Mood
            </label>
            <p className="text-xs text-gray-400 mb-3">
              How do you rate your general disposition, optimism, and emotional energy today?
            </p>
            <div className="grid grid-cols-5 gap-2">
              {moodLevels.map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, mood: m.val }))}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    form.mood === m.val
                      ? 'bg-purple-500/30 border-purple-400 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs font-bold text-white mt-1">{m.val}</span>
                  <span className="text-[10px] text-gray-400 text-center hidden sm:block mt-0.5">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-bold text-white">
                2. Mission Workload & Cognitive Stress (1 = Relaxed, 5 = Overwhelmed)
              </label>
              <span className="text-xs font-mono text-cyan-400 font-bold">Level {form.stress} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={form.stress}
              onChange={(e) => setForm(prev => ({ ...prev, stress: Number(e.target.value) }))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[11px] text-gray-500 mt-1 font-mono">
              <span>1 - Fully in control</span>
              <span>3 - Moderate workload</span>
              <span>5 - Acute cognitive overload</span>
            </div>
          </div>

          {/* Isolation & Confinement Feeling */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-bold text-white">
                3. Confinement & Isolation Intensity (1 = Connected, 5 = Severe Isolation)
              </label>
              <span className="text-xs font-mono text-purple-400 font-bold">Level {form.isolation} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={form.isolation}
              onChange={(e) => setForm(prev => ({ ...prev, isolation: Number(e.target.value) }))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[11px] text-gray-500 mt-1 font-mono">
              <span>1 - Deep crew camaraderie</span>
              <span>3 - Routine sensory monotony</span>
              <span>5 - Profound detachment / Homesickness</span>
            </div>
          </div>

          {/* Reflective Notes */}
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Confidential Astronaut Reflections / Journal
            </label>
            <textarea
              rows="3"
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Difficult circadian shift; feeling homesick during Earth-comm latency; crew morale remains cooperative."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" />
                  <span>Evaluating Wellbeing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Log Mental Health Check-In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
