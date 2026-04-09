import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Robust logic: Ensure protocol (https://) and suffix (/api) are present
let finalBaseURL = rawBaseURL;

if (!finalBaseURL.startsWith('http')) {
  finalBaseURL = `https://${finalBaseURL}`;
}

if (!finalBaseURL.endsWith('/api')) {
  // Only add /api if it doesn't already look like specialized URL
  if (!finalBaseURL.includes('/api/')) {
    finalBaseURL = finalBaseURL.replace(/\/$/, '') + '/api';
  }
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
