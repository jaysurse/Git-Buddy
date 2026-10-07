import { useState, useEffect, useCallback } from 'react';
import repositoryService from '../services/repositoryService.js';

export function useRepository(owner, repo) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRepo = useCallback(async (isRefresh = false) => {
    if (!owner || !repo) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (isRefresh) {
        result = await repositoryService.analyzeRepository(`https://github.com/${owner}/${repo}`, true);
      } else {
        result = await repositoryService.getRepository(owner, repo);
      }
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load repository data.');
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchRepo(false);
  }, [fetchRepo]);

  const refresh = () => fetchRepo(true);

  return {
    data,
    loading,
    error,
    refresh,
    setData,
  };
}

export default useRepository;
