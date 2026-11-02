// components/body/BodyPartPanel.jsx
// Side drawer panel displaying in-depth physiological analysis, NASA hazard links,
// real-time telemetry from linked indicators, and prioritized countermeasure actions.

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Activity,
  ShieldAlert,
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import GlassCard from '../common/GlassCard';
import StatusBadge from '../common/StatusBadge';
import { api } from '../../services/api';

export default function BodyPartPanel({ partId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!partId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.getBodyPart(partId)
      .then((res) => {
        if (isMounted) setData(res.data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load system details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [partId]);

  if (loading) {
    return (
      <GlassCard className="p-6 h-full flex flex-col justify-center items-center text-center">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm text-gray-400">Querying telemetry for anatomical system...</p>
      </GlassCard>
    );
  }

  if (error || !data) {
    return (
      <GlassCard className="p-6 h-full flex flex-col justify-center items-center text-center">
        <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
        <p className="text-sm text-red-400 font-medium">{error || 'Data unavailable'}</p>
      </GlassCard>
    );
  }

  const isCritical = data.status === 'red';

  return (
    <motion.div
      key={partId}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col gap-4 overflow-y-auto pr-1"
    >
      {/* Header Card */}
      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">
              Anatomical System
            </span>
            <h2 className="text-2xl font-bold text-white mt-0.5">{data.name}</h2>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <p className="text-sm text-gray-300 mt-3 leading-relaxed">
          {data.description}
        </p>

        {/* Active Status Assessment */}
        <div className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed ${
          isCritical ? 'bg-red-500/10 border-red-500/30 text-red-200' :
          data.status === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200' :
          'bg-green-500/10 border-green-500/30 text-green-200'
        }`}>
          <div className="font-semibold mb-1 flex items-center gap-1.5">
            {isCritical ? <AlertCircle className="w-4 h-4 text-red-400" /> :
             data.status === 'yellow' ? <AlertTriangle className="w-4 h-4 text-yellow-400" /> :
             <CheckCircle className="w-4 h-4 text-green-400" />}
            Current Clinical Assessment:
          </div>
          {data.activeStatusDescription}
        </div>

        {/* Emergency Surgeon Warning */}
        {isCritical && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-500 flex items-center gap-3">
            <PhoneCall className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
            <div className="text-xs text-red-200">
              <span className="font-bold">Medical Alert:</span> Telemetry triggers flight surgeon escalation criteria. Prepare communication packet.
            </div>
          </div>
        )}
      </GlassCard>

      {/* NASA Hazards Tagging */}
      <GlassCard className="p-5">
        <h3 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-2.5 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-orange-400" />
          Associated NASA Spaceflight Hazards
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.relatedHazards?.map((hazard, idx) => (
            <span
              key={idx}
              className="px-3 py-1 text-xs rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 font-medium"
            >
              {hazard}
            </span>
          ))}
        </div>
      </GlassCard>

      {/* Linked Telemetry Indicators */}
      <GlassCard className="p-5">
        <h3 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-3 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400" />
          Linked Health Indicators
        </h3>
        <div className="space-y-2.5">
          {data.linkedIndicatorsData?.map((ind) => (
            <div
              key={ind.id}
              className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-white">{ind.name}</p>
                <p className="text-xs text-gray-400">
                  {ind.normalRange ? `Ref: ${ind.normalRange.min} - ${ind.normalRange.max} ${ind.unit}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-white">
                  {ind.value !== null ? `${ind.value} ${ind.unit}` : '--'}
                </span>
                <StatusBadge status={ind.status} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recommended Countermeasures & Actions */}
      <GlassCard className="p-5">
        <h3 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-3 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-green-400" />
          Recommended Countermeasure Protocols
        </h3>
        <ul className="space-y-2 text-xs text-gray-300">
          {data.recommendations?.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  );
}
