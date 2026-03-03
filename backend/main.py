from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv(override=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    key = os.getenv("GROQ_API_KEY")
    if key:
        print(f"✅ GROQ_API_KEY loaded: {key[:8]}...")
    else:
        print("⚠️  WARNING: GROQ_API_KEY not found!")
    print("🚀 SEOlens API starting up...")
    yield
    print("🛑 SEOlens API shutting down...")


app = FastAPI(
    title="SEOlens API",
    version="2.0.0",
    lifespan=lifespan,
)

# ── CORS — must be added BEFORE any routes ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.analyze import router as analyze_router
from routes.compare import router as compare_router

app.include_router(analyze_router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(compare_router, prefix="/api/compare", tags=["Compare"])


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "SEOlens API v2.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)