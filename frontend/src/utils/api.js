import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 35000,
});

API.interceptors.response.use(
  r => r.data,
  err => { throw new Error(err.response?.data?.detail || err.message || 'Request failed'); }
);

export const analyzeContent = (payload) => API.post('/analyze/', payload);
export const getAISuggestions = (analysis, content_snippet = '') =>
  API.post('/analyze/ai-suggestions', { analysis, content_snippet });
export const getKeywords = (content_snippet, keyword = '') =>
  API.post('/analyze/keywords', { content_snippet, keyword });
export const comparePages = (payload) => API.post('/compare/', payload);
