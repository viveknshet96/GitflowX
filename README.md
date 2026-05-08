<div align="center">

# ⚡ GitFlowX

### Advanced Repository Analytics & Intelligent Codebase Explorer

[![Stack](https://img.shields.io/badge/Stack-MERN-4DB33D?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![UI](https://img.shields.io/badge/UI-Shadcn%2FUI-000000?style=for-the-badge)](https://ui.shadcn.com)
[![LLM](https://img.shields.io/badge/LLM-Groq-FF6B35?style=for-the-badge)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

**GitFlowX** transforms any GitHub repository into an interactive visual map and intelligent conversation surface — without ever cloning it locally. Powered by the MERN stack and Groq's ultra-fast LLM inference.

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Environment Setup](#-environment-setup)

</div>

---

## 🧭 What is GitFlowX?

GitFlowX is a **premium repository intelligence tool** built for developers who need deep structural insight into codebases fast. Whether you're onboarding onto a new project, auditing a dependency tree, or generating documentation, GitFlowX gives you a bird's-eye view instantly.

> No `git clone`. No manual file digging. Just paste a GitHub URL and explore.

---

## ✨ Features

### 🕸️ Tiered Dependency Graph
Visualize your project's full architecture as a dynamic, interactive graph. Files are automatically organized into **Domain Zones** — Backend, Frontend, and Utilities — using high-performance layout algorithms.

| Capability | Description |
|---|---|
| **Auto-Clustering** | Nodes grouped by folder hierarchy automatically |
| **Entry Point Detection** | Highlights the "heart" of your repository |
| **Real-Time Search** | Instantly locate files and trace dependency paths |
| **Smooth Navigation** | Buttery pan/zoom powered by `@xyflow/react` |

---

### 🤖 Intelligent Repository Assistant
Chat directly with your codebase. The AI assistant is context-aware and can:
- Explain architectural decisions and patterns
- Walk through function logic step-by-step
- Answer questions like *"Where is authentication handled?"*
- Suggest implementation approaches based on existing code

Powered by **Groq's Llama 3.3 / Mixtral-8x7b** — fast enough for real conversation.

---

### 📄 Auto-Documentation Generator
Generate production-ready Markdown documentation in seconds. GitFlowX reads your repo's structure and sample files to produce:
- Project overview and purpose
- Installation & setup instructions
- Architecture overview with key module descriptions
- API route or component summaries

---

### ⚡ LLM Context Builder
Stop manually copying files into ChatGPT or Claude. Select any files from the tree, and GitFlowX bundles them into a perfectly formatted context snippet — ready to paste into any LLM.

---

## 🎨 Design Philosophy

GitFlowX is designed with a **"Premium-First"** aesthetic:

- **Dark Mode Excellence** — High-contrast interface using a curated slate and teal palette
- **Glassmorphism** — Backdrop blur and subtle borders for a modern, layered feel
- **Fluid Motion** — Staggered entry animations via Framer Motion & GSAP
- **Interactive Graphs** — Smooth panning and zooming with React Flow

---

## 🏗️ Architecture

```
GitFlowX/
├── frontend/          # React 19 + Vite SPA
│   ├── components/    # Shadcn UI + custom components
│   ├── pages/         # Route-level views
│   └── hooks/         # TanStack Query hooks
│
└── backend/           # Node.js + Express API
    ├── routes/        # API endpoints
    ├── services/      # GitHub API, Groq LLM, caching
    └── models/        # Mongoose schemas (MongoDB)
```

### Frontend

| Tool | Purpose |
|---|---|
| React 19 + Vite | Core framework & build tooling |
| TailwindCSS + Shadcn UI | Styling and component library |
| TanStack Query | Async state management & caching |
| `@xyflow/react` | Interactive dependency graph |
| Framer Motion + GSAP | Animations and transitions |

### Backend

| Tool | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Repository data caching |
| Groq Cloud SDK | LLM inference (Llama 3.3 / Mixtral) |
| GitHub REST API | Repository fetching & file access |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- [Groq API Key](https://console.groq.com)
- [GitHub Personal Access Token](https://github.com/settings/tokens) *(highly recommended to avoid rate limits)*

### 1. Clone the Repository

```bash
git clone https://github.com/viveknshet96/GitflowX.git
cd GitflowX
```

### 2. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Environment Setup

Create a `.env` file inside the `backend/` directory:

```env
# backend/.env

MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_personal_access_token
PORT=5000
```

> **Why a GitHub token?** Without it, the GitHub API limits you to 60 requests/hour. A token raises this to 5,000/hour.

### 4. Start the App

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

The app will be available at `http://localhost:5173` by default.

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ Yes | MongoDB connection string |
| `GROQ_API_KEY` | ✅ Yes | Groq Cloud API key for LLM features |
| `GITHUB_TOKEN` | ⚠️ Recommended | GitHub PAT — avoids API rate limits |
| `PORT` | ❌ Optional | Backend port (defaults to `5000`) |

---

## 📄 License

Distributed under the [MIT License](https://opensource.org/licenses/MIT). See `LICENSE` for details.

---

<div align="center">

Built with ❤️ for developers who value clarity and design.

</div>
