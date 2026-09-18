# 🚀 GitHub Buddy

> **Understand any GitHub repository visually.**

GitHub Buddy helps students, bootcamps, and beginner developers understand unfamiliar GitHub repositories without manually opening, reading, and deciphering every single file.

---

## 🎯 The Main Flow (USP)

```
PASTE GITHUB REPOSITORY
        ↓
     ANALYZE
        ↓
    UNDERSTAND
        ↓
    VISUALIZE
        ↓
     EXPLORE
        ↓
  ASK QUESTIONS
```

---

## ✨ Features

- 🔍 **Real GitHub REST API v3 Integration**: Live extraction of repository metadata, stars, forks, default branch, watchers, license, and directory tree. No fake/mock data in production.
- ⚡ **Deterministic Tech Stack Detector**: Manifest-driven parsing of `package.json`, `requirements.txt`, `pom.xml`, `go.mod`, `Cargo.toml`, etc., detecting languages, frameworks, libraries, and DevOps tooling without hallucination.
- 🌳 **Interactive Visual File Explorer**: Nested folder hierarchy with expand/collapse, instant search, extension filtering, landmark file badges, and file type icons.
- 🗺️ **Architecture Blueprint Map (React Flow)**: Visual directed graph displaying application tiers (Frontend UI, Backend Server, Data Storage, Config & DevOps) with clear confidence evidence (`Detected` vs `Likely`). Includes a mobile-optimized structured list toggle.
- 📄 **Important File Explanations & Safe Previews**: Instant plain-English breakdown of landmark files (`README.md`, manifests, dockerfiles) with built-in secret redaction.
- 🤖 **Grounded AI Q&A ("Ask Buddy")**: Chat assistant that answers repository questions strictly using verified code facts and file paths. If evidence is lacking, it honestly clarifies rather than hallucinating. Powered by Gemini / OpenAI with a built-in deterministic fallback engine.
- 🛠️ **Git Command Assistant**: Categorized Git reference library plus natural language goal-to-command matching (e.g. *"I want to undo my last commit without losing code"* ➔ `git reset --soft HEAD~1`).
- 🩺 **Git Error Diagnostician**: Instant breakdown of confusing terminal errors (e.g. *fatal: not a git repository*, *failed to push some refs*, merge conflicts) with *What happened*, *Why*, and copyable fix commands.
- 📱 **Mobile-First & Capacitor-Ready**: Responsive design with touch-friendly tap targets, bottom navigation bar on mobile viewports, and zero hover-dependent interactions.

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Dark theme, mobile-first responsive layout)
- **Routing**: React Router v6
- **Visualization**: `@xyflow/react` (React Flow v12)
- **Icons & Motion**: Lucide React, Framer Motion
- **HTTP Client**: Axios with centralized request/response interceptors

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Middleware**: CORS, Morgan logger, custom input sanitizers, centralized error handling
- **Caching**: High-performance in-memory cache with TTL (Time To Live) to minimize API roundtrips
- **Security**: Strict secret sanitization engine filtering `.env`, private keys, and API tokens

### External APIs & Providers
- **GitHub**: GitHub REST API v3 (`/repos`, `/git/trees`, `/languages`, `/contents`)
- **AI / LLM**: Provider-agnostic engine supporting Google Gemini API (`@google/genai` or REST) and OpenAI API with a 100% grounded deterministic fallback engine when API keys are omitted.

---

## 📁 Folder Structure

