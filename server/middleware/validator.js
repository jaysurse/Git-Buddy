/**
 * Request validation middlewares.
 * Ensures URLs are strictly github.com repositories, inputs are sanitized, and sizes are bounded.
 */

export function validateRepositoryUrl(req, res, next) {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'A valid GitHub repository URL or "owner/repo" string is required.',
      },
    });
  }

  const trimmed = url.trim();

  // Handle formats:
  // 1. https://github.com/owner/repo
  // 2. http://github.com/owner/repo
  // 3. github.com/owner/repo
  // 4. owner/repo
  let cleanPath = trimmed;

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    try {
      const parsedUrl = new URL(cleanPath);
      if (parsedUrl.hostname !== 'github.com' && parsedUrl.hostname !== 'www.github.com') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'UNSUPPORTED_HOST',
            message: 'Only public repositories on github.com are supported.',
          },
        });
      }
      cleanPath = parsedUrl.pathname.replace(/^\/+/, '');
    } catch {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MALFORMED_URL',
          message: 'Malformed URL provided. Please provide a valid GitHub repository URL.',
        },
      });
    }
  } else if (cleanPath.startsWith('github.com/')) {
    cleanPath = cleanPath.replace(/^github\.com\//, '');
  }

  // Remove .git suffix and trailing slashes
  cleanPath = cleanPath.replace(/\.git$/, '').replace(/\/+$/, '');

  const parts = cleanPath.split('/').filter(Boolean);
  if (parts.length < 2) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REPO_PATH',
        message: 'Please provide a valid repository URL in the format: https://github.com/owner/repo',
      },
    });
  }

  const [owner, repo] = parts;

  // Basic regex validation for GitHub usernames and repo names
  const validNameRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!validNameRegex.test(owner) || !validNameRegex.test(repo)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CHARACTERS',
        message: 'Owner and repository name contain invalid characters.',
      },
    });
  }

  req.repoInfo = {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    normalizedUrl: `https://github.com/${owner}/${repo}`,
  };

  next();
}

export function validateAiAsk(req, res, next) {
  const { question, repositoryContext } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'EMPTY_QUESTION',
        message: 'Please provide a non-empty question for Buddy.',
      },
    });
  }

  if (question.length > 500) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'QUESTION_TOO_LONG',
        message: 'Question exceeds maximum length of 500 characters.',
      },
    });
  }

  if (!repositoryContext || typeof repositoryContext !== 'object') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_CONTEXT',
        message: 'Repository context is required to ground the answer.',
      },
    });
  }

  next();
}

export function validateGitError(req, res, next) {
  const { error } = req.body;

  if (!error || typeof error !== 'string' || error.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'EMPTY_ERROR_MESSAGE',
        message: 'Please provide a Git error message to diagnose.',
      },
    });
  }

  if (error.length > 2000) {
    req.body.error = error.slice(0, 2000);
  }

  next();
}
