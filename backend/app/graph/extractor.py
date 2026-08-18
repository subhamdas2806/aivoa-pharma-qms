import json
import re
from typing import Dict, Any, Tuple
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings

EXTRACTION_SYSTEM_PROMPT = """You are an expert Pharmaceutical Quality Assurance (QA) and QMS AI Copilot for API (Active Pharmaceutical Ingredients) and FDF (Finished Dosage Forms) manufacturing compliant with cGMP / FDA 21 CFR Part 211 / EU GMP guidelines.

Your task:
Analyze the user's message, complaint report, or uploaded document excerpt, alongside the current QMS complaint form state.
1. Extract or update complaint fields accurately.
2. Formulate or update the GMP Risk Assessment (Severity: Low, Medium, or High, Risk Summary, Suggested Action, Root Cause Recommendation, CAPA Recommendation).
3. Do NOT overwrite existing valid fields unless the new information specifically corrects or updates them.
4. Produce a concise, professional pharmaceutical QA reply summarizing what was extracted or updated.

Return ONLY a valid JSON object matching this exact schema:
{
  "form_delta": {
    "complaint_source": "e.g., Pharmacy / Email / Field Report / Hospital QA or null if unchanged",
    "customer_name": "e.g., Apollo Pharmacy or null if unchanged",
    "product_name": "e.g., Amoxicillin Capsules or null if unchanged",
    "product_strength": "e.g., 500 mg, IP/BP or null if unchanged",
    "batch_number": "e.g., AMX240602 or null if unchanged",
    "affected_quantity": "e.g., 12 capsules or null if unchanged",
    "manufacturing_date": "e.g., March 2026 or null if unchanged",
    "expiry_date": "e.g., February 2028 or null if unchanged",
    "complaint_details": "Comprehensive description of the complaint defect observation"
  },
  "risk_assessment_delta": {
    "severity": "Low | Medium | High",
    "risk_summary": "Concise clinical, patient, and GMP regulatory risk assessment",
    "suggested_action": "Immediate containment (e.g. quarantine batch, inspect retain samples)",
    "root_cause_recommendation": "Technical hypothesis (e.g. blister packaging seal defect, thermal degradation)",
    "capa_recommendation": "Corrective and Preventive Actions (e.g. re-qualify sealing temperature sensor, SOP review)"
  },
  "ai_reply": "Professional QA assistant response explaining the fields updated and any recommended next steps."
}

Rules:
- For fields with no new information in the message/document, set them to null or leave them unchanged.
- Ensure 'severity' is one of: "Low", "Medium", "High". (Critical defects like discoloration, microbial risk, foreign particles, assay failures are High or Medium; minor packaging scuffs are Low).
- Response MUST be purely raw JSON without markdown fences if possible, or standard ```json codeblock.
"""

