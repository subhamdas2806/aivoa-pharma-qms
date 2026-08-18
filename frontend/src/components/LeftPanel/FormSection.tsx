import React from 'react';

interface FormSectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ number, title, children }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
      <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-100">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
          {number}
        </span>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {title}
        </h2>
      </div>
      <div className="space-y-3.5">
        {children}
      </div>
    </div>
  );
};
