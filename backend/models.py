from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class InputMode(str, Enum):
    url = "url"
    html = "html"
    text = "text"


class AnalyzeRequest(BaseModel):
    url: Optional[str] = None
    html: Optional[str] = None
    text: Optional[str] = None
    keyword: Optional[str] = ""
    include_ai: Optional[bool] = False

    @field_validator("url")
    @classmethod
    def validate_url(cls, v):
        if v and not v.startswith(("http://", "https://")):
            v = "https://" + v
        return v


class CompareRequest(BaseModel):
    url1: Optional[str] = None
    url2: Optional[str] = None
    html1: Optional[str] = None
    html2: Optional[str] = None
    keyword: Optional[str] = ""

    @field_validator("url1", "url2")
    @classmethod
    def validate_urls(cls, v):
        if v and not v.startswith(("http://", "https://")):
            v = "https://" + v
        return v


class AISuggestionsRequest(BaseModel):
    analysis: Dict[str, Any]
    content_snippet: Optional[str] = ""


class KeywordRequest(BaseModel):
    content_snippet: str
    keyword: Optional[str] = ""


class CheckResult(BaseModel):
    label: str
    score: Optional[float] = None
    passed: Optional[bool] = None
    recommendation: str
    details: Optional[Dict[str, Any]] = None


class AnalysisResponse(BaseModel):
    url: Optional[str] = None
    keyword: Optional[str] = None
    analyzed_at: str
    overall_score: int
    grade: str
    checks: Dict[str, Any]
    ai_suggestions: Optional[Dict[str, Any]] = None
    keyword_suggestions: Optional[Dict[str, Any]] = None
