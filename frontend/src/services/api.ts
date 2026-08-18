import axios from 'axios';
import type { ComplaintData, ChatMessage } from '../types/complaint';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  async sendMessage(message: string, currentState: ComplaintData, history: ChatMessage[]) {
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      document_name: msg.document_name
    }));

    const response = await axios.post(`${API_BASE_URL}/chat`, {
      message,
      current_state: currentState,
      conversation_history: formattedHistory
    });
    return response.data;
  },

  async uploadDocument(file: File, currentState: ComplaintData) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('current_state_json', JSON.stringify(currentState));

    const response = await axios.post(`${API_BASE_URL}/upload-doc`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async commitComplaint(complaint: ComplaintData, history: ChatMessage[]) {
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      document_name: msg.document_name
    }));

    const response = await axios.post(`${API_BASE_URL}/complaints/commit`, {
      complaint,
      conversation_history: formattedHistory
    });
    return response.data;
  },

  async getComplaints() {
    const response = await axios.get(`${API_BASE_URL}/complaints`);
    return response.data;
  }
};
