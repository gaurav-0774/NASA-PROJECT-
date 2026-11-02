// pages/LogData.jsx
// Telemetry entry terminal allowing astronauts to input vitals, sleep, mood,
// exercise duration, and hydration with space measurement guidance and instant evaluation.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenLine,
  Heart,
  Activity,
  Droplets,
  Moon,
  Smile,
  Dumbbell,
  Thermometer,
  Wind,
  Scale,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';
import { useMission } from '../context/MissionContext';

export default function LogData() {
  const { healthSummary, refreshSummary, environment } = useMission();

  const [formData, setFormData] = useState({
    heart_rate: 72,
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    blood_glucose: 95,
    body_temperature: 36.6,
    sleep_hours: 7.5,
    mood: 4,
    spo2: 98,
    weight: 78.0,
    exercise_minutes: 150,
    hydration: 4,
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Preload latest log if available
  useEffect(() => {
    if (healthSummary?.latestLog) {
      const log = healthSummary.latestLog;
      setFormData(prev => ({
        ...prev,
        heart_rate: log.heart_rate ?? prev.heart_rate,
        blood_pressure_systolic: log.blood_pressure_systolic ?? prev.blood_pressure_systolic,
        blood_pressure_diastolic: log.blood_pressure_diastolic ?? prev.blood_pressure_diastolic,
        blood_glucose: log.blood_glucose ?? prev.blood_glucose,
        body_temperature: log.body_temperature ?? prev.body_temperature,
        sleep_hours: log.sleep_hours ?? prev.sleep_hours,
        mood: log.mood ?? prev.mood,
        spo2: log.spo2 ?? prev.spo2,
        weight: log.weight ?? prev.weight,
        exercise_minutes: log.exercise_minutes ?? prev.exercise_minutes,
        hydration: log.hydration ?? prev.hydration
      }));
    }
  }, [healthSummary]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setResult(null);

    try {
      const payload = {
        ...formData,
        heart_rate: Number(formData.heart_rate),
        blood_pressure_systolic: Number(formData.blood_pressure_systolic),
        blood_pressure_diastolic: Number(formData.blood_pressure_diastolic),
        blood_glucose: Number(formData.blood_glucose),
        body_temperature: Number(formData.body_temperature),
        sleep_hours: Number(formData.sleep_hours),
        mood: Number(formData.mood),
        spo2: Number(formData.spo2),
        weight: Number(formData.weight),
        exercise_minutes: Number(formData.exercise_minutes),
        hydration: Number(formData.hydration),
        environment
      };

      const res = await api.logHealth(payload);
      setResult(res.data);
      await refreshSummary();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to submit telemetry record.');
    } finally {
      setSubmitting(false);
    }
  };

  const moodEmojis = [
    { score: 1, emoji: '😫', label: 'Severe Distress' },
    { score: 2, emoji: '😟', label: 'Fatigued / Low' },
    { score: 3, emoji: '😐', label: 'Neutral' },
    { score: 4, emoji: '😊', label: 'Good' },
    { score: 5, emoji: '🤩', label: 'Optimal / Peak' }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
          <PenLine className="w-3.5 h-3.5 text-cyan-400" />
          Mission Daily Protocol
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Log Health & Vitals Telemetry
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Record standard physiological markers to evaluate microgravity adaptation and trigger countermeasure guidance.
        </p>
      </div>

      {/* Success Evaluation Banner */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_25px_rgba(34,211,238,0.25)] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Telemetry Evaluated Successfully!</h3>
                  <p className="text-xs text-cyan-300">
                    Health Score: <strong>{result.overallScore}/100</strong> • XP Earned: +{result.xpEarned} XP
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                STREAK ACTIVE
              </span>
            </div>

            {/* Quick Indicator Results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-cyan-500/20">
              {result.evaluations?.slice(0, 4).map((ev) => (
                <div key={ev.id} className="p-2.5 rounded-lg bg-black/40 text-xs">
                  <div className="text-gray-400 truncate font-mono uppercase text-[10px]">{ev.id.replace('_', ' ')}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-white">{ev.value}</span>
                    <StatusBadge status={ev.status} />
                  </div>
                </div>
              ))}
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Cardiovascular & Oxygenation */}
        <GlassCard className="p-6">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Cardiovascular & Oxygenation
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Measured using habitat ultrasound or pulse oximeter cuff. In microgravity, cephalic fluid shift alters blood pressure.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Heart Rate */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                name="heart_rate"
                value={formData.heart_rate}
                onChange={handleChange}
                min="30"
                max="220"
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Nominal: 60 - 100 bpm</span>
            </div>

            {/* Systolic BP */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                name="blood_pressure_systolic"
                value={formData.blood_pressure_systolic}
                onChange={handleChange}
                min="60"
                max="240"
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Nominal: 90 - 120 mmHg</span>
            </div>

            {/* Diastolic BP */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                name="blood_pressure_diastolic"
                value={formData.blood_pressure_diastolic}
                onChange={handleChange}
                min="40"
                max="140"
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Nominal: 60 - 80 mmHg</span>
            </div>

            {/* SpO2 */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Blood Oxygen (SpO2 %)
              </label>
              <input
                type="number"
                name="spo2"
                value={formData.spo2}
                onChange={handleChange}
                min="70"
                max="100"
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Nominal: 95 - 100%</span>
            </div>
          </div>
        </GlassCard>

        {/* Section 2: Physical Vitals & Countermeasures */}
        <GlassCard className="p-6">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Biometrics & Daily Countermeasures
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Astronauts require 2.5 hours of daily resistance & cardio training to counter 1-2% monthly bone mineral density loss.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Core Temp */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Body Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="body_temperature"
                value={formData.body_temperature}
                onChange={handleChange}
                min="32"
                max="43"
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Nominal: 36.1 - 37.2 °C</span>
            </div>

            {/* Glucose */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Blood Glucose (mg/dL)
              </label>
              <input
                type="number"
                name="blood_glucose"
                value={formData.blood_glucose}
                onChange={handleChange}
                min="40"
                max="300"
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Nominal: 70 - 100 mg/dL</span>
            </div>

            {/* Weight / Mass */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Body Mass (kg via SLAMMD)
              </label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="35"
                max="180"
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Inertial mass measurement</span>
            </div>

            {/* Exercise Minutes */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                ARED / CEVIS Exercise (min)
              </label>
              <input
                type="number"
                name="exercise_minutes"
                value={formData.exercise_minutes}
                onChange={handleChange}
                min="0"
                max="360"
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Target: 120 - 180 min</span>
            </div>
          </div>
        </GlassCard>

        {/* Section 3: Sleep, Hydration & Psychological State */}
        <GlassCard className="p-6">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-400" />
            Sleep, Hydration & Behavioral Health
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Confinement and artificial circadian lighting directly impact crew sleep architecture and psychological resilience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sleep Hours */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Sleep Rest (hours)
              </label>
              <input
                type="number"
                step="0.5"
                name="sleep_hours"
                value={formData.sleep_hours}
                onChange={handleChange}
                min="0"
                max="16"
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Nominal: 7.0 - 9.0 hours</span>
            </div>

            {/* Hydration 1-5 scale */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Hydration Level (Urine Color / Fluid Intake)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, hydration: lvl }))}
                    className={`flex-1 py-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      Number(formData.hydration) === lvl
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 font-bold scale-105'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Droplets className={`w-4 h-4 ${lvl >= 3 ? 'text-cyan-400' : 'text-yellow-400'}`} />
                    <span className="text-xs mt-1">{lvl}</span>
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-gray-500 mt-1.5 block">1 = Dehydrated • 5 = Optimal</span>
            </div>

            {/* Mood Emojis */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Behavioral Wellness / Mood
              </label>
              <div className="flex gap-2">
                {moodEmojis.map((m) => (
                  <button
                    key={m.score}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mood: m.score }))}
                    className={`flex-1 py-2 rounded-xl border flex flex-col items-center justify-center transition-all text-lg ${
                      Number(formData.mood) === m.score
                        ? 'bg-yellow-500/20 border-yellow-400 scale-105 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                        : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100 hover:bg-white/10'
                    }`}
                    title={m.label}
                  >
                    <span>{m.emoji}</span>
                    <span className="text-[10px] mt-0.5 text-gray-300 font-mono">{m.score}</span>
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-gray-500 mt-1.5 block">1 = Critical Distress • 5 = Peak</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-5">
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Astronaut Log Notes (Subjective Symptoms, EVA remarks, Fatigue)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="e.g. Mild back pain following ARED deadlift cycle; sinus congestion from zero-g fluid shift."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>
        </GlassCard>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                <span>Evaluating Telemetry Risk...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Submit Telemetry & Evaluate</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
