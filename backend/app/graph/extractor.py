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

    def extract(self, input_text: str, current_state: Dict[str, Any], doc_name: str = None, conversation_history: list = None) -> Tuple[Dict[str, Any], str]:
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
                
                # Strip <think>...</think> blocks from thinking models (Qwen, etc.)
                think_match = re.search(r'<think>(.*?)</think>', content, re.DOTALL)
                if think_match:
                    content = content[think_match.end():].strip()
                
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
            except json.JSONDecodeError as je:
                # Try to fix common JSON issues (trailing commas, etc.)
                try:
                    fixed = re.sub(r',\s*}', '}', content)
                    fixed = re.sub(r',\s*]', ']', fixed)
                    parsed = json.loads(fixed)
                    return parsed, parsed.get("ai_reply", "State updated successfully.")
                except Exception:
                    pass
                print(f"LLM extraction error: {je}, falling back to intelligent heuristic parser.")
            except Exception as e:
                print(f"LLM extraction error: {e}, falling back to intelligent heuristic parser.")

        # Robust intelligent heuristic extraction fallback if LLM is unavailable or fails
        return self._heuristic_extractor(input_text, current_state, doc_name, conversation_history)

    def _heuristic_extractor(self, text: str, current_state: Dict[str, Any], doc_name: str = None, conversation_history: list = None) -> Tuple[Dict[str, Any], str]:
        """
        Rule-based / regex intelligent extractor ensuring the system is 100% operational
        even in offline/test environments.
        """
        form_delta = {}
        risk_delta = {}
        updated_fields = []
        lower_t = text.lower()

        # --- Explicit update commands (e.g., "update severity to high", "change batch number to X") ---
        SEVERITY_MAP = {"low": "Low", "medium": "Medium", "med": "Medium", "high": "High", "hi": "High", "critical": "High"}

        # Explicit severity update: "severity to high", "severity to a med", "set severity medium", "change severity to high", "severity level to high"
        sev_match = re.search(r'severity\s+(?:level\s+)?(?:to\s+(?:a\s+)?)?(\w+)', lower_t)
        if sev_match:
            raw = sev_match.group(1).strip().lower()
            if raw in SEVERITY_MAP:
                risk_delta["severity"] = SEVERITY_MAP[raw]
                updated_fields.append("Severity")

        # Explicit batch number update:
        #   "change batch number to X", "update batch to X", "change lot number to X"
        #   "change the AMX240602 to a MX240602902835" (old_val to new_val pattern)
        #   Also handles missing space: "MFH260712Ato a FH260712A4290"
        batch_update_match = re.search(r'(?:update|change|set)\s+(?:the\s+)?(?:batch|lot)\s*(?:number)?\s+to\s+(?:a\s+)?([A-Za-z0-9\-]+)', text, re.IGNORECASE)
        if not batch_update_match:
            # Pattern: "change the OLDVAL to a NEWVAL" where OLDVAL looks like a batch
            # Allows optional spaces: "MFH260712Ato a FH260712A4290"
            change_to_match = re.search(r'(?:update|change|set)\s+the\s+([A-Za-z0-9]{4,15})\s*to\s*(?:a\s+)?([A-Za-z0-9]{4,15})', text, re.IGNORECASE)
            if change_to_match:
                old_val = change_to_match.group(1).upper()
                new_val = change_to_match.group(2).upper()
                current_batch = current_state.get("form", {}).get("batch_number", "")
                if old_val == current_batch.upper() or old_val in current_batch.upper():
                    form_delta["batch_number"] = new_val
                    updated_fields.append("Batch Number")
        if batch_update_match and "batch_number" not in form_delta:
            form_delta["batch_number"] = batch_update_match.group(1).strip().upper()
            updated_fields.append("Batch Number")

        # Explicit product name update
        prod_update_match = re.search(r'(?:update|change|set)\s+(?:the\s+)?(?:product|medicine|drug)\s*(?:name)?\s+(?:to\s+)?(.+?)(?:\s+and\s+|\s*$)', lower_t)
        if not prod_update_match:
            prod_update_match = re.search(r'(?:update|change)\s+(?:the\s+)?(?:product|medicine|drug)\s+(?:to\s+)?(.+?)(?:\s+and\s+|\s*$)', lower_t)
        if prod_update_match:
            form_delta["product_name"] = prod_update_match.group(1).strip().title()
            updated_fields.append("Product Name")

        # Explicit customer name update
        cust_update_match = re.search(r'(?:update|change|set)\s+(?:the\s+)?customer\s*(?:name)?\s+(?:to\s+)?(.+?)(?:\s+and\s+|\s*$)', lower_t)
        if cust_update_match:
            form_delta["customer_name"] = cust_update_match.group(1).strip().title()
            updated_fields.append("Customer Name")

        # Explicit source update
        src_update_match = re.search(r'(?:update|change|set)\s+(?:the\s+)?(?:source|channel)\s+(?:to\s+)?(.+?)(?:\s+and\s+|\s*$)', lower_t)
        if src_update_match:
            form_delta["complaint_source"] = src_update_match.group(1).strip().title()
            updated_fields.append("Source / Channel")

        # Explicit affected quantity update
        qty_update_match = re.search(r'(?:update|change|set)\s+(?:the\s+)?(?:affected\s+)?quantity\s+(?:to\s+)?(.+?)(?:\s+and\s+|\s*$)', lower_t)
        if qty_update_match:
            form_delta["affected_quantity"] = qty_update_match.group(1).strip()
            updated_fields.append("Affected Quantity")

        # --- Product Name (keyword-based, with extended mappings) ---
        product_map = {
            "amoxicillin": "Amoxicillin Capsules",
            "metformin": "Metformin Hydrochloride API",
            "paracetamol": "Paracetamol Tablets IP",
            "acetaminophen": "Paracetamol Tablets IP",
            "ciprofloxacin": "Ciprofloxacin Eye Drops",
            "norflox": "Norfloxacin Tablets IP",
            "norfloxacin": "Norfloxacin Tablets IP",
            "ibuprofen": "Ibuprofen Tablets IP",
            "azithromycin": "Azithromycin Tablets IP",
            "omeprazole": "Omeprazole Capsules IP",
            "pantoprazole": "Pantoprazole Tablets IP",
            "cetirizine": "Cetirizine Tablets IP",
            "ranitidine": "Ranitidine Tablets IP",
            "levofloxacin": "Levofloxacin Tablets IP",
            "cefixime": "Cefixime Tablets IP",
            "diclofenac": "Diclofenac Tablets IP",
            "naproxen": "Naproxen Tablets IP",
            "cephalexin": "Cephalexin Capsules IP",
            "doxycycline": "Doxycycline Capsules IP",
            "clindamycin": "Clindamycin Capsules IP",
            "ceftriaxone": "Ceftriaxone Injection",
            "cefotaxime": "Cefotaxime Injection",
            "vancomycin": "Vancomycin Injection",
            "meropenem": "Meropenem Injection",
            "piperacillin": "Piperacillin Injection",
            "ampicillin": "Ampicillin Capsules",
            "gentamicin": "Gentamicin Injection",
            "tobramycin": "Tobramycin Injection",
            "erythromycin": "Erythromycin Tablets IP",
            "clarithromycin": "Clarithromycin Tablets IP",
            "lincomycin": "Lincomycin Capsules",
            "metronidazole": "Metronidazole Tablets IP",
            "tinidazole": "Tinidazole Tablets IP",
            "aciclovir": "Aciclovir Tablets IP",
            "oseltamivir": "Oseltamivir Capsules",
            "hydroxychloroquine": "Hydroxychloroquine Tablets IP",
            "losartan": "Losartan Tablets IP",
            "amlodipine": "Amlodipine Tablets IP",
            "atorvastatin": "Atorvastatin Tablets IP",
            "rosuvastatin": "Rosuvastatin Tablets IP",
            "metoprolol": "Metoprolol Tablets IP",
            "bisoprolol": "Bisoprolol Tablets IP",
            "carvedilol": "Carvedilol Tablets IP",
            "gliclazide": "Gliclazide Tablets IP",
            "glimepiride": "Glimepiride Tablets IP",
            "pioglitazone": "Pioglitazone Tablets IP",
            "sitagliptin": "Sitagliptin Tablets IP",
            "empagliflozin": "Empagliflozin Tablets IP",
            "dapagliflozin": "Dapagliflozin Tablets IP",
            "insulin": "Insulin Injection",
            "enoxaparin": "Enoxaparin Injection",
            "heparin": "Heparin Injection",
            "warfarin": "Warfarin Tablets IP",
            "rivaroxaban": "Rivaroxaban Tablets",
            "apixaban": "Apixaban Tablets",
        }
        for keyword, product_name in product_map.items():
            if keyword in lower_t:
                form_delta["product_name"] = product_name
                updated_fields.append("Product Name")
                break
        
        # General product name extraction if keyword map didn't match
        # Captures everything between "regarding/about/for" and the first parenthesis or specific delimiters
        if "product_name" not in form_delta:
            # Use parenthesis as primary stop (handles "regarding X Y (strength, grade)")
            prod_match = re.search(r'(?:regarding|about|for)\s+([A-Z][A-Za-z0-9\s\-\+\.\%]+?)(?:\s*\()', text)
            if not prod_match:
                # Fallback: stop before common sentence delimiters but not periods inside numbers
                prod_match = re.search(r'(?:regarding|about|for)\s+([A-Z][A-Za-z0-9\s\-\+]+?)(?:\s+(?:was|is|has|had|show|shows|showed|due|because|and\s+the|with|from|Batch|The\s+batch|They|The\s+bags|Inspection|Discoloration))', text)
            if prod_match:
                name = prod_match.group(1).strip()
                if len(name) > 3:
                    form_delta["product_name"] = name
                    updated_fields.append("Product Name")

        # Product Strength (handles decimals like 5.6%)
        strength_match = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|%|IP/BP|USP))', text, re.IGNORECASE)
        if strength_match:
            form_delta["product_strength"] = strength_match.group(1).strip()
            updated_fields.append("Product Strength")
        elif "500 mg" in text or "500mg" in text:
            form_delta["product_strength"] = "500 mg, IP/BP"
            updated_fields.append("Product Strength")

        # Batch Number (only if not already set by explicit update)
        if "batch_number" not in form_delta:
            batch_match = re.search(r'(?:Batch|Lot)(?:\s*(?:No|Number|#)?:?|\s+ID:?)\s+(?:is\s+)?([A-Z0-9\-]{3,})', text, re.IGNORECASE)
            if batch_match:
                form_delta["batch_number"] = batch_match.group(1).strip()
                updated_fields.append("Batch Number")
            else:
                code_match = re.search(r'\b([A-Z]{2,4}\d{4,8}[A-Z]?)\b', text)
                if code_match:
                    form_delta["batch_number"] = code_match.group(1).strip()
                    updated_fields.append("Batch Number")

        # Customer / Source — general extraction FIRST, keyword map as fallback
        # General customer name extraction from "from X regarding", "by X regarding" patterns
        if "customer_name" not in form_delta:
            customer_patterns = [
                r'(?:report|receiving|received|logged|filed|opened|submitted|alert)\s+(?:\w+\s+)*?(?:from|by)\s+([A-Z][A-Za-z\s&]+?)(?:\s+(?:regarding|about|for|stating|noting|concerning)|[.,])',
                r'(?:from|by)\s+([A-Z][A-Za-z\s&]+?)\s+(?:regarding|about|for|stating|noting|concerning)',
                r'client\s*:\s*([A-Za-z\s&]+?)(?:\s+(?:regarding|about|for|stating|noting)|[.,])',
            ]
            for pattern in customer_patterns:
                cust_match = re.search(pattern, text, re.IGNORECASE)
                if cust_match:
                    extracted = cust_match.group(1).strip()
                    skip_words = {"direct", "email", "phone", "web", "online", "chat", "the", "a", "an", "customer", "quality"}
                    if extracted.lower().split()[0] not in skip_words and len(extracted) > 3:
                        form_delta["customer_name"] = extracted
                        updated_fields.append("Customer Name")
                        break
        
        # Keyword map fallback (only if general extraction didn't find anything)
        if "customer_name" not in form_delta:
            if "apollo" in lower_t:
                form_delta["customer_name"] = "Apollo Pharmacy Ltd."
                form_delta["complaint_source"] = "Pharmacy / Retail Dispenser"
                updated_fields.extend(["Customer Name", "Complaint Source"])
            elif "medplus" in lower_t:
                form_delta["customer_name"] = "MedPlus Health Services"
                form_delta["complaint_source"] = "Pharmacy Chain"
                updated_fields.extend(["Customer Name", "Complaint Source"])
            elif "abc formulation" in lower_t:
                form_delta["customer_name"] = "ABC Formulations Ltd."
                form_delta["complaint_source"] = "FDF Customer Report"
                updated_fields.extend(["Customer Name", "Complaint Source"])
            elif "sun pharma" in lower_t:
                form_delta["customer_name"] = "Sun Pharma R&D Facility"
                form_delta["complaint_source"] = "R&D Facility Report"
                updated_fields.extend(["Customer Name", "Complaint Source"])
            elif "email" in lower_t and not current_state.get("form", {}).get("complaint_source"):
                form_delta["complaint_source"] = "Direct Email Inquiry"
        
        # General source/channel extraction
        if "complaint_source" not in form_delta:
            if "portal" in lower_t or "portal ticket" in lower_t:
                form_delta["complaint_source"] = "Portal Ticket"
                updated_fields.append("Source / Channel")
            elif "call" in lower_t and ("customer" in lower_t or "phone" in lower_t):
                form_delta["complaint_source"] = "Phone Call"
                updated_fields.append("Source / Channel")
            elif "written" in lower_t and ("complaint" in lower_t or "logged" in lower_t):
                form_delta["complaint_source"] = "Written Complaint"
                updated_fields.append("Source / Channel")
            elif "email" in lower_t:
                form_delta["complaint_source"] = "Email"
                updated_fields.append("Source / Channel")
            elif "notification" in lower_t or "submitted" in lower_t:
                form_delta["complaint_source"] = "Quality Notification"
                updated_fields.append("Source / Channel")
            elif "report" in lower_t:
                form_delta["complaint_source"] = "Report"
                updated_fields.append("Source / Channel")

        # Affected Quantity
        if "affected_quantity" not in form_delta:
            qty_units = r'(?:capsules|tablets|bottles|drums|vials|strips|kg|units|packs|boxes|tubes|ampoules|sachets|blisters|cartons|pouches|bags|infusions|containers)'
            # Prioritize "total affected quantity is X" pattern
            total_qty_match = re.search(rf'(?:total\s+)?(?:affected\s+)?quantity\s+(?:is\s+|of\s+)?(\d+\s*{qty_units})', text, re.IGNORECASE)
            if total_qty_match:
                form_delta["affected_quantity"] = total_qty_match.group(1).strip()
                updated_fields.append("Affected Quantity")
            else:
                # Try "X defective/affected/reported capsules" first
                ctx_qty_match = re.search(rf'(\d+)\s+(?:defective|affected|reported|damaged|missing|broken|contaminated)\s+{qty_units}', text, re.IGNORECASE)
                if ctx_qty_match:
                    form_delta["affected_quantity"] = ctx_qty_match.group(0).strip()
                    updated_fields.append("Affected Quantity")
                else:
                    # Try "X of Y units" pattern (e.g., "45 tubes from Batch")
                    of_qty_match = re.search(rf'(\d+)\s+(?:\w+\s+)?{qty_units}\s+(?:from|in|of|across)', text, re.IGNORECASE)
                    if of_qty_match:
                        # Clean: extract just number + unit, skip adjectives like "individual"
                        raw = of_qty_match.group(0)
                        num_match = re.search(r'(\d+)', raw)
                        unit_match = re.search(qty_units, raw, re.IGNORECASE)
                        if num_match and unit_match:
                            form_delta["affected_quantity"] = f"{num_match.group(1)} {unit_match.group(0)}"
                        else:
                            form_delta["affected_quantity"] = raw.rsplit(' ', 1)[0].strip()
                        updated_fields.append("Affected Quantity")
                    else:
                        # Fallback: simple number + optional adjective + unit
                        qty_match = re.search(rf'(\d+)\s+(?:\w+\s+)?{qty_units}', text, re.IGNORECASE)
                        if qty_match:
                            clean = re.search(rf'(\d+)\s+{qty_units}', qty_match.group(0), re.IGNORECASE)
                            form_delta["affected_quantity"] = clean.group(0).strip() if clean else qty_match.group(0).strip()
                            updated_fields.append("Affected Quantity")

        # Manufacturing & Expiry Dates
        mfg_match = re.search(r'(?:Mfg|Manufacturing|MFD|manufactured)(?:\s+date)?(?:\s+\w+)*?[:\s]+(?:is\s+|on\s+|of\s+)?([A-Za-z0-9\/\-\.]+ \d{4}|\d{2}\/\d{4})', text, re.IGNORECASE)
        if mfg_match:
            form_delta["manufacturing_date"] = mfg_match.group(1).strip()
            updated_fields.append("Manufacturing Date")

        exp_match = re.search(r'(?:Exp|Expiry|EXP|Expiration|Expiry\s*Date)(?:\s*Date)?(?:\s+(?:is|of|on))?[:\s]+([A-Za-z0-9\/\-\.]+ \d{4}|\d{2}\/\d{4})', text, re.IGNORECASE)
        if exp_match:
            form_delta["expiry_date"] = exp_match.group(1).strip()
            updated_fields.append("Expiry Date")

        # Complaint description - build summary from entire conversation history
        # Gather all user messages and form data to create a comprehensive description
        is_update_command = bool(re.search(r'(?:update|change|set|modify)\s+', lower_t))
        if conversation_history is None:
            conversation_history = []
        
        user_messages = []
        for msg in conversation_history:
            role = msg.get("role", "")
            content = msg.get("content", "")
            if role == "user" and content and content.strip():
                user_messages.append(content.strip())
        # Include current message if it's not an update command
        if not is_update_command and text.strip() and text.strip() not in user_messages:
            user_messages.append(text.strip())
        
        # Build a structured summary using MERGED form state (current + newly extracted values)
        # This ensures the description always reflects the latest updates
        form = current_state.get("form", {}).copy()
        # Merge form_delta into form so description reflects updated values
        for k, v in form_delta.items():
            if v is not None and v != "":
                form[k] = v
        parts = []
        
        # Customer and source
        customer = form.get("customer_name", "") or ""
        source = form.get("complaint_source", "") or ""
        if customer:
            customer_line = f"Customer: {customer}"
            if source:
                customer_line += f" ({source})"
            parts.append(customer_line)
        
        # Product details
        product = form.get("product_name", "") or ""
        strength = form.get("product_strength", "") or ""
        batch = form.get("batch_number", "") or ""
        if product:
            prod_line = f"Product: {product}"
            if strength:
                prod_line += f", {strength}"
            if batch:
                prod_line += f", Batch: {batch}"
            parts.append(prod_line)
        
        # Dates and quantity
        mfg = form.get("manufacturing_date", "") or ""
        exp = form.get("expiry_date", "") or ""
        qty = form.get("affected_quantity", "") or ""
        date_parts = []
        if mfg:
            date_parts.append(f"Mfg: {mfg}")
        if exp:
            date_parts.append(f"Exp: {exp}")
        if qty:
            date_parts.append(f"Qty: {qty}")
        if date_parts:
            parts.append(", ".join(date_parts))
        
        # Complaint narrative from user messages (skip short/irrelevant ones)
        complaint_phrases = []
        skip_words = {"update", "change", "set", "modify", "hello", "hi", "hey", "thanks", "ok", "yes", "no"}
        update_pattern = re.compile(
            r'(?:^|\b)(?:update|change|set|modify)\b'
            r'|(?:batch|lot)\s*(?:number)?\s*(?:to|a)\s'
            r'|severity\s+(?:to|a)\s'
            r'|product\s+(?:name)?\s*(?:to|a)\s'
            r'|strength\s+(?:to|a)\s'
            r'|quantity\s+(?:to|a)\s'
            r'|customer\s+(?:name)?\s*(?:to|a)\s'
            r'|source\s+(?:to|a)\s',
            re.IGNORECASE
        )
        for msg in user_messages:
            msg_lower = msg.lower().strip()
            # Skip very short messages
            if len(msg) < 10:
                continue
            # Skip messages that are purely greetings or acks
            if all(w in skip_words for w in msg_lower.split()):
                continue
            # Skip any message that looks like an update command
            if update_pattern.search(msg_lower):
                continue
            complaint_phrases.append(msg)
        
        if complaint_phrases:
            parts.append("Complaint: " + "; ".join(complaint_phrases))
        
        # Combine into final summary
        if parts:
            summary = ". ".join(parts) + "."
            form_delta["complaint_details"] = summary
            updated_fields.append("Complaint Description (Summary)")

        # Risk assessment logic (only if severity wasn't explicitly set)
        if "severity" not in risk_delta:
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
            reply = f"Successfully parsed information{doc_info}. Updated fields: {', '.join(updated_fields)}. Risk severity: {risk_delta.get('severity', 'N/A')}."
        else:
            reply = f"Processed information{doc_info}. Verified QMS complaint context. Current risk severity: {risk_delta.get('severity', 'N/A')}."

        delta_resp["ai_reply"] = reply
        return delta_resp, reply

llm_extractor = LLMExtractor()
