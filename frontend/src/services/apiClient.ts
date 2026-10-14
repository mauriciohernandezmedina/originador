import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const DEFAULT_API_KEY = 'originador-llm-secret-key-2026';
const API_KEY_STORAGE_KEY = 'originador_api_key';

export const getStoredApiKey = (): string => {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || DEFAULT_API_KEY;
};

export const setStoredApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 8000, // 8 seconds timeout as specified
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Injects X-API-Key automatically
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const apiKey = getStoredApiKey();
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handles 401 Unauthorized, Timeouts, and formatted errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      console.warn('API Error 401: Clave de API no válida o ausente.');
      window.dispatchEvent(new CustomEvent('originador:unauthorized'));
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('API Error: Tiempo de espera agotado (timeout de 8s).');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
