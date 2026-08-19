import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { FormSection } from './FormSection';
import { FormField } from './FormField';
import { RiskAssessmentCard } from './RiskAssessmentCard';
import { CommitModal } from './CommitModal';
import {
  setCommitting,
  setCommitSuccess,
  addMessage,
  updateFormField,
  updateRiskField
} from '../../store/complaintSlice';
import { api } from '../../services/api';
import { Check } from 'lucide-react';

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
          content: `Complaint ${res.complaint_id} committed to database.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
      }
    } catch (err: any) {
      alert("Failed to save complaint: " + (err.response?.data?.detail || err.message));
    } finally {
      dispatch(setCommitting(false));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto p-6 space-y-5">
      {/* Top Form Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Complaint Record Form
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and edit the fields below before saving.
          </p>
        </div>

        <button
          onClick={handleCommit}
          disabled={isCommitting || commitSuccess}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs ${
            commitSuccess
              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          {commitSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Saved to Database</span>
            </>
          ) : isCommitting ? (
            <span>Saving...</span>
          ) : (
            <span>Save Complaint</span>
          )}
        </button>
      </div>

      {/* Section 1: Customer Info */}
      <FormSection title="Customer Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Source / Channel"
            value={currentComplaint.form.complaint_source}
            placeholder="e.g. Retail Pharmacy, Direct Email"
            onChange={(val) => dispatch(updateFormField({ field: 'complaint_source', value: val }))}
          />
          <FormField
            label="Customer Name"
            value={currentComplaint.form.customer_name}
            placeholder="e.g. Apollo Pharmacy, ABC Formulations Ltd."
            onChange={(val) => dispatch(updateFormField({ field: 'customer_name', value: val }))}
          />
        </div>
      </FormSection>

      {/* Section 2: Product & Batch Identification */}
      <FormSection title="Product & Batch Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Product Name"
            value={currentComplaint.form.product_name}
            placeholder="e.g. Amoxicillin Capsules, Metformin HCl API"
            onChange={(val) => dispatch(updateFormField({ field: 'product_name', value: val }))}
          />
          <FormField
            label="Strength / Grade"
            value={currentComplaint.form.product_strength}
            placeholder="e.g. 500 mg, USP Grade"
            onChange={(val) => dispatch(updateFormField({ field: 'product_strength', value: val }))}
          />
          <FormField
            label="Batch Number"
            value={currentComplaint.form.batch_number}
            placeholder="e.g. AMX240602, MFH260712A"
            onChange={(val) => dispatch(updateFormField({ field: 'batch_number', value: val }))}
          />
          <FormField
            label="Affected Quantity"
            value={currentComplaint.form.affected_quantity}
            placeholder="e.g. 12 capsules, 25 kg"
            onChange={(val) => dispatch(updateFormField({ field: 'affected_quantity', value: val }))}
          />
          <FormField
            label="Manufacturing Date"
            value={currentComplaint.form.manufacturing_date}
            placeholder="e.g. 03/2026"
            onChange={(val) => dispatch(updateFormField({ field: 'manufacturing_date', value: val }))}
          />
          <FormField
            label="Expiration Date"
            value={currentComplaint.form.expiry_date}
            placeholder="e.g. 02/2028"
            onChange={(val) => dispatch(updateFormField({ field: 'expiry_date', value: val }))}
          />
        </div>
      </FormSection>

      {/* Observation Narrative */}
      <FormSection title="Observation & Description">
        <FormField
          label="Complaint Description"
          value={currentComplaint.form.complaint_details}
          placeholder="Details of the defect or issue..."
          isTextArea
          rows={3}
          onChange={(val) => dispatch(updateFormField({ field: 'complaint_details', value: val }))}
        />
      </FormSection>

      {/* Section 3: Risk Assessment */}
      <RiskAssessmentCard
        assessment={currentComplaint.risk_assessment}
        onChange={(field, val) => dispatch(updateRiskField({ field, value: val }))}
      />

      {/* Confirmation Modal */}
      <CommitModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        complaintId={currentComplaint.complaint_id}
      />
    </div>
  );
};
