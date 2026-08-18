from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class FormState(BaseModel):
    complaint_source: Optional[str] = Field(default="", description="Origin channel e.g., Pharmacy, Email, Field Report, Hospital QA")
    customer_name: Optional[str] = Field(default="", description="Customer or institution name e.g., Apollo Pharmacy, ABC Formulations Ltd.")
    product_name: Optional[str] = Field(default="", description="Product brand/chemical name e.g., Amoxicillin Capsules, Metformin Hydrochloride API")
    product_strength: Optional[str] = Field(default="", description="Strength or grade e.g., 500 mg, IP/BP, USP Grade")
    batch_number: Optional[str] = Field(default="", description="Batch / Lot number e.g., AMX240602, MFH260712A")
    affected_quantity: Optional[str] = Field(default="", description="Quantity reported e.g., 12 capsules, 25 kg (1 HDPE Drum)")
    manufacturing_date: Optional[str] = Field(default="", description="Date of manufacturing e.g., March 2026, 03/2026")
    expiry_date: Optional[str] = Field(default="", description="Date of expiry e.g., February 2028, Not Provided")
    complaint_details: Optional[str] = Field(default="", description="Detailed narrative of the complaint / defect observation")

class RiskAssessment(BaseModel):
    severity: Literal["Low", "Medium", "High"] = Field(default="Medium", description="Assigned severity rating based on patient risk & GMP impact")
    risk_summary: Optional[str] = Field(default="", description="Concise analysis of potential clinical or regulatory risk")
    suggested_action: Optional[str] = Field(default="", description="Immediate containment action e.g., quarantine batch, retain sample testing")
    root_cause_recommendation: Optional[str] = Field(default="", description="Suspected root cause e.g., blister sealing integrity failure, humidity control in granulation")
    capa_recommendation: Optional[str] = Field(default="", description="Corrective and Preventive Action plan")

class ComplaintSchema(BaseModel):
    complaint_id: str = Field(default="CMP-2026-0081")
    status: str = Field(default="Ready to Commit")
    form: FormState = Field(default_factory=FormState)
    risk_assessment: RiskAssessment = Field(default_factory=RiskAssessment)
    document_name: Optional[str] = None

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: Optional[str] = None
    document_name: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    current_state: ComplaintSchema
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    updated_state: ComplaintSchema
    extracted_fields: Dict[str, Any] = {}
    explanation: Optional[str] = None

class CommitRequest(BaseModel):
    complaint: ComplaintSchema
    conversation_history: Optional[List[ChatMessage]] = []

class CommitResponse(BaseModel):
    success: bool
    complaint_id: str
    message: str
    db_id: int
