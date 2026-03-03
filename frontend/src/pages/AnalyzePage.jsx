import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeContent } from '../utils/api';
import AnalysisReport from '../components/AnalysisReport';

const MODES = [
  { id: 'url', icon: '🔗', label: 'URL' },
  { id: 'html', icon: '‹/›', label: 'HTML' },
  { id: 'text', icon: '¶', label: 'Text' },
];

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } }
};
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
};

export default function AnalyzePage() {
  const [mode, setMode] = useState('url');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');
  const [includeAI, setIncludeAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = ['Fetching page...', 'Parsing HTML...', 'Running SEO checks...', 'Generating report...'];

  const handleAnalyze = async () => {
    if (mode === 'url' && !url.trim()) return setError('Please enter a URL to analyze.');
    if (mode !== 'url' && !content.trim()) return setError('Please paste some content to analyze.');
    setLoading(true); setError(null); setAnalysis(null); setLoadingStep(0);

    const stepInterval = setInterval(() => setLoadingStep(s => Math.min(s + 1, steps.length - 1)), 800);

    try {
      const payload = { keyword: keyword.trim(), include_ai: includeAI };
      if (mode === 'url') payload.url = url.trim();
      else if (mode === 'html') payload.html = content.trim();
      else payload.text = content.trim();

      const r = await analyzeContent(payload);
      setAnalysis(r.data);
    } catch (e) { setError(e.message); }
    finally { clearInterval(stepInterval); setLoading(false); }
  };

  return (
    <div>
      {/* Page Header */}
      <motion.div style={{ marginBottom: 40 }} variants={stagger} initial="initial" animate="animate">
        <motion.div variants={fadeUp} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 10 }}>
          ◈ Content Intelligence
        </motion.div>
        <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.05, marginBottom: 12 }}>
          SEO Content<br /><span style={{ background: 'linear-gradient(90deg, var(--cyan), var(--violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Analyzer</span>
        </motion.h1>
        <motion.p variants={fadeUp} style={{ color: 'var(--text-soft)', fontSize: 16, maxWidth: 560, lineHeight: 1.65 }}>
          Powered by Python + FastAPI + BeautifulSoup4 + textstat + Groq LLaMA. Get deep SEO analysis with real NLP metrics.
        </motion.p>
      </motion.div>

      {/* Input Card */}
      <motion.div className="card" style={{ marginBottom: 36 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        {/* Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div className="tab-group">
            {MODES.map(m => (
              <button key={m.id} className={`tab-btn ${mode === m.id ? 'active' : ''}`}
                onClick={() => { setMode(m.id); setContent(''); setError(null); }}>
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            FastAPI backend · Uvicorn ASGI
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <AnimatePresence mode="wait">
            {mode === 'url' ? (
              <motion.div key="url" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <label className="label">Page URL</label>
                <input type="url" className="input" style={{ fontSize: 15 }}
                  placeholder="https://yoursite.com/blog/article"
                  value={url} onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <label className="label">{mode === 'html' ? 'HTML Content' : 'Plain Text Content'}</label>
                <textarea className="textarea" style={{ minHeight: 160, fontSize: 13 }}
                  placeholder={mode === 'html' ? '<!DOCTYPE html><html>...' : 'Paste your article or blog post here...'}
                  value={content} onChange={e => setContent(e.target.value)} />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="label">Target Keyword <span style={{ color: 'var(--text-ghost)' }}>(optional)</span></label>
            <input type="text" className="input" placeholder="e.g. content marketing strategy 2024"
              value={keyword} onChange={e => setKeyword(e.target.value)} />
          </div>

          {/* AI Toggle */}
          <div className="toggle-wrap" onClick={() => setIncludeAI(v => !v)}>
            <div className={`toggle ${includeAI ? 'on' : ''}`}>
              <div className="toggle-knob" style={{ left: includeAI ? 18 : 2 }} />
            </div>
            <span style={{ fontSize: 13.5, color: 'var(--text-soft)', userSelect: 'none' }}>
              Include AI suggestions&nbsp;
              <span style={{ color: 'var(--violet)' }}>(Groq LLaMA 3.1 70B)</span>
            </span>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="alert alert-error"><span>⚠</span><span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 15.5 }}
            whileTap={{ scale: 0.99 }}>
            {loading ? <><span className="spinner" />&nbsp;{steps[loadingStep]}</> : '◈ Analyze SEO'}
          </motion.button>
        </div>
      </motion.div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <motion.div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid var(--border-soft)', borderTopColor: 'var(--cyan)' }}
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} />
                <motion.div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '2px solid var(--border-subtle)', borderBottomColor: 'var(--violet)' }}
                  animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 1.3, ease: 'linear' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{steps[loadingStep]}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                BeautifulSoup4 · textstat · Groq{includeAI ? ' LLaMA' : ''}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {steps.map((_, i) => (
                  <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= loadingStep ? 'var(--cyan)' : 'var(--border-soft)' }}
                    animate={i <= loadingStep ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ repeat: i === loadingStep ? Infinity : 0, duration: 0.8 }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {analysis && !loading && (
        <AnalysisReport analysis={analysis} onUpdate={setAnalysis} />
      )}
    </div>
  );
}
