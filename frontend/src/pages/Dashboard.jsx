// pages/Dashboard.jsx
// Main medical command dashboard displaying composite health score gauge,
// primary vitals cards, category radar, and prioritized alerts.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Activity,
  Wind,
  Moon,
  Dumbbell,
  Smile,
  Thermometer,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import HealthScore from '../components/dashboard/HealthScore';
import StatusCard from '../components/dashboard/StatusCard';
import CategoryRadar from '../components/dashboard/CategoryRadar';
import GlassCard from '../components/common/GlassCard';
import StatusBadge from '../components/common/StatusBadge';
import { useMission } from '../context/MissionContext';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { healthSummary, refreshSummary, loading, error, missionDay, environment } = useMission();
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingAlerts(true);
    api.getAlerts()
      .then((res) => {
        if (isMounted) setAlerts(res.data.slice(0, 5));
      })
      .catch((err) => console.error('Alerts load error:', err))
      .finally(() => {
        if (isMounted) setLoadingAlerts(false);
      });

    return () => { isMounted = false; };
  }, [healthSummary]);

  const latestLog = healthSummary?.latestLog || {};
  const overallScore = healthSummary?.overallScore ?? healthSummary?.overall_score ?? 88;
  const categories = healthSummary?.categories || {};
  const indicatorsList = healthSummary?.indicators || [];

  const getIndStatus = (id) => {
    const found = indicatorsList.find(i => i.id === id);
    return found ? found.status : 'green';
  };

  const getIndMessage = (id) => {
    const found = indicatorsList.find(i => i.id === id);
    return found ? found.message : null;
  };

  if (loading && !healthSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-gray-400 text-sm font-mono">Synchronizing telemetry from habitat sensors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Medical Protocol Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs text-cyan-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Astronaut Self-Assessment Mode:</strong> Telemetry is evaluated against NASA Human Research Program thresholds for <em>{environment.toUpperCase()}</em>. Not a certified replacement for Flight Surgeon consultations.
          </span>
        </div>
        <button
          onClick={refreshSummary}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-[11px] transition-colors shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          <span>SYNC</span>
        </button>
      </div>

      {/* TOP ROW: Primary Vitals & Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Overall Health Score Card */}
        <GlassCard className="p-4 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-3 left-4 text-xs font-mono uppercase text-gray-400 tracking-wider">
            Composite Index
          </div>
          <HealthScore score={overallScore} size={160} strokeWidth={12} />
        </GlassCard>

        {/* Heart Rate */}
        <StatusCard
          icon={Heart}
          label="Heart Rate"
          value={latestLog.heart_rate ?? 72}
          unit="bpm"
          status={getIndStatus('heart_rate')}
          normalRange={{ min: 60, max: 100 }}
          trend={getIndMessage('heart_rate')}
          onClick={() => navigate('/charts')}
        />

        {/* Blood Pressure */}
        <StatusCard
          icon={Activity}
          label="Blood Pressure"
          value={latestLog.blood_pressure_systolic ? `${latestLog.blood_pressure_systolic}/${latestLog.blood_pressure_diastolic}` : '118/76'}
          unit="mmHg"
          status={getIndStatus('blood_pressure_systolic') === 'red' || getIndStatus('blood_pressure_diastolic') === 'red' ? 'red' :
                  getIndStatus('blood_pressure_systolic') === 'yellow' || getIndStatus('blood_pressure_diastolic') === 'yellow' ? 'yellow' : 'green'}
          normalRange={{ min: '90/60', max: '120/80' }}
          trend={getIndMessage('blood_pressure_systolic')}
          onClick={() => navigate('/charts')}
        />

        {/* SpO2 */}
        <StatusCard
          icon={Wind}
          label="Blood Oxygen (SpO2)"
          value={latestLog.spo2 ?? 98}
          unit="%"
          status={getIndStatus('spo2')}
          normalRange={{ min: 95, max: 100 }}
          trend={getIndMessage('spo2')}
          onClick={() => navigate('/charts')}
        />
      </div>

      {/* MIDDLE ROW: Category Radar & Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Radar Chart */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-white">Physiological Systems Balance</h3>
                <p className="text-xs text-gray-400">5-domain health index under current mission gravity</p>
              </div>
              <button
                onClick={() => navigate('/body-map')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Body Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <CategoryRadar categories={categories} />
            <div className="mt-2 pt-3 border-t border-white/5 flex justify-around text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Cardio: {categories?.cardiovascular?.score ?? 80}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Bone/Musc: {categories?.bone_muscle?.score ?? 85}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> Neuro: {categories?.mental_health?.score ?? 70}%
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Priority Health Alerts Panel */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-yellow-400" />
                <h3 className="text-base font-bold text-white">Active Medical Warnings & Alerts</h3>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px] pr-1">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
                  <Activity className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-sm font-semibold text-white">All Systems Nominal</p>
                  <p className="text-xs text-gray-400 mt-1">No active critical alerts for mission day {missionDay}.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      alert.severity === 'red'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {alert.severity === 'red' ? (
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                        )}
                        <span className="text-xs font-mono font-bold uppercase text-white">
                          {alert.indicator.replace('_', ' ')}
                        </span>
                      </div>
                      <StatusBadge status={alert.severity} />
                    </div>
                    <p className="text-xs text-gray-300 mt-2">{alert.message}</p>
                    {alert.action && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 text-[11px] text-cyan-300 flex items-center gap-1.5">
                        <strong className="text-white">Action Protocol:</strong> {alert.action}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span>Automated triage engine refreshed</span>
              <button
                onClick={() => navigate('/alerts')}
                className="hover:text-white transition-colors"
              >
                Protocol Manual →
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* BOTTOM ROW: Secondary Vitals & Routine Factors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatusCard
          icon={Moon}
          label="Sleep Rest"
          value={latestLog.sleep_hours ?? 7.5}
          unit="hrs"
          status={getIndStatus('sleep_hours')}
          normalRange={{ min: 7, max: 9 }}
          trend={getIndMessage('sleep_hours')}
          onClick={() => navigate('/charts')}
        />

        <StatusCard
          icon={Dumbbell}
          label="ARED Exercise"
          value={latestLog.exercise_minutes ?? 150}
          unit="min"
          status={getIndStatus('exercise_minutes')}
          normalRange={{ min: 120, max: 180 }}
          trend={getIndMessage('exercise_minutes')}
          onClick={() => navigate('/charts')}
        />

        <StatusCard
          icon={Smile}
          label="Psychological Mood"
          value={latestLog.mood ? `${latestLog.mood}/5` : '4/5'}
          unit=""
          status={getIndStatus('mood')}
          normalRange={{ min: 3, max: 5 }}
          trend={getIndMessage('mood')}
          onClick={() => navigate('/mood')}
        />

        <StatusCard
          icon={Thermometer}
          label="Core Temperature"
          value={latestLog.body_temperature ?? 36.6}
          unit="°C"
          status={getIndStatus('body_temperature')}
          normalRange={{ min: 36.1, max: 37.2 }}
          trend={getIndMessage('body_temperature')}
          onClick={() => navigate('/charts')}
        />
      </div>
    </div>
  );
}
