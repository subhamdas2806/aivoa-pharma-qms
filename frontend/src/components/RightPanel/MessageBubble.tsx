import React from 'react';
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
      <div className="flex items-center justify-center my-2">
        <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-1 my-3 ${isUser ? 'items-end' : 'items-start'}`}>
      {/* PDF Attachment preview if attached */}
      {message.document_name && (
        <div className="max-w-[85%] mb-1">
          <PdfPreviewCard fileName={message.document_name} />
        </div>
      )}

      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
          isUser
            ? 'bg-slate-900 text-white rounded-br-xs'
            : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>

      <span className="text-[10px] text-slate-400 px-1">
        {message.timestamp}
      </span>
    </div>
  );
};
