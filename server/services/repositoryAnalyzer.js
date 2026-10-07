import { fetchRepositoryMetadata, fetchRepositoryTree, fetchLanguages, fetchFileContent, fetchReadme } from './githubService.js';
import { detectTechStack } from './techDetector.js';
import { analyzeArchitecture } from './architectureAnalyzer.js';
import { isSensitiveFile } from '../utils/secretFilter.js';

// Knowledge base of standard important files and their explanations
const IMPORTANT_FILE_PATTERNS = [
  {
    regex: /^README\.md$/i,
    category: 'documentation',
    badge: 'Docs',
    purpose: 'Project Overview & Setup',
    explanation: 'The primary documentation entry point. Usually contains project introduction, installation instructions, usage guidelines, and architecture details.',
  },
  {
    regex: /^package\.json$/i,
    category: 'manifest',
    badge: 'Node / JS',
    purpose: 'Dependency & Script Manifest',
    explanation: 'Defines the Node.js/JavaScript package metadata, dependencies, devDependencies, and executable npm/yarn scripts.',
  },
  {
    regex: /^requirements\.txt$/i,
    category: 'manifest',
    badge: 'Python',
    purpose: 'Python Dependencies',
    explanation: 'Specifies pinned Python packages required to run or develop the project using pip.',
  },
  {
    regex: /^pyproject\.toml$/i,
    category: 'manifest',
    badge: 'Python',
    purpose: 'Modern Python Project Config',
    explanation: 'PEP 518 build system specification and dependency configuration (used with Poetry, Flit, or Pip).',
  },
  {
    regex: /^pom\.xml$/i,
    category: 'manifest',
    badge: 'Java Maven',
    purpose: 'Maven Project Object Model',
    explanation: 'Core configuration for Java projects managed by Apache Maven, declaring dependencies, plugins, and build lifecycles.',
  },
  {
    regex: /^build\.gradle(\.kts)?$/i,
    category: 'manifest',
    badge: 'Gradle',
    purpose: 'Gradle Build Configuration',
    explanation: 'Defines build automation tasks and dependencies for Java, Kotlin, or Android projects.',
  },
  {
    regex: /^go\.mod$/i,
    category: 'manifest',
    badge: 'Go',
    purpose: 'Go Module Definition',
    explanation: 'Specifies the Go module path and required external packages and versions.',
  },
  {
    regex: /^Cargo\.toml$/i,
    category: 'manifest',
    badge: 'Rust',
    purpose: 'Rust Cargo Manifest',
    explanation: 'Defines package metadata, compiler settings, and crate dependencies for Rust.',
  },
  {
    regex: /^composer\.json$/i,
    category: 'manifest',
    badge: 'PHP',
    purpose: 'PHP Composer Manifest',
    explanation: 'Declares PHP dependencies and autoload mappings.',
  },
  {
    regex: /^Gemfile$/i,
    category: 'manifest',
    badge: 'Ruby',
    purpose: 'Ruby Gem Dependencies',
    explanation: 'Specifies gems required for Ruby and Rails applications managed by Bundler.',
  },
  {
    regex: /^(vite\.config\.[jt]s|next\.config\.[jt]?s|webpack\.config\.js|tailwind\.config\.[jt]?s|postcss\.config\.[jt]?s)$/i,
    category: 'config',
    badge: 'Build Config',
    purpose: 'Frontend Build & Bundler Config',
    explanation: 'Configures module bundling, asset compilation, CSS processing, and development server parameters.',
  },
  {
    regex: /^tsconfig\.json$/i,
    category: 'config',
    badge: 'TypeScript',
    purpose: 'TypeScript Compiler Options',
    explanation: 'Specifies the root files and the compiler flags required to compile a TypeScript project.',
  },
  {
    regex: /^Dockerfile$/i,
    category: 'devops',
    badge: 'Docker',
    purpose: 'Container Build Instructions',
    explanation: 'Contains sequential commands to package the application into a reproducible Docker container image.',
  },
  {
    regex: /^docker-compose\.ya?ml$/i,
    category: 'devops',
    badge: 'Docker Compose',
    purpose: 'Multi-container Orchestration',
    explanation: 'Defines and runs multi-container Docker applications, including databases, caches, and web services.',
  },
  {
    regex: /^\.env\.example$/i,
    category: 'config',
    badge: 'Environment Template',
    purpose: 'Environment Variables Template',
    explanation: 'Documents required environment variable keys without exposing any secret values.',
  },
  {
    regex: /^\.gitignore$/i,
    category: 'git',
    badge: 'Git Rules',
    purpose: 'Git Ignore Rules',
    explanation: 'Tells Git which untracked files, builds, secrets, and caches to ignore from version control.',
  },
  {
    regex: /^(main|index|server|app)\.[a-z0-9]+$/i,
    category: 'entrypoint',
    badge: 'Entry Point',
    purpose: 'Application Entry Point',
    explanation: 'Likely the starting point or primary bootstrapping file of the application or service.',
  },
];

/**
 * Checks if a file is an important landmark file
 */
export function getImportantFileInfo(filePath) {
  if (!filePath) return null;
  const fileName = filePath.split('/').pop();

  for (const pattern of IMPORTANT_FILE_PATTERNS) {
    if (pattern.regex.test(fileName)) {
      return {
        path: filePath,
        fileName,
        category: pattern.category,
        badge: pattern.badge,
        purpose: pattern.purpose,
        explanation: pattern.explanation,
      };
    }
  }

  return null;
}

