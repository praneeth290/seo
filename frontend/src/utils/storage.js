// ── History ──────────────────────────────────────────────────
const KEY = 'seolens_v2_history';
const MAX = 25;

export function saveHistory(analysis) {
  const list = getHistory();
  const item = {
    id: Date.now().toString(),
    saved_at: new Date().toISOString(),
    url: analysis.url,
    keyword: analysis.keyword,
    overall_score: analysis.overall_score,
    grade: analysis.grade,
    analyzed_at: analysis.analyzed_at,
    checks: Object.fromEntries(
      Object.entries(analysis.checks).map(([k, v]) => [k, {
        label: v.label, score: v.score, passed: v.passed, recommendation: v.recommendation
      }])
    ),
  };
  localStorage.setItem(KEY, JSON.stringify([item, ...list].slice(0, MAX)));
  return item;
}

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function deleteHistory(id) {
  localStorage.setItem(KEY, JSON.stringify(getHistory().filter(i => i.id !== id)));
}

export function clearHistory() { localStorage.removeItem(KEY); }
