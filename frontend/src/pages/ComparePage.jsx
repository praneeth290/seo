import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { comparePages } from '../utils/api';
import ScoreRing from '../components/ScoreRing';

export default function ComparePage() {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handle = async () => {
    if (!url1.trim() || !url2.trim()) return setError('Please enter both URLs.');
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await comparePages({ url1: url1.trim(), url2: url2.trim(), keyword: keyword.trim() });
      setResult(r.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <motion.div style={{ marginBottom: 40 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--violet)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 10 }}>⊞ Compare Mode</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 10 }}>
          Side-by-Side <span style={{ background: 'linear-gradient(90deg, var(--violet), var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Comparison</span>
        </h1>
        <p style={{ color: 'var(--text-soft)', fontSize: 15 }}>Compare any two pages to see which is better optimized for SEO.</p>
      </motion.div>

      <motion.div className="card" style={{ marginBottom: 32 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">Page 1 URL</label>
            <input type="url" className="input" placeholder="https://yoursite.com/page" value={url1} onChange={e => setUrl1(e.target.value)} />
          </div>
          <div>
            <label className="label">Page 2 URL</label>
            <input type="url" className="input" placeholder="https://competitor.com/page" value={url2} onChange={e => setUrl2(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 16, maxWidth: 400 }}>
          <label className="label">Target Keyword <span style={{ color: 'var(--text-ghost)' }}>(optional)</span></label>
          <input type="text" className="input" placeholder="e.g. best seo tools" value={keyword} onChange={e => setKeyword(e.target.value)} />
        </div>
        <AnimatePresence>
          {error && <motion.div className="alert alert-error" style={{ marginTop: 14 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><span>⚠</span>{error}</motion.div>}
        </AnimatePresence>
        <motion.button className="btn btn-primary" onClick={handle} disabled={loading}
          style={{ marginTop: 20, width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
          whileTap={{ scale: 0.99 }}>
          {loading ? <><span className="spinner" />&nbsp;Comparing pages...</> : '⊞ Compare Pages'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: 48 }}>
            <div className="spinner" style={{ width: 44, height: 44, margin: '0 auto 16px', borderWidth: 3 }} />
            <div style={{ color: 'var(--text-soft)' }}>Fetching and analyzing both pages with BeautifulSoup4...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {result && !loading && <CompareResults result={result} />}
    </div>
  );
}

function CompareResults({ result }) {
  const { page1, page2, comparison } = result;
  const winnerColor = comparison.overall_winner === 1 ? 'var(--emerald)' : comparison.overall_winner === 2 ? 'var(--rose)' : 'var(--amber)';

  return (
    <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* Score overview */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-raised))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 24, padding: '8px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <ScoreRing score={page1.overall_score} size={120} label="Page 1" />
            {page1.url && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 8, maxWidth: 200, wordBreak: 'break-all' }}>{page1.url}</div>}
          </div>
          <div style={{ textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: winnerColor, marginBottom: 4 }}
            >
              {comparison.overall_winner === 0 ? '🤝 Tied' : `Page ${comparison.overall_winner} Wins`}
            </motion.div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{Math.abs(comparison.score_diff)} pts difference</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <ScoreRing score={page2.overall_score} size={120} label="Page 2" />
            {page2.url && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 8, maxWidth: 200, wordBreak: 'break-all' }}>{page2.url}</div>}
          </div>
        </div>
      </div>

      {/* Checks breakdown */}
      <div className="card">
        <div className="section-label">Check-by-Check Comparison</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(comparison.checks).map(([key, diff], i) => (
            <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', gap: 12, alignItems: 'center' }}>
              <ScoreBar2 score={diff.page1_score} winner={diff.winner === 1} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: 'var(--text-soft)', marginBottom: 4 }}>{diff.label}</div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  color: diff.winner === 1 ? 'var(--emerald)' : diff.winner === 2 ? 'var(--rose)' : 'var(--amber)' }}>
                  {diff.winner === 0 ? 'TIE' : diff.winner === 1 ? '← P1 Wins' : 'P2 Wins →'}
                </span>
              </div>
              <ScoreBar2 score={diff.page2_score} winner={diff.winner === 2} reverse />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ScoreBar2({ score, winner, reverse }) {
  if (score == null) return <div style={{ color: 'var(--text-ghost)', fontSize: 12, textAlign: reverse ? 'left' : 'right' }}>N/A</div>;
  const color = winner ? 'var(--emerald)' : score >= 80 ? 'var(--text-soft)' : score >= 60 ? 'var(--amber)' : 'var(--rose)';
  return (
    <div style={{ display: 'flex', flexDirection: reverse ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color, minWidth: 40, textAlign: reverse ? 'left' : 'right', lineHeight: 1 }}>
        {Math.round(score)}
      </div>
      <div style={{ flex: 1, height: 5, background: 'var(--bg-raised)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: color, borderRadius: 3, marginLeft: reverse ? 'auto' : 0, boxShadow: winner ? `0 0 8px ${color}66` : 'none' }}
        />
      </div>
    </div>
  );
}
