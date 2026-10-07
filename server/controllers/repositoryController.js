import { analyzeRepository } from '../services/repositoryAnalyzer.js';
import { fetchFileContent } from '../services/githubService.js';
import { repoCache } from '../utils/cache.js';
import { isSensitiveFile } from '../utils/secretFilter.js';

/**
 * Controller to handle POST /api/repository/analyze
 */
export async function analyzeRepositoryHandler(req, res, next) {
  try {
    const { owner, repo } = req.repoInfo;
    const clientToken = req.headers['x-github-token'] || req.body.githubToken || null;
    const cacheKey = `${owner.toLowerCase()}/${repo.toLowerCase()}`;

    // Check cache unless refresh is explicitly requested
    if (!req.body.refresh && repoCache.has(cacheKey)) {
      const cached = repoCache.get(cacheKey);
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // Perform live analysis
    const analysis = await analyzeRepository(owner, repo, clientToken);

    // Cache the result
    repoCache.set(cacheKey, analysis);

    res.json({
      success: true,
      source: 'live',
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to handle GET /api/repository/:owner/:repo
 */
export async function getRepositoryHandler(req, res, next) {
  try {
    const { owner, repo } = req.params;
    const clientToken = req.headers['x-github-token'] || null;
    const cacheKey = `${owner.toLowerCase()}/${repo.toLowerCase()}`;

    if (repoCache.has(cacheKey)) {
      return res.json({
        success: true,
        source: 'cache',
        data: repoCache.get(cacheKey),
      });
    }

    const analysis = await analyzeRepository(owner, repo, clientToken);
    repoCache.set(cacheKey, analysis);

    res.json({
      success: true,
      source: 'live',
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to safely preview important files
 * GET /api/repository/:owner/:repo/file?path=...
 */
export async function getFilePreviewHandler(req, res, next) {
  try {
    const { owner, repo } = req.params;
    const filePath = req.query.path;
    const branch = req.query.branch || 'main';
    const clientToken = req.headers['x-github-token'] || null;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PATH', message: 'Query parameter "path" is required.' },
      });
    }

    if (isSensitiveFile(filePath)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN_FILE', message: 'Preview of sensitive or secret files is blocked.' },
      });
    }

    const content = await fetchFileContent(owner, repo, filePath, branch, clientToken);

    if (content === null) {
      return res.status(404).json({
        success: false,
        error: { code: 'FILE_NOT_FOUND', message: 'File not found in repository.' },
      });
    }

    res.json({
      success: true,
      data: {
        path: filePath,
        fileName: filePath.split('/').pop(),
        content,
      },
    });
  } catch (error) {
    next(error);
  }
}
