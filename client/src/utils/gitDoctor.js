/**
 * Git Doctor – repository health analysis.
 * Runs entirely on the already-analysed repository data (no extra GitHub API calls).
 * Each check returns a status (pass / warn / fail), points earned, why it matters,
 * and the exact steps / Git commands to fix it.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const BUILD_ARTIFACT_DIRS = ['node_modules', 'dist', 'build', 'out', '.next', 'venv', '.venv', 'env', '__pycache__', 'target', '.gradle', 'coverage'];
const JUNK_FILES = ['.DS_Store', 'Thumbs.db', 'desktop.ini'];
const MANIFESTS = ['package.json', 'requirements.txt', 'pyproject.toml', 'pom.xml', 'build.gradle', 'build.gradle.kts', 'go.mod', 'Cargo.toml', 'composer.json', 'Gemfile'];
const LARGE_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Flattens the nested file tree into a list of { path, name, type, size } */
export function flattenTree(nodes = [], out = []) {
  for (const node of nodes) {
    out.push({ path: node.path, name: node.name, type: node.type, size: node.size || 0 });
    if (node.children?.length) flattenTree(node.children, out);
  }
  return out;
}

const isRoot = (p) => !p.includes('/');
const status = (earned, max) => (earned >= max ? 'pass' : earned > 0 ? 'warn' : 'fail');

function check(def, earned, message, extra = {}) {
  return { ...def, earned, status: status(earned, def.max), message, ...extra };
}

