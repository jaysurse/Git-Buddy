import api from './api.js';

export const gitService = {
  /**
   * Get categorized Git commands or filter by search query
   */
  async getCommands(search = '') {
    const response = await api.get('/git/commands', {
      params: search ? { search } : {},
    });
    return response.data?.categories || [];
  },

  /**
   * Match natural language goal to a Git command
   */
  async matchGoal(goal) {
    const response = await api.get('/git/commands', {
      params: { goal },
    });
    return response.data?.matchedResult || null;
  },

  /**
   * Diagnose and explain a terminal Git error
   */
  async explainError(error) {
    const response = await api.post('/git/explain-error', { error });
    return response.data;
  },
};

export default gitService;
