import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { FileDropZone } from './FileDropZone';
import { SampleDataSelector } from './SampleDataSelector';
import { addMessage, mergeFormState, setLoading } from '../../store/complaintSlice';
import { api } from '../../services/api';
import { Bot } from 'lucide-react';

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
    
    // Add user message to UI
    dispatch(addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp
    }));

    try {
      dispatch(setLoading(true));
      const res = await api.sendMessage(text, currentComplaint, chatHistory);

      // Seamlessly merge the updated fields into the left form
      if (res.updated_state) {
        dispatch(mergeFormState(res.updated_state));
      }

      // Add assistant response to UI
      dispatch(addMessage({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply || "Extracted details and updated form fields.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedFields: Object.keys(res.extracted_fields || {})
      }));
    } catch (err: any) {
      dispatch(addMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "⚠️ " + (err.response?.data?.detail || "Could not connect to LangGraph backend. Ensure the FastAPI server is active."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFileUpload = async (file: File) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add file upload event as user bubble with document preview
    dispatch(addMessage({
      id: `upload-${Date.now()}`,
      role: 'user',
      content: `Uploaded complaint report for automated parsing.`,
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
        content: res.reply || `Extracted parameters from ${file.name} and mapped to QMS form.`,
        document_name: file.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedFields: Object.keys(res.extracted_fields || {})
      }));
    } catch (err: any) {
      dispatch(addMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "⚠️ Failed to parse document: " + (err.response?.data?.detail || err.message),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xs">
      {/* Top Bar matching reference specs */}
      <div className="px-5 py-3.5 border-b border-slate-200/90 flex items-center justify-between bg-white">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">AIVOA Copilot</h3>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Agent</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Drop complaint files or paste text below
          </p>
        </div>

        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
          <Bot className="w-4 h-4" />
        </div>
      </div>

      {/* Chat Conversation Stream & Drop Zone */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
        <FileDropZone onFileUpload={handleFileUpload} disabled={isLoading} />
        <SampleDataSelector onSelectSample={handleSendMessage} disabled={isLoading} />

        <div className="pt-2">
          {chatHistory.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-start space-x-2.5 my-3.5">
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center space-x-2 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium text-slate-500 ml-1">Extracting batch parameters & GMP risk...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Chat Input Bar */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        disabled={isLoading}
      />
    </div>
  );
};
