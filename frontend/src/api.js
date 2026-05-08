import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const analyzeRepo = (repoUrl) => api.post("/repos/analyze", { repoUrl }).then((r) => r.data);
export const getFileContent = (owner, repo, path, branch) =>
  api.post("/repos/file", { owner, repo, path, branch }).then((r) => r.data);
export const buildLlmContext = (owner, repo, filePaths, branch) =>
  api.post("/repos/llm-context", { owner, repo, filePaths, branch }).then((r) => r.data);
export const getHistory = () => api.get("/history").then((r) => r.data);
export const getHistoryItem = (id) => api.get(`/history/${id}`).then((r) => r.data);
export const deleteHistoryItem = (id) => api.delete(`/history/${id}`).then((r) => r.data);
