import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { api } from '../services/api';
import { setCommittedRecords, mergeFormState, setActiveView } from '../store/complaintSlice';
import { RefreshCw, ArrowUpRight } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const dispatch = useDispatch();
  const { committedRecords } = useSelector((state: RootState) => state.complaint);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const records = await api.getComplaints();
      dispatch(setCommittedRecords(records));
      if (records.length > 0 && !selectedRecord) {
        setSelectedRecord(records[0]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden text-slate-900">
      {/* Top action header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Complaints Database
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            History of committed customer complaint records.
          </p>
        </div>

        <button
          onClick={fetchRecords}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main split log view */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left list (5 cols) */}
        <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-5 space-y-2.5">
          <div className="text-xs font-medium text-slate-400 px-1 pb-1">
            All Records ({committedRecords.length})
          </div>

          {committedRecords.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl p-6 text-xs text-slate-400 bg-white">
              No complaint records found in database.
            </div>
          ) : (
            committedRecords.map((rec: any) => {
              const isSelected = selectedRecord?.complaint_id === rec.complaint_id;
              return (
                <div
                  key={rec.id || rec.complaint_id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="font-mono font-semibold text-xs text-slate-900">{rec.complaint_id}</span>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {rec.severity}
                    </span>
                  </div>

                  <div className="mt-2 text-xs space-y-1">
                    <div className="font-medium text-slate-900 truncate">
                      {rec.product_name || 'Unspecified Product'} {rec.product_strength}
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center justify-between">
                      <span>Batch: {rec.batch_number || 'N/A'}</span>
                      <span>{rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Pane (7 cols) */}
        <div className="md:col-span-7 overflow-y-auto p-6 text-xs space-y-4 bg-white">
          {selectedRecord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {selectedRecord.complaint_id}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Recorded on {selectedRecord.created_at ? new Date(selectedRecord.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    dispatch(mergeFormState({
                      complaint_id: selectedRecord.complaint_id,
                      status: 'Committed Record',
                      form: {
                        complaint_source: selectedRecord.complaint_source || '',
                        customer_name: selectedRecord.customer_name || '',
                        product_name: selectedRecord.product_name || '',
                        product_strength: selectedRecord.product_strength || '',
                        batch_number: selectedRecord.batch_number || '',
                        affected_quantity: selectedRecord.affected_quantity || '',
                        manufacturing_date: selectedRecord.manufacturing_date || '',
                        expiry_date: selectedRecord.expiry_date || '',
                        complaint_details: selectedRecord.complaint_details || '',
                      },
                      risk_assessment: {
                        severity: selectedRecord.severity || 'Medium',
                        risk_summary: selectedRecord.risk_summary || '',
                        suggested_action: selectedRecord.suggested_action || '',
                        root_cause_recommendation: selectedRecord.root_cause_recommendation || '',
                        capa_recommendation: selectedRecord.capa_recommendation || '',
                      }
                    }));
                    dispatch(setActiveView('intake'));
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors text-xs font-medium"
                >
                  <span>Open in Form</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Record Summary Data Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Customer / Channel</span>
                  <span className="text-slate-900 font-medium text-xs">{selectedRecord.customer_name || 'N/A'}</span>
                  <span className="text-slate-500 text-xs block">{selectedRecord.complaint_source}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Product &amp; Strength</span>
                  <span className="text-slate-900 font-medium text-xs">{selectedRecord.product_name}</span>
                  <span className="text-slate-500 text-xs block">{selectedRecord.product_strength}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Batch &amp; Quantity</span>
                  <span className="text-slate-900 font-medium text-xs">{selectedRecord.batch_number || 'N/A'}</span>
                  <span className="text-slate-500 text-xs block">{selectedRecord.affected_quantity}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Dates</span>
                  <span className="text-slate-900 text-xs">Mfg: {selectedRecord.manufacturing_date || 'N/A'}</span>
                  <span className="text-slate-500 text-xs block">Exp: {selectedRecord.expiry_date || 'N/A'}</span>
                </div>
              </div>

              {/* Defect Narrative */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-medium block">Complaint Details</span>
                <p className="text-slate-800 leading-relaxed text-xs">
                  {selectedRecord.complaint_details || 'No details recorded.'}
                </p>
              </div>

              {/* Risk & Containment */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Risk &amp; Actions</span>
                  <span className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {selectedRecord.severity} Severity
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">Immediate Action:</span>
                  <p className="text-slate-800 text-xs">{selectedRecord.suggested_action || 'None'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Suspected Root Cause:</span>
                    <p className="text-slate-700 text-xs mt-0.5">{selectedRecord.root_cause_recommendation || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">CAPA Plan:</span>
                    <p className="text-slate-700 text-xs mt-0.5">{selectedRecord.capa_recommendation || 'None'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Select a complaint record from the left to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
