import React, { useState, useRef } from 'react';
import { ArrowUp, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  disabled
}) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text);
    setText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-4">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.txt"
          className="hidden"
          disabled={disabled}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="absolute left-3 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors disabled:opacity-50"
          title="Upload PDF document"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste complaint correspondence or type details..."
          disabled={disabled}
          className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
        />

        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="absolute right-2 p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="Send"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
