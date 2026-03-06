# RiskRadar - Cyber Security Score

A web app that gives users a **Cyber Security Score (0–100)** based on their digital habits — like a credit score, but for cybersecurity.

## Features

- **Breach Scanner** - Check if your email appears in data breaches (HaveIBeenPwned API)
- **Password Strength Checker** - Local analysis with entropy score and crack time estimate
- **Security Habit Quiz** - Quick questions to assess your security practices
- **Personal Security Dashboard** - Score, weaknesses, improvement tips, historical trends

## Tech Stack

- **Frontend**: React, Tailwind CSS, Chart.js
- **Backend**: Python FastAPI
- **Database**: PostgreSQL
- **Security**: bcrypt password hashing, JWT auth, API rate limiting

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env     # Optional: add HIBP API key for breach scanning
uvicorn app.main:app --reload --port 8000
```

Uses SQLite by default (no PostgreSQL required for dev). Tables are created automatically on startup.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` to the backend. Open http://localhost:5173

### Environment Variables (optional)

Create `backend/.env`:

```
# Database (default: SQLite)
DATABASE_URL=sqlite+aiosqlite:///./riskradar.db

# JWT secret (change in production)
SECRET_KEY=your-secret-key-for-jwt

# HaveIBeenPwned API key for breach scanning ($3.50/mo)
HIBP_API_KEY=your-haveibeenpwned-api-key
```

## API Key Note

The HaveIBeenPwned API requires a subscription ($3.50/month) for breach checking. Get your key at https://haveibeenpwned.com/API/Key. Without it, breach scanning will show a message but password strength and quiz features work fully.
