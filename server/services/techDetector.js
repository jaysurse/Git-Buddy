/**
 * Deterministic Technology Detector.
 * Analyzes repository tree and manifest contents to identify languages, frameworks, libraries, and tools.
 * Does NOT use AI for technology detection.
 */

const MANIFEST_DETECTORS = {
  'package.json': (content) => {
    const frameworks = new Set();
    const libraries = new Set();
    const tools = new Set();

    try {
      const pkg = JSON.parse(content);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
        ...(pkg.peerDependencies || {}),
      };

      // Frameworks & Runtimes
      if (allDeps['react'] || allDeps['react-dom']) libraries.add('React');
      if (allDeps['next']) frameworks.add('Next.js');
      if (allDeps['vue']) frameworks.add('Vue.js');
      if (allDeps['nuxt']) frameworks.add('Nuxt');
      if (allDeps['@angular/core']) frameworks.add('Angular');
      if (allDeps['svelte'] || allDeps['@sveltejs/kit']) frameworks.add('Svelte / SvelteKit');
      if (allDeps['express']) frameworks.add('Express.js');
      if (allDeps['fastify']) frameworks.add('Fastify');
      if (allDeps['@nestjs/core']) frameworks.add('NestJS');
      if (allDeps['koa']) frameworks.add('Koa');
      if (allDeps['remix'] || allDeps['@remix-run/react']) frameworks.add('Remix');
      if (allDeps['gatsby']) frameworks.add('Gatsby');
      if (allDeps['astro']) frameworks.add('Astro');
      if (allDeps['electron']) frameworks.add('Electron');
      if (allDeps['react-native']) frameworks.add('React Native');

      // Libraries
      if (allDeps['redux'] || allDeps['@reduxjs/toolkit']) libraries.add('Redux');
      if (allDeps['zustand']) libraries.add('Zustand');
      if (allDeps['mobx']) libraries.add('MobX');
      if (allDeps['axios']) libraries.add('Axios');
      if (allDeps['framer-motion']) libraries.add('Framer Motion');
      if (allDeps['@xyflow/react'] || allDeps['reactflow']) libraries.add('React Flow');
      if (allDeps['lucide-react'] || allDeps['react-icons']) libraries.add('Lucide / Icons');
      if (allDeps['lodash']) libraries.add('Lodash');
      if (allDeps['zod']) libraries.add('Zod');
      if (allDeps['graphql'] || allDeps['@apollo/client']) libraries.add('GraphQL / Apollo');
      if (allDeps['socket.io'] || allDeps['socket.io-client']) libraries.add('Socket.io');
      if (allDeps['three'] || allDeps['@react-three/fiber']) libraries.add('Three.js');

      // Databases & ORMs
      if (allDeps['mongoose']) libraries.add('Mongoose (MongoDB)');
      if (allDeps['prisma'] || allDeps['@prisma/client']) tools.add('Prisma ORM');
      if (allDeps['drizzle-orm']) libraries.add('Drizzle ORM');
      if (allDeps['typeorm']) libraries.add('TypeORM');
      if (allDeps['sequelize']) libraries.add('Sequelize');
      if (allDeps['pg'] || allDeps['postgres']) libraries.add('PostgreSQL Driver');
      if (allDeps['mysql'] || allDeps['mysql2']) libraries.add('MySQL Driver');
      if (allDeps['redis'] || allDeps['ioredis']) libraries.add('Redis Client');

      // Tools & Build
      if (allDeps['tailwindcss']) tools.add('Tailwind CSS');
      if (allDeps['vite']) tools.add('Vite');
      if (allDeps['webpack']) tools.add('Webpack');
      if (allDeps['rollup']) tools.add('Rollup');
      if (allDeps['esbuild']) tools.add('esbuild');
      if (allDeps['typescript']) tools.add('TypeScript');
      if (allDeps['jest']) tools.add('Jest');
      if (allDeps['vitest']) tools.add('Vitest');
      if (allDeps['eslint']) tools.add('ESLint');
      if (allDeps['prettier']) tools.add('Prettier');
      if (allDeps['postcss']) tools.add('PostCSS');
    } catch {
      // Content may be truncated or non-JSON
    }

    return {
      frameworks: Array.from(frameworks),
      libraries: Array.from(libraries),
      tools: Array.from(tools),
    };
  },

  'requirements.txt': (content) => {
    const frameworks = new Set();
    const libraries = new Set();
    const tools = new Set();
    const lower = content.toLowerCase();

    if (lower.includes('django')) frameworks.add('Django');
    if (lower.includes('flask')) frameworks.add('Flask');
    if (lower.includes('fastapi')) frameworks.add('FastAPI');
    if (lower.includes('tornado')) frameworks.add('Tornado');
    if (lower.includes('pyramid')) frameworks.add('Pyramid');

    if (lower.includes('numpy')) libraries.add('NumPy');
    if (lower.includes('pandas')) libraries.add('Pandas');
    if (lower.includes('scipy')) libraries.add('SciPy');
    if (lower.includes('scikit-learn')) libraries.add('scikit-learn');
    if (lower.includes('tensorflow') || lower.includes('keras')) libraries.add('TensorFlow');
    if (lower.includes('torch') || lower.includes('pytorch')) libraries.add('PyTorch');
    if (lower.includes('sqlalchemy')) libraries.add('SQLAlchemy');
    if (lower.includes('celery')) tools.add('Celery');
    if (lower.includes('pytest')) tools.add('pytest');
    if (lower.includes('requests')) libraries.add('Requests');

    return {
      frameworks: Array.from(frameworks),
      libraries: Array.from(libraries),
      tools: Array.from(tools),
    };
  },

  'pom.xml': (content) => {
    const frameworks = new Set();
    const tools = new Set(['Maven']);
    const lower = content.toLowerCase();

    if (lower.includes('spring-boot')) frameworks.add('Spring Boot');
    else if (lower.includes('springframework')) frameworks.add('Spring Framework');
    if (lower.includes('quarkus')) frameworks.add('Quarkus');
    if (lower.includes('micronaut')) frameworks.add('Micronaut');
    if (lower.includes('hibernate')) frameworks.add('Hibernate ORM');

    return { frameworks: Array.from(frameworks), libraries: [], tools: Array.from(tools) };
  },

  'go.mod': (content) => {
    const frameworks = new Set();
    const libraries = new Set();
    const lower = content.toLowerCase();

    if (lower.includes('github.com/gin-gonic/gin')) frameworks.add('Gin');
    if (lower.includes('github.com/gofiber/fiber')) frameworks.add('Fiber');
    if (lower.includes('github.com/labstack/echo')) frameworks.add('Echo');
    if (lower.includes('gorm.io/gorm')) libraries.add('GORM');

    return { frameworks: Array.from(frameworks), libraries: Array.from(libraries), tools: ['Go Modules'] };
  },

  'Cargo.toml': (content) => {
    const frameworks = new Set();
    const libraries = new Set();
    const lower = content.toLowerCase();

    if (lower.includes('actix-web')) frameworks.add('Actix Web');
    if (lower.includes('axum')) frameworks.add('Axum');
    if (lower.includes('rocket')) frameworks.add('Rocket');
    if (lower.includes('tokio')) libraries.add('Tokio (Async)');
    if (lower.includes('diesel')) libraries.add('Diesel ORM');

    return { frameworks: Array.from(frameworks), libraries: Array.from(libraries), tools: ['Cargo'] };
  },

  'composer.json': (content) => {
    const frameworks = new Set();
    const lower = content.toLowerCase();

    if (lower.includes('laravel/framework')) frameworks.add('Laravel');
    if (lower.includes('symfony/framework-bundle')) frameworks.add('Symfony');

    return { frameworks: Array.from(frameworks), libraries: [], tools: ['Composer'] };
  },

  'Gemfile': (content) => {
    const frameworks = new Set();
    const lower = content.toLowerCase();

    if (lower.includes("'rails'") || lower.includes('"rails"')) frameworks.add('Ruby on Rails');
    if (lower.includes("'sinatra'") || lower.includes('"sinatra"')) frameworks.add('Sinatra');

    return { frameworks: Array.from(frameworks), libraries: [], tools: ['Bundler'] };
  },
};

