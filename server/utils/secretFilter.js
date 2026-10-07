/**
 * Utility to filter sensitive files and sanitize code content.
 * Guarantees secrets, private keys, and credentials are never exposed to the client or LLM.
 */

const SENSITIVE_FILE_PATTERNS = [
  /^\.env(\..+)?$/i,
  /\.pem$/i,
  /\.key$/i,
  /\.pfx$/i,
  /\.p12$/i,
  /id_rsa/i,
  /id_ecdsa/i,
  /id_ed25519/i,
  /credentials\.json$/i,
  /service-account.*\.json$/i,
  /secret(s)?\.(json|yaml|yml)$/i,
  /\.htpasswd$/i,
  /passwd$/i,
  /shadow$/i,
  /\.keystore$/i,
];

const SECRET_PATTERNS = [
  // Generic API keys and tokens
  /(?:api[_-]?key|secret|token|password|auth[_-]?token|access[_-]?token)["']?\s*[:=]\s*["']?([A-Za-z0-9_\-\.]{12,})["']?/gi,
  // GitHub Personal Access Tokens
  /gh[pousr]_[A-Za-z0-9_]{36,}/g,
  // AWS Access Key ID
  /AKIA[0-9A-Z]{16}/g,
  // Private Key Headers
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g,
  // JWT tokens
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
];

/**
 * Checks if a filename or path matches known sensitive patterns.
 */
export function isSensitiveFile(filePath) {
  if (!filePath) return false;
  const fileName = filePath.split('/').pop();
  return SENSITIVE_FILE_PATTERNS.some((pattern) => pattern.test(fileName) || pattern.test(filePath));
}

/**
 * Sanitizes text content by replacing detected secrets with [REDACTED].
 */
export function sanitizeContent(content) {
  if (!content || typeof content !== 'string') return '';
  let sanitized = content;
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => {
      if (match.includes('PRIVATE KEY')) {
        return '[REDACTED_PRIVATE_KEY]';
      }
      return match.replace(/([:=]\s*["']?)([^"'\s]+)(["']?)/, '$1[REDACTED_SECRET]$3');
    });
  }
  return sanitized;
}
