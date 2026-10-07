import express from 'express';
import { askBuddyHandler } from '../controllers/aiController.js';
import { validateAiAsk } from '../middleware/validator.js';

const router = express.Router();

// POST /api/ai/ask
router.post('/ask', validateAiAsk, askBuddyHandler);

export default router;
