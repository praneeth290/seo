from fastapi import APIRouter, HTTPException
from bs4 import BeautifulSoup
import os

from models import AnalyzeRequest, AISuggestionsRequest, KeywordRequest
from services.seo_engine import analyze_seo
from services.groq_service import generate_ai_suggestions, generate_keyword_suggestions
from utils.fetcher import fetch_url

router = APIRouter()


@router.post("/")
async def analyze(req: AnalyzeRequest):
    """Analyze content from URL, HTML, or plain text."""
    if not req.url and not req.html and not req.text:
        raise HTTPException(status_code=400, detail="Provide a URL, HTML content, or plain text.")

    html_content = ""
    source_url = ""

    if req.url:
        fetched = await fetch_url(req.url)
        html_content = fetched["html"]
        source_url = fetched["final_url"]
    elif req.html:
        html_content = req.html
    elif req.text:
        paragraphs = "".join(f"<p>{p.strip()}</p>" for p in req.text.split("\n\n") if p.strip())
        html_content = f"<html><head><title></title></head><body>{paragraphs}</body></html>"

    analysis = analyze_seo(html_content, keyword=req.keyword or "", source_url=source_url)

    # Extract content snippet for AI
    soup = BeautifulSoup(html_content, "lxml")
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()
    content_snippet = " ".join(soup.get_text().split())[:800]

    if req.include_ai and os.getenv("GROQ_API_KEY"):
        try:
            ai_suggestions = generate_ai_suggestions(analysis, content_snippet)
            analysis["ai_suggestions"] = ai_suggestions
        except Exception as e:
            analysis["ai_suggestions"] = {"error": str(e)}

    return {"success": True, "data": analysis}


@router.post("/ai-suggestions")
async def ai_suggestions(req: AISuggestionsRequest):
    """Get Groq AI suggestions for an existing analysis."""
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured on this server.")
    try:
        suggestions = generate_ai_suggestions(req.analysis, req.content_snippet)
        return {"success": True, "data": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/keywords")
async def keyword_suggestions(req: KeywordRequest):
    """Get keyword suggestions powered by Groq."""
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured.")
    try:
        suggestions = generate_keyword_suggestions(req.content_snippet, req.keyword)
        return {"success": True, "data": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
