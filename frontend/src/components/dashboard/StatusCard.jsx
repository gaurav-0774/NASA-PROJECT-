// components/dashboard/StatusCard.jsx
// Metric display card featuring status glow, icons, and clinical state indicators.

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import StatusBadge from '../common/StatusBadge';

export default function StatusCard({
  icon: Icon,
  label,
  value,
  unit = '',
  status = 'green',
  normalRange = null,
  trend = null,
  onClick = null
}) {
  const getBorderColor = () => {
    switch (status) {
      case 'red': return 'border-red-500/40 hover:border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'yellow': return 'border-yellow-500/40 hover:border-yellow-500/80 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
      default: return 'border-green-500/30 hover:border-green-500/60 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'red': return 'text-red-400 bg-red-400/10 border-red-500/20';
      case 'yellow': return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20';
      default: return 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`rounded-2xl transition-all duration-300 border ${getBorderColor()} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <GlassCard className="p-5 flex flex-col justify-between h-full bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2.5 rounded-xl border ${getIconColor()}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {value !== undefined && value !== null ? value : '--'}
                </span>
                {unit && <span className="text-xs font-medium text-gray-400">{unit}</span>}
              </div>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
          <span>
            {normalRange ? `Ref: ${normalRange.min} - ${normalRange.max} ${unit}` : 'Nominal band active'}
          </span>
          {trend && (
            <span className={`font-medium ${trend.includes('declining') || trend.includes('rising') ? 'text-yellow-400' : 'text-gray-400'}`}>
              {trend}
            </span>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
