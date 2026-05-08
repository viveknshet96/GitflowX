# 🚀 GitFlowX — Advanced Repository Analytics

[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![UI Framework](https://img.shields.io/badge/UI-Shadcn%2FUI-black.svg)](https://ui.shadcn.com)
[![LLM Powered](https://img.shields.io/badge/LLM-Groq-orange.svg)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**GitFlowX** is a premium, high-fidelity GitHub repository analyzer that transforms complex codebases into interactive visual maps and intelligent conversation surfaces. Powered by the MERN stack and Groq's ultra-fast LLM inference, it provides deep structural insights and professional documentation without ever requiring a local clone.

---

## ✨ Core Capabilities

### 🕸️ Tiered Dependency Analysis
Visualize your project's architecture with a dynamic, tiered graph. GitFlowX intelligently separates your codebase into **Domain Zones** (Backend, Frontend, and Utilities) using high-performance layout algorithms.
- **Auto-Clustering**: Nodes are automatically grouped by folder hierarchy.
- **Real-Time Search**: Instantly locate files and highlight dependency paths.
- **Entry point Detection**: Automatically identifies the "heart" of your repository.

### 🤖 Intelligent Repository Assistant
Chat directly with your codebase. Our context-aware AI assistant answers complex architectural questions, explains function logic, and provides implementation suggestions using the latest Groq LLM models.

### 📄 Professional Auto-Documentation
Generate production-ready Markdown documentation in seconds. GitFlowX analyzes repository structure and sample file contents to create comprehensive guides, installation steps, and architecture overviews.

### ⚡ LLM Context Builder
Stop manually copying and pasting files into ChatGPT. Select specific files from the tree, and GitFlowX will bundle them into a perfectly formatted context snippet for use with Claude, GPT-4, or other LLMs.

---

## 🎨 Design Philosophy
GitFlowX is built with a **"Premium-First"** aesthetic:
- **Dark Mode Excellence**: A sleek, high-contrast interface using a curated slate and teal color palette.
- **Fluid Motion**: Powered by **Framer Motion** and **GSAP** for staggered entry animations and smooth transitions.
- **Glassmorphism**: Backdrop blur effects and subtle borders for a modern, sophisticated feel.
- **Interactive Graphs**: Powered by `@xyflow/react` for buttery-smooth panning and zooming.

---

## 🛠️ Technical Architecture

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS + Shadcn UI
- **State Management**: TanStack Query (React Query)
- **Visualization**: React Flow (@xyflow/react)

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB (Mongoose) for global caching
- **Intelligence**: Groq Cloud SDK (Llama 3.3 / Mixtral-8x7b)

---

## 🚀 Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Rakshitha-YK/Patient-Records-App.git
cd gitflowx-mern

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Setup
Create a `.env` file in the `backend` directory:
```env
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_personal_access_token (Highly Recommended)
PORT=5000
```

### 3. Execution
**Start Backend:**
```bash
cd backend && npm run dev
```
**Start Frontend:**
```bash
cd frontend && npm run dev
```

---

<p align="center">Built with ❤️ for developers who value clarity and design.</p>
# GitflowX
