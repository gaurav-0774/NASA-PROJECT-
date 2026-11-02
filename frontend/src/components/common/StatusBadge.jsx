// components/common/StatusBadge.jsx — Small colored badge showing health status
import React from 'react';

const statusConfig = {
  green: { label: 'Normal', bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' },
  yellow: { label: 'Watch', bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  red: { label: 'Alert', bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
  normal: { label: 'Normal', bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' },
  warning: { label: 'Watch', bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  alert: { label: 'Alert', bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
  critical: { label: 'Critical', bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
};

export default function StatusBadge({ status, label }) {
  const config = statusConfig[status] || statusConfig.green;
  const displayLabel = label || config.label;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {displayLabel}
    </span>
  );
}
