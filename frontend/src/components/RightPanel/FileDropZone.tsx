import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileDropZoneProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileUpload, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.type.includes('text')) {
        onFileUpload(file);
      } else {
        alert('Please upload a PDF document or text file.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/50 rounded-xl p-3.5 text-center cursor-pointer transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept=".pdf,.txt"
        className="hidden"
        disabled={disabled}
      />
      <div className="flex items-center justify-center space-x-2 text-slate-600">
        <Upload className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-medium text-slate-700">Upload PDF report</span>
        <span className="text-xs text-slate-400">or drop here</span>
      </div>
    </div>
  );
};
