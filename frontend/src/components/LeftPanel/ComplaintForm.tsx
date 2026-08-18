import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { FormSection } from './FormSection';
import { FormField } from './FormField';
import { RiskAssessmentCard } from './RiskAssessmentCard';
import { CommitModal } from './CommitModal';
import { setCommitting, setCommitSuccess, addMessage } from '../../store/complaintSlice';
import { api } from '../../services/api';
import { CheckCircle2, Lock, FileText } from 'lucide-react';

export const ComplaintForm: React.FC = () => {
  const dispatch = useDispatch();
  const { currentComplaint, chatHistory, isCommitting, commitSuccess } = useSelector(
    (state: RootState) => state.complaint
  );
  const [showModal, setShowModal] = useState(false);

  const handleCommit = async () => {
    try {
      dispatch(setCommitting(true));
      const res = await api.commitComplaint(currentComplaint, chatHistory);
      if (res.success) {
        dispatch(setCommitSuccess({ success: true, id: res.complaint_id }));
        setShowModal(true);
        dispatch(addMessage({
          id: `commit-${Date.now()}`,
          role: 'system',
          content: `✅ Complaint ${res.complaint_id} has been formally committed to the QMS database.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
      }
    } catch (err: any) {
      alert("Failed to commit complaint: " + (err.response?.data?.detail || err.message));
    } finally {
      dispatch(setCommitting(false));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto p-4 sm:p-6 space-y-5">
      {/* Top Form Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base font-bold text-slate-900">Log Customer Complaint</h2>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>• Ready to Commit</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            API & FDF Quality Assurance Module • Form fields are auto-populated via AIVOA Copilot
          </p>
        </div>

        <button
          onClick={handleCommit}
          disabled={isCommitting || commitSuccess}
          className={`flex items-center justify-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-xs ${
            commitSuccess
              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-[0.98]"
          }`}
        >
          {commitSuccess ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Committed to QMS</span>
            </>
          ) : isCommitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Committing...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Commit to QMS</span>
            </>
          )}
        </button>
      </div>

      {/* Section 1: Origin & Customer Details */}
      <FormSection number="1" title="ORIGIN & CUSTOMER DETAILS">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Complaint Source"
            value={currentComplaint.form.complaint_source}
            placeholder="e.g., Pharmacy / Retail Dispenser, Hospital QA, Email"
            badge="Origin"
          />
          <FormField
            label="Customer Name"
            value={currentComplaint.form.customer_name}
            placeholder="e.g., Apollo Pharmacy, ABC Formulations Ltd."
          />
        </div>
      </FormSection>

      {/* Section 2: Product & Batch Identification */}
      <FormSection number="2" title="PRODUCT & BATCH IDENTIFICATION">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Product Name"
            value={currentComplaint.form.product_name}
            placeholder="e.g., Amoxicillin Capsules, Metformin HCl API"
          />
          <FormField
            label="Product Strength / Grade"
            value={currentComplaint.form.product_strength}
            placeholder="e.g., 500 mg, IP/BP, USP Grade"
          />
          <FormField
            label="Batch / Lot Number"
            value={currentComplaint.form.batch_number}
            placeholder="e.g., AMX240602, MFH260712A"
          />
          <FormField
            label="Affected Quantity"
            value={currentComplaint.form.affected_quantity}
            placeholder="e.g., 12 capsules, 25 kg (1 HDPE Drum)"
          />
          <FormField
            label="Manufacturing Date"
            value={currentComplaint.form.manufacturing_date}
            placeholder="e.g., March 2026, 03/2026"
          />
          <FormField
            label="Expiry Date"
            value={currentComplaint.form.expiry_date}
            placeholder="e.g., February 2028, Not Provided"
          />
        </div>
      </FormSection>

      {/* Complaint Observation Narrative */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-2">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <FileText className="w-4 h-4 text-slate-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            COMPLAINT OBSERVATION & DEFECT DETAILS
          </h2>
        </div>
        <FormField
          label="Detailed Defect Observation"
          value={currentComplaint.form.complaint_details}
          placeholder="Extracted complaint narrative will be shown here..."
          isTextArea
          rows={3}
        />
      </div>

      {/* Section 3: AI Risk Assessment */}
      <RiskAssessmentCard assessment={currentComplaint.risk_assessment} />

      {/* Confirmation Modal */}
      <CommitModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        complaintId={currentComplaint.complaint_id}
      />
    </div>
  );
};
