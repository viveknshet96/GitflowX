import { useState } from "react";
import { buildLlmContext } from "../api.js";
import { Copy, Check, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

function flattenFiles(items) {
  const result = [];
  for (const item of items || []) {
    if (item.type === "file") result.push(item.path);
    else if (item.children) result.push(...flattenFiles(item.children));
  }
  return result;
}

export default function ContextBuilder({ fileTree, owner, repo, branch }) {
  const [selected, setSelected] = useState(new Set());
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const allFiles = flattenFiles(fileTree);
  const toggle = (path) => {
    const n = new Set(selected);
    n.has(path) ? n.delete(path) : n.add(path);
    setSelected(n);
  };

  const handleBuild = async () => {
    if (!selected.size) return;
    setLoading(true);
    try {
      const result = await buildLlmContext(owner, repo, Array.from(selected), branch);
      setContext(result.context);
      toast.success(`Built context from ${result.fileCount} files (~${result.totalTokens?.toLocaleString()} tokens)`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to build context");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!context) return;
    navigator.clipboard.writeText(context);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '100%', padding: '16px' }}>
      {/* Left: File selector */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#111318', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>Select Files</span>
          <span style={{ fontSize: '12px', color: '#484f58', fontWeight: 500 }}>{selected.size} selected</span>
        </div>
        <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {allFiles.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#484f58', fontSize: '13px', padding: '20px' }}>No files available</p>
          ) : allFiles.map(path => (
            <label key={path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <input
                type="checkbox"
                checked={selected.has(path)}
                onChange={() => toggle(path)}
                style={{ width: 14, height: 14, accentColor: '#10b981', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '12px', color: selected.has(path) ? '#10b981' : '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {path}
              </span>
            </label>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleBuild}
            disabled={!selected.size || loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              padding: '10px', borderRadius: '8px', border: 'none', fontFamily: 'inherit',
              fontSize: '13px', fontWeight: 600, cursor: !selected.size || loading ? 'not-allowed' : 'pointer',
              background: !selected.size || loading ? 'rgba(16,185,129,0.15)' : '#10b981',
              color: !selected.size || loading ? 'rgba(16,185,129,0.4)' : '#0a0a0a',
              transition: 'all 0.2s',
            }}
          >
            {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Building...</> : 'Build Context'}
          </button>
        </div>
      </div>

      {/* Right: Generated context */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#111318', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>Generated Context</span>
          <button
            onClick={handleCopy}
            disabled={!context}
            style={{ padding: '5px', background: 'transparent', border: 'none', cursor: context ? 'pointer' : 'not-allowed', color: copied ? '#10b981' : '#484f58', borderRadius: '5px', display: 'flex', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (context) e.currentTarget.style.color = '#e6edf3'; }}
            onMouseLeave={e => { if (context) e.currentTarget.style.color = copied ? '#10b981' : '#484f58'; }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {context ? (
            <textarea
              readOnly
              value={context}
              className="scrollbar-thin"
              style={{ width: '100%', height: '100%', resize: 'none', background: 'transparent', border: 'none', outline: 'none', padding: '14px 16px', fontFamily: "'Fira Code', monospace", fontSize: '12px', color: '#93c5fd', lineHeight: 1.6 }}
              spellCheck={false}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
              Select files and click Build to generate LLM context.
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
