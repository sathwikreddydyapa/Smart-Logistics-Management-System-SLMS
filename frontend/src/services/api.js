import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '';

// Smart Auto-Identity Logic: Infer backend address from current frontend address
const currentHost = window.location.hostname;
let finalBaseURL = rawBaseURL;

if (currentHost.includes('onrender.com')) {
  // If we are on Render, try to find the backend brother service
  // e.g. if we are on sathwik-slms-frontend.onrender.com, use sathwik-slms-backend.onrender.com
  const baseName = currentHost.split('.')[0].replace('-frontend', '');
  finalBaseURL = `https://${baseName}-backend.onrender.com`;
  console.log("Auto-Identity Inferred API URL:", finalBaseURL);
} 

if (!finalBaseURL) {
  finalBaseURL = 'http://localhost:8080';
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
