export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://events-szqw.onrender.com/api';
export const API_HOST = import.meta.env.VITE_API_HOST || 'https://events-szqw.onrender.com';

export const getServerUrl = (path = '') => {
  if (!path) return API_HOST;
  return path.startsWith('http') ? path : `${API_HOST}${path}`;
};

export const GOOGLE_AUTH_URL = `${API_HOST}/api/auth/google`;
