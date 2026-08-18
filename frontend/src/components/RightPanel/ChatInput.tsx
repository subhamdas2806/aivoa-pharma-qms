import React, { useState, useRef } from 'react';
import { Send, Paperclip, Sparkles } from 'lucide-react';

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
    <div className="bg-white border-t border-slate-200/90 p-3 sm:p-4 space-y-2">
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
          className="absolute left-2.5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          title="Attach PDF complaint report"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask Copilot, type complaint details or paste text..."
          disabled={disabled}
          className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
        />

        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Mandatory LangGraph Footer Credit */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5">
        <span className="flex items-center space-x-1 font-mono tracking-wider font-semibold text-slate-500">
          <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
          <span>POWERED BY LANGGRAPH & GROQ</span>
        </span>
        <span>GMP QA Intelligence</span>
      </div>
    </div>
  );
};
