from bs4 import BeautifulSoup
from urllib.parse import urlparse
from datetime import datetime, timezone
import re
import math


# ── Scoring thresholds (easy to tune) ────────────────────────────────────────
TITLE_MIN, TITLE_MAX         = 50, 60
META_MIN,  META_MAX          = 150, 160
WORD_MIN,  WORD_GOOD, WORD_GREAT = 300, 600, 1000
KW_MIN,    KW_MAX            = 0.5, 2.5
FLESCH_EASY, FLESCH_OK       = 70, 50


def analyze_seo(html: str, keyword: str = "", source_url: str = "") -> dict:
    soup  = BeautifulSoup(html, "lxml")
    soup2 = BeautifulSoup(html, "lxml")   # kept clean for links/images
    kw    = keyword.strip().lower()

    checks = {}

    # 1 ── Title ───────────────────────────────────────────────────────────────
    tag   = soup.find("title")
    text  = tag.get_text(strip=True) if tag else ""
    tlen  = len(text)
    checks["title"] = {
        "label": "Title Tag",
        "value": text or None,
        "length": tlen,
        "present": bool(text),
        "keyword_in_title": (kw in text.lower()) if kw else None,
        "passed": bool(text) and TITLE_MIN <= tlen <= TITLE_MAX,
        "score": _score_range(bool(text), tlen, TITLE_MIN, TITLE_MAX),
        "recommendation": _rec_range("Title", bool(text), tlen, TITLE_MIN, TITLE_MAX),
    }

    # 2 ── Meta Description ────────────────────────────────────────────────────
    meta  = soup.find("meta", attrs={"name": re.compile("^description$", re.I)})
    mdesc = (meta.get("content", "") or "").strip() if meta else ""
    mlen  = len(mdesc)
    checks["meta_description"] = {
        "label": "Meta Description",
        "value": mdesc or None,
        "length": mlen,
        "present": bool(mdesc),
        "passed": bool(mdesc) and META_MIN <= mlen <= META_MAX,
        "score": _score_range(bool(mdesc), mlen, META_MIN, META_MAX),
        "recommendation": _rec_range("Meta description", bool(mdesc), mlen, META_MIN, META_MAX),
    }

    # 3 ── Heading Structure ───────────────────────────────────────────────────
    h1s = [h.get_text(strip=True) for h in soup.find_all("h1")]
    h2s = [h.get_text(strip=True) for h in soup.find_all("h2")]
    h3s = [h.get_text(strip=True) for h in soup.find_all("h3")]
    issues = (
        ([f"Multiple H1 tags ({len(h1s)})"] if len(h1s) > 1 else []) +
        (["H2 tags present but no H1"] if not h1s and h2s else [])
    )
    checks["headings"] = {
        "label": "Heading Structure",
        "h1": h1s, "h2": h2s[:5], "h3": h3s[:5],
        "has_h1": bool(h1s),
        "single_h1": len(h1s) == 1,
        "hierarchy_issues": issues,
        "keyword_in_h1": any(kw in h.lower() for h in h1s) if kw and h1s else None,
        "passed": bool(h1s) and len(h1s) == 1 and not issues,
        "score": 100 if (h1s and len(h1s) == 1 and not issues) else (70 if h1s else 0),
        "recommendation": (
            "Add an H1 tag — every page needs exactly one." if not h1s
            else f"Found {len(h1s)} H1 tags — use exactly one." if len(h1s) > 1
            else ". ".join(issues) if issues
            else "Heading structure is well-organized!"
        ),
    }

    # 4 ── Keyword Density ─────────────────────────────────────────────────────
    body      = _plain(soup)
    all_words = re.findall(r'\b\w+\b', body.lower())
    total_w   = len(all_words)

    if kw:
        count   = body.lower().count(kw)
        density = round(count / total_w * 100, 2) if total_w else 0
        fp      = soup.find("p")
        passed  = KW_MIN <= density <= KW_MAX
        checks["keyword"] = {
            "label": "Keyword Density",
            "keyword": keyword,
            "count": count, "density": density, "total_words": total_w,
            "in_title": kw in text.lower(),
            "in_h1": any(kw in h.lower() for h in h1s),
            "in_first_paragraph": kw in fp.get_text().lower() if fp else False,
            "passed": passed,
            "score": 100 if passed else (0 if count == 0 else (40 if density < KW_MIN else 60)),
            "recommendation": (
                f'Keyword "{keyword}" not found. Add it naturally.' if not count
                else f"Density too low ({density}%). Aim for {KW_MIN}–{KW_MAX}%." if density < KW_MIN
                else f"Density too high ({density}%). Reduce to avoid over-optimization." if density > KW_MAX
                else f"Keyword density is ideal at {density}%."
            ),
        }
    else:
        checks["keyword"] = {
            "label": "Keyword Density", "passed": None, "score": None,
            "recommendation": "No keyword provided. Enter a target keyword for density analysis.",
        }

    # 5 ── Word Count ──────────────────────────────────────────────────────────
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()
    wc = len(re.findall(r'\b[a-zA-Z]{2,}\b', soup.get_text(" ")))
    checks["word_count"] = {
        "label": "Word Count", "count": wc,
        "passed": wc >= WORD_MIN,
        "score": 100 if wc >= WORD_GREAT else (85 if wc >= WORD_GOOD else (65 if wc >= WORD_MIN else 30)),
        "recommendation": (
            f"Very short ({wc} words). Aim for {WORD_MIN}+ minimum." if wc < WORD_MIN
            else f"{wc} words — consider {WORD_GOOD}+ for better rankings." if wc < WORD_GOOD
            else f"Good length at {wc} words. {WORD_GREAT}+ performs best for competitive topics." if wc < WORD_GREAT
            else f"Excellent content depth at {wc} words!"
        ),
    }

    # 6 ── Links ───────────────────────────────────────────────────────────────
    base  = urlparse(source_url).netloc if source_url else ""
    links = soup2.find_all("a", href=True)
    internal = external = broken = 0
    for a in links:
        href = a["href"].strip()
        if not href or href.startswith(("javascript:", "#", "mailto:", "tel:")):
            broken += 1
        elif href.startswith(("http://", "https://", "//")):
            external += 1 if not (base and base in urlparse(href).netloc) else 0
            internal += 1 if (base and base in urlparse(href).netloc) else 0
        else:
            internal += 1
    checks["links"] = {
        "label": "Link Analysis",
        "total": len(links), "internal": internal, "external": external, "broken_anchors": broken,
        "passed": internal > 0,
        "score": 100 if (internal and external) else (80 if internal else 40),
        "recommendation": (
            "No links found. Add internal links to improve crawlability." if not links
            else "No internal links. Add links to related pages on your site." if not internal
            else f"Good link profile: {internal} internal, {external} external links."
        ),
    }

    # 7 ── Images ──────────────────────────────────────────────────────────────
    imgs     = soup2.find_all("img")
    total_i  = len(imgs)
    miss_alt = sum(1 for i in imgs if i.get("alt") is None)
    empty_alt= sum(1 for i in imgs if i.get("alt") is not None and not i.get("alt","").strip())
    checks["images"] = {
        "label": "Image Alt Text",
        "total": total_i, "missing_alt": miss_alt,
        "empty_alt": empty_alt, "with_alt": total_i - miss_alt - empty_alt,
        "passed": total_i == 0 or (miss_alt == 0 and empty_alt == 0),
        "score": 100 if total_i == 0 else max(0, round(100 - (miss_alt + empty_alt) / total_i * 100)),
        "recommendation": (
            "No images found. Add relevant images with descriptive alt text." if not total_i
            else f"All {total_i} images have proper alt text!" if not (miss_alt + empty_alt)
            else f"{miss_alt + empty_alt} of {total_i} images missing alt text. Add descriptive alt attributes."
        ),
    }

    # 8 ── Readability ─────────────────────────────────────────────────────────
    soup3 = BeautifulSoup(html, "lxml")
    for tag in soup3(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    rtext = re.sub(r'\s+', ' ', soup3.get_text(" ").strip())

    if len(rtext) > 100:
        flesch, fog, smog, avg_sent = _readability(rtext)
        level = "Easy" if flesch >= FLESCH_EASY else ("Moderate" if flesch >= FLESCH_OK else "Difficult")
        rtime = math.ceil(wc / 200)
    else:
        flesch = fog = smog = avg_sent = rtime = 0
        level = "Unknown"

    checks["readability"] = {
        "label": "Readability",
        "flesch_score": flesch, "gunning_fog": fog,
        "smog_index": smog, "level": level,
        "avg_sentence_length": avg_sent, "reading_time_minutes": rtime,
        "passed": flesch >= FLESCH_OK,
        "score": 100 if flesch >= FLESCH_EASY else (75 if flesch >= FLESCH_OK else (50 if flesch >= 30 else 25)),
        "recommendation": (
            "Not enough text to calculate readability." if level == "Unknown"
            else "Very difficult to read. Use shorter sentences and simpler vocabulary." if flesch < 30
            else "Difficult to read. Simplify sentence structure for broader audiences." if flesch < FLESCH_OK
            else "Moderately readable. Simplify where possible for better engagement." if flesch < FLESCH_EASY
            else f"Excellent readability (Flesch: {flesch}). Easy for most readers!"
        ),
    }

    # ── Overall Score ─────────────────────────────────────────────────────────
    scores  = [v["score"] for v in checks.values() if v.get("score") is not None]
    overall = round(sum(scores) / len(scores)) if scores else 0
    grade   = next(g for g, t in [("A",90),("B",80),("C",70),("D",60),("F",0)] if overall >= t)

    return {
        "url": source_url or None,
        "keyword": keyword or None,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "overall_score": overall,
        "grade": grade,
        "checks": checks,
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _plain(soup):
    for tag in soup(["script", "style"]):
        tag.decompose()
    return soup.get_text(" ")


def _score_range(present, length, lo, hi):
    if not present: return 0
    if lo <= length <= hi: return 100
    if (lo - 10) <= length < lo or hi < length <= (hi + 10): return 70
    return 45


def _rec_range(name, present, length, lo, hi):
    if not present: return f"Add a {name.lower()} — missing entirely."
    if length < lo:  return f"{name} too short ({length} chars). Aim for {lo}–{hi}."
    if length > hi:  return f"{name} too long ({length} chars). Trim to {lo}–{hi}."
    return f"{name} is optimal at {length} characters!"


def _readability(text: str):
    sentences  = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    sent_count = max(len(sentences), 1)
    words      = re.findall(r'\b[a-zA-Z]+\b', text)
    word_count = max(len(words), 1)

    def syllables(w):
        w = w.lower()
        n, prev = 0, False
        for c in w:
            v = c in "aeiouy"
            if v and not prev: n += 1
            prev = v
        return max(1, n - (1 if w.endswith('e') and n > 1 else 0))

    syls     = [syllables(w) for w in words]
    total_s  = sum(syls)
    complex_w= sum(1 for s in syls if s >= 3)

    flesch = round(max(0.0, min(100.0,
        206.835 - 1.015 * (word_count / sent_count) - 84.6 * (total_s / word_count)
    )), 1)
    fog  = round(0.4 * (word_count / sent_count + 100 * complex_w / word_count), 1)
    smog = round(3 + math.sqrt(complex_w * 30 / sent_count), 1) if sent_count >= 30 else 0.0
    avg  = round(word_count / sent_count, 1)

    return flesch, fog, smog, avg