from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=True)
    totp_secret = Column(String(255), nullable=True)
    totp_enabled = Column(Integer, default=0)  # 0=off, 1=enabled
    public_username = Column(String(50), unique=True, nullable=True, index=True)
    public_profile_enabled = Column(Integer, default=0)
    last_scan_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    security_scores = relationship("SecurityScore", back_populates="user")
    quiz_responses = relationship("QuizResponse", back_populates="user")
    reminders = relationship("UserReminder", back_populates="user")


class SecurityScore(Base):
    __tablename__ = "security_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)  # 0-100
    breach_count = Column(Integer, default=0)
    password_strength = Column(Float, nullable=True)  # entropy or strength score
    risks = Column(JSON, default=list)  # ["Password reused", "No MFA", etc.]
    recommendations = Column(JSON, default=list)  # ["Enable MFA", "Use password manager", etc.]
    quiz_data = Column(JSON, default=dict)  # Store quiz answers for reference
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="security_scores")


class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    responses = Column(JSON, nullable=False)  # {question_id: answer}
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_responses")


class UserReminder(Base):
    __tablename__ = "user_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reminder_type = Column(String(50), nullable=False)  # breach_check, password_rotate
    due_date = Column(DateTime, nullable=False)
    enabled = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reminders")
