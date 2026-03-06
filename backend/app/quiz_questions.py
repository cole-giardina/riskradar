"""Security habit quiz questions and scoring logic."""

QUIZ_QUESTIONS = [
    {
        "id": "password_manager",
        "question": "Do you use a password manager?",
        "options": ["Yes", "No"],
        "risk_if_no": "Password reuse and weak passwords",
        "points_if_yes": 15,
    },
    {
        "id": "mfa",
        "question": "Do you enable MFA/2FA on important accounts (email, banking)?",
        "options": ["Yes", "No"],
        "risk_if_no": "No MFA on critical accounts",
        "points_if_yes": 20,
    },
    {
        "id": "unique_passwords",
        "question": "Do you use unique passwords for each account?",
        "options": ["Yes", "No"],
        "risk_if_no": "Password reused across sites",
        "points_if_yes": 15,
    },
    {
        "id": "public_wifi",
        "question": "Do you avoid sensitive activities on public WiFi (or use VPN)?",
        "options": ["Yes", "No"],
        "risk_if_no": "Vulnerable on public networks",
        "points_if_yes": 10,
    },
    {
        "id": "software_updates",
        "question": "Do you keep software and devices updated?",
        "options": ["Yes", "No"],
        "risk_if_no": "Outdated software vulnerabilities",
        "points_if_yes": 10,
    },
    {
        "id": "phishing_awareness",
        "question": "Do you verify links/emails before clicking?",
        "options": ["Yes", "No"],
        "risk_if_no": "Phishing risk",
        "points_if_yes": 10,
    },
    {
        "id": "backup",
        "question": "Do you back up important data regularly?",
        "options": ["Yes", "No"],
        "risk_if_no": "Data loss risk",
        "points_if_yes": 10,
    },
    {
        "id": "sensitive_sharing",
        "question": "Do you avoid sharing passwords or sensitive data via email/chat?",
        "options": ["Yes", "No"],
        "risk_if_no": "Insecure data sharing",
        "points_if_yes": 10,
    },
]


def calculate_quiz_score(responses: dict[str, str]) -> tuple[int, list[str], list[str]]:
    """
    Returns (score_impact, risks_identified, recommendations).
    Score impact is 0-100 added to base. Risks are what we found. Recommendations are actions.
    """
    risks = []
    recommendations = []
    score = 0

    for q in QUIZ_QUESTIONS:
        qid = q["id"]
        answer = responses.get(qid, "No")
        if answer == "Yes":
            score += q["points_if_yes"]
        else:
            risks.append(q["risk_if_no"])
            # Add corresponding recommendation
            rec = get_recommendation(qid)
            if rec and rec not in recommendations:
                recommendations.append(rec)

    return (min(100, score), risks, recommendations)


def get_recommendation(question_id: str) -> str | None:
    recs = {
        "password_manager": "Use a password manager (e.g. 1Password, Bitwarden)",
        "mfa": "Enable MFA on email and financial accounts",
        "unique_passwords": "Use unique passwords for each account",
        "public_wifi": "Use VPN or avoid sensitive tasks on public WiFi",
        "software_updates": "Enable automatic updates on devices",
        "phishing_awareness": "Verify sender and URLs before clicking",
        "backup": "Set up automated backups (3-2-1 rule)",
        "sensitive_sharing": "Use secure sharing methods, never email passwords",
    }
    return recs.get(question_id)
