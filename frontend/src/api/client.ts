/// <reference types="vite/client" />
import axios from 'axios';

// Use relative /api URL for production, or VITE_API_URL if defined
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? '/api'  // Production: always use relative /api
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');  // Development

console.log('[API Client] Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
