import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface FormFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  isTextArea?: boolean;
  rows?: number;
  badge?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  placeholder = "Awaiting AI extraction...",
  isTextArea = false,
  rows = 3,
  badge
}) => {
  const isPopulated = Boolean(value && value.trim().length > 0);

  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <span>{label}</span>
          {badge && (
            <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.2 rounded">
              {badge}
            </span>
          )}
        </label>
        {isPopulated && (
          <span className="flex items-center space-x-1 text-[11px] font-medium text-emerald-600">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>AI Populated</span>
          </span>
        )}
      </div>

      <div className="relative">
        {isTextArea ? (
          <textarea
            readOnly
            rows={rows}
            value={value || ""}
            placeholder={placeholder}
            className={`w-full text-xs sm:text-sm px-3 py-2 rounded-lg border transition-all resize-none outline-none font-medium ${
              isPopulated
                ? "bg-white text-slate-900 border-slate-300 shadow-xs ring-1 ring-slate-200/50"
                : "bg-slate-50/80 text-slate-400 border-slate-200 italic"
            }`}
          />
        ) : (
          <input
            type="text"
            readOnly
            value={value || ""}
            placeholder={placeholder}
            className={`w-full text-xs sm:text-sm px-3 py-2 rounded-lg border transition-all outline-none font-medium truncate ${
              isPopulated
                ? "bg-white text-slate-900 border-slate-300 shadow-xs ring-1 ring-slate-200/50"
                : "bg-slate-50/80 text-slate-400 border-slate-200 italic"
            }`}
          />
        )}
      </div>
    </div>
  );
};
