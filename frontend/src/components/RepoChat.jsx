import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, User, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function RepoChat({ owner, repo, branch = "HEAD", fileTree }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi! I'm your AI assistant for **${owner}/${repo}**. Ask me anything about the codebase.` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const topFiles = fileTree?.filter(f => f.type === "blob").slice(0, 5).map(f => f.path) || [];
      const payload = {
        owner, repo, branch,
        message: input,
        history: messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content })),
        filePaths: topFiles
      };
      const res = await axios.post("http://localhost:5000/api/repos/chat", payload);
      setMessages(prev => [...prev, { role: "assistant", content: res.data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0a' }}>
      {/* Messages */}
      <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: 'flex-start' }}>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === "user" ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
              border: msg.role === "user" ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.08)',
            }}>
              {msg.role === "user"
                ? <User size={15} color="#10b981" />
                : <Bot size={15} color="#8b949e" />
              }
            </div>
            {/* Bubble */}
            <div style={{
              maxWidth: '72%',
              padding: '12px 16px',
              borderRadius: msg.role === "user" ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              background: msg.role === "user" ? 'rgba(16,185,129,0.08)' : '#111318',
              border: msg.role === "user" ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(255,255,255,0.07)',
              fontSize: '13px',
              lineHeight: 1.65,
            }}>
              <div className="prose-dark">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Loader2 size={15} color="#8b949e" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: '#111318', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 1, 2].map(n => (
                <div key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: '#484f58', animation: `bounce 1.2s ${n * 0.2}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0d1117', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', background: '#111318', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', padding: '4px 4px 4px 14px', transition: 'border-color 0.2s' }}
          onFocus={() => {}} 
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask a question about the repository..."
            className="scrollbar-thin"
            style={{ flex: 1, maxHeight: '120px', minHeight: '40px', background: 'transparent', border: 'none', outline: 'none', color: '#e6edf3', fontSize: '13px', resize: 'none', fontFamily: 'inherit', padding: '10px 0', lineHeight: 1.5 }}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              width: 36, height: 36, borderRadius: '8px', flexShrink: 0,
              background: input.trim() && !isLoading ? '#10b981' : 'rgba(255,255,255,0.05)',
              border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', margin: '4px 4px 4px 0',
            }}
          >
            <Send size={15} color={input.trim() && !isLoading ? '#0a0a0a' : '#484f58'} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  );
}
