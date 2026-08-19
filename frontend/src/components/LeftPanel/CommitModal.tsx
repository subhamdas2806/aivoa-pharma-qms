import React from 'react';
import { Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 text-center space-y-4">
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-800">
          <Check className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">Complaint Saved</h3>
          <p className="text-xs text-slate-500">
            Case <span className="font-mono font-medium text-slate-800">{complaintId}</span> has been logged to the database.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
