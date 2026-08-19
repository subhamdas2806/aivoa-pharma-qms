import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { FileDropZone } from './FileDropZone';
import { SampleDataSelector } from './SampleDataSelector';
import { addMessage, mergeFormState, setLoading } from '../../store/complaintSlice';
import { api } from '../../services/api';

export const CopilotChat: React.FC = () => {
  const dispatch = useDispatch();
  const { currentComplaint, chatHistory, isLoading } = useSelector(
    (state: RootState) => state.complaint
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    dispatch(addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp
    }));

    try {
      dispatch(setLoading(true));
      const res = await api.sendMessage(text, currentComplaint, chatHistory);

      if (res.updated_state) {
        dispatch(mergeFormState(res.updated_state));
      }

      dispatch(addMessage({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply || "Updated the form with extracted details.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedFields: Object.keys(res.extracted_fields || {})
      }));
    } catch (err: any) {
      dispatch(addMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "Error: " + (err.response?.data?.detail || "Could not connect to backend server."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFileUpload = async (file: File) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    dispatch(addMessage({
      id: `upload-${Date.now()}`,
      role: 'user',
      content: `Uploaded file: ${file.name}`,
      document_name: file.name,
      timestamp
    }));

    try {
      dispatch(setLoading(true));
      const res = await api.uploadDocument(file, currentComplaint);

      if (res.updated_state) {
        dispatch(mergeFormState(res.updated_state));
      }

      dispatch(addMessage({
        id: `ai-doc-${Date.now()}`,
        role: 'assistant',
        content: res.reply || `Processed ${file.name} and populated form.`,
        document_name: file.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedFields: Object.keys(res.extracted_fields || {})
      }));
    } catch (err: any) {
      dispatch(addMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "File processing error: " + (err.response?.data?.detail || err.message),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Assistant &amp; Intake Stream
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Drop reports or write complaint text</p>
        </div>
      </div>

      {/* Chat Conversation Stream & Drop Zone */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        <FileDropZone onFileUpload={handleFileUpload} disabled={isLoading} />
        <SampleDataSelector onSelectSample={handleSendMessage} disabled={isLoading} />

        <div className="pt-2">
          {chatHistory.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 my-3 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-slate-500 font-medium">Extracting information...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        disabled={isLoading}
      />
    </div>
  );
};
