import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

interface PdfPreviewCardProps {
  fileName: string;
  onView?: () => void;
}

export const PdfPreviewCard: React.FC<PdfPreviewCardProps> = ({ fileName }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex items-center justify-between space-x-3 transition-all hover:border-slate-300">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <h4 className="text-xs font-bold text-slate-800 truncate">{fileName}</h4>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-slate-200">
              PDF Document
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Extracted by LangGraph</span>
          </p>
        </div>
      </div>
    </div>
  );
};
