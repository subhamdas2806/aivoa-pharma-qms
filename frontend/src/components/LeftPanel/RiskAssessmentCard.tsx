import React from 'react';
import type { RiskAssessment } from '../../types/complaint';

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
  onChange?: (field: keyof RiskAssessment, val: any) => void;
}

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ assessment, onChange }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
            Risk &amp; CAPA Assessment
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Quality assessment and suggested follow-up actions</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500">Severity:</span>
          <select
            value={assessment.severity}
            onChange={(e) => onChange && onChange('severity', e.target.value)}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none cursor-pointer focus:border-slate-400"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">
            Risk Summary
          </label>
          <textarea
            rows={2}
            value={assessment.risk_summary || ""}
            onChange={(e) => onChange && onChange('risk_summary', e.target.value)}
            placeholder="Overview of the potential risk..."
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">
            Immediate Containment Action
          </label>
          <textarea
            rows={2}
            value={assessment.suggested_action || ""}
            onChange={(e) => onChange && onChange('suggested_action', e.target.value)}
            placeholder="Immediate actions taken or required..."
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Suspected Root Cause
            </label>
            <textarea
              rows={2}
              value={assessment.root_cause_recommendation || ""}
              onChange={(e) => onChange && onChange('root_cause_recommendation', e.target.value)}
              placeholder="Suspected root cause..."
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              CAPA Recommendation
            </label>
            <textarea
              rows={2}
              value={assessment.capa_recommendation || ""}
              onChange={(e) => onChange && onChange('capa_recommendation', e.target.value)}
              placeholder="Corrective and preventive action plan..."
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
