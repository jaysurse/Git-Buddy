import { verifyToken, findUserById } from '../services/authService.js';

/**
 * Requires a valid "Authorization: Bearer <token>" header.
 * Attaches the authenticated user to req.user.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  const payload = verifyToken(token);
  const user = payload ? findUserById(payload.sub) : null;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Please log in to continue. Your session may have expired.' },
    });
  }

  req.user = user;
  next();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function badRequest(res, message) {
  return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message } });
}

export function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
    return badRequest(res, 'Please enter your name (2–60 characters).');
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return badRequest(res, 'Please enter a valid email address.');
  }
  if (!password || typeof password !== 'string' || password.length < 6 || password.length > 128) {
    return badRequest(res, 'Password must be at least 6 characters long.');
  }
  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return badRequest(res, 'Email and password are required.');
  }
  next();
}
