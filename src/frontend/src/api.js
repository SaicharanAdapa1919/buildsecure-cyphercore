import axios from 'axios';

// When deployed on Vercel together, default to relative '/api'
const defaultBaseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? '/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

export default api;
