import api from './api.js';

// Client-side cache to make tab switching and back navigation instantaneous
const clientRepoCache = new Map();

export const repositoryService = {
  /**
   * Check backend server health
   */
  async checkHealth() {
    return api.get('/health');
  },

  /**
   * Analyze a repository from URL or shorthand
   */
  async analyzeRepository(url, refresh = false) {
    const response = await api.post('/repository/analyze', { url, refresh });
    if (response?.data?.repository?.full_name) {
      const key = response.data.repository.full_name.toLowerCase();
      clientRepoCache.set(key, response.data);
      sessionStorage.setItem(`repo_${key}`, JSON.stringify(response.data));
    }
    return response.data;
  },

  /**
   * Get cached or fresh repository analysis by owner and repo
   */
  async getRepository(owner, repo) {
    const key = `${owner}/${repo}`.toLowerCase();

    // Check in-memory cache first
    if (clientRepoCache.has(key)) {
      return clientRepoCache.get(key);
    }

    // Check session storage
    const stored = sessionStorage.getItem(`repo_${key}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        clientRepoCache.set(key, parsed);
        return parsed;
      } catch {
        // ignore parse error
      }
    }

    // Fetch from backend
    const response = await api.get(`/repository/${owner}/${repo}`);
    if (response?.data) {
      clientRepoCache.set(key, response.data);
      sessionStorage.setItem(`repo_${key}`, JSON.stringify(response.data));
    }
    return response.data;
  },

  /**
   * Safely fetch file preview content
   */
  async getFilePreview(owner, repo, path, branch = 'main') {
    const response = await api.get(`/repository/${owner}/${repo}/file`, {
      params: { path, branch },
    });
    return response.data;
  },
};

export default repositoryService;
