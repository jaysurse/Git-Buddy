import api from './api.js';

const TOKEN_KEY = 'gb_auth_token';
const USER_KEY = 'gb_auth_user';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const authService = {
  getStoredToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  getStoredUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  saveSession(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch { /* storage unavailable */ }
  },
  clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch { /* storage unavailable */ }
  },
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data; // { user, token }
  },
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // { user, token }
  },
  async me(token) {
    const response = await api.get('/auth/me', authHeader(token));
    return response.data.user;
  },
};

export default authService;
