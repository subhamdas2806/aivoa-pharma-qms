import React from 'react';
import { Pill, Sparkles, Beaker, FileSpreadsheet } from 'lucide-react';

interface SampleDataSelectorProps {
  onSelectSample: (text: string) => void;
  disabled?: boolean;
}

export const SampleDataSelector: React.FC<SampleDataSelectorProps> = ({
  onSelectSample,
  disabled
}) => {
  const samples = [
    {
      title: "Amoxicillin 500mg (FDF Discoloration)",
      text: "Customer: Apollo Pharmacy reported that in Batch AMX240602 of Amoxicillin Capsules 500 mg (Mfg: March 2026, Exp: February 2028), 12 capsules showed localized dark black spot discoloration on the gelatin shell upon opening the blister pack. Customer requested batch investigation.",
      tag: "FDF Discoloration",
      icon: Pill
    },
    {
      title: "Metformin HCl API (Assay Out-of-Spec)",
      text: "Received email from ABC Formulations Ltd stating Metformin Hydrochloride API (Batch MFH260712A, Mfg: 01/2026, Exp: 12/2028, Qty: 25 kg in 1 HDPE Drum) failed incoming assay testing at 97.2% against specification 98.5% - 101.0%.",
      tag: "API Quality OOS",
      icon: Beaker
    },
    {
      title: "Paracetamol 650mg (Blister Seal Defect)",
      text: "Field QA report from MedPlus Health Services: 50 strips of Paracetamol Tablets 650mg, Batch PCM241098 (Exp Date: 11/2027) have unsealed blister pockets with air leakage.",
      tag: "Packaging Defect",
      icon: FileSpreadsheet
    }
  ];

  return (
    <div className="space-y-2 py-1">
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
        <span className="flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Quick Demo Presets (Pharma Scenarios):</span>
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {samples.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectSample(s.text)}
              disabled={disabled}
              className="text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 transition-all text-xs flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center space-x-2 truncate">
                <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-700 group-hover:text-indigo-900 truncate">
                  {s.title}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0 ml-2">
                {s.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
