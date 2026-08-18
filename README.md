# AIVOA Pharma QMS - AI-Powered Customer Complaint Management System

A full-stack pharmaceutical Quality Management System (QMS) designed for API (Active Pharmaceutical Ingredients) and FDF (Finished Dosage Forms) manufacturing plants. Built in accordance with cGMP and FDA 21 CFR Part 211 guidelines for customer complaint handling, deviation tracking, and risk assessment.

---

## Overview

In regulated pharmaceutical manufacturing, manual complaint intake is error-prone, slow, and inconsistent. This system replaces manual form filling with an AI-driven workflow that extracts batch details, product specifications, complaint narratives, and compliance parameters directly from incoming correspondence (emails, field reports, pharmacy returns, or uploaded PDF documents).

The interface is structured into two synchronized panels:
1. **Left Panel (Log Customer Complaint Form)**: Displays structured fields populated dynamically by the AI. Inputs are read-only to ensure all changes go through validated extraction and review before committing to the QMS database.
2. **Right Panel (AIVOA Copilot)**: An interactive assistant powered by a LangGraph state graph. Handles conversational inputs, batch updates, file uploads, and continuous GMP risk scoring.

---

## Key Features

- **Automated Parameter Extraction**: Identifies product name, strength/grade, batch/lot numbers, manufacturing and expiry dates, affected quantity, and complainant details.
- **Incremental State Updates**: Employs LangGraph to merge new observations into the form without clearing existing verified fields.
- **GMP Risk Assessment**: Evaluates defect severity (Low, Medium, High), computes potential clinical hazard, suggests immediate containment actions (such as batch quarantine or retain sample testing), and proposes root cause hypotheses and CAPA recommendations.
- **Native PDF Parsing**: Extracts text from batch inspection sheets and field complaint PDFs using lightweight stream readers without requiring external OCR dependencies.
- **Audit Trail & Database Commit**: Commits verified complaint records, risk assessments, and the complete conversational history snapshot to the database.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Redux Toolkit, Tailwind CSS, Lucide Icons, Inter typography
- **Backend**: Python, FastAPI, SQLAlchemy ORM, Pydantic V2
- **AI / Workflow Engine**: LangGraph (`StateGraph`), Groq API (`gemma2-9b-it` / `llama-3.3-70b-versatile`) with heuristic extraction fallback
- **Database**: SQLite (default zero-config) / PostgreSQL support via `DATABASE_URL`
- **PDF Text Parsing**: `pypdf`

---

## Project Structure

```
AIVOA/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   │   ├── models.py             # SQLAlchemy Complaint model
│   │   │   └── session.py            # Database engine and session factory
│   │   ├── graph/
│   │   │   ├── extractor.py          # Groq LLM & heuristic extraction logic
│   │   │   ├── graph.py              # LangGraph state machine definition
│   │   │   └── state.py              # AgentState schema
│   │   ├── schemas/
│   │   │   └── complaint.py          # Pydantic schemas (Form, Risk, Chat)
│   │   ├── services/
│   │   │   ├── complaint_service.py  # Database transaction service
│   │   │   └── pdf_service.py        # PDF text extraction service
│   │   ├── config.py                 # Application configuration & environment vars
│   │   └── main.py                   # FastAPI REST API endpoints
│   ├── requirements.txt
│   └── test_pipeline.py              # Pipeline test script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LeftPanel/
│   │   │   │   ├── ComplaintForm.tsx
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── FormSection.tsx
│   │   │   │   ├── RiskAssessmentCard.tsx
│   │   │   │   └── CommitModal.tsx
│   │   │   ├── RightPanel/
│   │   │   │   ├── CopilotChat.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── FileDropZone.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── PdfPreviewCard.tsx
│   │   │   │   └── SampleDataSelector.tsx
│   │   │   └── Header.tsx
│   │   ├── store/
│   │   │   ├── complaintSlice.ts     # Redux slice with MERGE_FORM_STATE reducer
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── complaint.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## Data Schema

The data exchanged between the backend graph and frontend store adheres to the following structure:

```json
{
  "complaint_id": "CMP-2026-0081",
  "status": "Ready to Commit",
  "form": {
    "complaint_source": "Pharmacy / Retail Dispenser",
    "customer_name": "Apollo Pharmacy Ltd.",
    "product_name": "Amoxicillin Capsules",
    "product_strength": "500 mg, IP/BP",
    "batch_number": "AMX240602",
    "affected_quantity": "12 capsules",
    "manufacturing_date": "March 2026",
    "expiry_date": "February 2028",
    "complaint_details": "Customer reported localized dark discoloration on gelatin shell."
  },
  "risk_assessment": {
    "severity": "High",
    "risk_summary": "Critical physical/chemical quality deviation posing potential patient risk.",
    "suggested_action": "Immediate batch quarantine and retain sample visual testing.",
    "root_cause_recommendation": "Blister sealing machine temperature fluctuation allowing ambient moisture ingress.",
    "capa_recommendation": "Calibrate and validate blister line sealing temperature controllers."
  }
}
```

---

## Installation and Setup

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm
- (Optional) Groq API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. (Optional) Set up your Groq API key:
   ```bash
   cp .env.example .env
   # Edit .env and set GROQ_API_KEY=your_key_here
   ```
   *Note: If no API key is provided, the backend automatically uses its built-in rule-based extractor to process common pharma test cases.*
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be accessible at `http://localhost:8000`. Swagger documentation is available at `http://localhost:8000/docs`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## Testing

To run the backend LangGraph extraction and state-merging test:

```bash
python backend/test_pipeline.py
```

To run a production frontend build:

```bash
cd frontend
npm run build
```

---

## License

This project is licensed under the MIT License.
