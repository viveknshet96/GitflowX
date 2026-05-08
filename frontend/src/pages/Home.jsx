import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { analyzeRepo } from '../api.js';
import { GitFork, Search, GitBranch, MessageSquare, FileText, Package, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const EXAMPLE_REPOS = ['facebook/react', 'vercel/next.js', 'expressjs/express'];

function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^/\s]+)\/([^/\s]+)/);
  if (match) return { owner: match[1], repo: match[2].replace('.git', '') };
  return null;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: analyzeRepo,
    onSuccess: (data) => {
      navigate(`/result/${data.owner}/${data.repo}`, { state: { data } });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to analyze repository');
    },
  });

  const handleAnalyze = (repoUrl) => {
    const target = repoUrl || url;
    if (!target.trim()) return;
    let fullUrl = target;
    if (!target.includes('github.com')) fullUrl = `https://github.com/${target}`;
    const parsed = parseGitHubUrl(fullUrl);
    if (!parsed) { toast.error('Please enter a valid GitHub URL'); return; }
    mutation.mutate(fullUrl);
  };

  const parsedPreview = url
    ? parseGitHubUrl(url.includes('github.com') ? url : `https://github.com/${url}`)
    : null;

  const features = [
    { icon: <GitBranch size={18} color="#10b981" />, title: 'Dependency Graph', desc: 'Interactive visual map of file imports with real edge connections and search/highlight' },
    { icon: <MessageSquare size={18} color="#10b981" />, title: 'Chat with Repo', desc: 'Ask AI any question about the codebase — architecture, functions, how it works' },
    { icon: <FileText size={18} color="#f97316" />, title: 'Auto Documentation', desc: 'Generate comprehensive markdown docs from the repository with one click' },
    { icon: <Package size={18} color="#f97316" />, title: 'LLM Context Builder', desc: 'Select files and copy context instantly to paste into ChatGPT or Claude' },
  ];

  return (
    <main style={{
      minHeight: 'calc(100vh - 48px)',
      background: '#0a0a0a',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '60px',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, white 40%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, white 40%, transparent 100%)',
        zIndex: 0,
      }} />

      {/* Hero Section */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: '72px', maxWidth: '780px', padding: '0 24px' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 14px',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '999px',
          fontSize: '12px',
          color: '#10b981',
          fontWeight: 600,
          marginBottom: '32px',
          boxShadow: '0 0 20px rgba(16,185,129,0.1)',
        }}>
          <Sparkles size={12} />
          AI-Powered Repository Analysis
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(44px, 7vw, 76px)',
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          marginBottom: '20px',
        }}>
          Understand any<br />
          <span style={{
            background: 'linear-gradient(90deg, #10b981 0%, #34d399 40%, #f97316 70%, #fb923c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            codebase
          </span>
          {' '}in minutes
        </h1>

        <p style={{
          fontSize: '17px',
          color: '#8b949e',
          lineHeight: 1.65,
          maxWidth: '540px',
          margin: '0 auto 48px',
          fontWeight: 400,
        }}>
          Visualize dependencies, chat with the code, auto-generate docs — no cloning required.
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '580px',
        padding: '0 16px',
        marginBottom: '60px',
      }}>
        <div style={{
          background: '#111318',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px',
          padding: '20px',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 60px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Loading overlay */}
          {mutation.isPending && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(17,19,24,0.85)',
              backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
              borderRadius: '18px',
            }}>
              <Loader2 size={28} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>Analyzing Repository...</span>
            </div>
          )}

          {/* URL Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#0d1117',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '0 14px',
            marginBottom: parsedPreview ? '10px' : '12px',
            transition: 'border-color 0.2s',
          }}
            onFocus={() => {}}
          >
            <GitFork size={16} color="#484f58" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e6edf3',
                fontSize: '14px',
                height: '44px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Parsed preview */}
          {parsedPreview && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '12px',
              color: '#34d399',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              <ChevronRight size={15} />
              {parsedPreview.owner} / {parsedPreview.repo}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={() => handleAnalyze()}
            disabled={mutation.isPending || !url.trim()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px',
              background: mutation.isPending || !url.trim() ? 'rgba(16,185,129,0.25)' : '#10b981',
              color: mutation.isPending || !url.trim() ? 'rgba(0,0,0,0.4)' : '#0a0a0a',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: mutation.isPending || !url.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              marginBottom: '14px',
              boxShadow: !mutation.isPending && url.trim() ? '0 0 24px rgba(16,185,129,0.25)' : 'none',
            }}
            onMouseEnter={e => { if (!mutation.isPending && url.trim()) e.currentTarget.style.background = '#059669'; }}
            onMouseLeave={e => { if (!mutation.isPending && url.trim()) e.currentTarget.style.background = '#10b981'; }}
          >
            <Search size={16} />
            Analyze Repository
          </button>

          {/* Quick try repos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#484f58', fontSize: '13px', fontWeight: 500 }}>Try:</span>
            {EXAMPLE_REPOS.map(r => (
              <button
                key={r}
                onClick={() => { setUrl(`https://github.com/${r}`); handleAnalyze(`https://github.com/${r}`); }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  color: '#8b949e',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#10b981'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#8b949e'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px',
        width: '100%',
        maxWidth: '900px',
        padding: '0 16px',
      }}>
        {features.map((f, i) => (
          <div
            key={f.title}
            style={{
              background: '#111318',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              padding: '22px',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: i < 2 ? 'rgba(16,185,129,0.1)' : 'rgba(249,115,22,0.1)',
                border: `1px solid ${i < 2 ? 'rgba(16,185,129,0.2)' : 'rgba(249,115,22,0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <span style={{ color: '#e6edf3', fontSize: '14px', fontWeight: 600 }}>{f.title}</span>
            </div>
            <p style={{ color: '#8b949e', fontSize: '13px', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
