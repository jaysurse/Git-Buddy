import axios from 'axios';
import { isSensitiveFile, sanitizeContent } from '../utils/secretFilter.js';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Creates an Axios instance pre-configured for GitHub REST API v3
 */
function getGitHubClient(userToken) {
  const token = userToken || process.env.GITHUB_TOKEN;
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Buddy-Analyzer/1.0',
  };

  if (token && token.trim().length > 0) {
    headers.Authorization = `token ${token.trim()}`;
  }

  return axios.create({
    baseURL: GITHUB_API_BASE,
    headers,
    timeout: 15000,
  });
}

/**
 * Fetches repository metadata from GitHub REST API
 */
export async function fetchRepositoryMetadata(owner, repo, token) {
  const client = getGitHubClient(token);
  const response = await client.get(`/repos/${owner}/${repo}`);
  const data = response.data;

  return {
    id: data.id,
    name: data.name,
    full_name: data.full_name,
    owner: {
      login: data.owner?.login,
      avatar_url: data.owner?.avatar_url,
      html_url: data.owner?.html_url,
      type: data.owner?.type,
    },
    description: data.description || 'No description provided.',
    html_url: data.html_url,
    homepage: data.homepage || null,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    open_issues: data.open_issues_count,
    default_branch: data.default_branch || 'main',
    license: data.license ? { key: data.license.key, name: data.license.name } : null,
    is_private: data.private,
    is_fork: data.fork,
    is_archived: data.archived,
    topics: data.topics || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
    pushed_at: data.pushed_at,
    size_kb: data.size,
  };
}

/**
 * Fetches recursive git tree using GitHub Git Trees API
 */
export async function fetchRepositoryTree(owner, repo, branch = 'main', token) {
  const client = getGitHubClient(token);
  const response = await client.get(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  const data = response.data;

  return {
    sha: data.sha,
    truncated: Boolean(data.truncated),
    items: (data.tree || []).map((item) => ({
      path: item.path,
      type: item.type === 'tree' ? 'folder' : 'file',
      sha: item.sha,
      size: item.size || 0,
      mode: item.mode,
    })),
  };
}

/**
 * Fetches language byte distribution from GitHub API
 */
export async function fetchLanguages(owner, repo, token) {
  try {
    const client = getGitHubClient(token);
    const response = await client.get(`/repos/${owner}/${repo}/languages`);
    const languagesMap = response.data || {};

    const totalBytes = Object.values(languagesMap).reduce((sum, bytes) => sum + bytes, 0);
    const languages = Object.entries(languagesMap).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: totalBytes > 0 ? Number(((bytes / totalBytes) * 100).toFixed(1)) : 0,
    }));

    languages.sort((a, b) => b.bytes - a.bytes);
    return languages;
  } catch (error) {
    console.warn(`[GitHubService] Could not fetch languages for ${owner}/${repo}:`, error.message);
    return [];
  }
}

/**
 * Fetches raw file content safely (e.g. package.json, README.md, manifest files)
 * Never reads sensitive files like .env or private keys.
 */
export async function fetchFileContent(owner, repo, filePath, branch = 'main', token) {
  if (!filePath || isSensitiveFile(filePath)) {
    throw new Error('Access to sensitive or secret configuration files is forbidden.');
  }

  const client = getGitHubClient(token);

  try {
    const response = await client.get(`/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
      },
      responseType: 'text',
      maxContentLength: 1024 * 500, // 500 KB limit for preview
    });

    const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    return sanitizeContent(content);
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Fetches repository README.md if available
 */
export async function fetchReadme(owner, repo, token) {
  try {
    const client = getGitHubClient(token);
    const response = await client.get(`/repos/${owner}/${repo}/readme`, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
      },
      responseType: 'text',
      maxContentLength: 1024 * 200, // 200 KB
    });

    const raw = typeof response.data === 'string' ? response.data : '';
    return sanitizeContent(raw);
  } catch {
    return null;
  }
}
