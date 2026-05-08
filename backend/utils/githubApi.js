function getGithubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitFlowX",
    ...(token ? { Authorization: `token ${token}` } : {}),
  };
}

export function parseGitHubUrl(url) {
  try {
    const clean = url.replace(/\.git$/, "").replace(/\/$/, "");
    const match = clean.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
}

export async function fetchRepoMetadata(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: getGithubHeaders(),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchRepoTree(owner, repo, branch = "HEAD") {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: getGithubHeaders() }
  );
  if (!res.ok) throw new Error(`GitHub tree error: ${res.status}`);
  const data = await res.json();
  return data.tree ?? [];
}

export async function fetchFileContent(owner, repo, path, branch = "HEAD") {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`,
    { headers: getGithubHeaders() }
  );
  if (!res.ok) return "";
  const data = await res.json();
  if (data.encoding === "base64" && data.content) {
    return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
  }
  return "";
}

export function detectLanguage(filename) {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  const map = {
    js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
    py: "python", rb: "ruby", go: "go", java: "java", cs: "csharp",
    cpp: "cpp", c: "c", rs: "rust", php: "php", swift: "swift",
    kt: "kotlin", vue: "vue", svelte: "svelte", css: "css", scss: "scss",
    sass: "sass", html: "html", json: "json", yaml: "yaml", yml: "yaml",
    md: "markdown", sh: "bash", dockerfile: "dockerfile", toml: "toml",
    xml: "xml", sql: "sql",
  };
  return map[ext] || "text";
}

export function buildFileTree(items) {
  const root = [];
  const nodeMap = {};

  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const item of sorted) {
    const parts = item.path.split("/");
    const name = parts[parts.length - 1];
    const node = {
      path: item.path,
      name,
      type: item.type === "tree" ? "dir" : "file",
      size: item.size,
      language: item.type !== "tree" ? detectLanguage(name) : undefined,
      children: item.type === "tree" ? [] : undefined,
    };
    nodeMap[item.path] = node;
    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = nodeMap[parentPath];
      if (parent?.children) parent.children.push(node);
    }
  }
  return root;
}

import dagre from "dagre";

export function buildGraph(files, entryPoint, importMap) {
  const codeFiles = files.filter(
    (f) =>
      f.type === "blob" &&
      /\.(js|jsx|ts|tsx|py|go|java|rb|rs|php|vue|svelte|cs)$/.test(f.path) &&
      !f.path.includes("node_modules") &&
      !f.path.includes(".min.")
  );

  const limited = codeFiles.slice(0, 100);

  // Helper to categorize node path
  const getDomain = (path) => {
    const p = path.toLowerCase();
    if (p.startsWith("backend/") || p.startsWith("server/") || p.startsWith("api/")) return "backend";
    if (p.startsWith("frontend/") || p.startsWith("client/") || p.startsWith("src/") || p.startsWith("public/")) return "frontend";
    return "other";
  };

  const domainNodes = { backend: [], frontend: [], other: [] };
  limited.forEach(f => domainNodes[getDomain(f.path)].push(f));

  // Determine if we should use tiered layout
  const isTiered = domainNodes.backend.length > 0 && domainNodes.frontend.length > 0;

  const configureGraph = () => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 120, ranksep: 90, align: "UL" });
    g.setDefaultEdgeLabel(() => ({}));
    return g;
  };

  const nodeIds = new Set(limited.map((f) => f.path));
  const finalNodes = [];
  const finalEdges = [];

  // Group padding constants
  const GROUP_PAD_X = 60;
  const GROUP_PAD_TOP = 70;   // extra top space for the cluster label
  const GROUP_PAD_BOTTOM = 40;
  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 60;

  /**
   * Process a partition of files into a dagre layout.
   * Returns { nodes: [...], width, height } with positions relative to (0,0).
   */
  const layoutPartition = (partitionFiles) => {
    if (partitionFiles.length === 0) return { nodes: [], width: 0, height: 0 };

    const g = configureGraph();
    partitionFiles.forEach(f => g.setNode(f.path, { width: NODE_WIDTH, height: NODE_HEIGHT }));

    // Add edges within this partition
    for (const [source, targets] of Object.entries(importMap || {})) {
      if (!partitionFiles.find(f => f.path === source)) continue;
      for (const target of targets) {
        if (!partitionFiles.find(f => f.path === target)) continue;
        g.setEdge(source, target);
      }
    }

    // Fallback: star layout from entry point when there are no resolved edges
    const hasEdges = g.edgeCount() > 0;
    if (!hasEdges && partitionFiles.length > 1) {
      const pEntry =
        partitionFiles.find(f => f.path === entryPoint || f.path.endsWith("/" + entryPoint))
        || partitionFiles[0];
      partitionFiles.forEach(f => {
        if (f.path !== pEntry.path) g.setEdge(pEntry.path, f.path);
      });
    }

    dagre.layout(g);

    // Collect positioned nodes and compute bounding box
    const layoutNodes = [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    partitionFiles.forEach(f => {
      const pos = g.node(f.path);
      const x = pos.x - NODE_WIDTH / 2;
      const y = pos.y - NODE_HEIGHT / 2;
      layoutNodes.push({ file: f, x, y });
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + NODE_WIDTH > maxX) maxX = x + NODE_WIDTH;
      if (y + NODE_HEIGHT > maxY) maxY = y + NODE_HEIGHT;
    });

    // Normalise to (0, 0) origin
    layoutNodes.forEach(n => { n.x -= minX; n.y -= minY; });
    const contentW = maxX - minX;
    const contentH = maxY - minY;

    // Add partition edges
    g.edges().forEach(e => {
      finalEdges.push({
        id: `${e.v}->${e.w}`,
        source: e.v,
        target: e.w,
        animated: true,
      });
    });

    return { nodes: layoutNodes, width: contentW, height: contentH };
  };

  const DOMAIN_LABELS = {
    backend:  "⬢  Backend",
    frontend: "◈  Frontend",
    other:    "◉  Other",
  };

  if (isTiered) {
    // Layout each domain independently
    const partitions = [
      { key: "backend",  files: domainNodes.backend  },
      { key: "frontend", files: domainNodes.frontend },
      { key: "other",    files: domainNodes.other    },
    ].filter(p => p.files.length > 0);

    let currentX = 0;
    const CLUSTER_GAP = 150; // horizontal gap between clusters

    for (const partition of partitions) {
      const layout = layoutPartition(partition.files);
      if (layout.nodes.length === 0) continue;

      const groupWidth  = layout.width  + GROUP_PAD_X * 2;
      const groupHeight = layout.height + GROUP_PAD_TOP + GROUP_PAD_BOTTOM;
      const groupId = `__group_${partition.key}`;

      // Add the cluster group node
      finalNodes.push({
        id: groupId,
        type: "group",
        position: { x: currentX, y: 0 },
        style: { width: groupWidth, height: groupHeight },
        data: {
          label: DOMAIN_LABELS[partition.key] || partition.key,
          domain: partition.key,
          isGroup: true,
        },
      });

      // Add child nodes positioned relative to the group
      layout.nodes.forEach(n => {
        finalNodes.push({
          id: n.file.path,
          parentId: groupId,
          extent: "parent",
          position: { x: n.x + GROUP_PAD_X, y: n.y + GROUP_PAD_TOP },
          data: {
            label: n.file.path.split("/").pop() || n.file.path,
            filePath: n.file.path,
            language: detectLanguage(n.file.path.split("/").pop() || n.file.path),
            isEntry: n.file.path === entryPoint || n.file.path.endsWith("/" + entryPoint),
            domain: partition.key,
          },
        });
      });

      currentX += groupWidth + CLUSTER_GAP;
    }
  } else {
    // Standard single layout — no groups needed
    const layout = layoutPartition(limited);
    layout.nodes.forEach(n => {
      finalNodes.push({
        id: n.file.path,
        position: { x: n.x, y: n.y },
        data: {
          label: n.file.path.split("/").pop() || n.file.path,
          filePath: n.file.path,
          language: detectLanguage(n.file.path.split("/").pop() || n.file.path),
          isEntry: n.file.path === entryPoint || n.file.path.endsWith("/" + entryPoint),
          domain: getDomain(n.file.path),
        },
      });
    });
  }

  // Cross-domain edges from importMap that weren't added yet
  for (const [source, targets] of Object.entries(importMap || {})) {
    if (!nodeIds.has(source)) continue;
    for (const target of targets) {
      if (!nodeIds.has(target)) continue;
      const id = `${source}->${target}`;
      if (!finalEdges.find(e => e.id === id)) {
        finalEdges.push({ id, source, target, animated: true });
      }
    }
  }

  return { nodes: finalNodes, edges: finalEdges };
}

