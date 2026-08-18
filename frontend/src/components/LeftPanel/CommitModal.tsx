import React from 'react';
import { CheckCircle } from 'lucide-react';

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
}

export const CommitModal: React.FC<CommitModalProps> = ({
  isOpen,
  onClose,
  complaintId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
          <CheckCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">Complaint Committed to QMS</h3>
          <p className="text-xs text-slate-500">
            Official record has been registered into the Pharmaceutical Quality System Audit Trail with immutable timestamp.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left font-mono text-xs space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>Tracking ID:</span>
            <span className="font-bold text-indigo-600">{complaintId}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Regulatory Standard:</span>
            <span className="text-slate-800">21 CFR Part 211 / cGMP</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Status:</span>
            <span className="text-emerald-600 font-semibold">Committed & Locked</span>
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
