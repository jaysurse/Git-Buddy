import { registerUser, loginUser, createToken, toPublicUser } from '../services/authService.js';

/** POST /api/auth/register */
export function registerHandler(req, res, next) {
  try {
    const user = registerUser(req.body);
    res.status(201).json({ success: true, data: { user: toPublicUser(user), token: createToken(user) } });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: { code: err.code, message: err.message } });
    }
    next(err);
  }
}

/** POST /api/auth/login */
export function loginHandler(req, res, next) {
  try {
    const user = loginUser(req.body);
    res.json({ success: true, data: { user: toPublicUser(user), token: createToken(user) } });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: { code: err.code, message: err.message } });
    }
    next(err);
  }
}

/** GET /api/auth/me */
export function meHandler(req, res) {
  res.json({ success: true, data: { user: toPublicUser(req.user) } });
}
