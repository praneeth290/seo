# SEOlens v2 — Corporate SEO Intelligence Platform

Full-stack SEO Content Analyzer built with **Python + FastAPI + BeautifulSoup4 + Groq LLaMA**.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.11+ · FastAPI · Uvicorn (ASGI) |
| **HTML Parsing** | BeautifulSoup4 + lxml |
| **Readability** | textstat (Flesch, Gunning Fog, SMOG) |
| **AI** | Groq SDK · LLaMA 3.1 70B + LLaMA 3.1 8B |
| **HTTP Client** | httpx (async) |
| **Frontend** | React 18 · Framer Motion · Recharts |
| **PDF Export** | jsPDF + jsPDF-AutoTable |
| **API Docs** | FastAPI Swagger UI (auto-generated) |

## 📦 Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key → [console.groq.com](https://console.groq.com) (free)

### Backend Setup
```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — add your GROQ_API_KEY

# Start the server
uvicorn main:app --reload --port 8000
```

The API is live at: `http://localhost:8000`
Auto-generated docs: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/analyze/` | Analyze URL, HTML, or text |
| POST | `/api/analyze/ai-suggestions` | Get Groq AI rewrites |
| POST | `/api/analyze/keywords` | Get keyword suggestions |
| POST | `/api/compare/` | Compare two pages |
| GET | `/docs` | Swagger UI (FastAPI auto-docs) |

## ✅ Features

- **8 SEO Checks**: Title, Meta, Headings, Keyword Density, Word Count, Links, Images, Readability
- **Real NLP**: textstat Flesch + Gunning Fog + SMOG index
- **Groq AI**: LLaMA 3.1 70B rewrites title/meta/H1 + action items
- **Compare Mode**: Side-by-side competitor analysis
- **PDF Export**: Styled report download
- **History**: localStorage-based saved analyses
- **Framer Motion**: Smooth page transitions and micro-interactions
- **Swagger Docs**: FastAPI auto-generates API documentation

## 🌐 Deploy

### Backend → railway.com
1. Push to GitHub
2. New Web Service → `backend/` directory
3. Runtime: **Python 3**
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Env vars: `GROQ_API_KEY`

### Frontend → Vercel
1. Set `REACT_APP_API_URL` to your Render backend URL + `/api`
2. Build: `npm run build`
3. Output: `build/`



# SEOlens v2 — Project Summary

## 1. Tech Stack — What Was Chosen and Why

| Layer | Technology | Why This Choice |
|---|---|---|
| **Server** | Python + FastAPI | FastAPI auto-generates Swagger docs, handles async natively, and has Pydantic for built-in type validation. Flask would have needed extra libraries for all of this. |
| **HTML Parsing** | BeautifulSoup4 + lxml | Industry standard for HTML parsing in Python. lxml is the fastest parser backend. Far more powerful than Node.js alternatives like Cheerio. |
| **AI Layer** | Groq LLaMA 3.1 70B | Groq provides the fastest LLM inference available (250+ tokens/sec). Free tier is generous. LLaMA 3.1 is open-source. OpenAI would cost money and be slower. |
| **Frontend** | React 18 | Component-based architecture makes the complex dashboard manageable. Large ecosystem with Recharts for data visualization. |
| **Animations** | Framer Motion | Spring physics animations make the UI feel premium. AnimatePresence handles page transitions cleanly. CSS alone cannot match the quality. |
| **Backend Host** | Railway | Simpler deployment than Render — push to GitHub and it deploys automatically. Better logs and environment variable management. |
| **Frontend Host** | Vercel | Purpose-built for React apps. Zero-config deployment. Free SSL, CDN, and preview deployments on every push. |

---

## 2. AI Tools Used and How They Helped

Two distinct AI tools were used — one during development, one running live inside the app.

| Tool | Role | Specific Contribution |
|---|---|---|
| **Claude (Anthropic)** | Development Assistant | Architecture decisions, full code generation, debugging Railway deployment errors, fixing Python 3.13 compatibility issues, CORS configuration, and writing documentation. |
| **Groq LLaMA 3.1 70B** | Live App Feature | Runs inside the deployed app. When users click "Generate AI Suggestions", it rewrites their title tag, meta description, and H1, and generates content improvement action items. |
| **Groq LLaMA 3.1 8B** | Live App Feature | Lighter, faster model used for keyword suggestion generation. Chosen over 70B for speed — keyword suggestions need fast response, not deep reasoning. |

> **Important distinction:** Claude was used to **build** the tool. Groq LLaMA **runs inside** the tool for end users. These are separate roles.

---

## 3. Trade-offs and Prioritization Decisions

- **Removed textstat → Pure Python readability engine:** textstat is broken on Python 3.12+ due to a removed dependency (pkg_resources). Rather than downgrading Python, a custom Flesch Reading Ease, Gunning Fog, and SMOG calculator was written from scratch — removing an external dependency entirely.

- **localStorage for history instead of a database:** A PostgreSQL database would require additional setup, hosting costs, and authentication. localStorage gives the same user-facing feature with zero infrastructure. Trade-off is history doesn't sync across devices — acceptable for this scope.

- **BeautifulSoup over Puppeteer/Playwright:** Puppeteer can render JavaScript and analyze SPAs. BeautifulSoup cannot. However, Puppeteer adds significant complexity, memory usage, and deployment difficulty. BeautifulSoup covers 90% of real-world pages for this use case.

- **Groq over OpenAI:** OpenAI GPT-4 would produce marginally better AI suggestions but costs money per request and is slower. Groq LLaMA 3.1 70B is free, faster, and produces good enough results for SEO rewriting tasks.

- **Keyword weighted 3x in overall scoring:** After testing, a keyword scoring 0 on a technically well-built page only moved the overall score by ~8 points. Since the keyword is the reason someone is analyzing a page, it was given triple weight so the score meaningfully reflects keyword relevance.

- **Minimum version constraints instead of pinned versions:** Pinned versions like pydantic==2.5.3 caused build failures on Railway (Python 3.13). Switched to >= constraints so the platform always resolves compatible wheels.

---

## 4. What Would Be Improved With More Time

| Feature | Why It Matters |
|---|---|
| **PostgreSQL + Authen** | History would persist across devices. User accounts would allow teams to share analyses and track SEO improvements over time. |
| **Puppeteer Support** | Many modern sites are React/Vue SPAs — BeautifulSoup sees empty HTML. Puppeteer would render JavaScript and analyze the actual content users see. |
| **Bulk URL Analysis** | Upload a sitemap.xml and analyze all pages in one go. Identify the worst-performing pages across an entire website. |
| **Scheduled Monitoring** | Track SEO score changes over time. Alert users when a page's score drops — useful for catching accidental meta tag deletions after deployments. |
| **Competitor Analysis** | Given a keyword, fetch the top 5 Google results and compare their SEO structure against the user's page. Show exactly what top-ranking pages do differently. |
| **Phrase-level Keyword Detection** | Current detection is word-based. Multi-word phrases like "machine learning tutorial" should be detected as a unit, not as separate words. |

---

## 5. Known Bugs and Limitations

| Severity | Issue | Workaround |
|---|---|---|
| **Medium** | Sites like LinkedIn, Medium, and Twitter return 403 Forbidden — the backend cannot fetch their HTML. | Use the HTML tab to paste content directly. Any page can be analyzed by pasting its source HTML. |
| **Medium** | JavaScript-rendered SPAs (React, Vue, Angular sites) show empty content since BeautifulSoup cannot execute JavaScript. | Paste the rendered HTML from browser DevTools → Elements panel. |
| **Low** | Keyword scoring is word-based. A multi-word keyword like "python tutorial" is searched as an exact phrase, which may under-count occurrences. | Use single-word keywords for most accurate density scoring. |
| **Low** | History is stored in browser localStorage only. Clearing browser data or switching browsers loses all saved analyses. | Export important analyses as PDF before clearing browser data. |
| **Low** | SMOG readability index requires 30+ sentences to be accurate. Short pages return SMOG = 0. | Flesch and Gunning Fog are still calculated accurately. SMOG is a supplementary metric. |
| **Info** | Railway free tier spins down after inactivity. First request after idle period takes 5–10 seconds. | Expected behavior on free hosting. Upgrade to paid tier for always-on performance. |