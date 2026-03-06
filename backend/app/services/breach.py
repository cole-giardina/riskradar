import httpx
from urllib.parse import quote
from app.config import settings

HIBP_BASE = "https://haveibeenpwned.com/api/v3"
XON_BASE = "https://api.xposedornot.com/v1"
USER_AGENT = "RiskRadar-SecurityScore/1.0"


async def _check_xposedornot(email: str) -> dict:
    """Free breach check via XposedOrNot (no API key, 1 req/sec limit)."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{XON_BASE}/check-email/{quote(email)}",
                headers={"User-Agent": USER_AGENT},
            )
            if resp.status_code == 200:
                data = resp.json()
                if "Error" in data and data["Error"] == "Not found":
                    return {"found": False, "breach_count": 0, "breaches": [], "message": "No breaches found"}
                breaches_raw = data.get("breaches", [])
                # Response format: {"breaches": [["Tesco", "KiwiFarms", ...]]}
                names = breaches_raw[0] if breaches_raw and isinstance(breaches_raw[0], list) else breaches_raw
                breach_list = [{"name": n} for n in names] if isinstance(names, list) else []
                return {
                    "found": len(breach_list) > 0,
                    "breach_count": len(breach_list),
                    "breaches": breach_list,
                    "message": f"Found in {len(breach_list)} breach(es)" if breach_list else "No breaches found",
                }
            return {"found": False, "breach_count": 0, "breaches": [], "message": f"API error: {resp.status_code}"}
    except httpx.RequestError as e:
        return {"found": False, "breach_count": 0, "breaches": [], "message": f"Request failed: {str(e)}"}


async def check_breach(email: str) -> dict:
    """Check if email appears in breach databases. Uses HIBP if key configured, else free XposedOrNot."""
    if settings.hibp_api_key:
        # Use HaveIBeenPwned (paid, more comprehensive)
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{HIBP_BASE}/breachedaccount/{quote(email)}",
                    headers={
                        "hibp-api-key": settings.hibp_api_key,
                        "User-Agent": USER_AGENT,
                    },
                )

                if resp.status_code == 404:
                    return {"found": False, "breach_count": 0, "breaches": [], "message": "No breaches found"}

                if resp.status_code == 401:
                    return {
                        "found": False,
                        "breach_count": 0,
                        "breaches": [],
                        "message": "Invalid API key",
                    }

                if resp.status_code == 429:
                    return {
                        "found": False,
                        "breach_count": 0,
                        "breaches": [],
                        "message": "Rate limit exceeded. Try again later.",
                    }

                if resp.status_code == 200:
                    data = resp.json()
                    breaches = data if isinstance(data, list) else [data]
                    return {
                        "found": True,
                        "breach_count": len(breaches),
                        "breaches": [{"name": b.get("Name", "Unknown")} for b in breaches],
                        "message": f"Found in {len(breaches)} breach(es)",
                    }

                return {
                    "found": False,
                    "breach_count": 0,
                    "breaches": [],
                    "message": f"API error: {resp.status_code}",
                }
        except httpx.RequestError as e:
            return {
                "found": False,
                "breach_count": 0,
                "breaches": [],
                "message": f"Request failed: {str(e)}",
            }

    # No HIBP key: use free XposedOrNot (1 req/sec limit)
    return await _check_xposedornot(email)
