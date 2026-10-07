/**
 * Comprehensive Automated Test Suite for GitHub Buddy
 * Validates error handling, security, API endpoints, and detection services.
 */

import { detectTechStack } from '../services/techDetector.js';
import { analyzeArchitecture } from '../services/architectureAnalyzer.js';
import { buildNestedTree, getImportantFileInfo } from '../services/repositoryAnalyzer.js';
import { isSensitiveFile, sanitizeContent } from '../utils/secretFilter.js';
import { diagnoseGitError, matchNaturalLanguageGoal } from '../services/gitService.js';
import { askBuddy } from '../services/aiService.js';
import app from '../app.js';

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('🧪 Starting GitHub Buddy Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Secret Filter & Sanitizer Tests
  console.log('--- 1. Secret Filter & Sanitizer Tests ---');
  assert(isSensitiveFile('.env') === true, 'Blocks .env file');
  assert(isSensitiveFile('.env.production') === true, 'Blocks .env.production file');
  assert(isSensitiveFile('id_rsa') === true, 'Blocks SSH private key files');
  assert(isSensitiveFile('server.key') === true, 'Blocks SSL .key files');
  assert(isSensitiveFile('package.json') === false, 'Allows package.json');
  assert(isSensitiveFile('src/App.jsx') === false, 'Allows source code files');

  const sampleLeak = 'const token = "ghp_123456789012345678901234567890123456";';
  const sanitized = sanitizeContent(sampleLeak);
  assert(!sanitized.includes('ghp_'), 'Redacts GitHub personal access tokens');

  // 2. Deterministic Tech Detector Tests
  console.log('\n--- 2. Deterministic Tech Detector Tests ---');
  const mockPkgJson = JSON.stringify({
    dependencies: { react: '^18.0.0', express: '^4.18.0', tailwindcss: '^3.0.0' },
  });
  const techDetected = detectTechStack(
    [{ path: 'package.json' }, { path: 'Dockerfile' }, { path: 'tsconfig.json' }],
    { 'package.json': mockPkgJson },
    [{ name: 'TypeScript', bytes: 1000 }]
  );
  assert(techDetected.libraries.includes('React'), 'Detects React from package.json');
  assert(techDetected.frameworks.includes('Express.js'), 'Detects Express.js from package.json');
  assert(techDetected.tools.includes('Tailwind CSS'), 'Detects Tailwind CSS from package.json');
  assert(techDetected.tools.includes('Docker'), 'Detects Docker from tree');
  assert(techDetected.languages.includes('TypeScript'), 'Detects TypeScript language');

  // 3. Architecture Analyzer Tests
  console.log('\n--- 3. Architecture Analyzer Tests ---');
  const mockTree = [
    { path: 'src/components/Button.jsx', type: 'file' },
    { path: 'src/pages/Home.jsx', type: 'file' },
    { path: 'server/routes/api.js', type: 'file' },
    { path: 'server/controllers/user.js', type: 'file' },
    { path: 'server/models/User.js', type: 'file' },
    { path: 'Dockerfile', type: 'file' },
  ];
  const archResult = analyzeArchitecture(mockTree, techDetected);
  const layerNames = archResult.layers.map((l) => l.name);
  assert(layerNames.includes('Frontend / UI'), 'Identifies Frontend UI layer');
  assert(layerNames.includes('Backend / Server'), 'Identifies Backend Server layer');
  assert(layerNames.includes('Data & Storage'), 'Identifies Data & Storage layer');
  assert(layerNames.includes('Config & DevOps'), 'Identifies Config & DevOps layer');
  assert(archResult.graph.nodes.length >= 4, 'Generates valid graph nodes for React Flow');

  // 4. Git Service Tests
  console.log('\n--- 4. Git Assistant & Error Diagnoser Tests ---');
  const goalMatch = matchNaturalLanguageGoal('I want to create a new branch');
  assert(goalMatch.matched === true, 'Matches branch creation goal');
  assert(goalMatch.command.includes('git checkout -b') || goalMatch.command.includes('git switch'), 'Suggests branch creation command');

  const diagResult = diagnoseGitError('fatal: not a git repository (or any of the parent directories): .git');
  assert(diagResult.name === 'Not a Git Repository', 'Diagnoses non-git repo error');
  assert(diagResult.howToFix.length > 0, 'Provides clear fix instructions');

  // 5. Grounded AI Q&A Fallback Tests
  console.log('\n--- 5. Grounded AI Q&A Tests ---');
  const mockContext = {
    repository: { name: 'express', full_name: 'expressjs/express', description: 'Fast Node framework' },
    techStack: { languages: ['JavaScript'], frameworks: ['Express.js'], tools: ['Node.js'] },
    architecture: { layers: [{ name: 'Backend / Server', confidence: 'high', evidence: ['lib/express.js'] }] },
    importantFiles: [{ path: 'index.js', category: 'entrypoint', fileName: 'index.js', purpose: 'Application Entry Point' }],
  };
  const aiResult = await askBuddy('Where does the application start?', mockContext);
  assert(aiResult.grounded === true, 'Response is marked as grounded');
  assert(aiResult.answer.includes('index.js'), 'Cites real index.js entry file');

  // 6. HTTP API Endpoint Tests
  console.log('\n--- 6. HTTP REST API Tests ---');
  server = app.listen(PORT);

  // Health endpoint
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthJson = await healthRes.json();
  assert(healthRes.status === 200 && healthJson.success === true, 'GET /api/health returns 200');

  // Invalid URL validation test
  const invalidUrlRes = await fetch(`${BASE_URL}/repository/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://notgithub.com/someone/repo' }),
  });
  const invalidUrlJson = await invalidUrlRes.json();
  assert(invalidUrlRes.status === 400 && invalidUrlJson.success === false, 'Rejects non-github.com URL');

  // Malformed input test
  const malformedRes = await fetch(`${BASE_URL}/repository/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: '' }),
  });
  assert(malformedRes.status === 400, 'Rejects empty repository URL');

  // Git commands endpoint test
  const gitCmdRes = await fetch(`${BASE_URL}/git/commands`);
  const gitCmdJson = await gitCmdRes.json();
  assert(gitCmdRes.status === 200 && gitCmdJson.data.categories.length > 5, 'GET /api/git/commands returns categories');

  // Git explain-error endpoint test
  const gitErrRes = await fetch(`${BASE_URL}/git/explain-error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'error: failed to push some refs to git@github.com' }),
  });
  const gitErrJson = await gitErrRes.json();
  assert(gitErrRes.status === 200 && gitErrJson.data.name.includes('Push Rejected'), 'POST /api/git/explain-error diagnoses push error');

  server.close();

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  if (server) server.close();
  process.exit(1);
});