```
github-buddy/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Footer, LoadingSteps, ErrorBanner, StatCard, Badge
│   │   │   ├── dashboard/        # Summary cards, quick metrics
│   │   │   ├── files/            # FileNode, FilePreviewModal
│   │   │   ├── architecture/     # CustomNodes (Root, Layer, Component)
│   │   │   ├── ai/               # Chat UI, suggested questions, message bubbles
│   │   │   └── git/              # Command reference & Error helper
│   │   ├── pages/                # Landing, Analyze, Dashboard, Files, Architecture, Insights, AskBuddy, Git pages
│   │   ├── layouts/              # MainLayout (global), RepoLayout (sub-navigation & context)
│   │   ├── services/             # Centralized api.js, repositoryService, aiService, gitService
│   │   ├── hooks/                # useRepository, useDebounce
│   │   ├── utils/                # formatters, fileIcons
│   │   ├── data/                 # sampleRepos
│   │   ├── App.jsx               # Route definitions
│   │   ├── main.jsx              # Application bootstrap
│   │   └── index.css             # Tailwind base & React Flow styles
│   ├── index.html
│   ├── vite.config.js            # Vite config with API proxy
│   ├── tailwind.config.js
│   └── package.json
│
├── server/
│   ├── controllers/              # repositoryController, aiController, gitController
│   ├── routes/                   # healthRoutes, repositoryRoutes, aiRoutes, gitRoutes
│   ├── services/                 # githubService, repositoryAnalyzer, techDetector, architectureAnalyzer, aiService, gitService
│   ├── middleware/               # errorHandler, validator
│   ├── utils/                    # cache, secretFilter
│   ├── app.js                    # Express app configuration & production static serving
│   ├── server.js                 # Server entrypoint
│   └── package.json
│
├── .env.example
├── .gitignore
├── README.md
└── package.json                  # Root orchestration scripts
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher

### 2. Installation
Clone the repository and install all dependencies (root, server, and client) with a single command:

```bash
# Clone the repository
git clone https://github.com/your-username/github-buddy.git
cd github-buddy

# Install dependencies across root, server, and client
npm run install:all
```

### 3. Environment Variables
Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Edit `.env` (optional but recommended):
```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Optional: Increases GitHub API limit from 60 to 5,000 requests/hour
GITHUB_TOKEN=

# Optional: Enables live LLM responses in Ask Buddy (Gemini or OpenAI)
GEMINI_API_KEY=
OPENAI_API_KEY=
```

> **Note**: GitHub Buddy works out-of-the-box **without any API keys**! If keys are absent, it uses the shared public GitHub API tier and its deterministic grounded repository engine.

### 4. Running in Development Mode
Start both backend (port 5000) and frontend (port 5173) simultaneously:

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 5. Running in Production Mode
Build the client and serve it through Express:

```bash
# Build the client bundle
npm run build

# Start the production server
npm start
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/repository/analyze` | Analyze repository (`{ "url": "https://github.com/owner/repo" }`) |
| `GET` | `/api/repository/:owner/:repo` | Get cached/stored analysis |
| `GET` | `/api/repository/:owner/:repo/file` | Safely preview file content (`?path=src/index.js`) |
| `POST` | `/api/ai/ask` | Ask Buddy grounded questions (`{ "question": "...", "repositoryContext": {...} }`) |
| `GET` | `/api/git/commands` | List categorized Git commands or search with `?goal=...` |
| `POST` | `/api/git/explain-error` | Diagnose a terminal error (`{ "error": "fatal: ..." }`) |

---

## 🔒 Security & Safe Handling

1. **No Code Execution**: GitHub Buddy parses file trees and manifests as static text data. No repository code is cloned or executed on the server.
2. **Secret Redaction**: Files matching sensitive signatures (`.env`, `*.pem`, `*.key`, `id_rsa`, `credentials.json`) are blocked from preview. In text files, keys and tokens are automatically replaced with `[REDACTED_SECRET]`.
3. **Prompt Injection Defense**: Repository content is treated strictly as untrusted data. The LLM prompt explicitly rejects instructions embedded inside files or READMEs.
4. **Host Restriction**: Only public repositories hosted on `github.com` are permitted.

---

## 📱 Mobile & Capacitor Wrapping Guide

GitHub Buddy is engineered mobile-first so it can be wrapped into iOS and Android apps using Capacitor or WebView:
- **No hover-only interactions**: Every action is accessible via explicit tap/click.
- **Touch Targets**: All buttons, chips, and tree rows have a minimum 40–48px touch target.
- **Bottom Navigation**: Mobile screens automatically present a fixed thumb-accessible bottom tab bar.
- **Responsive React Flow**: When viewing the architecture diagram on mobile screens, users can toggle between the interactive canvas and a structured list view.

To wrap with Capacitor:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "GitHub Buddy" "com.githubbuddy.app" --web-dir client/dist
npm run build
npx cap add android
npx cap sync
```

---

## 📄 License
MIT License. Built for students and developers exploring open source.
# Git-Buddy
