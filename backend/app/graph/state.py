from typing import TypedDict, List, Dict, Any, Optional
from app.schemas.complaint import ComplaintSchema, ChatMessage

class AgentState(TypedDict):
    input_text: str
    current_state: Dict[str, Any]
    conversation_history: List[Dict[str, Any]]
    document_name: Optional[str]
    
    extracted_delta: Dict[str, Any]
    updated_state: Dict[str, Any]
    ai_reply: str
    explanation: Optional[str]
