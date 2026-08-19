# AIVOA - Pharma Complaint Management System

A web app for logging and managing customer complaints in pharmaceutical manufacturing. Instead of manually filling out complaint forms, you paste in complaint text (emails, reports, PDFs) and an AI copilot extracts the relevant fields and populates the form for you.

Built for API (Active Pharmaceutical Ingredients) and FDF (Finished Dosage Forms) plants. Follows cGMP / FDA 21 CFR Part 211 guidelines for complaint handling.

## Live Demo & Deployment

- **Live Web App (Frontend):** [https://aivoa-pharma-qms-three.vercel.app](https://aivoa-pharma-qms-three.vercel.app)
- **Backend API Base:** [https://aivoa-pharma-qms-yiym.onrender.com](https://aivoa-pharma-qms-yiym.onrender.com)
- **Swagger API Documentation:** [https://aivoa-pharma-qms-yiym.onrender.com/docs](https://aivoa-pharma-qms-yiym.onrender.com/docs)

## What it does

- You paste complaint text or drop a PDF into the chat panel
- The AI extracts product name, batch number, customer, dates, severity, etc.
- Fields populate a structured complaint form on the left side
- You can update fields through chat commands ("change batch to X", "set severity to high")
- A complaint description summary is auto-generated from the conversation
- Risk assessment (severity, root cause, CAPA) is computed automatically
- You commit the record to a SQLite/PostgreSQL database with an audit trail

## Complaint Log (All Complaints view)

The "All Complaints" tab displays committed records from the database in a structured table format. This is a **development/demo feature** — it exposes the raw database contents so you can verify that records are being saved correctly and inspect the stored data.

In a production deployment, this view would be replaced with role-based access (QA managers, auditors) or removed entirely from the end-user interface.

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Redux Toolkit, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic v2 |
| AI/Workflow | LangGraph (state graph), Groq API (Llama 3.3 70B) |
| Database | SQLite (default), PostgreSQL via env var |
| PDF parsing | pypdf |

The Groq API key is optional. Without it, a built-in heuristic extractor handles common pharma test cases (amoxicillin, metformin, paracetamol, norfloxacin, etc.) using regex and keyword matching.

## Setup

**Prerequisites:** Python 3.10+, Node.js 18+, npm

### Backend

```bash
cd backend
pip install -r requirements.txt

# Optional: set up Groq API key
cp .env.example .env
# edit .env and add your GROQ_API_KEY

uvicorn app.main:app --reload --port 8000
```

API docs at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project structure

```
backend/
  app/
    graph/           # LangGraph state machine + extractor logic
    db/              # SQLAlchemy models + session
    schemas/         # Pydantic schemas
    services/        # Complaint + PDF services
    config.py        # Env vars and settings
    main.py          # FastAPI routes
  requirements.txt

frontend/
  src/
    components/
      LeftPanel/     # Complaint form, risk card, commit modal
      RightPanel/    # Chat panel, file drop, sample data
      Header.tsx
    store/           # Redux slice (complaintSlice)
    services/        # API client (api.ts)
    types/           # TypeScript interfaces
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Send message + current state, get extracted fields back |
| POST | `/api/upload-doc` | Upload PDF, extract text, run through pipeline |
| POST | `/api/complaints/commit` | Save complaint to database |
| GET | `/api/complaints` | List all committed complaints |

## Running tests

```bash
python backend/test_pipeline.py
```

## License

MIT
