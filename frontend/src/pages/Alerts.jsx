// pages/Alerts.jsx
// Medical triage and emergency protocol alert center.
// Prioritizes severe clinical deviations and provides instant operational countermeasures.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  PhoneCall,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Activity,
  Filter
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';
import { useMission } from '../context/MissionContext';

export default function Alerts() {
  const { refreshSummary } = useMission();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const loadAlerts = () => {
    setLoading(true);
    api.getAlerts()
      .then((res) => setAlerts(res.data || []))
      .catch((err) => console.error('Alerts load error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleDismiss = async (id) => {
    try {
      await api.dismissAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      await refreshSummary();
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    return a.severity === filter;
  });

  const criticalCount = alerts.filter(a => a.severity === 'red').length;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-red-500/10 text-red-300 border border-red-500/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            Medical Triage Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Active Clinical Alerts & Warnings
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Algorithmic safety warnings based on real-time deviations from NASA physiological baselines.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass border border-white/10 self-start sm:self-auto">
          {['all', 'red', 'yellow'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                filter === f
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' ? `All (${alerts.length})` : f === 'red' ? `Critical (${criticalCount})` : 'Watch'}
            </button>
          ))}
        </div>
      </div>

      {/* Critical Escalation Card if any red alerts exist */}
      {criticalCount > 0 && (
        <div className="p-5 rounded-2xl bg-red-950/60 border border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Flight Surgeon Escalation Required</h3>
              <p className="text-xs text-red-200 mt-0.5">
                {criticalCount} physiological reading(s) breached safety thresholds. Prepare ground medical burst packet.
              </p>
            </div>
          </div>
          <button
            onClick={() => alert('Flight Surgeon Telemetry Burst Packet prepared and queued for Deep Space Network uplink transmission.')}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 shadow-lg"
          >
            Uplink Telemetry Packet
          </button>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <GlassCard className="p-12 text-center flex flex-col items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
            <h3 className="text-lg font-bold text-white">All Systems Nominal 🚀</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-md">
              No active warnings detected. Cardiovascular, bone, immune, and cognitive metrics are well within safe envelopes.
            </p>
          </GlassCard>
        ) : (
          filteredAlerts.map((alert) => {
            const isRed = alert.severity === 'red';
            const isExpanded = expandedId === alert.id;

            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-2xl border transition-all ${
                  isRed
                    ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      isRed ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {isRed ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                          {alert.indicator.replace('_', ' ')}
                        </span>
                        <StatusBadge status={alert.severity} />
                        <span className="text-[11px] font-mono text-gray-400">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 font-medium mt-1.5">{alert.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title="Expand countermeasure actions"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition-colors"
                      title="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Countermeasure Action Protocol (Expandable) */}
                {alert.action && (
                  <div className="mt-3.5 pt-3 border-t border-white/5">
                    <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                      <span>Action Protocol:</span>
                    </div>
                    <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed font-mono">
                      {alert.action}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
