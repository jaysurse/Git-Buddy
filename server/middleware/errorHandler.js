/**
 * Centralized Express Error Handling Middleware.
 * Provides clean, user-friendly error messages and prevents leaking stack traces to clients.
 */
export function errorHandler(err, req, res, next) {
  // Log technical error details on server for debugging
  console.error(`[Error] ${req.method} ${req.url} ->`, err.message || err);
  if (err.stack) {
    console.error(err.stack);
  }

  // Determine status code
  let statusCode = err.statusCode || res.statusCode;
  if (statusCode === 200 || !statusCode) {
    statusCode = 500;
  }

  let message = err.message || 'An unexpected server error occurred.';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle Axios / GitHub API specific errors
  if (err.isAxiosError && err.response) {
    const ghStatus = err.response.status;
    const ghData = err.response.data;

    if (ghStatus === 404) {
      statusCode = 404;
      message = 'GitHub repository not found or is private.';
      code = 'REPO_NOT_FOUND';
    } else if (ghStatus === 403) {
      if (ghData && ghData.message && ghData.message.includes('rate limit')) {
        statusCode = 429;
        message = 'GitHub API rate limit reached (60 req/hr for unauthenticated requests). You can configure a GITHUB_TOKEN in the server .env or try again in a few minutes.';
        code = 'RATE_LIMIT_EXCEEDED';
      } else {
        statusCode = 403;
        message = 'Access forbidden by GitHub. The repository may be private or token has insufficient permissions.';
        code = 'FORBIDDEN';
      }
    } else if (ghStatus === 401) {
      statusCode = 401;
      message = 'GitHub authentication failed. Please verify your GITHUB_TOKEN.';
      code = 'UNAUTHORIZED';
    } else if (ghStatus >= 500) {
      statusCode = 502;
      message = 'GitHub API is currently unreachable or experiencing issues. Please try again shortly.';
      code = 'GITHUB_UNAVAILABLE';
    }
  } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    statusCode = 504;
    message = 'Request timed out while connecting to GitHub API.';
    code = 'GATEWAY_TIMEOUT';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: err.details || undefined,
    },
  });
}
