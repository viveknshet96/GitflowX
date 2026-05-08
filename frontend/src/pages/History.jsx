import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHistory, deleteHistoryItem } from "../api.js";
import { useNavigate } from "react-router-dom";
import { Star, Trash2, ExternalLink, Loader2, GitFork, Code2, GitBranch } from "lucide-react";
import { toast } from "sonner";

const LANG_COLORS = {
  JavaScript: "#f59e0b", TypeScript: "#38bdf8", Python: "#10b981",
  Go: "#22d3ee", Rust: "#f97316", Java: "#f87171", Ruby: "#e879f9",
  "C++": "#f97316", C: "#9ca3af", PHP: "#a78bfa",
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `Analyzed ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function History() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHistoryItem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["history"] }); toast.success("Deleted"); },
    onError: () => toast.error("Failed to delete"),
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 48px)', background: '#0a0a0a' }}>
        <Loader2 size={24} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 48px)', background: '#0a0a0a', color: '#484f58', fontSize: '14px' }}>
        Failed to load history
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: '#0a0a0a' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#e6edf3', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Analysis History
          </h1>
          <p style={{ color: '#8b949e', fontSize: '14px' }}>
            View your previously analyzed repositories.
          </p>
        </div>

        {items.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '64px 32px',
            textAlign: 'center',
            maxWidth: '420px',
            margin: '0 auto',
          }}>
            <GitBranch size={44} color="#30363d" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#8b949e', fontSize: '15px', marginBottom: '24px' }}>
              No repositories analyzed yet. Go analyze one!
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: '#10b981', color: '#0a0a0a', fontWeight: 700,
                fontSize: '14px', padding: '9px 24px', borderRadius: '8px',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Analyze a Repository
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
          }}>
            {items.map((item) => {
              const langColor = LANG_COLORS[item.language] || "#8b949e";
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/result/${item.owner}/${item.repo}`)}
                  style={{
                    background: '#111318',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '176px',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)';
                    e.currentTarget.style.background = '#141920';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.background = '#111318';
                  }}
                >
                  {/* Top */}
                  <div>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <GitBranch size={14} color="#8b949e" style={{ flexShrink: 0 }} />
                        <span style={{
                          color: '#e6edf3', fontSize: '14px', fontWeight: 600,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.owner}/{item.repo}
                        </span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                        disabled={deleteMutation.isPending}
                        title="Delete"
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          padding: '3px', color: '#30363d', flexShrink: 0,
                          transition: 'color 0.15s', display: 'flex', alignItems: 'center',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = '#30363d'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Description */}
                    <p style={{
                      color: '#8b949e', fontSize: '13px', lineHeight: 1.5,
                      marginBottom: '14px', overflow: 'hidden',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {item.description || "No description available."}
                    </p>

                    {/* Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {item.language && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px',
                          background: 'rgba(255,255,255,0.05)', color: '#8b949e',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                          <Code2 size={10} />
                          {item.language}
                        </span>
                      )}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px',
                        background: item.stars > 0 ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.04)',
                        color: item.stars > 0 ? '#f97316' : '#8b949e',
                        border: item.stars > 0 ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(255,255,255,0.07)',
                      }}>
                        <Star size={10} />
                        {(item.stars || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: '14px', paddingTop: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ color: '#484f58', fontSize: '11px', fontWeight: 500 }}>
                      {formatDate(item.analyzedAt)}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/result/${item.owner}/${item.repo}`); }}
                      title="Open analysis"
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '3px', color: '#30363d', transition: 'color 0.15s',
                        display: 'flex', alignItems: 'center',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
                      onMouseLeave={e => e.currentTarget.style.color = '#30363d'}
                    >
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
