import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { analyzeRepo, getFileContent } from "../api.js";
import DependencyGraph from "../components/DependencyGraph.jsx";
import CodeViewer from "../components/CodeViewer.jsx";
import FileTree from "../components/FileTree.jsx";
import ContextBuilder from "../components/ContextBuilder.jsx";
import RepoChat from "../components/RepoChat.jsx";
import RepoDocs from "../components/RepoDocs.jsx";
import {
  ArrowLeft, Star, GitFork, Terminal, Zap, Layers, AlertCircle,
  Loader2, X, Folder, Package, Database, MessageSquare, FileText,
  GitBranch, ChevronRight, Sparkles, Hash, BarChart2
} from "lucide-react";
import { toast } from "sonner";

const LANG_COLORS = {
  JavaScript: "#f59e0b", TypeScript: "#38bdf8", Python: "#10b981",
  Go: "#22d3ee", Rust: "#f97316", Java: "#f87171", Ruby: "#e879f9",
  "C++": "#f97316", C: "#9ca3af", PHP: "#a78bfa", Swift: "#f97316",
};

const TABS = [
  { id: "graph",   icon: <GitBranch size={13} />,     label: "Graph" },
  { id: "summary", icon: <Sparkles size={13} />,       label: "Analysis" },
  { id: "chat",    icon: <MessageSquare size={13} />,  label: "Chat" },
  { id: "docs",    icon: <FileText size={13} />,       label: "Docs" },
  { id: "context", icon: <Package size={13} />,        label: "LLM Context" },
];

