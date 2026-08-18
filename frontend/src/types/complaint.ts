export interface FormState {
  complaint_source: string;
  customer_name: string;
  product_name: string;
  product_strength: string;
  batch_number: string;
  affected_quantity: string;
  manufacturing_date: string;
  expiry_date: string;
  complaint_details: string;
}

export interface RiskAssessment {
  severity: "Low" | "Medium" | "High";
  risk_summary: string;
  suggested_action: string;
  root_cause_recommendation: string;
  capa_recommendation: string;
}

export interface ComplaintData {
  complaint_id: string;
  status: string;
  form: FormState;
  risk_assessment: RiskAssessment;
  document_name?: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  document_name?: string;
  isExtractedCard?: boolean;
  updatedFields?: string[];
}
