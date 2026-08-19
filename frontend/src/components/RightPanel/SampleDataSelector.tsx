import React from 'react';

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
      title: "Amoxicillin 500mg - Capsule Discoloration",
      text: "Customer: Apollo Pharmacy reported that in Batch AMX240602 of Amoxicillin Capsules 500 mg (Mfg: March 2026, Exp: February 2028), 12 capsules showed localized dark black spot discoloration on the gelatin shell upon opening the blister pack. Customer requested batch investigation."
    },
    {
      title: "Metformin HCl API - Assay OOS",
      text: "Received email from ABC Formulations Ltd stating Metformin Hydrochloride API (Batch MFH260712A, Mfg: 01/2026, Exp: 12/2028, Qty: 25 kg in 1 HDPE Drum) failed incoming assay testing at 97.2% against specification 98.5% - 101.0%."
    },
    {
      title: "Paracetamol 650mg - Blister Seal Leakage",
      text: "Field QA report from MedPlus Health Services: 50 strips of Paracetamol Tablets 650mg, Batch PCM241098 (Exp Date: 11/2027) have unsealed blister pockets with air leakage."
    }
  ];

  return (
    <div className="space-y-1.5 pt-1">
      <div className="text-[11px] font-medium text-slate-400 px-1">
        Sample Inputs
      </div>
      <div className="flex flex-col gap-1.5">
        {samples.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSample(s.text)}
            disabled={disabled}
            className="text-left px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            {s.title}
          </button>
        ))}
      </div>
    </div>
  );
};
