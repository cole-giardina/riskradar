from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.rate_limit import limiter
from app.routers import breach, password, quiz, dashboard, paste, domain, tips, public, phishing
from app.database import engine
from app.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="RiskRadar API",
    description="Cyber Security Score - Like a credit score for cybersecurity",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(breach.router, prefix="/api/breach", tags=["breach"])
app.include_router(paste.router, prefix="/api/paste", tags=["paste"])
app.include_router(domain.router, prefix="/api/domain", tags=["domain"])
app.include_router(password.router, prefix="/api/password", tags=["password"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(tips.router, prefix="/api/tips", tags=["tips"])
app.include_router(public.router, prefix="/api/public", tags=["public"])
app.include_router(phishing.router, prefix="/api/phishing", tags=["phishing"])


@app.get("/")
def root():
    return {"message": "RiskRadar API", "docs": "/docs"}
