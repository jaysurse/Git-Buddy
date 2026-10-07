import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'GitHub Buddy API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
