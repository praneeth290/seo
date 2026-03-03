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

### Backend → Render.com
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
