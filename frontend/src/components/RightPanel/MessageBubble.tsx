import React from 'react';
import { Bot, User, Check, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../../types/complaint';
import { PdfPreviewCard } from './PdfPreviewCard';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex items-center justify-center my-3">
        <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium px-3 py-1 rounded-full shadow-2xs">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-2.5 my-3.5 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-indigo-600 border border-slate-200'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-indigo-600" />}
      </div>

      {/* Message Content Container */}
      <div className={`max-w-[85%] space-y-2`}>
        {/* PDF Attachment preview if attached */}
        {message.document_name && (
          <PdfPreviewCard fileName={message.document_name} />
        )}

        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs leading-relaxed font-normal ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-xs font-medium'
              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
          }`}
        >
          {/* AI Header Badge if assistant card */}
          {!isUser && (
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-600 pb-1.5 mb-1.5 border-b border-slate-100">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>AIVOA QMS Copilot</span>
            </div>
          )}

          <p className="whitespace-pre-wrap">{message.content}</p>

          <div className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
            <span>{message.timestamp}</span>
            {isUser && <Check className="w-2.5 h-2.5" />}
          </div>
        </div>
      </div>
    </div>
  );
};
