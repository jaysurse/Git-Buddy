import axios from 'axios';

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach optional client-provided GitHub token
api.interceptors.request.use((config) => {
  const customToken = sessionStorage.getItem('gh_user_token');
  if (customToken) {
    config.headers['x-github-token'] = customToken.trim();
  }
  return config;
});

// Interceptor to normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred.';
    let code = 'NETWORK_ERROR';

    if (error.response?.data?.error) {
      message = error.response.data.error.message || message;
      code = error.response.data.error.code || code;
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject({
      code,
      message,
      status: error.response?.status,
      original: error,
    });
  }
);

export default api;