export default function Result() {
  const { owner, repo } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(location.state?.data || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("graph");

  const analyzeMutation = useMutation({
    mutationFn: analyzeRepo,
    onSuccess: setData,
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to analyze"),
  });

  useEffect(() => {
    if (!data && owner && repo) analyzeMutation.mutate(`https://github.com/${owner}/${repo}`);
  }, [owner, repo]);

  const handleFileSelect = async (item) => {
    if (item.type !== "file") return;
    setSelectedFile(item.path);
    setCodeOpen(true);
    setFileContent(null);
    setFileLoading(true);
    try {
      const res = await getFileContent(owner, repo, item.path, data?.branch || "HEAD");
      setFileContent(res);
    } catch { toast.error("Failed to load file content"); }
    finally { setFileLoading(false); }
  };

  const handleNodeClick = (node) => {
    if (node.data?.filePath) handleFileSelect({ path: node.data.filePath, type: "file", name: node.data.label });
  };

  /* ── Loading ── */
  if (analyzeMutation.isPending && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 48px)', gap: '20px', background: '#0a0a0a' }}>
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(16,185,129,0.15)', borderTopColor: '#10b981', animation: 'spin 1s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={22} color="#10b981" />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#e6edf3', fontSize: '17px', fontWeight: 600, marginBottom: '6px' }}>Analyzing Repository</div>
          <div style={{ color: '#8b949e', fontSize: '13px' }}>Fetching data and running LLM analysis...</div>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (analyzeMutation.isError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 48px)', background: '#0a0a0a', padding: '24px' }}>
        <div style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '40px', textAlign: 'center' }}>
          <AlertCircle size={40} color="#f87171" style={{ margin: '0 auto 16px' }} />
          <div style={{ color: '#e6edf3', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Analysis Failed</div>
          <div style={{ color: '#8b949e', fontSize: '13px', marginBottom: '24px' }}>
            {analyzeMutation.error?.response?.data?.message || "Something went wrong."}
          </div>
          <button onClick={() => navigate("/")} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e6edf3', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const langColor = LANG_COLORS[data.language] || "#8b949e";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', background: '#0a0a0a', overflow: 'hidden' }}>
      
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: '44px',
        background: '#0d1117',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Left: back + repo info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              color: '#8b949e', fontSize: '13px', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', padding: '4px 8px', borderRadius: '6px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8b949e'; e.currentTarget.style.background = 'none'; }}
          >
            <ArrowLeft size={13} /> Back
          </button>

          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#e6edf3', fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {data.owner}/{data.repo}
            </span>

            {data.cached && (
              <span style={{
                padding: '1px 7px', borderRadius: '5px',
                border: '1px solid rgba(255,255,255,0.15)', color: '#8b949e',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                Cached
              </span>
            )}

            {data.language && (
              <span style={{
                padding: '2px 9px', borderRadius: '6px',
                background: `${langColor}20`, color: langColor,
                border: `1px solid ${langColor}40`,
                fontSize: '11px', fontWeight: 600,
              }}>
                {data.language}
              </span>
            )}
          </div>
        </div>

        {/* Right: Stars + Forks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {data.stars > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8b949e', fontSize: '13px', fontWeight: 500 }}>
              <Star size={13} color="#f97316" />
              <span style={{ color: '#e6edf3' }}>{data.stars?.toLocaleString()}</span>
            </div>
          )}
          {data.forks > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8b949e', fontSize: '13px', fontWeight: 500 }}>
              <GitFork size={13} />
              <span style={{ color: '#e6edf3' }}>{data.forks?.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* File tree sidebar */}
        <div style={{
          width: '220px',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '8px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#484f58',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Folder size={12} /> Files
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }} className="scrollbar-thin">
            <FileTree fileTree={data.fileTree} onSelect={handleFileSelect} selectedPath={selectedFile} />
          </div>
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '2px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '0 14px',
            background: '#0d1117',
            flexShrink: 0,
          }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 14px',
                  fontSize: '13px', fontWeight: 500,
                  border: 'none', background: 'none',
                  cursor: 'pointer', fontFamily: 'inherit',
                  borderBottom: `2px solid ${activeTab === t.id ? '#10b981' : 'transparent'}`,
                  color: activeTab === t.id ? '#10b981' : '#8b949e',
                  transition: 'all 0.15s',
                  marginBottom: '-1px',
                }}
                onMouseEnter={e => { if (activeTab !== t.id) { e.currentTarget.style.color = '#e6edf3'; } }}
                onMouseLeave={e => { if (activeTab !== t.id) { e.currentTarget.style.color = '#8b949e'; } }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#0a0a0a' }}>

            {/* ── Graph tab ── */}
            {activeTab === "graph" && (
              <div style={{ position: 'absolute', inset: 0 }}>
                {(data.nodes || []).length > 0 ? (
                  <DependencyGraph nodes={data.nodes} edges={data.edges || []} onNodeClick={handleNodeClick} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#484f58' }}>
                    <Layers size={44} style={{ opacity: 0.3 }} />
                    <p style={{ fontSize: '14px' }}>No graph data for this repository</p>
                  </div>
                )}
                {codeOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0, width: '480px',
                    borderLeft: '1px solid rgba(255,255,255,0.07)',
                    background: '#0d1117', zIndex: 10, display: 'flex', flexDirection: 'column',
                    boxShadow: '-8px 0 24px rgba(0,0,0,0.4)',
                  }}>
                    <div style={{
                      padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#111318',
                    }}>
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedFile}
                      </span>
                      <button
                        onClick={() => setCodeOpen(false)}
                        style={{ padding: '3px', background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', borderRadius: '4px', display: 'flex', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#8b949e'; }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <CodeViewer content={fileContent?.content} language={fileContent?.language} isLoading={fileLoading} path={selectedFile} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Analysis tab ── */}
            {activeTab === "summary" && (
              <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '24px' }} className="scrollbar-thin">
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Description card */}
                  {(data.description) && (
                    <Card>
                      <SectionLabel>Description</SectionLabel>
                      <p style={{ color: '#c9d1d9', fontSize: '14px', lineHeight: 1.65 }}>{data.description}</p>
                    </Card>
                  )}

                  {/* AI Analysis / Summary */}
                  {data.summary && (
                    <Card>
                      <SectionLabel accent="#10b981" icon={<Sparkles size={12} color="#10b981" />}>AI Analysis</SectionLabel>
                      <p style={{ color: '#c9d1d9', fontSize: '14px', lineHeight: 1.7 }}>{data.summary}</p>
                      {data.architecture && (
                        <>
                          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />
                          <p style={{ color: '#8b949e', fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.architecture}</p>
                        </>
                      )}
                    </Card>
                  )}

                  {/* Entry + Run */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Card>
                      <SectionLabel icon={<Zap size={12} color="#10b981" />}>Entry Point</SectionLabel>
                      <CodePill color="teal">{data.entryPoint || "Not detected"}</CodePill>
                    </Card>
                    <Card>
                      <SectionLabel icon={<Terminal size={12} />}>Run Command</SectionLabel>
                      <CodePill color="orange">{data.runCommand || "Not detected"}</CodePill>
                    </Card>
                  </div>

                  {/* Tech Stack */}
                  {data.techStack?.length > 0 && (
                    <Card>
                      <SectionLabel icon={<Hash size={12} />}>Tech Stack</SectionLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {data.techStack.map(t => (
                          <span key={t} style={{
                            padding: '4px 12px', borderRadius: '8px',
                            background: 'rgba(16,185,129,0.08)',
                            border: '1px solid rgba(16,185,129,0.2)',
                            color: '#34d399', fontSize: '12px', fontWeight: 600,
                          }}>{t}</span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Topics */}
                  {data.topics?.length > 0 && (
                    <Card>
                      <SectionLabel>Topics</SectionLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {data.topics.map(t => (
                          <span key={t} style={{
                            padding: '3px 10px', borderRadius: '6px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#8b949e', fontSize: '12px', fontWeight: 500,
                          }}>{t}</span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Key Files */}
                  {data.keyFiles?.length > 0 && (
                    <Card>
                      <SectionLabel>Key Files</SectionLabel>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {data.keyFiles.map((kf, i) => (
                          <div key={i}>
                            <div style={{ fontFamily: 'monospace', color: '#a78bfa', fontSize: '13px', marginBottom: '4px' }}>{kf.path}</div>
                            <div style={{ color: '#8b949e', fontSize: '13px', lineHeight: 1.55 }}>{kf.description}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Metrics */}
                  <Card>
                    <SectionLabel icon={<BarChart2 size={12} />}>Metrics</SectionLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', textAlign: 'center' }}>
                      {[
                        { value: data.nodes?.length ?? 0, label: 'Files' },
                        { value: data.edges?.length ?? 0, label: 'Dependencies' },
                        { value: data.stars?.toLocaleString() ?? 0, label: 'Stars', color: '#f97316' },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ fontSize: '28px', fontWeight: 800, color: s.color || '#e6edf3', letterSpacing: '-0.02em' }}>{s.value}</div>
                          <div style={{ fontSize: '12px', color: '#484f58', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ── Chat tab ── */}
            {activeTab === "chat" && (
              <div style={{ position: 'absolute', inset: 0 }}>
                <RepoChat owner={data.owner} repo={data.repo} branch={data.branch} fileTree={data.fileTree} />
              </div>
            )}

            {/* ── Docs tab ── */}
            {activeTab === "docs" && (
              <div style={{ position: 'absolute', inset: 0 }}>
                <RepoDocs owner={data.owner} repo={data.repo} branch={data.branch} />
              </div>
            )}

            {/* ── LLM Context tab ── */}
            {activeTab === "context" && (
              <div style={{ position: 'absolute', inset: 0 }}>
                <ContextBuilder fileTree={data.fileTree} owner={data.owner} repo={data.repo} branch={data.branch} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

/* ── Small helper components ── */
function Card({ children }) {
  return (
    <div style={{
      background: '#111318',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      padding: '20px 22px',
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, accent, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: accent || '#484f58',
      marginBottom: '12px',
    }}>
      {icon}
      {children}
    </div>
  );
}

function CodePill({ children, color }) {
  const styles = {
    teal: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#34d399' },
    orange: { bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', color: '#f97316' },
  }[color] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#8b949e' };

  return (
    <code style={{
      display: 'inline-block',
      padding: '6px 12px', borderRadius: '8px',
      background: styles.bg, border: `1px solid ${styles.border}`,
      color: styles.color, fontSize: '13px',
      fontFamily: "'Fira Code', 'Geist Mono', monospace",
      fontWeight: 500,
    }}>
      {children}
    </code>
  );
}
