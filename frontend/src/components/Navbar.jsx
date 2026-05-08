import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitFork, Home, Clock, Zap } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Left: Logo + nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginRight: '8px' }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              background: '#0d2e1f',
              border: '1.5px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <GitFork size={14} color="#34d399" />
            </div>
            <span style={{
              fontWeight: 800,
              fontSize: '16px',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #10b981 0%, #d9f99d 50%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              GitFlowX
            </span>
          </Link>

          {/* Home tab */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              ...(location.pathname === '/'
                ? { background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }
                : { color: '#8b949e', border: '1px solid transparent' }
              ),
            }}
            onMouseEnter={e => { if (location.pathname !== '/') { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
            onMouseLeave={e => { if (location.pathname !== '/') { e.currentTarget.style.color = '#8b949e'; e.currentTarget.style.background = 'transparent'; } }}
          >
            <Home size={13} />
            Home
          </Link>

          {/* History tab */}
          <Link
            to="/history"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              ...(location.pathname === '/history'
                ? { background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }
                : { color: '#8b949e', border: '1px solid transparent' }
              ),
            }}
            onMouseEnter={e => { if (location.pathname !== '/history') { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
            onMouseLeave={e => { if (location.pathname !== '/history') { e.currentTarget.style.color = '#8b949e'; e.currentTarget.style.background = 'transparent'; } }}
          >
            <Clock size={13} />
            History
          </Link>
        </div>

        {/* Right: AI badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '12px',
          color: '#8b949e',
          fontWeight: 500,
        }}>
          <Zap size={12} color="#10b981" />
          AI-Powered Analysis
        </div>
      </div>
    </nav>
  );
}
