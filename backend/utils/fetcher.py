import httpx
from fastapi import HTTPException
from urllib.parse import urlparse


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
}


async def fetch_url(url: str) -> dict:
    """Async URL fetcher using httpx with proper error handling."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Only HTTP/HTTPS URLs are supported.")

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=20.0,
            headers=HEADERS,
            limits=httpx.Limits(max_connections=5),
        ) as client:
            response = await client.get(url)

            content_type = response.headers.get("content-type", "")
            if "text/html" not in content_type and "xhtml" not in content_type:
                raise HTTPException(
                    status_code=422,
                    detail=f"URL returned non-HTML content ({content_type}). Only HTML pages can be analyzed.",
                )

            if response.status_code == 403:
                raise HTTPException(status_code=403, detail="Access denied (403). This website blocks automated requests. Try pasting the HTML directly.")
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Page not found (404).")
            if response.status_code >= 400:
                raise HTTPException(status_code=response.status_code, detail=f"Server returned error {response.status_code}.")

            return {
                "html": response.text,
                "final_url": str(response.url),
                "status_code": response.status_code,
            }

    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timed out. The URL took too long to respond.")
    except httpx.ConnectError:
        raise HTTPException(status_code=400, detail=f"Cannot connect to {parsed.netloc}. Check the URL and try again.")
    except httpx.TooManyRedirects:
        raise HTTPException(status_code=400, detail="Too many redirects. Check if the URL is correct.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch URL: {str(e)}")
