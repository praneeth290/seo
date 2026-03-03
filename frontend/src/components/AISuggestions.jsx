import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAISuggestions } from '../utils/api';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="btn-ghost btn" style={{ fontSize: 11, padding: '4px 10px' }}>
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  );
}

function SuggestionBlock({ icon, label, value, charCount }) {
  const inRange = charCount ? (charCount >= 50 && charCount <= 160) : true;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-void)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {icon} {label}
          {charCount && (
            <span style={{ marginLeft: 8, color: inRange ? 'var(--emerald)' : 'var(--amber)' }}>({charCount} chars)</span>
          )}
        </div>
        <CopyBtn text={value} />
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--text-soft)', lineHeight: 1.6, fontStyle: 'italic' }}>
        "{value}"
      </div>
    </motion.div>
  );
}

export default function AISuggestions({ analysis, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const ai = analysis?.ai_suggestions;

  const fetch = async () => {
    setLoading(true); setError(null);
    try {
      const r = await getAISuggestions(analysis, '');
      onUpdate({ ...analysis, ai_suggestions: r.data });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (!ai && !loading) return (
    <motion.div className="card" style={{ textAlign: 'center', padding: 48 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
      </motion.div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        AI-Powered SEO Suggestions
      </div>
      <div style={{ color: 'var(--text-soft)', fontSize: 14, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}>
        Get rewritten title, meta description, and H1 — plus action items and content gaps — powered by Groq's LLaMA 3.1 70B.
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: 16, textAlign: 'left', maxWidth: 480, margin: '0 auto 16px' }}><span>⚠</span>{error}</div>}
      <button className="btn btn-primary" onClick={fetch} style={{ fontSize: 14 }}>
        ✦ Generate with Groq AI
      </button>
    </motion.div>
  );

  if (loading) return (
    <div className="card" style={{ textAlign: 'center', padding: 64 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <motion.div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--border-soft)', borderTopColor: 'var(--cyan)', position: 'absolute' }}
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
          <motion.div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid transparent', borderBottomColor: 'var(--violet)', position: 'absolute' }}
            animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Groq LLaMA is thinking...</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Analyzing your content with LLaMA 3.1 70B</div>
      </div>
    </div>
  );

  if (ai?.error) return (
    <div className="card"><div className="alert alert-error"><span>⚠</span>{ai.error}</div></div>
  );

  return (
    <motion.div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🤖</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>AI Suggestions</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan)', background: 'var(--cyan-dim)', border: '1px solid rgba(0,229,255,0.15)', padding: '3px 10px', borderRadius: 20 }}>
            Groq LLaMA 3.1 70B
          </span>
        </div>
        <button className="btn btn-ghost" onClick={fetch}>↺ Regenerate</button>
      </div>

      {ai?.quick_win && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(139,92,246,0.06))', border: '1px solid rgba(0,229,255,0.15)', borderRadius: 12, padding: '14px 18px' }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>⚡ Quick Win</div>
          <div style={{ fontSize: 14, color: 'var(--text-white)', lineHeight: 1.6 }}>{ai.quick_win}</div>
        </motion.div>
      )}

      <div className="grid-2">
        {ai?.optimized_title && <SuggestionBlock icon="📝" label="Optimized Title" value={ai.optimized_title} charCount={ai.optimized_title.length} />}
        {ai?.optimized_meta && <SuggestionBlock icon="🏷️" label="Optimized Meta" value={ai.optimized_meta} charCount={ai.optimized_meta.length} />}
        {ai?.optimized_h1 && <SuggestionBlock icon="📐" label="Optimized H1" value={ai.optimized_h1} />}
        {ai?.content_gaps && <SuggestionBlock icon="🔍" label="Content Gaps" value={ai.content_gaps} />}
      </div>

      {ai?.action_items?.length > 0 && (
        <div>
          <div className="section-label">Action Items</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ai.action_items.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ display: 'flex', gap: 12, fontSize: 13.5, color: 'var(--text-soft)', lineHeight: 1.6, padding: '10px 14px', background: 'var(--bg-raised)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--violet)', fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>{i + 1}</span>
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
