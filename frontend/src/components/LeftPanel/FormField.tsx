import React from 'react';

interface FormFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  isTextArea?: boolean;
  rows?: number;
  readOnly?: boolean;
  onChange?: (val: string) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  placeholder = "Empty",
  isTextArea = false,
  rows = 3,
  readOnly = false,
  onChange
}) => {
  return (
    <div className="flex flex-col space-y-1.5">
      <label className="text-xs font-medium text-slate-600">
        {label}
      </label>

      <div>
        {isTextArea ? (
          <textarea
            readOnly={readOnly}
            rows={rows}
            value={value || ""}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all resize-none"
          />
        ) : (
          <input
            type="text"
            readOnly={readOnly}
            value={value || ""}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all truncate"
          />
        )}
      </div>
    </div>
  );
};