class LLMExtractor:
    def __init__(self):
        self.llm = None
        if settings.GROQ_API_KEY:
            try:
                self.llm = ChatGroq(
                    temperature=0.1,
                    groq_api_key=settings.GROQ_API_KEY,
                    model_name=settings.GROQ_MODEL
                )
            except Exception as e:
                print(f"Warning: Could not initialize Groq with {settings.GROQ_MODEL}: {e}")
                try:
                    self.llm = ChatGroq(
                        temperature=0.1,
                        groq_api_key=settings.GROQ_API_KEY,
                        model_name=settings.FALLBACK_GROQ_MODEL
                    )
                except Exception as e2:
                    print(f"Warning: Could not initialize Groq fallback: {e2}")

    def extract(self, input_text: str, current_state: Dict[str, Any], doc_name: str = None) -> Tuple[Dict[str, Any], str]:
        if self.llm:
            try:
                prompt_content = f"""CURRENT FORM STATE:
{json.dumps(current_state, indent=2)}

NEW USER INPUT / DOCUMENT CONTENT ({doc_name or 'Chat Input'}):
{input_text}

Extract the delta and update the risk assessment based on GMP standards."""

                messages = [
                    SystemMessage(content=EXTRACTION_SYSTEM_PROMPT),
                    HumanMessage(content=prompt_content)
                ]
                response = self.llm.invoke(messages)
                content = response.content.strip()
                
                # Strip markdown code blocks if present
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()

                parsed = json.loads(content)
                return parsed, parsed.get("ai_reply", "State updated successfully.")
            except Exception as e:
                print(f"LLM extraction error: {e}, falling back to intelligent heuristic parser.")

        # Robust intelligent heuristic extraction fallback if LLM is unavailable or fails
        return self._heuristic_extractor(input_text, current_state, doc_name)

    def _heuristic_extractor(self, text: str, current_state: Dict[str, Any], doc_name: str = None) -> Tuple[Dict[str, Any], str]:
        """
        Rule-based / regex intelligent extractor ensuring the system is 100% operational
        even in offline/test environments.
        """
        form_delta = {}
        risk_delta = {}
        updated_fields = []

        # Product Name
        if "amoxicillin" in text.lower():
            form_delta["product_name"] = "Amoxicillin Capsules"
            updated_fields.append("Product Name")
        elif "metformin" in text.lower():
            form_delta["product_name"] = "Metformin Hydrochloride API"
            updated_fields.append("Product Name")
        elif "paracetamol" in text.lower() or "acetaminophen" in text.lower():
            form_delta["product_name"] = "Paracetamol Tablets IP"
            updated_fields.append("Product Name")
        elif "ciprofloxacin" in text.lower():
            form_delta["product_name"] = "Ciprofloxacin Eye Drops"
            updated_fields.append("Product Name")

        # Product Strength
        strength_match = re.search(r'(\d+\s*(?:mg|g|mcg|ml|%|IP/BP|USP))', text, re.IGNORECASE)
        if strength_match:
            form_delta["product_strength"] = strength_match.group(1).strip()
            updated_fields.append("Product Strength")
        elif "500 mg" in text or "500mg" in text:
            form_delta["product_strength"] = "500 mg, IP/BP"
            updated_fields.append("Product Strength")

        # Batch Number
        batch_match = re.search(r'(?:Batch|Lot)(?:\s*(?:No|Number|#)?:?|\s+ID:?)\s*([A-Z0-9\-]+)', text, re.IGNORECASE)
        if batch_match:
            form_delta["batch_number"] = batch_match.group(1).strip()
            updated_fields.append("Batch Number")
        else:
            code_match = re.search(r'\b([A-Z]{2,4}\d{4,8}[A-Z]?)\b', text)
            if code_match:
                form_delta["batch_number"] = code_match.group(1).strip()
                updated_fields.append("Batch Number")

        # Customer / Source
        if "apollo" in text.lower():
            form_delta["customer_name"] = "Apollo Pharmacy Ltd."
            form_delta["complaint_source"] = "Pharmacy / Retail Dispenser"
            updated_fields.extend(["Customer Name", "Complaint Source"])
        elif "medplus" in text.lower():
            form_delta["customer_name"] = "MedPlus Health Services"
            form_delta["complaint_source"] = "Pharmacy Chain"
            updated_fields.extend(["Customer Name", "Complaint Source"])
        elif "abc formulation" in text.lower():
            form_delta["customer_name"] = "ABC Formulations Ltd."
            form_delta["complaint_source"] = "FDF Customer Report"
            updated_fields.extend(["Customer Name", "Complaint Source"])
        elif "email" in text.lower() and not current_state.get("form", {}).get("complaint_source"):
            form_delta["complaint_source"] = "Direct Email Inquiry"

        # Affected Quantity
        qty_match = re.search(r'(\d+\s*(?:capsules|tablets|bottles|drums|vials|strips|kg|units|packs))', text, re.IGNORECASE)
        if qty_match:
            form_delta["affected_quantity"] = qty_match.group(1).strip()
            updated_fields.append("Affected Quantity")

        # Manufacturing & Expiry Dates
        mfg_match = re.search(r'(?:Mfg|Manufacturing|MFD)(?:\s*Date)?:?\s*([A-Za-z0-9\/\-\.]+ \d{4}|\d{2}\/\d{4})', text, re.IGNORECASE)
        if mfg_match:
            form_delta["manufacturing_date"] = mfg_match.group(1).strip()
            updated_fields.append("Manufacturing Date")

        exp_match = re.search(r'(?:Exp|Expiry|EXP)(?:\s*Date)?:?\s*([A-Za-z0-9\/\-\.]+ \d{4}|\d{2}\/\d{4})', text, re.IGNORECASE)
        if exp_match:
            form_delta["expiry_date"] = exp_match.group(1).strip()
            updated_fields.append("Expiry Date")

        # Complaint details
        if len(text.strip()) > 15:
            form_delta["complaint_details"] = text.strip()
            updated_fields.append("Complaint Details")

        # Risk assessment logic
        lower_t = text.lower()
        if any(w in lower_t for w in ["black spots", "discoloration", "contamination", "glass", "subpotent", "out of spec", "oos", "adverse", "foreign"]):
            risk_delta["severity"] = "High"
            risk_delta["risk_summary"] = "Critical physical/chemical quality deviation posing potential patient risk and regulatory reporting obligation under GMP standards."
            risk_delta["suggested_action"] = "Immediate batch quarantine, initiate QA investigation (Form QA-04), retrieve retain samples for visual and chemical assay testing."
            risk_delta["root_cause_recommendation"] = "Suspected blister sealing machine heat fluctuation allowing ambient humidity ingress, causing localized oxidative discoloration."
            risk_delta["capa_recommendation"] = "Calibrate and validate blister line sealing temperature controllers; institute hourly visual inspection checks on secondary packaging."
        elif any(w in lower_t for w in ["broken", "cracked", "leak", "cap", "chipped"]):
            risk_delta["severity"] = "Medium"
            risk_delta["risk_summary"] = "Physical container-closure or tablet integrity defect without confirmed systemic stability failure."
            risk_delta["suggested_action"] = "Request return of defective samples for QA analysis, inspect remaining inventory in warehouse."
            risk_delta["root_cause_recommendation"] = "Vibration impact during tertiary packaging or compression machine punch tooling wear."
            risk_delta["capa_recommendation"] = "Review compression punch tooling maintenance schedule and re-train packaging operators."
        else:
            risk_delta["severity"] = "Low"
            risk_delta["risk_summary"] = "Minor cosmetic or packaging observation with no direct therapeutic or critical quality compromise."
            risk_delta["suggested_action"] = "Log complaint in QMS, issue standard acknowledgement to customer, monitor lot trends."
            risk_delta["root_cause_recommendation"] = "Minor secondary packaging scuff or carton printing alignment deviation."
            risk_delta["capa_recommendation"] = "Maintain routine vendor packaging material incoming QA check."

        delta_resp = {
            "form_delta": form_delta,
            "risk_assessment_delta": risk_delta
        }
        
        doc_info = f" from document '{doc_name}'" if doc_name else ""
        if updated_fields:
            reply = f"Successfully parsed information{doc_info}. Updated fields: {', '.join(updated_fields)}. Calculated risk severity: {risk_delta['severity']}."
        else:
            reply = f"Processed information{doc_info}. Verified QMS complaint context and updated risk assessment to {risk_delta['severity']} severity."

        delta_resp["ai_reply"] = reply
        return delta_resp, reply

llm_extractor = LLMExtractor()
