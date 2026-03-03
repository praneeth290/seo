import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import ScoreRing from './ScoreRing';
import CheckCard from './CheckCard';
import AISuggestions from './AISuggestions';
import { exportPDF } from '../utils/pdf';
import { saveHistory } from '../utils/storage';

const CHECK_ORDER = ['title', 'meta_description', 'headings', 'keyword', 'word_count', 'links', 'images', 'readability'];

const tabs = [
  { id: 'overview', icon: '◉', label: 'Overview' },
  { id: 'checks', icon: '≡', label: 'All Checks' },
  { id: 'ai', icon: '✦', label: 'AI Suggestions' },
];

export default function AnalysisReport({ analysis, onUpdate }) {
  const [tab, setTab] = useState('overview');
  const [saved, setSaved] = useState(false);

  if (!analysis) return null;
  const { overall_score, grade, checks, url, keyword, analyzed_at } = analysis;

  const passCount = CHECK_ORDER.filter(k => checks[k]?.passed === true).length;
  const failCount = CHECK_ORDER.filter(k => checks[k]?.passed === false).length;

  const radarData = CHECK_ORDER
    .filter(k => checks[k]?.score != null)
    .map(k => ({
      subject: (checks[k].label || k).replace(' Tag', '').replace(' Analysis', '').replace(' Structure', ''),
      score: Math.round(checks[k].score || 0),
    }));

  const barData = CHECK_ORDER
    .filter(k => checks[k]?.score != null)
    .sort((a, b) => (checks[a].score || 0) - (checks[b].score || 0))
    .map(k => ({
      name: (checks[k].label || k).replace(' Tag', '').replace(' Analysis', '').replace(' Structure', ''),
      score: Math.round(checks[k].score || 0),
    }));

  const handleSave = () => {
    saveHistory(analysis); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const scoreColor = overall_score >= 80 ? 'var(--emerald)' : overall_score >= 60 ? 'var(--amber)' : 'var(--rose)';

  return (
    <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

      {/* ── Hero Panel ── */}
      <motion.div className="card"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-raised) 100%)', position: 'relative', overflow: 'hidden' }}
      >
        {/* BG decoration */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${scoreColor}10, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center', position: 'relative' }}>
          <ScoreRing score={overall_score} size={148} stroke={11} />

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, lineHeight: 1.2, marginBottom: 6 }}>
              {overall_score >= 80 ? '🎉 Strong SEO Performance' :
               overall_score >= 60 ? '⚡ Needs Optimization' : '🚨 Critical SEO Issues'}
            </div>

            {url && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)', marginBottom: 10, wordBreak: 'break-all', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <span>🔗</span><span>{url}</span>
              </div>
            )}
            {keyword && (
              <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 14 }}>
                🔑 Keyword: <strong style={{ color: 'var(--text-white)' }}>{keyword}</strong>
              </div>
            )}

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--emerald)' }}>{passCount}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>passed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--rose)' }}>{failCount}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>failed</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-ghost)' }}>
                {new Date(analyzed_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
            <motion.button className="btn btn-primary" onClick={() => exportPDF(analysis)} whileTap={{ scale: 0.97 }} style={{ fontSize: 13 }}>
              ↓ Export PDF
            </motion.button>
            <motion.button className="btn btn-secondary" onClick={handleSave} disabled={saved} whileTap={{ scale: 0.97 }} style={{ fontSize: 13 }}>
              {saved ? '✓ Saved!' : '◷ Save to History'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div className="tab-group">
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          {CHECK_ORDER.filter(k => checks[k]?.score != null).length} checks · Python + BeautifulSoup4 + Pure Python
        </div>
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid-2">
            {/* Radar */}
            <div className="card">
              <div className="section-label">Score Radar</div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                  <Radar name="Score" dataKey="score" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.12} strokeWidth={2} dot={{ fill: 'var(--cyan)', r: 3 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border-soft)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)' }} formatter={v => [`${v}/100`]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="card">
              <div className="section-label">Score Breakdown</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-soft)', fontSize: 10 }} width={88} />
                  <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border-soft)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v}/100`]} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 80 ? '#00ff9d' : entry.score >= 60 ? '#ffbe0b' : '#ff3366'} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Fixes */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="section-label">Priority Fixes</div>
              {failCount === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--emerald)', fontSize: 15 }}>🎉 All checks passed! Great SEO foundation.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CHECK_ORDER
                    .filter(k => checks[k]?.passed === false)
                    .sort((a, b) => (checks[a].score || 0) - (checks[b].score || 0))
                    .map((k, i) => (
                      <motion.div key={k}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        style={{ display: 'flex', gap: 14, padding: '12px 16px', background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}
                      >
                        <span style={{ color: 'var(--rose)', fontWeight: 800, fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>✗</span>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-white)', marginBottom: 3 }}>{checks[k].label}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12.5, lineHeight: 1.5 }}>{checks[k].recommendation}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--rose)', flexShrink: 0 }}>
                          {Math.round(checks[k].score)}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'checks' && (
          <motion.div key="checks" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CHECK_ORDER
              .filter(k => checks[k])
              .sort((a, b) => (checks[a].score || 0) - (checks[b].score || 0))
              .map((k, i) => <CheckCard key={k} checkKey={k} check={checks[k]} index={i} />)}
          </motion.div>
        )}

        {tab === 'ai' && (
          <motion.div key="ai" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AISuggestions analysis={analysis} onUpdate={onUpdate} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
