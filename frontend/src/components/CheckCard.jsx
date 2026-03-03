import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS = {
  title: '📝', meta_description: '🏷️', headings: '📐',
  keyword: '🔑', word_count: '📊', links: '🔗', images: '🖼️', readability: '📖'
};

function ScoreBar({ score }) {
  if (score == null) return null;
  const color = score >= 80 ? 'var(--emerald)' : score >= 60 ? 'var(--amber)' : 'var(--rose)';
  return (
    <div style={{ height: 3, background: 'var(--bg-raised)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{ height: '100%', background: color, borderRadius: 2, boxShadow: `0 0 8px ${color}66` }}
      />
    </div>
  );
}

function StatChip({ label, value, color }) {
  return (
    <div className="chip">
      <span className="chip-value" style={{ color: color || 'var(--text-white)', fontSize: 16 }}>{value}</span>
      <span className="chip-label">{label}</span>
    </div>
  );
}

export default function CheckCard({ checkKey, check, index = 0 }) {
  const [open, setOpen] = useState(false);
  if (!check) return null;

  const { label, score, passed, recommendation } = check;
  const icon = ICONS[checkKey] || '◆';
  const statusClass = passed === true ? 'badge-pass' : passed === false ? 'badge-fail' : 'badge-na';
  const statusText = passed === true ? '✓ Pass' : passed === false ? '✗ Fail' : '— N/A';
  const scoreColor = score >= 80 ? 'var(--emerald)' : score >= 60 ? 'var(--amber)' : score != null ? 'var(--rose)' : 'var(--text-muted)';

  const renderExtra = () => {
    switch (checkKey) {
      case 'title':
        return check.value ? (
          <div style={{ marginTop: 12 }}>
            <div className="label" style={{ marginBottom: 6 }}>Current Title</div>
            <div style={{ background: 'var(--bg-void)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-soft)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{check.value}" <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({check.length} chars)</span>
            </div>
            {check.keyword_in_title !== null && (
              <div style={{ marginTop: 8, fontSize: 12, color: check.keyword_in_title ? 'var(--emerald)' : 'var(--rose)' }}>
                {check.keyword_in_title ? '✓ Keyword found in title' : '✗ Keyword not in title'}
              </div>
            )}
          </div>
        ) : null;

      case 'meta_description':
        return check.value ? (
          <div style={{ marginTop: 12 }}>
            <div className="label" style={{ marginBottom: 6 }}>Current Meta Description</div>
            <div style={{ background: 'var(--bg-void)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-soft)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{check.value}" <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({check.length} chars)</span>
            </div>
          </div>
        ) : null;

      case 'headings':
        return (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[['H1', check.h1, 'var(--cyan)'], ['H2', check.h2, 'var(--violet)'], ['H3', check.h3, 'var(--text-muted)']].map(([tag, items, c]) =>
              items?.length > 0 && (
                <div key={tag} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: c, minWidth: 32 }}>{tag}×{items.length}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {items[0]}{items.length > 1 ? ` +${items.length - 1} more` : ''}
                  </span>
                </div>
              )
            )}
            {check.hierarchy_issues?.map((issue, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--amber)' }}>⚠ {issue}</div>
            ))}
          </div>
        );

      case 'keyword':
        return check.keyword ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <StatChip label="Density" value={`${check.density}%`} color={check.passed ? 'var(--emerald)' : 'var(--rose)'} />
              <StatChip label="Count" value={check.count} />
              <StatChip label="Words" value={(check.total_words || 0).toLocaleString()} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                ['In Title', check.in_title],
                ['In H1', check.in_h1],
                ['1st Para', check.in_first_paragraph],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                  <span style={{ color: val ? 'var(--emerald)' : 'var(--rose)' }}>{val ? '✓' : '✗'}</span>
                  <span style={{ color: 'var(--text-soft)' }}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'word_count':
        return (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: scoreColor, letterSpacing: '-1px' }}>
              {(check.count || 0).toLocaleString()}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>words</span>
          </div>
        );

      case 'links':
        return (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <StatChip label="Total" value={check.total} />
            <StatChip label="Internal" value={check.internal} color="var(--emerald)" />
            <StatChip label="External" value={check.external} color="var(--cyan)" />
            {check.broken_anchors > 0 && <StatChip label="Broken" value={check.broken_anchors} color="var(--rose)" />}
          </div>
        );

      case 'images':
        return (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <StatChip label="Total" value={check.total} />
            <StatChip label="With Alt" value={check.with_alt} color="var(--emerald)" />
            <StatChip label="Missing Alt" value={check.missing_alt} color={check.missing_alt > 0 ? 'var(--rose)' : 'var(--text-muted)'} />
            <StatChip label="Empty Alt" value={check.empty_alt} color={check.empty_alt > 0 ? 'var(--amber)' : 'var(--text-muted)'} />
          </div>
        );

      case 'readability':
        return (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <StatChip label="Flesch" value={check.flesch_score} color={scoreColor} />
              <StatChip label="Level" value={check.level} color={check.level === 'Easy' ? 'var(--emerald)' : check.level === 'Moderate' ? 'var(--amber)' : 'var(--rose)'} />
              <StatChip label="Fog Index" value={check.gunning_fog} />
              <StatChip label="Avg Sent" value={`${check.avg_sentence_length}w`} />
            </div>
            {check.reading_time_minutes > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                ⏱ Estimated reading time: <strong style={{ color: 'var(--text-soft)' }}>{check.reading_time_minutes} min</strong>
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="card"
      style={{ cursor: 'pointer' }}
      onClick={() => setOpen(o => !o)}
      whileHover={{ borderColor: 'var(--border-soft)', transition: { duration: 0.15 } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5 }}>{label}</span>
            <span className={`badge ${statusClass}`}>{statusText}</span>
          </div>
          <ScoreBar score={score} />
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: scoreColor, lineHeight: 1 }}>
            {score != null ? Math.round(score) : '—'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-ghost)' }}>/100</div>
        </div>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ color: 'var(--text-muted)', fontSize: 11, flexShrink: 0 }}
        >▼</motion.span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.65 }}>
                <span style={{ color: 'var(--cyan)', marginRight: 6 }}>💡</span>{recommendation}
              </div>
              {renderExtra()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
