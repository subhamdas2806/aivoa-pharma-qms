import React from 'react';
import { FileText } from 'lucide-react';

interface PdfPreviewCardProps {
  fileName: string;
}

export const PdfPreviewCard: React.FC<PdfPreviewCardProps> = ({ fileName }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center space-x-2.5">
      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
      <span className="text-xs font-medium text-slate-700 truncate">{fileName}</span>
    </div>
  );
};
