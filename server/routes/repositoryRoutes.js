import express from 'express';
import {
  analyzeRepositoryHandler,
  getRepositoryHandler,
  getFilePreviewHandler,
} from '../controllers/repositoryController.js';
import { validateRepositoryUrl } from '../middleware/validator.js';

const router = express.Router();

// POST /api/repository/analyze
router.post('/analyze', validateRepositoryUrl, analyzeRepositoryHandler);

// GET /api/repository/:owner/:repo/file?path=...
router.get('/:owner/:repo/file', getFilePreviewHandler);

// GET /api/repository/:owner/:repo
router.get('/:owner/:repo', getRepositoryHandler);

export default router;
