import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = None

def get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set in environment variables.")
        _client = Groq(api_key=api_key)
    return _client


def generate_ai_suggestions(analysis: dict, content_snippet: str = "") -> dict:
    """Generate AI-powered SEO improvement suggestions using Groq LLaMA."""
    client = get_client()
    checks = analysis.get("checks", {})
    keyword = analysis.get("keyword", "")
    overall_score = analysis.get("overall_score", 0)

    # Build issues summary from failed checks
    issues = []
    for key, check in checks.items():
        if isinstance(check, dict) and check.get("score") is not None and check.get("score", 100) < 80:
            issues.append(f"- {check.get('label', key)}: {check.get('recommendation', '')}")

    title_val = checks.get("title", {}).get("value") or "Not found"
    meta_val = checks.get("meta_description", {}).get("value") or "Not found"
    h1_val = (checks.get("headings", {}).get("h1") or ["Not found"])[0]

    prompt = f"""You are a senior SEO strategist at a top digital marketing agency. Analyze the following SEO audit and provide precise, actionable improvements.

PAGE AUDIT:
- Overall SEO Score: {overall_score}/100
- Target Keyword: {keyword or "Not specified"}
- Current Title: "{title_val}"
- Current Meta Description: "{meta_val}"
- Current H1: "{h1_val}"
{f'- Content Sample: "{content_snippet[:600]}..."' if content_snippet else ""}

IDENTIFIED ISSUES:
{chr(10).join(issues) if issues else "No major issues detected."}

Provide specific improvements as JSON:
{{
  "optimized_title": "rewritten title (50-60 chars, include keyword naturally)",
  "optimized_meta": "rewritten meta description (150-160 chars, compelling CTA)",
  "optimized_h1": "improved H1 heading (keyword-rich, engaging)",
  "action_items": ["specific action 1", "specific action 2", "specific action 3"],
  "quick_win": "the single most impactful change to make right now",
  "content_gaps": "what topics or sections this content is missing"
}}

Return ONLY valid JSON, no markdown, no extra text."""

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.65,
        max_tokens=1024,
    )

    raw = completion.choices[0].message.content or "{}"
    cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "optimized_title": None,
            "optimized_meta": None,
            "optimized_h1": None,
            "action_items": ["Could not parse AI response. Please try again."],
            "quick_win": None,
            "content_gaps": None,
        }


def generate_keyword_suggestions(content_snippet: str, existing_keyword: str = "") -> dict:
    """Generate keyword suggestions using Groq LLaMA 3.1 8B (fast)."""
    client = get_client()

    prompt = f"""You are an expert SEO keyword researcher. Analyze this content and suggest the most valuable keywords to target.

{f'Current target keyword: "{existing_keyword}"' if existing_keyword else ""}

Content:
"{content_snippet[:800]}"

Suggest keywords in JSON format:
{{
  "primary": ["3 high-intent primary keywords"],
  "long_tail": ["3 specific long-tail keyword phrases"],
  "semantic": ["2 semantically related keywords"],
  "questions": ["2 question-based keywords people search"]
}}

Return ONLY valid JSON."""

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
        max_tokens=512,
    )

    raw = completion.choices[0].message.content or "{}"
    cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"primary": [], "long_tail": [], "semantic": [], "questions": []}
