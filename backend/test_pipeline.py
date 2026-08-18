import sys
import os

# Set python path to backend root
sys.path.insert(0, os.path.abspath("backend"))

from app.graph.graph import complaint_graph
from app.schemas.complaint import ComplaintSchema

def test_extraction_and_flow():
    print("Testing LangGraph complaint workflow...")
    
    sample_text = "Customer: Apollo Pharmacy reported that in Batch AMX240602 of Amoxicillin Capsules 500 mg (Mfg: March 2026, Exp: February 2028), 12 capsules showed dark black spot discoloration on the gelatin shell upon opening the blister pack."
    
    initial_complaint = ComplaintSchema()
    
    state = {
        "input_text": sample_text,
        "current_state": initial_complaint.model_dump(),
        "conversation_history": [],
        "document_name": None
    }
    
    result = complaint_graph.invoke(state)
    
    updated = result.get("updated_state", {})
    form = updated.get("form", {})
    risk = updated.get("risk_assessment", {})
    
    print("\n--- Extracted Form State ---")
    print(f"Product Name:       {form.get('product_name')}")
    print(f"Product Strength:   {form.get('product_strength')}")
    print(f"Batch Number:       {form.get('batch_number')}")
    print(f"Customer Name:      {form.get('customer_name')}")
    print(f"Complaint Source:   {form.get('complaint_source')}")
    print(f"Affected Quantity:  {form.get('affected_quantity')}")
    print(f"Manufacturing Date: {form.get('manufacturing_date')}")
    print(f"Expiry Date:        {form.get('expiry_date')}")
    
    print("\n--- Risk Assessment ---")
    print(f"Severity:           {risk.get('severity')}")
    print(f"Risk Summary:       {risk.get('risk_summary')}")
    print(f"Suggested Action:   {risk.get('suggested_action')}")
    print(f"Root Cause:         {risk.get('root_cause_recommendation')}")
    print(f"CAPA Plan:          {risk.get('capa_recommendation')}")
    
    print(f"\nAI Reply:\n{result.get('ai_reply')}")
    
    assert form.get("product_name") is not None, "Product Name should be populated"
    assert form.get("batch_number") is not None, "Batch Number should be populated"
    assert risk.get("severity") in ["Low", "Medium", "High"], "Severity should be valid"
    print("\n[SUCCESS] LangGraph pipeline test passed successfully!")

if __name__ == "__main__":
    test_extraction_and_flow()
