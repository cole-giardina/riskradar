import math
import hashlib
import httpx

# Character set sizes for entropy calculation
CHARSETS = {
    "lower": 26,
    "upper": 26,
    "digits": 10,
    "symbols": 33,
}


def calculate_entropy(password: str) -> float:
    """Calculate Shannon entropy bits for password."""
    if not password:
        return 0.0

    charset_size = 0
    if any(c.islower() for c in password):
        charset_size += CHARSETS["lower"]
    if any(c.isupper() for c in password):
        charset_size += CHARSETS["upper"]
    if any(c.isdigit() for c in password):
        charset_size += CHARSETS["digits"]
    if any(not c.isalnum() for c in password):
        charset_size += CHARSETS["symbols"]

    if charset_size == 0:
        charset_size = 26  # default to lowercase

    return len(password) * math.log2(charset_size)


def estimate_crack_time(entropy: float) -> tuple[float, str]:
    """
    Estimate crack time assuming 10^12 guesses/second (GPU cluster).
    Returns (seconds, human-readable string).
    """
    # 2^entropy combinations, at 1 trillion guesses/sec
    guesses_per_sec = 10**12
    combinations = 2**entropy
    seconds = combinations / guesses_per_sec

    if seconds < 1:
        return seconds, "instant"
    if seconds < 60:
        return seconds, "seconds"
    if seconds < 3600:
        return seconds, f"{int(seconds / 60)} minutes"
    if seconds < 86400:
        return seconds, f"{seconds / 3600:.1f} hours"
    if seconds < 31536000:
        return seconds, f"{seconds / 86400:.0f} days"
    if seconds < 31536000 * 100:
        return seconds, f"{seconds / 31536000:.0f} years"
    return seconds, "centuries"


def get_strength_feedback(password: str) -> list[str]:
    """Get feedback for improving password strength."""
    feedback = []
    if len(password) < 8:
        feedback.append("Use at least 8 characters")
    if len(password) < 12:
        feedback.append("Consider 12+ characters for better security")
    if not any(c.isupper() for c in password):
        feedback.append("Add uppercase letters")
    if not any(c.islower() for c in password):
        feedback.append("Add lowercase letters")
    if not any(c.isdigit() for c in password):
        feedback.append("Add numbers")
    if not any(not c.isalnum() for c in password):
        feedback.append("Add symbols (!@#$%^&*)")
    if password.isdigit():
        feedback.append("Avoid numbers only")
    if password.lower() == password or password.upper() == password:
        feedback.append("Mix character types")
    return feedback


def entropy_to_score(entropy: float) -> int:
    """Convert entropy to 0-100 strength score."""
    # 28 bits = ~1 year crack time, 40 bits = strong, 60+ = very strong
    if entropy < 20:
        return min(100, int(entropy * 3))
    if entropy < 35:
        return min(100, 60 + int((entropy - 20) * 2))
    return min(100, 90 + int((entropy - 35) / 2))


async def check_pwned_password(password: str) -> tuple[bool, int]:
    """
    Check if password is in HIBP Pwned Passwords (k-anonymity, no API key needed).
    Returns (is_pwned, exposure_count).
    """
    sha1 = hashlib.sha1(password.encode()).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"https://api.pwnedpasswords.com/range/{prefix}",
                headers={"User-Agent": "RiskRadar-SecurityScore/1.0"},
            )
            if resp.status_code != 200:
                return False, 0

            for line in resp.text.splitlines():
                parts = line.split(":")
                if len(parts) >= 2 and parts[0] == suffix:
                    return True, int(parts[1])
            return False, 0
    except Exception:
        return False, 0


async def check_password_reuse(passwords: list[str]) -> dict:
    """
    Check multiple passwords for reuse (duplicates) and pwned status.
    Returns which are pwned, which are duplicated.
    """
    seen_hashes: dict[str, list[int]] = {}  # hash -> indices
    pwned_indices: set[int] = set()
    pwned_counts: dict[int, int] = {}

    for i, pwd in enumerate(passwords):
        if not pwd or not pwd.strip():
            continue
        pwd = pwd.strip()
        h = hashlib.sha1(pwd.encode()).hexdigest().upper()
        if h not in seen_hashes:
            seen_hashes[h] = []
        seen_hashes[h].append(i)

        is_pwned, count = await check_pwned_password(pwd)
        if is_pwned:
            pwned_indices.add(i)
            pwned_counts[i] = count

    duplicates = []
    for h, indices in seen_hashes.items():
        if len(indices) > 1:
            duplicates.append(indices)

    return {
        "pwned_indices": list(pwned_indices),
        "pwned_counts": pwned_counts,
        "duplicate_groups": duplicates,
        "reuse_detected": len(duplicates) > 0,
        "any_pwned": len(pwned_indices) > 0,
    }


def analyze_password(password: str) -> dict:
    """Full local password analysis."""
    entropy = calculate_entropy(password)
    crack_seconds, crack_display = estimate_crack_time(entropy)
    feedback = get_strength_feedback(password)
    score = entropy_to_score(entropy)

    return {
        "entropy": round(entropy, 1),
        "crack_time_seconds": crack_seconds,
        "crack_time_display": crack_display,
        "strength_score": min(100, score),
        "feedback": feedback,
    }
