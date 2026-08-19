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
  activeView: 'intake' | 'audit_log';
  committedRecords: any[];
}

function generateCaseId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `CMP-2026-${num}`;
}

const initialComplaintData: ComplaintData = {
  complaint_id: generateCaseId(),
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
    risk_summary: '',
    suggested_action: '',
    root_cause_recommendation: '',
    capa_recommendation: '',
  },
  document_name: null,
};

const initialState: ComplaintState = {
  currentComplaint: initialComplaintData,
  chatHistory: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Upload a report or paste customer correspondence to populate the complaint form.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ],
  isLoading: false,
  isCommitting: false,
  commitSuccess: false,
  lastCommittedId: null,
  error: null,
  activeView: 'intake',
  committedRecords: [],
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
    setActiveView: (state, action: PayloadAction<'intake' | 'audit_log'>) => {
      state.activeView = action.payload;
    },
    setCommittedRecords: (state, action: PayloadAction<any[]>) => {
      state.committedRecords = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatHistory.push(action.payload);
    },
    updateFormField: (state, action: PayloadAction<{ field: keyof ComplaintData['form']; value: string }>) => {
      state.currentComplaint.form[action.payload.field] = action.payload.value;
    },
    updateRiskField: (state, action: PayloadAction<{ field: keyof ComplaintData['risk_assessment']; value: any }>) => {
      (state.currentComplaint.risk_assessment as any)[action.payload.field] = action.payload.value;
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
        state.currentComplaint.status = 'Committed';
      }
    },
    resetComplaint: (state) => {
      state.currentComplaint = {
        ...initialComplaintData,
        complaint_id: generateCaseId(),
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
  setActiveView,
  setCommittedRecords,
  addMessage,
  updateFormField,
  updateRiskField,
  mergeFormState,
  setCommitSuccess,
  resetComplaint
} = complaintSlice.actions;

export default complaintSlice.reducer;
