from bs4 import BeautifulSoup
import re
from datetime import datetime, timezone
import math


def analyze_seo(html: str, keyword: str = "", source_url: str = "") -> dict:
    soup = BeautifulSoup(html, "lxml")
    checks = {}

    # Extract clean body text once
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()

    body_text = soup.get_text(separator=" ")
    body_text = re.sub(r"\s+", " ", body_text).strip()
    words = re.findall(r"\b\w+\b", body_text.lower())
    total_words = len(words)

    # ─────────────────────────────
    # 1. TITLE
    # ─────────────────────────────
    title_tag = soup.find("title")
    title_text = title_tag.get_text(strip=True) if title_tag else ""
    title_len = len(title_text)
    title_present = bool(title_text)
    title_kw = keyword.lower() in title_text.lower() if keyword else False

    title_score = (
        0 if not title_present else
        100 if 50 <= title_len <= 60 else
        70 if 40 <= title_len <= 70 else
        40
    )

    checks["title"] = {
        "label": "Title Tag",
        "length": title_len,
        "keyword_in_title": title_kw,
        "score": title_score,
        "passed": 50 <= title_len <= 60,
        "recommendation":
            "Add a title tag." if not title_present else
            "Title should be 50–60 characters." if not (50 <= title_len <= 60)
            else "Title length is optimal."
    }

    # ─────────────────────────────
    # 2. META DESCRIPTION
    # ─────────────────────────────
    meta_tag = soup.find("meta", attrs={"name": re.compile("^description$", re.I)})
    meta_text = meta_tag.get("content", "").strip() if meta_tag else ""
    meta_len = len(meta_text)

    meta_score = (
        0 if not meta_text else
        100 if 150 <= meta_len <= 160 else
        70 if 130 <= meta_len <= 180 else
        40
    )

    checks["meta_description"] = {
        "label": "Meta Description",
        "length": meta_len,
        "score": meta_score,
        "passed": 150 <= meta_len <= 160,
        "recommendation":
            "Add a meta description." if not meta_text else
            "Meta description should be 150–160 characters."
    }

    # ─────────────────────────────
    # 3. HEADINGS
    # ─────────────────────────────
    h1s = [h.get_text(strip=True) for h in soup.find_all("h1")]
    has_single_h1 = len(h1s) == 1
    kw_in_h1 = any(keyword.lower() in h.lower() for h in h1s) if keyword else False

    heading_score = 100 if has_single_h1 else 40

    checks["headings"] = {
        "label": "Heading Structure",
        "h1_count": len(h1s),
        "keyword_in_h1": kw_in_h1,
        "score": heading_score,
        "passed": has_single_h1,
        "recommendation": "Use exactly one H1 tag."
    }

    # ─────────────────────────────
    # 4. KEYWORD RELEVANCE (STRICT)
    # ─────────────────────────────
    if keyword:
        kw_lower = keyword.lower()
        kw_count = body_text.lower().count(kw_lower)
        density = (kw_count / total_words * 100) if total_words else 0

        if kw_count == 0:
            relevance_score = 0
        elif density < 0.3:
            relevance_score = 40
        elif 0.3 <= density <= 2:
            relevance_score = 100
        else:
            relevance_score = 60

        # Penalty if not in title AND not in H1
        if not title_kw and not kw_in_h1:
            relevance_score *= 0.6

        checks["keyword"] = {
            "label": "Keyword Relevance",
            "count": kw_count,
            "density": round(density, 2),
            "in_title": title_kw,
            "in_h1": kw_in_h1,
            "score": round(relevance_score),
            "passed": relevance_score >= 60,
            "recommendation":
                "Keyword not found — content not relevant." if kw_count == 0 else
                "Keyword density too low." if density < 0.3 else
                "Keyword density too high." if density > 2 else
                "Keyword usage is healthy."
        }
    else:
        checks["keyword"] = {
            "label": "Keyword Relevance",
            "score": 0,
            "passed": None,
            "recommendation": "Provide a target keyword."
        }

    # ─────────────────────────────
    # 5. WORD COUNT
    # ─────────────────────────────
    word_score = (
        100 if total_words >= 1000 else
        80 if total_words >= 600 else
        60 if total_words >= 300 else
        30
    )

    checks["word_count"] = {
        "label": "Content Depth",
        "count": total_words,
        "score": word_score,
        "passed": total_words >= 300,
        "recommendation":
            "Content too short." if total_words < 300 else
            "Consider expanding content." if total_words < 600 else
            "Strong content depth."
    }

    # ─────────────────────────────
    # 6. IMAGES
    # ─────────────────────────────
    images = soup.find_all("img")
    total_imgs = len(images)
    missing_alt = sum(1 for img in images if not img.get("alt"))

    img_score = (
        70 if total_imgs == 0 else
        max(0, round(100 - (missing_alt / total_imgs * 100)))
    )

    checks["images"] = {
        "label": "Image Optimization",
        "total": total_imgs,
        "missing_alt": missing_alt,
        "score": img_score,
        "passed": missing_alt == 0,
        "recommendation":
            "Add optimized images." if total_imgs == 0 else
            "Some images missing alt text." if missing_alt else
            "All images optimized."
    }

    # ─────────────────────────────
    # 7. READABILITY
    # ─────────────────────────────
    if len(body_text) > 100:
        flesch = round(textstat.flesch_reading_ease(body_text), 1)
        flesch = max(0, min(100, flesch))
    else:
        flesch = 0

    readability_score = (
        100 if flesch >= 70 else
        75 if flesch >= 50 else
        50 if flesch >= 30 else
        25
    )

    checks["readability"] = {
        "label": "Readability",
        "flesch_score": flesch,
        "score": readability_score,
        "passed": flesch >= 50,
        "recommendation":
            "Very difficult to read." if flesch < 30 else
            "Difficult readability." if flesch < 50 else
            "Moderately readable." if flesch < 70 else
            "Excellent readability."
    }

    # ─────────────────────────────
    # ENTERPRISE WEIGHTED SCORING
    # ─────────────────────────────
    weights = {
        "title": 1,
        "meta_description": 1,
        "headings": 1,
        "keyword": 3,
        "word_count": 2,
        "images": 1,
        "readability": 1,
    }

    total_weight = sum(weights.values())
    weighted_score = sum(checks[k]["score"] * w for k, w in weights.items())
    overall = round(weighted_score / total_weight)

    # Final hard penalty
    if keyword:
        kw = checks["keyword"]

    # Severe topical mismatch detection
        if (
            kw["density"] < 0.1 and
            not kw["in_title"] and
            not kw["in_h1"]
        ):
            overall = min(overall, 35)

    return {
        "url": source_url or None,
        "keyword": keyword or None,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "overall_score": overall,
        # "grade": grade,
        "checks": checks,
    }  