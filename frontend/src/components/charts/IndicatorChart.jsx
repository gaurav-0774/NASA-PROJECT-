// components/charts/IndicatorChart.jsx
// Interactive telemetry trend chart with shaded reference range and threshold lines.

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts';

export default function IndicatorChart({
  data = [],
  dataKey = 'value',
  name = 'Measurement',
  unit = '',
  normalRange = null,
  criticalRange = null
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-gray-500">
        No telemetry logged for this period.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-slate-900/95 border border-cyan-500/40 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
          <p className="text-gray-400 font-mono">Mission Day {label}</p>
          <p className="text-white font-bold text-sm mt-1">
            {name}: <span className="text-cyan-400">{val} {unit}</span>
          </p>
          {normalRange && (
            <p className="text-[11px] text-gray-400 mt-1">
              Nominal: {normalRange.min} - {normalRange.max} {unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            unit="d"
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            domain={['auto', 'auto']}
            unit={unit ? ` ${unit}` : ''}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Shaded Normal Range Band */}
          {normalRange && normalRange.min !== undefined && normalRange.max !== undefined && (
            <ReferenceArea
              y1={normalRange.min}
              y2={normalRange.max}
              fill="#22c55e"
              fillOpacity={0.12}
            />
          )}

          {/* Critical Threshold Lines */}
          {criticalRange && criticalRange.max && (
            <ReferenceLine
              y={criticalRange.max}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: 'Critical High', fill: '#ef4444', fontSize: 9, position: 'top' }}
            />
          )}
          {criticalRange && criticalRange.min && (
            <ReferenceLine
              y={criticalRange.min}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: 'Critical Low', fill: '#ef4444', fontSize: 9, position: 'bottom' }}
            />
          )}

          {/* Telemetry Line */}
          <Line
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke="#22d3ee"
            strokeWidth={3}
            dot={{ fill: '#0a0e27', stroke: '#22d3ee', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 6, fill: '#00f0ff', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