export function runGitDoctor(repositoryData) {
  const repo = repositoryData?.repository || {};
  const items = flattenTree(repositoryData?.fileTree || []);
  const files = items.filter((i) => i.type === 'file');
  const folders = items.filter((i) => i.type === 'folder');
  const branch = repo.default_branch || 'main';
  const checks = [];

  // 1. README
  const readme = files.find((f) => isRoot(f.path) && /^readme(\.(md|markdown|rst|txt))?$/i.test(f.name));
  const readmeDef = {
    id: 'readme', title: 'README file', category: 'Documentation', max: 15,
    why: 'The README is the first thing anyone sees. It should explain what the project does and how to install and run it.',
    fix: [
      { label: 'Create a README in the project root', cmd: 'echo "# Project Name" > README.md' },
      { label: 'Commit and push it', cmd: `git add README.md\ngit commit -m "docs: add README"\ngit push origin ${branch}` },
    ],
  };
  if (readme && readme.size >= 300) checks.push(check(readmeDef, 15, `Found ${readme.name} (${Math.round(readme.size / 1024) || 1} KB).`));
  else if (readme) checks.push(check(readmeDef, 7, `${readme.name} exists but is very short. Add setup and usage instructions.`));
  else checks.push(check(readmeDef, 0, 'No README file found in the repository root.'));

  // 2. .gitignore
  const gitignore = files.find((f) => f.path === '.gitignore');
  checks.push(check({
    id: 'gitignore', title: '.gitignore file', category: 'Repository Hygiene', max: 15,
    why: 'Without a .gitignore, dependencies, build output and secret files (like .env) can be committed by mistake.',
    fix: [
      { label: 'Create a .gitignore with common entries', cmd: 'printf "node_modules/\\ndist/\\nbuild/\\n.env\\n.DS_Store\\n" > .gitignore' },
      { label: 'Commit it', cmd: `git add .gitignore\ngit commit -m "chore: add .gitignore"\ngit push origin ${branch}` },
    ],
  }, gitignore ? 15 : 0, gitignore ? '.gitignore is present in the root.' : 'No .gitignore found in the repository root.'));

  // 3. Committed dependencies / build artefacts / junk files
  const badFolders = folders.filter((f) => BUILD_ARTIFACT_DIRS.includes(f.name));
  const junk = files.filter((f) => JUNK_FILES.includes(f.name));
  const offenders = [...new Set([...badFolders.map((f) => f.path), ...junk.map((f) => f.path)])];
  const removeCmds = offenders.slice(0, 5).map((p) => `git rm -r --cached "${p}"`).join('\n');
  checks.push(check({
    id: 'artifacts', title: 'No dependencies or build files committed', category: 'Repository Hygiene', max: 15,
    why: 'Folders like node_modules, dist or venv make the repository huge, slow to clone and cause merge conflicts. They should be generated locally.',
    fix: [
      { label: 'Stop tracking the folders (files stay on your computer)', cmd: removeCmds || 'git rm -r --cached node_modules' },
      { label: 'Add them to .gitignore', cmd: `printf "${(badFolders.length ? [...new Set(badFolders.map((f) => f.name))] : ['node_modules']).map((n) => `${n}/`).join('\\n')}\\n" >> .gitignore` },
      { label: 'Commit the clean-up', cmd: `git add .gitignore\ngit commit -m "chore: stop tracking generated files"\ngit push origin ${branch}` },
    ],
  }, offenders.length === 0 ? 15 : 0,
  offenders.length === 0 ? 'No committed dependency, build or OS junk files detected.' : `Found ${offenders.length} committed generated item(s): ${offenders.slice(0, 4).join(', ')}${offenders.length > 4 ? '…' : ''}`,
  { evidence: offenders }));

  // 4. License
  const licenseFile = files.find((f) => isRoot(f.path) && /^(licen[cs]e|copying)(\.(md|txt))?$/i.test(f.name));
  const hasLicense = Boolean(repo.license || licenseFile);
  checks.push(check({
    id: 'license', title: 'License', category: 'Documentation', max: 10,
    why: 'A license tells others whether they are allowed to use, copy or modify your code. Without one, nobody can legally reuse it.',
    fix: [
      { label: 'On GitHub: Add file → Create new file → name it LICENSE → "Choose a license template"', cmd: '' },
      { label: 'Then pull it locally', cmd: `git pull origin ${branch}` },
    ],
  }, hasLicense ? 10 : 0, hasLicense ? `License detected: ${repo.license?.name || licenseFile?.name}.` : 'No license found.'));

  // 5. Description
  const hasDescription = repo.description && repo.description !== 'No description provided.';
  checks.push(check({
    id: 'description', title: 'Repository description', category: 'Documentation', max: 5,
    why: 'A one-line description helps people quickly understand the project in search results and on your profile.',
    fix: [{ label: 'On GitHub, click the ⚙️ next to "About" on the repository page and add a description and topics.', cmd: '' }],
  }, hasDescription ? 5 : 0, hasDescription ? 'Repository has a description.' : 'The repository has no description.'));

  // 6. Recent activity
  const last = repo.pushed_at || repo.updated_at;
  const days = last ? Math.floor((Date.now() - new Date(last).getTime()) / DAY_MS) : null;
  const activityDef = {
    id: 'activity', title: 'Recent activity', category: 'Activity', max: 10,
    why: 'Recently updated repositories are more likely to work with current tools and libraries.',
    fix: [{ label: 'Commit and push your latest work regularly', cmd: `git add .\ngit commit -m "update: describe your change"\ngit push origin ${branch}` }],
  };
  if (repo.is_archived) checks.push(check(activityDef, 0, 'This repository is archived (read-only).'));
  else if (days === null) checks.push(check(activityDef, 5, 'Last activity date is unknown.'));
  else if (days <= 90) checks.push(check(activityDef, 10, `Last push ${days === 0 ? 'today' : `${days} day(s) ago`}.`));
  else if (days <= 365) checks.push(check(activityDef, 5, `Last push ${days} days ago (over 3 months).`));
  else checks.push(check(activityDef, 0, `No pushes for ${Math.floor(days / 365)} year(s).`));

  // 7. Tests
  const testItems = items.filter((i) => /(^|\/)(tests?|__tests__|spec|specs)(\/|$)/i.test(i.path) || /\.(test|spec)\.[a-z0-9]+$/i.test(i.name) || /^test_.*\.py$/i.test(i.name));
  checks.push(check({
    id: 'tests', title: 'Automated tests', category: 'Code Quality', max: 10,
    why: 'Tests catch bugs before they reach users and make it safe to change code later.',
    fix: [
      { label: 'Create a tests folder and add your first test', cmd: 'mkdir tests' },
      { label: 'Commit your tests', cmd: `git add tests\ngit commit -m "test: add initial tests"\ngit push origin ${branch}` },
    ],
  }, testItems.length ? 10 : 0, testItems.length ? `Found test files/folders (e.g. ${testItems[0].path}).` : 'No test files or test folders detected.'));

  // 8. CI / CD
  const ci = items.find((i) => i.path.startsWith('.github/workflows/') || ['.gitlab-ci.yml', '.travis.yml', 'Jenkinsfile', 'azure-pipelines.yml', '.circleci'].includes(i.path) || i.path.startsWith('.circleci/'));
  checks.push(check({
    id: 'ci', title: 'Continuous Integration (CI)', category: 'Code Quality', max: 10,
    why: 'CI automatically builds and tests every push, so broken code is noticed immediately.',
    fix: [
      { label: 'Create a GitHub Actions workflow folder', cmd: 'mkdir -p .github/workflows' },
      { label: 'Add a workflow file (e.g. ci.yml), then commit it', cmd: `git add .github\ngit commit -m "ci: add GitHub Actions workflow"\ngit push origin ${branch}` },
    ],
  }, ci ? 10 : 0, ci ? `CI configuration found (${ci.path}).` : 'No CI configuration (e.g. .github/workflows) found.'));

  // 9. Large files
  const large = files.filter((f) => f.size > LARGE_FILE_BYTES);
  checks.push(check({
    id: 'large-files', title: 'No very large files', category: 'Repository Hygiene', max: 5,
    why: 'Files over 5 MB slow down cloning. GitHub blocks files over 100 MB. Use Git LFS or external storage for big assets.',
    fix: [
      { label: 'Stop tracking a large file', cmd: `git rm --cached "${large[0]?.path || 'path/to/large-file'}"` },
      { label: 'Or track it with Git LFS', cmd: `git lfs install\ngit lfs track "*.${large[0]?.path?.split('.').pop() || 'zip'}"\ngit add .gitattributes` },
    ],
  }, large.length ? 0 : 5, large.length ? `${large.length} file(s) larger than 5 MB (e.g. ${large[0].path}).` : 'No files larger than 5 MB.', { evidence: large.map((f) => f.path) }));

  // 10. Dependency manifest
  const manifest = files.filter((f) => MANIFESTS.includes(f.name)).sort((x, y) => x.path.split('/').length - y.path.split('/').length)[0];
  checks.push(check({
    id: 'manifest', title: 'Dependency manifest', category: 'Code Quality', max: 5,
    why: 'A manifest (package.json, requirements.txt, pom.xml…) lets anyone install the exact libraries the project needs with one command.',
    fix: [
      { label: 'Node.js project', cmd: 'npm init -y' },
      { label: 'Python project', cmd: 'pip freeze > requirements.txt' },
    ],
  }, manifest ? 5 : 0, manifest ? `Found ${manifest.path}.` : 'No dependency manifest detected.'));

  const score = checks.reduce((s, c) => s + c.earned, 0);
  const maxScore = checks.reduce((s, c) => s + c.max, 0);
  const pct = Math.round((score / maxScore) * 100);
  const grade = pct >= 80 ? { label: 'Healthy', tone: 'emerald' } : pct >= 50 ? { label: 'Needs Attention', tone: 'amber' } : { label: 'Critical', tone: 'rose' };

  return {
    score: pct,
    grade,
    checks,
    summary: {
      passed: checks.filter((c) => c.status === 'pass').length,
      warnings: checks.filter((c) => c.status === 'warn').length,
      failed: checks.filter((c) => c.status === 'fail').length,
      total: checks.length,
    },
    issues: checks.filter((c) => c.status !== 'pass').sort((a, b) => (b.max - b.earned) - (a.max - a.earned)),
  };
}

export default runGitDoctor;