/**
 * Builds a hierarchical nested tree from flat GitHub Git Tree items
 */
export function buildNestedTree(items = [], maxDepth = 6, maxChildrenPerFolder = 80) {
  const root = {
    name: 'root',
    path: '',
    type: 'folder',
    children: [],
  };

  // Sort paths so folders and files are ordered cleanly
  const sortedItems = [...items].sort((a, b) => a.path.localeCompare(b.path));

  for (const item of sortedItems) {
    // Skip sensitive files completely
    if (isSensitiveFile(item.path)) {
      continue;
    }

    const segments = item.path.split('/');
    if (segments.length > maxDepth) {
      continue;
    }

    let current = root;
    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      if (isLast) {
        if (item.type === 'file') {
          const ext = segment.includes('.') ? segment.split('.').pop().toLowerCase() : '';
          const importantInfo = getImportantFileInfo(currentPath);

          if (current.children.length < maxChildrenPerFolder) {
            current.children.push({
              name: segment,
              path: currentPath,
              type: 'file',
              extension: ext,
              size: item.size || 0,
              sha: item.sha,
              isImportant: Boolean(importantInfo),
              importantInfo: importantInfo || undefined,
            });
          }
        } else {
          // Folder item
          let folderNode = current.children.find((c) => c.type === 'folder' && c.name === segment);
          if (!folderNode) {
            folderNode = {
              name: segment,
              path: currentPath,
              type: 'folder',
              children: [],
            };
            if (current.children.length < maxChildrenPerFolder) {
              current.children.push(folderNode);
            }
          }
        }
      } else {
        // Intermediate folder
        let folderNode = current.children.find((c) => c.type === 'folder' && c.name === segment);
        if (!folderNode) {
          folderNode = {
            name: segment,
            path: currentPath,
            type: 'folder',
            children: [],
          };
          current.children.push(folderNode);
        }
        current = folderNode;
      }
    }
  }

  // Recursive sort: folders first, then files alphabetically
  function sortNode(node) {
    if (!node.children) return;
    node.children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNode);
  }

  sortNode(root);
  return root.children;
}

/**
 * Main coordinator function to analyze a full repository
 */
export async function analyzeRepository(owner, repo, token) {
  // 1. Fetch metadata
  const metadata = await fetchRepositoryMetadata(owner, repo, token);

  // 2. Fetch Git tree
  const treeResult = await fetchRepositoryTree(owner, repo, metadata.default_branch, token);

  // 3. Fetch Languages
  const languages = await fetchLanguages(owner, repo, token);

  // 4. Identify important files in the repository
  const importantFiles = [];
  const manifestCandidates = ['package.json', 'requirements.txt', 'pom.xml', 'go.mod', 'Cargo.toml', 'composer.json', 'Gemfile'];
  const manifestsToFetch = [];

  for (const item of treeResult.items) {
    if (item.type === 'file') {
      const info = getImportantFileInfo(item.path);
      if (info) {
        importantFiles.push({
          ...info,
          size: item.size,
          sha: item.sha,
        });

        // Check if this is a root or primary manifest to inspect
        const fileName = item.path.split('/').pop();
        if (manifestCandidates.includes(fileName) && !item.path.includes('node_modules')) {
          manifestsToFetch.push({ fileName, path: item.path });
        }
      }
    }
  }

  // 5. Safely fetch manifest contents (up to 3 primary manifests to avoid excess API calls)
  const manifests = {};
  for (const candidate of manifestsToFetch.slice(0, 3)) {
    try {
      const content = await fetchFileContent(owner, repo, candidate.path, metadata.default_branch, token);
      if (content) {
        manifests[candidate.fileName] = content;
      }
    } catch {
      // Non-fatal if manifest fetch fails
    }
  }

  // 6. Fetch README content excerpt
  let readmeSnippet = '';
  try {
    const rawReadme = await fetchReadme(owner, repo, token);
    if (rawReadme) {
      // First 2000 characters for summary and AI context
      readmeSnippet = rawReadme.slice(0, 2500);
    }
  } catch {
    readmeSnippet = '';
  }

  // 7. Deterministic Tech Stack Detection
  const techStack = detectTechStack(treeResult.items, manifests, languages);

  // 8. Architecture Analysis
  const architecture = analyzeArchitecture(treeResult.items, techStack);

  // 9. Build nested file tree
  const fileTree = buildNestedTree(treeResult.items);

  // 10. Metrics summary
  const totalFiles = treeResult.items.filter((i) => i.type === 'file' && !isSensitiveFile(i.path)).length;
  const totalFolders = treeResult.items.filter((i) => i.type === 'folder').length;

  return {
    repository: metadata,
    metrics: {
      totalFiles,
      totalFolders,
      totalTreeItems: treeResult.items.length,
      isTruncated: treeResult.truncated,
      warningMessage: treeResult.truncated
        ? 'This repository is very large. GitHub truncated the tree results; a partial analysis is provided.'
        : null,
    },
    languages,
    techStack,
    architecture,
    importantFiles,
    fileTree,
    readmeSnippet,
    analyzedAt: new Date().toISOString(),
  };
}
