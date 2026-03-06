from datetime import datetime
from pydantic import BaseModel, EmailStr


# Auth
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str | None
    created_at: datetime
    totp_enabled: bool = False
    public_username: str | None = None
    public_profile_enabled: bool = False
    last_scan_at: datetime | None = None

    class Config:
        from_attributes = True


# Breach
class BreachCheckRequest(BaseModel):
    email: str


class BreachResult(BaseModel):
    found: bool
    breach_count: int
    breaches: list[dict]
    message: str


# Password
class PasswordCheckRequest(BaseModel):
    password: str


class PasswordStrengthResult(BaseModel):
    entropy: float
    crack_time_display: str
    crack_time_seconds: float
    strength_score: int  # 0-100
    feedback: list[str]
    is_pwned: bool | None = None
    pwned_count: int = 0  # Times seen in breaches


class PasswordReuseRequest(BaseModel):
    passwords: list[str]


class PasswordReuseResult(BaseModel):
    pwned_indices: list[int]
    pwned_counts: dict[int, int]
    duplicate_groups: list[list[int]]
    reuse_detected: bool
    any_pwned: bool


# Quiz
class QuizQuestion(BaseModel):
    id: str
    question: str
    options: list[str]
    risk_if_no: str  # What risk this represents if answered "no"


class QuizSubmit(BaseModel):
    responses: dict[str, str]  # question_id -> answer


class QuizResult(BaseModel):
    score_impact: int
    risks_identified: list[str]
    recommendations: list[str]


# Dashboard
class SecurityScoreResponse(BaseModel):
    id: int
    score: int
    breach_count: int
    password_strength: float | None
    risks: list[str]
    recommendations: list[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    current_score: SecurityScoreResponse | None
    score_history: list[dict]
    risks: list[str]
    recommendations: list[str]
    percentile: int | None = None  # Top X% (e.g. 75 = top 25%)
    industry_average: int = 58


# Fix forward ref
Token.model_rebuild()
