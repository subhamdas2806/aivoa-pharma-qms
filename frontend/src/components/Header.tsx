import React from 'react';
import { ShieldCheck, Database, RefreshCw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { resetComplaint } from '../store/complaintSlice';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { currentComplaint } = useSelector((state: RootState) => state.complaint);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
      <div className="flex items-center space-x-3.5">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900">AIVOA QMS</h1>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded border border-slate-200">
              API & FDF QA
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Customer Complaint Management & Risk Intelligence</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>Active Record:</span>
          <span className="font-mono font-semibold text-indigo-700">{currentComplaint.complaint_id}</span>
        </div>

        <button
          onClick={() => dispatch(resetComplaint())}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors shadow-xs"
          title="New Complaint Record"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>New Record</span>
        </button>
      </div>
    </header>
  );
};
