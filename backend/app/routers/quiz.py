from fastapi import APIRouter, Depends

from app.auth import require_user
from app.models import User
from app.schemas import QuizSubmit, QuizResult, QuizQuestion
from app.quiz_questions import QUIZ_QUESTIONS, calculate_quiz_score

router = APIRouter()


@router.get("/questions", response_model=list[QuizQuestion])
async def get_quiz_questions():
    return [
        QuizQuestion(
            id=q["id"],
            question=q["question"],
            options=q["options"],
            risk_if_no=q["risk_if_no"],
        )
        for q in QUIZ_QUESTIONS
    ]


@router.post("/submit", response_model=QuizResult)
async def submit_quiz(
    submission: QuizSubmit,
    user: User = Depends(require_user),
):
    score_impact, risks, recommendations = calculate_quiz_score(submission.responses)
    return QuizResult(
        score_impact=score_impact,
        risks_identified=risks,
        recommendations=recommendations,
    )
