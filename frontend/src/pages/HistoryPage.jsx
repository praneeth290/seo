import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHistory, deleteHistory, clearHistory } from '../utils/storage';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { setHistory(getHistory()); }, []);

  const handleDelete = (id) => {
    deleteHistory(id); setHistory(getHistory());
    if (selected?.id === id) setSelected(null);
  };

  const handleClear = () => {
    if (window.confirm('Clear all saved analyses?')) {
      clearHistory(); setHistory([]); setSelected(null);
    }
  };

  return (
    <div>
      <motion.div style={{ marginBottom: 40 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 10 }}>◷ History</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 10 }}>
          Saved <span style={{ background: 'linear-gradient(90deg, var(--amber), var(--rose))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Analyses</span>
        </h1>
        <p style={{ color: 'var(--text-soft)', fontSize: 15 }}>Your recent SEO analyses, saved locally in the browser.</p>
      </motion.div>

      {history.length === 0 ? (
        <motion.div className="card" style={{ textAlign: 'center', padding: 80 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div style={{ fontSize: 56, marginBottom: 18 }} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>◷</motion.div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>No saved analyses yet</div>
          <div style={{ color: 'var(--text-soft)', fontSize: 14, maxWidth: 360, margin: '0 auto' }}>
            Run an analysis and click "Save to History" to store results here for future reference.
          </div>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '360px 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
          {/* List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{history.length} saved item{history.length !== 1 ? 's' : ''}</span>
              <button className="btn btn-ghost" style={{ color: 'var(--rose)', fontSize: 11 }} onClick={handleClear}>✕ Clear All</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence>
                {history.map((item, i) => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: i * 0.04 }}
                    className="card"
                    onClick={() => setSelected(selected?.id === item.id ? null : item)}
                    style={{ cursor: 'pointer', border: selected?.id === item.id ? '1px solid rgba(0,229,255,0.3)' : '1px solid var(--border-subtle)', background: selected?.id === item.id ? 'var(--cyan-dim)' : 'var(--bg-card)', transition: 'all 0.2s' }}
                    whileHover={{ borderColor: 'var(--border-soft)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {item.url ? (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>🔗 {item.url}</div>
                        ) : (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Custom Content</div>
                        )}
                        {item.keyword && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>🔑 {item.keyword}</div>}
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-ghost)' }}>{new Date(item.saved_at).toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1, color: item.overall_score >= 80 ? 'var(--emerald)' : item.overall_score >= 60 ? 'var(--amber)' : 'var(--rose)' }}>
                            {item.overall_score}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-ghost)' }}>SCORE</div>
                        </div>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', padding: 4, fontSize: 13 }}
                          onClick={e => { e.stopPropagation(); handleDelete(item.id); }}>✕</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selected && (
              <motion.div key={selected.id} className="card"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Analysis Details</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{new Date(selected.saved_at).toLocaleString()}</div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, padding: 4 }} onClick={() => setSelected(null)}>✕</button>
                </div>

                {selected.url && <div style={{ marginBottom: 14 }}><div className="label">URL</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cyan)', wordBreak: 'break-all' }}>{selected.url}</div></div>}
                {selected.keyword && <div style={{ marginBottom: 14 }}><div className="label">Keyword</div><div style={{ fontSize: 13 }}>{selected.keyword}</div></div>}

                <div className="section-label" style={{ marginTop: 16 }}>Check Scores</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(selected.checks).map(([key, check]) => {
                    const sc = check.score;
                    const color = sc >= 80 ? 'var(--emerald)' : sc >= 60 ? 'var(--amber)' : sc != null ? 'var(--rose)' : 'var(--text-muted)';
                    return (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-raised)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: 13 }}>{check.label}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {sc != null && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color }}>{Math.round(sc)}</span>}
                          <span className={`badge ${check.passed === true ? 'badge-pass' : check.passed === false ? 'badge-fail' : 'badge-na'}`}>
                            {check.passed === true ? '✓' : check.passed === false ? '✗' : '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
