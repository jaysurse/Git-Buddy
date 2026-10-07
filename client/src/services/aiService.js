import api from './api.js';

export const aiService = {
  /**
   * Ask Buddy a question about the repository
   * @param {string} question
   * @param {object} repositoryContext
   */
  async askBuddy(question, repositoryContext) {
    const response = await api.post('/ai/ask', {
      question,
      repositoryContext: {
        repository: repositoryContext.repository,
        techStack: repositoryContext.techStack,
        architecture: repositoryContext.architecture,
        importantFiles: repositoryContext.importantFiles,
        readmeSnippet: repositoryContext.readmeSnippet,
      },
    });
    return response.data;
  },
};

export default aiService;
