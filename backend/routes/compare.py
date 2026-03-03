from fastapi import APIRouter, HTTPException
from models import CompareRequest
from services.seo_engine import analyze_seo
from utils.fetcher import fetch_url

router = APIRouter()


@router.post("/")
async def compare(req: CompareRequest):
    """Compare two pages side by side."""
    if (not req.url1 and not req.html1) or (not req.url2 and not req.html2):
        raise HTTPException(status_code=400, detail="Two URLs or HTML content pieces are required.")

    # Fetch both pages
    async def get_html(url, html, label):
        if url:
            fetched = await fetch_url(url)
            return fetched["html"], fetched["final_url"]
        return html, label

    html1, src1 = await get_html(req.url1, req.html1, "Page 1")
    html2, src2 = await get_html(req.url2, req.html2, "Page 2")

    analysis1 = analyze_seo(html1, keyword=req.keyword or "", source_url=src1)
    analysis2 = analyze_seo(html2, keyword=req.keyword or "", source_url=src2)

    comparison = _build_comparison(analysis1, analysis2)

    return {
        "success": True,
        "data": {
            "page1": analysis1,
            "page2": analysis2,
            "comparison": comparison,
        },
    }


def _build_comparison(a1: dict, a2: dict) -> dict:
    check_keys = list(a1["checks"].keys())
    diffs = {}
    for key in check_keys:
        c1 = a1["checks"].get(key, {})
        c2 = a2["checks"].get(key, {})
        s1 = c1.get("score")
        s2 = c2.get("score")
        winner = None
        if s1 is not None and s2 is not None:
            winner = 1 if s1 > s2 else (2 if s2 > s1 else 0)
        diffs[key] = {
            "label": c1.get("label", key),
            "page1_score": s1,
            "page2_score": s2,
            "winner": winner,
            "diff": round(s1 - s2, 1) if s1 is not None and s2 is not None else None,
        }

    s1_total = a1["overall_score"]
    s2_total = a2["overall_score"]
    return {
        "overall_winner": 1 if s1_total > s2_total else (2 if s2_total > s1_total else 0),
        "score_diff": s1_total - s2_total,
        "checks": diffs,
    }