/**
 * Detects technologies from repository tree paths and manifest contents
 */
export function detectTechStack(treeItems = [], manifests = {}, githubLanguages = []) {
  const frameworks = new Set();
  const libraries = new Set();
  const tools = new Set();
  const detectedLanguages = new Set();

  // 1. Add languages from GitHub API
  githubLanguages.forEach((lang) => {
    detectedLanguages.add(lang.name);
  });

  const filePaths = treeItems.map((item) => item.path);

  // 2. Tree path analysis for tools and configurations
  for (const path of filePaths) {
    const fileName = path.split('/').pop();

    if (fileName === 'Dockerfile' || fileName === 'docker-compose.yml' || fileName === 'docker-compose.yaml') {
      tools.add('Docker');
    }
    if (path.startsWith('.github/workflows/')) {
      tools.add('GitHub Actions');
    }
    if (fileName === 'tsconfig.json') {
      tools.add('TypeScript');
      detectedLanguages.add('TypeScript');
    }
    if (fileName.startsWith('vite.config.')) {
      tools.add('Vite');
    }
    if (fileName.startsWith('next.config.')) {
      frameworks.add('Next.js');
    }
    if (fileName.startsWith('tailwind.config.')) {
      tools.add('Tailwind CSS');
    }
    if (fileName === 'webpack.config.js') {
      tools.add('Webpack');
    }
    if (fileName === 'build.gradle' || fileName === 'build.gradle.kts') {
      tools.add('Gradle');
      detectedLanguages.add('Java / Kotlin');
    }
    if (fileName === 'go.mod') {
      detectedLanguages.add('Go');
      tools.add('Go Modules');
    }
    if (fileName === 'Cargo.toml') {
      detectedLanguages.add('Rust');
      tools.add('Cargo');
    }
    if (fileName === 'pom.xml') {
      detectedLanguages.add('Java');
      tools.add('Maven');
    }
    if (fileName === 'package.json') {
      tools.add('Node.js');
      if (!detectedLanguages.has('TypeScript')) {
        detectedLanguages.add('JavaScript');
      }
    }
  }

  // 3. Process fetched manifests with dedicated parsers
  for (const [manifestFile, content] of Object.entries(manifests)) {
    const detector = MANIFEST_DETECTORS[manifestFile];
    if (detector && content) {
      const result = detector(content);
      result.frameworks.forEach((f) => frameworks.add(f));
      result.libraries.forEach((l) => libraries.add(l));
      result.tools.forEach((t) => tools.add(t));
    }
  }

  return {
    languages: Array.from(detectedLanguages),
    frameworks: Array.from(frameworks),
    libraries: Array.from(libraries),
    tools: Array.from(tools),
  };
}
