import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '';

// Smart Fallback Logic
let finalBaseURL = rawBaseURL;

if (!finalBaseURL) {
  // If no env var, try to infer from current URL
  // Example: if frontend is slms-frontend.onrender.com, try slms-backend.onrender.com
  const currentHost = window.location.hostname;
  if (currentHost.includes('onrender.com')) {
    const baseName = currentHost.split('.')[0].replace('-frontend', '');
    finalBaseURL = `https://${baseName}-backend.onrender.com`;
    console.log("Inferring API URL:", finalBaseURL);
  } else {
    finalBaseURL = 'http://localhost:8080';
  }
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

export default api;
