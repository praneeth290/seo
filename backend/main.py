from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from routes.analyze import router as analyze_router
from routes.compare import router as compare_router

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 SEOlens API starting up...")
    yield
    print("🛑 SEOlens API shutting down...")


app = FastAPI(
    title="SEOlens API",
    description="Corporate-grade SEO Content Analyzer powered by Python + FastAPI + Groq AI",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(compare_router, prefix="/api/compare", tags=["Compare"])


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "SEOlens API v2.0", "framework": "FastAPI + Python"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
