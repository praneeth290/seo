import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ScoreRing({ score, size = 140, stroke = 10, label = 'SEO Score', animate = true }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);
  const radius = (size - stroke) / 2;
  const circ = radius * 2 * Math.PI;
  const offset = circ - (displayed / 100) * circ;

  const color = displayed >= 80 ? '#00ff9d' : displayed >= 60 ? '#ffbe0b' : '#ff3366';
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

  useEffect(() => {
    if (!animate) return;
    let start = null;
    const duration = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(ease * score));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score, animate]);

  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: -8,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 8px ${color}44)` }}>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-raised)" strokeWidth={stroke} />
          {/* Progress */}
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: animate ? 'none' : 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: size * 0.23,
            fontWeight: 800, color, lineHeight: 1, letterSpacing: '-1.5px'
          }}>{displayed}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: size * 0.085,
            color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase'
          }}>Grade {grade}</span>
        </div>
      </div>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        {label}
      </span>
    </motion.div>
  );
}
