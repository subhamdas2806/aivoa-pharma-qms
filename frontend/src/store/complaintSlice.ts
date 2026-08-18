import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ComplaintData, ChatMessage } from '../types/complaint';

interface ComplaintState {
  currentComplaint: ComplaintData;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  isCommitting: boolean;
  commitSuccess: boolean;
  lastCommittedId: string | null;
  error: string | null;
}

const initialComplaintData: ComplaintData = {
  complaint_id: 'CMP-2026-0081',
  status: 'Ready to Commit',
  form: {
    complaint_source: '',
    customer_name: '',
    product_name: '',
    product_strength: '',
    batch_number: '',
    affected_quantity: '',
    manufacturing_date: '',
    expiry_date: '',
    complaint_details: '',
  },
  risk_assessment: {
    severity: 'Medium',
    risk_summary: 'Awaiting quality defect extraction and hazard assessment.',
    suggested_action: 'Collect initial complainant data and retain sample details.',
    root_cause_recommendation: 'To be determined following full batch record review.',
    capa_recommendation: 'Pending investigation outcome.',
  },
  document_name: null,
};

const initialState: ComplaintState = {
  currentComplaint: initialComplaintData,
  chatHistory: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Welcome to AIVOA QMS Copilot. You can describe a customer complaint in natural language, upload QA field reports, or drop a PDF document below to automatically extract batch parameters and generate GMP risk assessments.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ],
  isLoading: false,
  isCommitting: false,
  commitSuccess: false,
  lastCommittedId: null,
  error: null,
};

export const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCommitting: (state, action: PayloadAction<boolean>) => {
      state.isCommitting = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatHistory.push(action.payload);
    },
    mergeFormState: (state, action: PayloadAction<Partial<ComplaintData>>) => {
      const incoming = action.payload;
      
      if (incoming.complaint_id) {
        state.currentComplaint.complaint_id = incoming.complaint_id;
      }
      if (incoming.status) {
        state.currentComplaint.status = incoming.status;
      }
      if (incoming.document_name !== undefined) {
        state.currentComplaint.document_name = incoming.document_name;
      }

      if (incoming.form) {
        Object.keys(incoming.form).forEach((key) => {
          const formKey = key as keyof typeof state.currentComplaint.form;
          const val = incoming.form?.[formKey];
          if (val !== undefined && val !== null && val !== '') {
            state.currentComplaint.form[formKey] = val;
          }
        });
      }

      if (incoming.risk_assessment) {
        Object.keys(incoming.risk_assessment).forEach((key) => {
          const riskKey = key as keyof typeof state.currentComplaint.risk_assessment;
          const val = incoming.risk_assessment?.[riskKey];
          if (val !== undefined && val !== null && val !== '') {
            (state.currentComplaint.risk_assessment as any)[riskKey] = val;
          }
        });
      }
    },
    setCommitSuccess: (state, action: PayloadAction<{ success: boolean; id: string | null }>) => {
      state.commitSuccess = action.payload.success;
      state.lastCommittedId = action.payload.id;
      if (action.payload.success) {
        state.currentComplaint.status = 'Committed to QMS';
      }
    },
    resetComplaint: (state) => {
      const newIdNumber = Math.floor(1000 + Math.random() * 9000);
      state.currentComplaint = {
        ...initialComplaintData,
        complaint_id: `CMP-2026-${newIdNumber}`,
      };
      state.commitSuccess = false;
      state.lastCommittedId = null;
      state.error = null;
    }
  },
});

export const {
  setLoading,
  setCommitting,
  setError,
  addMessage,
  mergeFormState,
  setCommitSuccess,
  resetComplaint
} = complaintSlice.actions;

export default complaintSlice.reducer;
