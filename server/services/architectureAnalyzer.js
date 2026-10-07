/**
 * Architecture Analyzer.
 * Identifies architectural layers, components, and evidence-based relationships
 * from repository structure and file patterns.
 * Never fabricates relationships: all connections are grounded in real folder/file evidence.
 */

export function analyzeArchitecture(treeItems = [], techStack = {}) {
  const paths = treeItems.map((item) => item.path);
  const folders = treeItems.filter((item) => item.type === 'folder').map((item) => item.path);
  const files = treeItems.filter((item) => item.type === 'file').map((item) => item.path);

  const layers = [];
  const nodes = [];
  const edges = [];

  // Helper to test if any path matches
  const hasPath = (regex) => paths.some((p) => regex.test(p));
  const getMatching = (regex) => paths.filter((p) => regex.test(p)).slice(0, 8);

  // 1. Root Node
  nodes.push({
    id: 'root',
    type: 'rootNode',
    data: {
      label: 'Repository Root',
      status: 'Root',
      badge: 'Project',
      description: 'Project root entry and configuration hub.',
    },
    position: { x: 400, y: 30 },
  });

  // 2. Frontend Layer Analysis
  const frontendEvidence = [
    ...getMatching(/^(client|frontend|web|ui|app|src\/pages|src\/components)/i),
    ...getMatching(/(vite\.config|next\.config|tailwind\.config|index\.html)/i),
  ];
  const isFrontendHigh =
    hasPath(/^(client|frontend|web|ui)\b/i) ||
    hasPath(/^(src\/)?(components|pages|views)\b/i) ||
    techStack.frameworks?.some((f) => ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte'].includes(f));

  if (frontendEvidence.length > 0 || isFrontendHigh) {
    const confidence = isFrontendHigh ? 'high' : 'medium';
    layers.push({
      id: 'layer-frontend',
      name: 'Frontend / UI',
      confidence,
      status: isFrontendHigh ? 'Detected' : 'Likely',
      evidence: frontendEvidence.slice(0, 5),
      description: 'User interface components, pages, styling, and client-side logic.',
    });

    nodes.push({
      id: 'node-frontend',
      type: 'layerNode',
      data: {
        label: 'Frontend UI',
        status: isFrontendHigh ? 'Detected' : 'Likely',
        badge: 'UI Layer',
        description: 'Client application, rendering views and user interactions.',
        evidence: frontendEvidence.slice(0, 3),
      },
      position: { x: 150, y: 160 },
    });

    edges.push({
      id: 'e-root-frontend',
      source: 'root',
      target: 'node-frontend',
      label: isFrontendHigh ? 'Detected' : 'Likely',
      animated: true,
    });

    // Sub-components: Components & Pages
    const componentPaths = getMatching(/(components|views|widgets)/i);
    if (componentPaths.length > 0) {
      nodes.push({
        id: 'node-components',
        type: 'componentNode',
        data: {
          label: 'Components & Views',
          status: 'Detected',
          badge: 'UI Subsystem',
          description: 'Modular UI components and presentation units.',
          path: componentPaths[0],
        },
        position: { x: 100, y: 300 },
      });
      edges.push({
        id: 'e-frontend-components',
        source: 'node-frontend',
        target: 'node-components',
        label: 'Contains',
      });
    }

    const routePages = getMatching(/(pages|routes|app\/[a-z0-9_-]+\/page)/i);
    if (routePages.length > 0) {
      nodes.push({
        id: 'node-pages',
        type: 'componentNode',
        data: {
          label: 'Pages & Routing',
          status: 'Detected',
          badge: 'Navigation',
          description: 'Client page endpoints and view routing.',
          path: routePages[0],
        },
        position: { x: 250, y: 300 },
      });
      edges.push({
        id: 'e-frontend-pages',
        source: 'node-frontend',
        target: 'node-pages',
        label: 'Routes',
      });
    }
  }

  // 3. Backend / API Layer Analysis
  const backendEvidence = [
    ...getMatching(/^(server|backend|api|src\/server|app\/api)/i),
    ...getMatching(/(routes|controllers|endpoints|handlers)/i),
  ];
  const isBackendHigh =
    hasPath(/^(server|backend|api)\b/i) ||
    hasPath(/(routes|controllers|handlers|endpoints)\b/i) ||
    techStack.frameworks?.some((f) => ['Express.js', 'Fastify', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Gin', 'Actix Web'].includes(f));

  if (backendEvidence.length > 0 || isBackendHigh) {
    const confidence = isBackendHigh ? 'high' : 'medium';
    layers.push({
      id: 'layer-backend',
      name: 'Backend / Server',
      confidence,
      status: isBackendHigh ? 'Detected' : 'Likely',
      evidence: backendEvidence.slice(0, 5),
      description: 'Server runtime, HTTP routing, business logic, and request orchestration.',
    });

    nodes.push({
      id: 'node-backend',
      type: 'layerNode',
      data: {
        label: 'Backend Server',
        status: isBackendHigh ? 'Detected' : 'Likely',
        badge: 'Server Layer',
        description: 'Server processes, endpoints, and application services.',
        evidence: backendEvidence.slice(0, 3),
      },
      position: { x: 550, y: 160 },
    });

    edges.push({
      id: 'e-root-backend',
      source: 'root',
      target: 'node-backend',
      label: isBackendHigh ? 'Detected' : 'Likely',
      animated: true,
    });

    // Sub-components: Routes & Controllers
    const routeEvidence = getMatching(/(routes|router|endpoints)/i);
    if (routeEvidence.length > 0) {
      nodes.push({
        id: 'node-routes',
        type: 'componentNode',
        data: {
          label: 'Routes & Endpoints',
          status: 'Detected',
          badge: 'API Contract',
          description: 'API path definitions and request dispatches.',
          path: routeEvidence[0],
        },
        position: { x: 470, y: 300 },
      });
      edges.push({
        id: 'e-backend-routes',
        source: 'node-backend',
        target: 'node-routes',
        label: 'Exposes',
      });
    }

    const controllerEvidence = getMatching(/(controllers|handlers|resolvers)/i);
    if (controllerEvidence.length > 0) {
      nodes.push({
        id: 'node-controllers',
        type: 'componentNode',
        data: {
          label: 'Controllers & Logic',
          status: 'Detected',
          badge: 'Orchestrator',
          description: 'Request handling and response coordination.',
          path: controllerEvidence[0],
        },
        position: { x: 630, y: 300 },
      });
      edges.push({
        id: 'e-backend-controllers',
        source: 'node-backend',
        target: 'node-controllers',
        label: 'Dispatches',
      });
    }
  }

  // 4. Data / Database Layer Analysis
  const dbEvidence = [
    ...getMatching(/(models|database|db|entities|schemas|migrations|repositories)/i),
    ...getMatching(/(schema\.prisma|mongoose|typeorm|drizzle)/i),
  ];
  if (dbEvidence.length > 0) {
    layers.push({
      id: 'layer-database',
      name: 'Data & Storage',
      confidence: 'high',
      status: 'Detected',
      evidence: dbEvidence.slice(0, 5),
      description: 'Data models, ORM schemas, database connections, and migrations.',
    });

    nodes.push({
      id: 'node-database',
      type: 'componentNode',
      data: {
        label: 'Database & Models',
        status: 'Detected',
        badge: 'Storage',
        description: 'Persistent entities, schemas, and queries.',
        evidence: dbEvidence.slice(0, 3),
      },
      position: { x: 630, y: 440 },
    });

    // Connect to backend if present, else root
    const parentNodeId = nodes.some((n) => n.id === 'node-controllers')
      ? 'node-controllers'
      : nodes.some((n) => n.id === 'node-backend')
      ? 'node-backend'
      : 'root';

    edges.push({
      id: 'e-parent-database',
      source: parentNodeId,
      target: 'node-database',
      label: 'Queries',
    });
  }

  // 5. Configuration & DevOps
  const configEvidence = [
    ...getMatching(/(config|\.github|docker|Dockerfile|Makefile)/i),
    ...getMatching(/(tsconfig|vite\.config|eslint|prettier)/i),
  ];
  if (configEvidence.length > 0) {
    layers.push({
      id: 'layer-config',
      name: 'Config & DevOps',
      confidence: 'high',
      status: 'Detected',
      evidence: configEvidence.slice(0, 5),
      description: 'Build tooling, containerization, linting, CI/CD, and environment settings.',
    });

    nodes.push({
      id: 'node-config',
      type: 'componentNode',
      data: {
        label: 'Config & Build',
        status: 'Detected',
        badge: 'Tooling',
        description: 'Project configuration and build pipeline.',
        evidence: configEvidence.slice(0, 3),
      },
      position: { x: 380, y: 440 },
    });

    edges.push({
      id: 'e-root-config',
      source: 'root',
      target: 'node-config',
      label: 'Configures',
    });
  }

  // Fallback node if repository is a library/monolith with no obvious layers
  if (layers.length === 0) {
    layers.push({
      id: 'layer-generic',
      name: 'Single Package / Library',
      confidence: 'medium',
      status: 'Likely',
      evidence: files.slice(0, 4),
      description: 'Modular library structure without separate client/server tiers.',
    });

    nodes.push({
      id: 'node-library',
      type: 'componentNode',
      data: {
        label: 'Core Module',
        status: 'Detected',
        badge: 'Module',
        description: 'Core source code and package exports.',
      },
      position: { x: 400, y: 200 },
    });

    edges.push({
      id: 'e-root-library',
      source: 'root',
      target: 'node-library',
      label: 'Exports',
    });
  }

  return {
    layers,
    graph: {
      nodes,
      edges,
    },
  };
}
