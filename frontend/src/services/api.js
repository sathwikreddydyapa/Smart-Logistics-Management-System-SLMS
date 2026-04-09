import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'https://smart-logistics-management-system-slms-2.onrender.com';

// Direct Override for SLMS production
let finalBaseURL = rawBaseURL;

if (window.location.hostname.includes('onrender.com')) {
  // Always prioritize the confirmed backend URL provided by the user
  finalBaseURL = 'https://smart-logistics-management-system-slms-2.onrender.com';
}

// Ensure protocol and remove trailing slash
if (finalBaseURL && !finalBaseURL.startsWith('http')) {
  finalBaseURL = `https://${finalBaseURL}`;
}

if (finalBaseURL) {
  finalBaseURL = finalBaseURL.replace(/\/$/, '');
}

const api = axios.create({
  baseURL: finalBaseURL,
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.token) {
      config.headers['Authorization'] = 'Bearer ' + user.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getBaseURL = () => api.defaults.baseURL;

export default api;
