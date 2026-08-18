import json
from typing import Dict, Any, List
from app.db.models import Complaint
from app.schemas.complaint import ComplaintSchema, FormState, RiskAssessment, ChatMessage
from sqlalchemy.orm import Session

class ComplaintService:
    @staticmethod
    def commit_complaint(db: Session, complaint: ComplaintSchema, conversation_history: List[ChatMessage] = []) -> Complaint:
        raw_transcript = [msg.dict() for msg in conversation_history]
        
        # Check if already exists, update or create
        existing = db.query(Complaint).filter(Complaint.complaint_id == complaint.complaint_id).first()
        
        if existing:
            existing.status = "Committed to QMS"
            existing.complaint_source = complaint.form.complaint_source
            existing.customer_name = complaint.form.customer_name
            existing.product_name = complaint.form.product_name
            existing.product_strength = complaint.form.product_strength
            existing.batch_number = complaint.form.batch_number
            existing.affected_quantity = complaint.form.affected_quantity
            existing.manufacturing_date = complaint.form.manufacturing_date
            existing.expiry_date = complaint.form.expiry_date
            existing.complaint_details = complaint.form.complaint_details
            
            existing.severity = complaint.risk_assessment.severity
            existing.risk_summary = complaint.risk_assessment.risk_summary
            existing.suggested_action = complaint.risk_assessment.suggested_action
            existing.root_cause_recommendation = complaint.risk_assessment.root_cause_recommendation
            existing.capa_recommendation = complaint.risk_assessment.capa_recommendation
            existing.raw_transcript = raw_transcript
            existing.document_name = complaint.document_name
            db.commit()
            db.refresh(existing)
            return existing
        else:
            new_complaint = Complaint(
                complaint_id=complaint.complaint_id,
                status="Committed to QMS",
                complaint_source=complaint.form.complaint_source,
                customer_name=complaint.form.customer_name,
                product_name=complaint.form.product_name,
                product_strength=complaint.form.product_strength,
                batch_number=complaint.form.batch_number,
                affected_quantity=complaint.form.affected_quantity,
                manufacturing_date=complaint.form.manufacturing_date,
                expiry_date=complaint.form.expiry_date,
                complaint_details=complaint.form.complaint_details,
                severity=complaint.risk_assessment.severity,
                risk_summary=complaint.risk_assessment.risk_summary,
                suggested_action=complaint.risk_assessment.suggested_action,
                root_cause_recommendation=complaint.risk_assessment.root_cause_recommendation,
                capa_recommendation=complaint.risk_assessment.capa_recommendation,
                raw_transcript=raw_transcript,
                document_name=complaint.document_name
            )
            db.add(new_complaint)
            db.commit()
            db.refresh(new_complaint)
            return new_complaint

    @staticmethod
    def get_all_complaints(db: Session) -> List[Complaint]:
        return db.query(Complaint).order_by(Complaint.created_at.desc()).all()

    @staticmethod
    def get_complaint(db: Session, complaint_id: str) -> Complaint:
        return db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()

complaint_service = ComplaintService()
