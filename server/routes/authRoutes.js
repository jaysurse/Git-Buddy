import express from 'express';
import { registerHandler, loginHandler, meHandler } from '../controllers/authController.js';
import { requireAuth, validateRegister, validateLogin } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', validateRegister, registerHandler);

// POST /api/auth/login
router.post('/login', validateLogin, loginHandler);

// GET /api/auth/me
router.get('/me', requireAuth, meHandler);

export default router;
