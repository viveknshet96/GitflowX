import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import axios from "axios";
import { Loader2, FileText, Download, Check, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function RepoDocs({ owner, repo, branch = "HEAD" }) {
  const [docs, setDocs] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (status === "idle" && containerRef.current) {
      const q = gsap.utils.selector(containerRef);
      gsap.fromTo(
        q(".animate-item"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [status]);

  const handleGenerate = async () => {
    setStatus("loading");
    try {
      const res = await axios.post("http://localhost:5000/api/repos/docs", { owner, repo, branch });
      setDocs(res.data.markdown);
      setStatus("success");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!docs) return;
    const blob = new Blob([docs], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${repo}-docs.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (status === "idle") {
    return (
      <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px', textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
        <div className="animate-item" style={{
          width: 64, height: 64, borderRadius: '18px',
          background: 'rgba(249,115,22,0.08)',
          border: '1px solid rgba(249,115,22,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 0 32px rgba(249,115,22,0.1)',
        }}>
          <FileText size={28} color="#f97316" />
        </div>

        <h2 className="animate-item" style={{ fontSize: '22px', fontWeight: 800, color: '#e6edf3', marginBottom: '10px', letterSpacing: '-0.02em' }}>
          Auto-Generate Documentation
        </h2>
        <p className="animate-item" style={{ color: '#8b949e', fontSize: '14px', lineHeight: 1.65, marginBottom: '28px', maxWidth: '400px' }}>
          GitFlowX will analyze the repository structure and key files to autonomously write comprehensive Markdown documentation.
        </p>

        <div className="animate-item" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', width: '100%', maxWidth: '380px' }}>
          {['Project overview & purpose', 'Architecture & logic', 'Setup & usage guide'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#111318', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', fontSize: '13px', color: '#8b949e', fontWeight: 500 }}>
              <Check size={14} color="#10b981" style={{ flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>

        <button
          className="animate-item"
          onClick={handleGenerate}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px', borderRadius: '10px',
            background: '#f97316', color: '#0a0a0a',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '14px', fontWeight: 700,
            boxShadow: '0 0 24px rgba(249,115,22,0.25)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Sparkles size={16} /> Generate Documentation
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
        <div style={{ position: 'relative', width: 48, height: 48 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(16,185,129,0.15)', borderTopColor: '#10b981', animation: 'spin 1s linear infinite' }} />
        </div>
        <span style={{ color: '#8b949e', fontSize: '14px' }}>AI is analyzing codebase to generate documentation...</span>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (status === "error" || !docs) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
        <div style={{ color: '#f87171', fontSize: '15px' }}>Failed to generate documentation.</div>
        <div style={{ color: '#f87171', fontSize: '13px', maxWidth: '400px', textAlign: 'center', opacity: 0.7 }}>{error}</div>
        <button onClick={() => setStatus("idle")} style={{ marginTop: '8px', padding: '8px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e6edf3', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>
          <FileText size={16} color="#10b981" /> Generated Documentation
        </div>
        <button
          onClick={handleDownload}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: '#e6edf3', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 500, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <Download size={13} /> Download MD
        </button>
      </div>
      <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div className="prose-dark" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ReactMarkdown>{docs}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
