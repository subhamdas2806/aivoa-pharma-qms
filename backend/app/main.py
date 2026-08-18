from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.config import settings
from app.db.session import engine, Base, get_db
from app.schemas.complaint import (
    ComplaintSchema,
    ChatRequest,
    ChatResponse,
    CommitRequest,
    CommitResponse
)
from app.graph.graph import complaint_graph
from app.services.pdf_service import pdf_service
from app.services.complaint_service import complaint_service

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AIVOA AI-Powered Customer Complaint Management System Backend"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Operational",
        "llm_model": settings.GROQ_MODEL,
        "endpoints": ["/api/chat", "/api/upload-doc", "/api/complaints/commit", "/api/complaints"]
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Passes user text + current state to the LangGraph pipeline.
    Returns the incremental state updates, LLM reply, and extracted fields.
    """
    try:
        initial_state = {
            "input_text": request.message,
            "current_state": request.current_state.model_dump(),
            "conversation_history": [msg.model_dump() for msg in (request.conversation_history or [])],
            "document_name": None
        }
        
        result = complaint_graph.invoke(initial_state)
        
        updated_state_dict = result.get("updated_state", request.current_state.model_dump())
        ai_reply = result.get("ai_reply", "State updated.")
        extracted_delta = result.get("extracted_delta", {})
        
        return ChatResponse(
            reply=ai_reply,
            updated_state=ComplaintSchema(**updated_state_dict),
            extracted_fields=extracted_delta.get("form_delta", {}),
            explanation=extracted_delta.get("risk_assessment_delta", {}).get("risk_summary")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph processing error: {str(e)}")

@app.post("/api/upload-doc", response_model=ChatResponse)
async def upload_document_endpoint(
    file: UploadFile = File(...),
    current_state_json: str = Form(...)
):
    """
    Receives PDF document, parses text stream, and feeds into LangGraph pipeline.
    """
    try:
        current_state_dict = json.loads(current_state_json)
    except Exception:
        current_state_dict = {}

    file_bytes = await file.read()
    filename = file.filename or "uploaded_complaint.pdf"
    
    # Extract text from PDF
    extracted_text = pdf_service.extract_text_from_bytes(file_bytes)
    
    try:
        initial_state = {
            "input_text": f"[Uploaded Document: {filename}]\n\n{extracted_text}",
            "current_state": current_state_dict,
            "conversation_history": [],
            "document_name": filename
        }
        
        result = complaint_graph.invoke(initial_state)
        
        updated_state_dict = result.get("updated_state", current_state_dict)
        updated_state_dict["document_name"] = filename
        ai_reply = result.get("ai_reply", f"Successfully analyzed document: {filename}")
        extracted_delta = result.get("extracted_delta", {})
        
        return ChatResponse(
            reply=ai_reply,
            updated_state=ComplaintSchema(**updated_state_dict),
            extracted_fields=extracted_delta.get("form_delta", {}),
            explanation=extracted_delta.get("risk_assessment_delta", {}).get("risk_summary")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document graph processing error: {str(e)}")

@app.post("/api/complaints/commit", response_model=CommitResponse)
def commit_complaint_endpoint(request: CommitRequest, db: Session = Depends(get_db)):
    """
    Saves the final AI-reviewed complaint to the PostgreSQL/SQLite database.
    """
    try:
        db_complaint = complaint_service.commit_complaint(
            db=db,
            complaint=request.complaint,
            conversation_history=request.conversation_history or []
        )
        return CommitResponse(
            success=True,
            complaint_id=db_complaint.complaint_id,
            message=f"Complaint {db_complaint.complaint_id} successfully logged to QMS Audit Trail.",
            db_id=db_complaint.id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database commit error: {str(e)}")

@app.get("/api/complaints")
def list_complaints_endpoint(db: Session = Depends(get_db)):
    """
    List all committed QMS complaints.
    """
    complaints = complaint_service.get_all_complaints(db)
    return [
        {
            "id": c.id,
            "complaint_id": c.complaint_id,
            "status": c.status,
            "product_name": c.product_name,
            "batch_number": c.batch_number,
            "severity": c.severity,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in complaints
    ]
