// src/services/messages.js
import axios from '../api/axiosInstance';

export const sendMessage = (payload) => axios.post('/api/messages', payload).then(r => r.data);
export const getConversation = (peerId) => axios.get('/api/messages', { params: { peer: peerId } }).then(r => r.data);
