import Groq from "groq-sdk";

let groqClient;
function getGroqClient() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

export async function analyzeWithLLM(owner, repo, description, fileTree, sampleFiles) {
  const filePaths = fileTree
    .filter((f) => f.type === "blob")
    .map((f) => f.path)
    .slice(0, 200)
    .join("\n");

  const sampleContent = Object.entries(sampleFiles)
    .slice(0, 5)
    .map(([path, content]) => `=== ${path} ===\n${content.slice(0, 2000)}`)
    .join("\n\n");

  const prompt = `You are a senior software engineer analyzing the GitHub repository "${owner}/${repo}".
Repository description: "${description || "No description"}"

File structure (up to 200 files):
${filePaths}

Sample file contents:
${sampleContent}

Analyze this repository and respond in STRICT JSON format with no markdown, no backticks, just raw JSON:
{
  "entryPoint": "path/to/main/file",
  "runCommand": "the command to run this project",
  "techStack": ["technology1", "technology2"],
  "summary": "2-3 sentence summary of what this project does",
  "architecture": "1-2 paragraphs describing the project's architecture, patterns, and data flow",
  "keyFiles": [
    { "path": "path/to/file", "description": "1 sentence explaining what this file does" }
  ],
  "importMap": {
    "source/file.ts": ["imported/file.ts"],
    "...": ["..."]
  }
}

For keyFiles, list up to 5 critical files. For importMap, only include real file-to-file imports within the repo (not node_modules). List up to 20 key files' imports.`;

  const client = getGroqClient();
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
  let lastError;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`LLM attempt ${attempt + 1}/3 with model: ${model}`);
        const chatCompletion = await client.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: "You are a senior software engineer. Always respond with valid JSON only, no markdown or backticks."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 4096,
          temperature: 0.3,
          response_format: { type: "json_object" },
        });

        var text = chatCompletion.choices?.[0]?.message?.content ?? "{}";
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        const errMsg = JSON.stringify(err?.message || err);
        console.warn(`LLM ${model} attempt ${attempt + 1} failed: ${errMsg}`);
        // If model doesn't exist, skip retries and move to next model
        if (errMsg.includes("not_found") || errMsg.includes("not found") || errMsg.includes("does not exist")) {
          break;
        }
        // Rate limit — back off longer
        if (errMsg.includes("rate_limit") || errMsg.includes("429")) {
          await new Promise((r) => setTimeout(r, 5000 * Math.pow(2, attempt)));
        } else {
          // Exponential backoff: 2s, 4s, 8s
          await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
        }
      }
    }
    if (!lastError) break; // Success, stop trying other models
    console.warn(`Model ${model} failed, trying next fallback...`);
  }

  if (lastError) {
    console.error("All LLM models failed:", lastError.message);
    return { entryPoint: "", runCommand: "", techStack: [], summary: "LLM analysis unavailable due to high demand. Please try again later.", importMap: {} };
  }

  let cleanText = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  try {
    const parsed = JSON.parse(cleanText);
    return {
      entryPoint: parsed.entryPoint ?? "",
      runCommand: parsed.runCommand ?? "",
      techStack: parsed.techStack ?? [],
      summary: parsed.summary ?? "",
      architecture: parsed.architecture ?? "",
      keyFiles: parsed.keyFiles ?? [],
      importMap: parsed.importMap ?? {},
    };
  } catch {
    return { entryPoint: "", runCommand: "", techStack: [], summary: "Analysis could not be completed.", architecture: "", keyFiles: [], importMap: {} };
  }
}

export async function chatWithRepo(owner, repo, contextFiles, history, message) {
  const client = getGroqClient();
  const fileContext = contextFiles.map(f => `=== ${f.path} ===\n${f.content.slice(0, 2000)}`).join("\n\n");
  
  const systemPrompt = `You are a helpful AI assistant answering questions about the repository "${owner}/${repo}".
You have access to the following file contexts from the repository:
${fileContext}

Provide clear, accurate, and concise answers based on the repository context. Use Markdown formatting.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...(history || []),
    { role: "user", content: message }
  ];

  try {
    const chatCompletion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.5,
      max_tokens: 2000,
    });
    return { text: chatCompletion.choices?.[0]?.message?.content || "" };
  } catch (err) {
    console.error("Chat LLM Error:", err);
    throw err;
  }
}

export async function generateRepoDocs(owner, repo, tree, sampleFiles) {
  const client = getGroqClient();
  const filePaths = tree.filter((f) => f.type === "blob").map((f) => f.path).slice(0, 100).join("\n");
  const sampleContent = Object.entries(sampleFiles).slice(0, 5).map(([path, content]) => `=== ${path} ===\n${content.slice(0, 2000)}`).join("\n\n");

  const prompt = `Generate a comprehensive Markdown documentation for the repository "${owner}/${repo}".
Repository structure:
${filePaths}
Sample files:
${sampleContent}

Return ONLY valid Markdown text containing:
1. A brief overview
2. Installation/Run instructions
3. Core architecture
4. Key files/components
Ensure it looks like a professional README.md.`;

  try {
    const chatCompletion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an expert technical writer. Return only Markdown content." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });
    return { docs: chatCompletion.choices?.[0]?.message?.content || "" };
  } catch (err) {
    console.error("Docs LLM Error:", err);
    throw err;
  }
}
