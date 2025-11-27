import axios from 'axios';
import { API_CONFIG } from '../constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Request interceptor to add bypass header to all requests
api.interceptors.request.use(
  (config) => {
    // Ensure bypass headers are always present
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
    // Note: User-Agent header cannot be set in browser environment
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 511 Network Authentication Required
    if (error.response?.status === 511) {
      console.error('Localtunnel authentication required - add bypass header');
    }
    return Promise.reject(error);
  }
);

// Custom fetch wrapper that adds bypass headers
export const apiFetch = async (url, options = {}) => {
  const headers = {
    'Bypass-Tunnel-Reminder': 'true',
    'User-Agent': 'LegendLift-Mobile-App',
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  return fetch(url, config);
};

export default api;
