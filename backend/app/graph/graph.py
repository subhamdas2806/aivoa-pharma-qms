from typing import Dict, Any
from langgraph.graph import StateGraph, END
from app.graph.state import AgentState
from app.graph.extractor import llm_extractor

def extract_information_node(state: AgentState) -> Dict[str, Any]:
    input_text = state["input_text"]
    current_state = state["current_state"]
    doc_name = state.get("document_name")
    conversation_history = state.get("conversation_history", [])
    
    extracted, ai_reply = llm_extractor.extract(input_text, current_state, doc_name, conversation_history)
    return {
        "extracted_delta": extracted,
        "ai_reply": ai_reply
    }

def update_qms_state_node(state: AgentState) -> Dict[str, Any]:
    current_state = state["current_state"].copy()
    delta = state.get("extracted_delta", {})
    
    form_delta = delta.get("form_delta") or {}
    risk_delta = delta.get("risk_assessment_delta") or {}
    
    # Merge form fields smoothly without overwriting valid data with nulls
    if "form" not in current_state or not isinstance(current_state["form"], dict):
        current_state["form"] = {}
        
    for k, v in form_delta.items():
        if v is not None and v != "":
            current_state["form"][k] = v
            
    # Merge risk assessment
    if "risk_assessment" not in current_state or not isinstance(current_state["risk_assessment"], dict):
        current_state["risk_assessment"] = {}
        
    for k, v in risk_delta.items():
        if v is not None and v != "":
            current_state["risk_assessment"][k] = v
            
    if state.get("document_name"):
        current_state["document_name"] = state["document_name"]
        
    current_state["status"] = "Ready to Commit"
    
    return {
        "updated_state": current_state
    }

# Build LangGraph StateGraph
workflow = StateGraph(AgentState)
workflow.add_node("extract_information", extract_information_node)
workflow.add_node("update_qms_state", update_qms_state_node)

workflow.set_entry_point("extract_information")
workflow.add_edge("extract_information", "update_qms_state")
workflow.add_edge("update_qms_state", END)

complaint_graph = workflow.compile()
