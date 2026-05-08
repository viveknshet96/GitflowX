import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Loader2 } from "lucide-react";

export default function CodeViewer({ content, language = "javascript", isLoading, path }) {
  if (isLoading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1e1e1e", color: "var(--muted-fg)" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 8px" }} />
          <p style={{ fontSize: "13px" }}>Loading file...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1e1e1e", color: "var(--muted-fg)", fontSize: "13px" }}>
        Select a file to view its content
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#1e1e1e" }}>
      {path && (
        <div style={{ padding: "6px 12px", borderBottom: "1px solid #333", background: "#252526", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#ccc" }}>
          {path}
        </div>
      )}
      <div style={{ flex: 1, overflow: "auto" }}>
        <SyntaxHighlighter
          language={(language || "text").toLowerCase()}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{ margin: 0, padding: "1rem", background: "transparent", fontSize: "12px" }}
          wrapLines
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
