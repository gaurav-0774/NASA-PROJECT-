// components/common/GlassCard.jsx — Reusable glassmorphism card with optional hover and status glow
import React from 'react';
import { motion } from 'framer-motion';

const statusGlowMap = {
  green: 'glow-green',
  yellow: 'glow-yellow',
  red: 'glow-red',
  cyan: 'glow-cyan',
};

export default function GlassCard({ children, className = '', hover = false, status, onClick }) {
  const glowClass = status ? statusGlowMap[status] || '' : '';

  const baseClasses = `glass rounded-2xl ${glowClass} ${className}`;

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{ scale: 1.02, brightness: 1.1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {children}
    </div>
  );
}
