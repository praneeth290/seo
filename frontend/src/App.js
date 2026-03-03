import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnalyzePage from './pages/AnalyzePage';
import ComparePage from './pages/ComparePage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

const pages = [
  { id: 'analyze', icon: '⊕', label: 'Analyze' },
  { id: 'compare', icon: '⊞', label: 'Compare' },
  { id: 'history', icon: '◷', label: 'History' },
];

const pageVariants = {
  initial: { opacity: 0, y: 18, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.2 } },
};

export default function App() {
  const [active, setActive] = useState('analyze');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-mark">S</div>
            <span>SEO<span className="logo-accent">lens</span></span>
          </div>

          <nav className="nav">
            {pages.map(p => (
              <button
                key={p.id}
                className={`nav-btn ${active === p.id ? 'active' : ''}`}
                onClick={() => setActive(p.id)}
              >
                <span className="nav-icon">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </nav>

          <div className="header-pill">Python + FastAPI + Groq</div>
        </div>
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div key={active} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {active === 'analyze' && <AnalyzePage />}
            {active === 'compare' && <ComparePage />}
            {active === 'history' && <HistoryPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="app-footer">
        <span>SEOlens v2.0</span>
        <span style={{ color: 'var(--border-bright)' }}>·</span>
        <span>Python + FastAPI + BeautifulSoup4 + Groq LLaMA</span>
        <span style={{ color: 'var(--border-bright)' }}>·</span>
        <span>React + Framer Motion</span>
      </footer>
    </div>
  );
}
