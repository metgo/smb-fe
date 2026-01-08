import axios from 'axios';
import { envKeys } from './envKeys';

const axiosInstance = axios.create({
  baseURL: envKeys.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Attach Bearer token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      const token = userData ? JSON.parse(userData)?.accessToken : null;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
