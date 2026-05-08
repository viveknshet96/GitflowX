import { Router } from "express";
import RepoAnalysis from "../models/RepoAnalysis.js";
import {
  parseGitHubUrl,
  fetchRepoMetadata,
  fetchRepoTree,
  fetchFileContent,
  buildFileTree,
  buildGraph,
} from "../utils/githubApi.js";
import { analyzeWithLLM } from "../utils/llmAnalysis.js";

const router = Router();

router.post("/analyze", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "repoUrl is required" });
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "Invalid GitHub repository URL" });
  }

  const { owner, repo } = parsed;

  try {
    const existing = await RepoAnalysis.findOne({ owner, repo });
    if (existing) { // Return cached result if available
      return res.json({ ...existing.toObject(), id: existing._id.toString(), cached: true });
    }

    const [metadata, tree] = await Promise.all([
      fetchRepoMetadata(owner, repo),
      fetchRepoTree(owner, repo, "HEAD"),
    ]);

    const branch = metadata.default_branch || "main";

    const keyFiles = [
      "package.json", "requirements.txt", "go.mod", "Cargo.toml",
      "README.md", "src/index.ts", "src/index.js", "src/main.tsx",
      "app.py", "main.py", "main.go", "index.js", "server.js",
    ];
    const samplePaths = tree
      .filter((f) => f.type === "blob" && keyFiles.some((k) => f.path === k || f.path.endsWith("/" + k)))
      .slice(0, 8)
      .map((f) => f.path);

    const sampleContents = {};
    await Promise.all(
      samplePaths.map(async (path) => {
        const content = await fetchFileContent(owner, repo, path, branch);
        if (content) sampleContents[path] = content;
      })
    );

    const llm = await analyzeWithLLM(owner, repo, metadata.description || "", tree, sampleContents);
    const fileTree = buildFileTree(tree);
    const { nodes, edges } = buildGraph(tree, llm.entryPoint, llm.importMap);

    const analysis = await RepoAnalysis.create({
      repoUrl,
      owner,
      repo,
      branch,
      description: metadata.description || null,
      stars: metadata.stargazers_count || 0,
      forks: metadata.forks_count || 0,
      language: metadata.language || null,
      topics: metadata.topics || [],
      entryPoint: llm.entryPoint || null,
      runCommand: llm.runCommand || null,
      techStack: llm.techStack,
      summary: llm.summary || null,
      architecture: llm.architecture || null,
      keyFiles: llm.keyFiles || [],
      nodes,
      edges,
      fileTree,
    });

    res.json({ ...analysis.toObject(), id: analysis._id.toString(), cached: false });
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
  }
});

router.post("/file", async (req, res) => {
  const { owner, repo, path, branch = "HEAD" } = req.body;
  if (!owner || !repo || !path) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "owner, repo, and path are required" });
  }
  try {
    const content = await fetchFileContent(owner, repo, path, branch);
    const ext = (path.split(".").pop() || "").toLowerCase();
    const langMap = {
      js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
      py: "python", rb: "ruby", go: "go", java: "java", rs: "rust",
      css: "css", scss: "scss", html: "html", json: "json", md: "markdown",
    };
    res.json({ path, content, language: langMap[ext] || "text", size: Buffer.byteLength(content) });
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
  }
});

router.post("/llm-context", async (req, res) => {
  const { owner, repo, branch = "HEAD", filePaths } = req.body;
  if (!owner || !repo || !filePaths?.length) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "owner, repo, and filePaths are required" });
  }
  try {
    const results = await Promise.all(
      filePaths.slice(0, 20).map(async (path) => {
        const content = await fetchFileContent(owner, repo, path, branch);
        return { path, content };
      })
    );
    const valid = results.filter((f) => f.content);
    const context = valid
      .map((f) => `# File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
      .join("\n\n");
    res.json({ context, fileCount: valid.length, totalTokens: Math.ceil(context.length / 4) });
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
  }
});

router.post("/chat", async (req, res) => {
  const { owner, repo, branch = "HEAD", filePaths, history, message } = req.body;
  if (!owner || !repo || !message) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "owner, repo, and message are required" });
  }
  try {
    const contextFiles = [];
    if (filePaths && filePaths.length > 0) {
      const results = await Promise.all(
        filePaths.slice(0, 5).map(async (path) => {
          const content = await fetchFileContent(owner, repo, path, branch);
          return { path, content };
        })
      );
      contextFiles.push(...results.filter((f) => f.content));
    }
    
    // We import chatWithRepo here dynamically or destructured above.
    const { chatWithRepo } = await import("../utils/llmAnalysis.js");
    const result = await chatWithRepo(owner, repo, contextFiles, history, message);
    res.json({ text: result.text });
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
  }
});

router.post("/docs", async (req, res) => {
  const { owner, repo, branch = "HEAD" } = req.body;
  if (!owner || !repo) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "owner and repo are required" });
  }
  try {
    const tree = await fetchRepoTree(owner, repo, branch);
    
    const keyFiles = ["package.json", "requirements.txt", "README.md", "src/index.js", "src/main.ts", "main.py"];
    const samplePaths = tree
      .filter((f) => f.type === "blob" && keyFiles.some((k) => f.path.endsWith(k)))
      .slice(0, 5)
      .map((f) => f.path);

    const sampleContents = {};
    await Promise.all(
      samplePaths.map(async (path) => {
        const content = await fetchFileContent(owner, repo, path, branch);
        if (content) sampleContents[path] = content;
      })
    );

    const { generateRepoDocs } = await import("../utils/llmAnalysis.js");
    const result = await generateRepoDocs(owner, repo, tree, sampleContents);
    res.json({ markdown: result.docs });
  } catch (err) {
    console.error("Docs API error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
  }
});

router.get("/search", async (req, res) => {
  const { owner, repo, q } = req.query;
  if (!owner || !repo || !q) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "owner, repo, and q are required" });
  }
  try {
    const url = `https://api.github.com/search/code?q=${encodeURIComponent(q)}+repo:${owner}/${repo}`;
    const token = process.env.GITHUB_TOKEN;
    const { default: axios } = await import("axios");
    const ghRes = await axios.get(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(token ? { Authorization: `token ${token}` } : {})
      }
    });
    
    // We limit back results to top 10 matches
    const items = ghRes.data.items.slice(0, 10).map((item) => ({
      name: item.name,
      path: item.path,
      url: item.html_url,
      repository: item.repository.full_name
    }));

    res.json({ total_count: ghRes.data.total_count, items });
  } catch (err) {
    console.error("Search API error:", err.message);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to perform code search" });
  }
});

export default router;
