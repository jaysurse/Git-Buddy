import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';

// Load .env from root or server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to local server/.env

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 GitHub Buddy API running on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 GitHub Token: ${process.env.GITHUB_TOKEN ? 'Configured (5,000 req/hr)' : 'None (60 req/hr public limit)'}`);
  console.log(`🤖 LLM Provider: ${process.env.GEMINI_API_KEY || process.env.LLM_API_KEY ? 'Gemini API' : process.env.OPENAI_API_KEY ? 'OpenAI API' : 'Grounded Deterministic Engine'}`);
  console.log(`========================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
