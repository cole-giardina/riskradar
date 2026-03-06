"""Paste/dark web monitoring - check if email appears in pastes."""
import httpx
from urllib.parse import quote
from app.config import settings

HIBP_BASE = "https://haveibeenpwned.com/api/v3"
XON_BASE = "https://api.xposedornot.com/v1"
USER_AGENT = "RiskRadar-SecurityScore/1.0"


async def check_pastes_hibp(email: str) -> dict:
    """Check pastes via HIBP (requires API key)."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{HIBP_BASE}/pasteaccount/{quote(email)}",
                headers={
                    "hibp-api-key": settings.hibp_api_key,
                    "User-Agent": USER_AGENT,
                },
            )
            if resp.status_code == 404:
                return {"found": False, "paste_count": 0, "pastes": [], "message": "No pastes found"}
            if resp.status_code != 200:
                return {"found": False, "paste_count": 0, "pastes": [], "message": f"API error: {resp.status_code}"}
            data = resp.json()
            pastes = data if isinstance(data, list) else [data]
            return {
                "found": len(pastes) > 0,
                "paste_count": len(pastes),
                "pastes": [{"source": p.get("Source", "Unknown"), "id": p.get("Id", "")} for p in pastes],
                "message": f"Found in {len(pastes)} paste(s)" if pastes else "No pastes found",
            }
    except httpx.RequestError as e:
        return {"found": False, "paste_count": 0, "pastes": [], "message": f"Request failed: {str(e)}"}


async def check_pastes_xposedornot(email: str) -> dict:
    """Check pastes via XposedOrNot breach-analytics (free, has PastesSummary)."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{XON_BASE}/breach-analytics",
                params={"email": email},
                headers={"User-Agent": USER_AGENT},
            )
            if resp.status_code != 200:
                return {"found": False, "paste_count": 0, "pastes": [], "message": f"API error: {resp.status_code}"}
            data = resp.json()
            pastes_summary = data.get("PastesSummary", {})
            paste_count = pastes_summary.get("count", 0) or 0
            if isinstance(paste_count, list):
                paste_count = paste_count[0] if paste_count else 0
            exposed = data.get("ExposedPastes", [])
            paste_list = []
            if isinstance(exposed, list):
                for p in exposed[:20]:  # Limit to 20
                    if isinstance(p, dict):
                        paste_list.append({"source": p.get("title", p.get("source", "Unknown")), "id": str(p.get("id", ""))})
                    elif isinstance(p, str):
                        paste_list.append({"source": p, "id": ""})
            return {
                "found": paste_count > 0,
                "paste_count": paste_count,
                "pastes": paste_list if paste_list else [{"source": "Paste sites", "id": ""}] * min(1, paste_count),
                "message": f"Found in {paste_count} paste(s)" if paste_count else "No pastes found",
            }
    except httpx.RequestError as e:
        return {"found": False, "paste_count": 0, "pastes": [], "message": f"Request failed: {str(e)}"}


async def check_pastes(email: str) -> dict:
    """Check if email appears in pastes. Uses HIBP if key set, else XposedOrNot."""
    if settings.hibp_api_key:
        return await check_pastes_hibp(email)
    return await check_pastes_xposedornot(email)
