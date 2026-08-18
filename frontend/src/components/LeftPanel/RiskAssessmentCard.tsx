import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import type { RiskAssessment } from '../../types/complaint';

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
}

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ assessment }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          dot: 'bg-rose-500',
          label: 'Critical / High Risk'
        };
      case 'Low':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dot: 'bg-emerald-500',
          label: 'Low Risk / Minor'
        };
      case 'Medium':
      default:
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          dot: 'bg-amber-500',
          label: 'Moderate Severity'
        };
    }
  };

  const badge = getSeverityBadge(assessment.severity);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
            3
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <span>FACILITY & MATERIAL IMPACT / AI RISK ASSESSMENT</span>
          </h2>
        </div>

        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.bg}`}>
          <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
          <span>{badge.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {/* Risk Summary */}
        <div className="bg-slate-50/75 rounded-lg border border-slate-200/80 p-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Hazard & Clinical Impact Analysis</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {assessment.risk_summary || "Awaiting complaint details to evaluate health hazard and cGMP regulatory scope."}
          </p>
        </div>

        {/* Suggested Immediate Action */}
        <div className="bg-indigo-50/50 rounded-lg border border-indigo-100/80 p-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-900 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
            <span>Immediate QA Containment Action</span>
          </div>
          <p className="text-xs text-indigo-950 leading-relaxed font-normal">
            {assessment.suggested_action || "Quarantine affected lot and check inventory records upon submission."}
          </p>
        </div>

        {/* Suspected Root Cause & CAPA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Suspected Root Cause
            </span>
            <p className="text-xs text-slate-600 font-medium">
              {assessment.root_cause_recommendation || "Under preliminary evaluation."}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Recommended CAPA Plan
            </span>
            <p className="text-xs text-slate-600 font-medium">
              {assessment.capa_recommendation || "Pending QA deviation investigation."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
