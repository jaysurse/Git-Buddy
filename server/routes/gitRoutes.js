import express from 'express';
import { getGitCommandsHandler, explainGitErrorHandler } from '../controllers/gitController.js';
import { validateGitError } from '../middleware/validator.js';

const router = express.Router();

// GET /api/git/commands
router.get('/commands', getGitCommandsHandler);

// POST /api/git/explain-error
router.post('/explain-error', validateGitError, explainGitErrorHandler);

export default router;
