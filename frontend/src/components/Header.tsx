import React, { useEffect } from 'react';
import { Shield, RotateCcw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { resetComplaint, setActiveView, setCommittedRecords } from '../store/complaintSlice';
import { api } from '../services/api';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { currentComplaint, activeView, commitSuccess } = useSelector((state: RootState) => state.complaint);

  const fetchRecords = async () => {
    try {
      const records = await api.getComplaints();
      dispatch(setCommittedRecords(records));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [commitSuccess]);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
      {/* Brand & Context */}
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-900 tracking-tight">AIVOA QMS</span>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-500 font-medium">Customer Complaints</span>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
        <button
          onClick={() => dispatch(setActiveView('intake'))}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            activeView === 'intake'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Complaint Intake
        </button>

        <button
          onClick={() => {
            dispatch(setActiveView('audit_log'));
            fetchRecords();
          }}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            activeView === 'audit_log'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Complaints
        </button>
      </div>

      {/* Case ID and Actions */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-500 font-mono">
          <span>Case:</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {currentComplaint.complaint_id}
          </span>
        </div>

        <button
          onClick={() => dispatch(resetComplaint())}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>New Case</span>
        </button>
      </div>
    </header>
  );
};
