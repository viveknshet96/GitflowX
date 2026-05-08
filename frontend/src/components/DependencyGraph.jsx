import { useCallback, useState, useEffect } from "react";
import {
  ReactFlow, MiniMap, Controls, Background, BackgroundVariant,
  useNodesState, useEdgesState, addEdge, Handle, Position, MarkerType,
} from "@xyflow/react";
import { Search } from "lucide-react";
import "@xyflow/react/dist/style.css";

/* ─── Language dot colours ───────────────────────────────────────────── */
const LANG_COLORS = {
  javascript: "#f59e0b", jsx: "#f59e0b",
  typescript: "#38bdf8", tsx: "#38bdf8",
  python:     "#10b981", go:   "#22d3ee",
  rust:       "#f97316", java: "#f87171",
  ruby:       "#e879f9", php:  "#a78bfa",
  css:        "#f472b6", scss: "#f472b6",
  html:       "#fb923c", json: "#9ca3af",
  yaml:       "#9ca3af", markdown: "#9ca3af",
};

/* ─── Handle dot shared style ─────────────────────────────────────────── */
const handleStyle = {
  background: "#f97316",
  border: "2px solid #050505",
  width: 10,
  height: 10,
  zIndex: 10,
  boxShadow: "0 0 10px rgba(249,115,22,0.8)",
};

/* ─── Cluster group node ─────────────────────────────────────────────── */
function GroupNode({ data }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(16, 185, 129, 0.02)",
        border: "1.5px dashed rgba(16, 185, 129, 0.3)",
        borderRadius: "20px",
        position: "relative",
        pointerEvents: "none",
        boxShadow: "inset 0 0 40px rgba(16, 185, 129, 0.05)",
      }}
    >
      {/* Cluster label */}
      <div
        style={{
          position: "absolute",
          top: -12,
          left: 20,
          background: "#050505",
          padding: "0 8px",
          fontSize: "12px",
          fontWeight: 800,
          color: "#34d399",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontFamily: "'Inter', sans-serif",
          textShadow: "0 0 10px rgba(16,185,129,0.5)",
        }}
      >
        {data.label}
      </div>
    </div>
  );
}

/* ─── Custom file node ────────────────────────────────────────────────── */
function CustomNode({ data }) {
  const color  = LANG_COLORS[data.language] || "#9ca3af";
  const isEntry = data.isEntry;
  const isDimmed = data.isDimmed;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background:   "rgba(10, 15, 20, 0.95)",
        backdropFilter: "blur(8px)",
        border:       isEntry ? "1.5px solid #f97316" : "1px solid rgba(16,185,129,0.4)",
        borderRadius: "12px",
        padding:      "10px 16px",
        minWidth:     "150px",
        boxShadow:    isEntry
          ? "0 0 20px rgba(249,115,22,0.4), inset 0 0 10px rgba(249,115,22,0.1)"
          : isHovered ? "0 0 15px rgba(16,185,129,0.5), inset 0 0 8px rgba(16,185,129,0.2)" : "0 4px 12px rgba(0,0,0,0.5)",
        display:      "flex",
        flexDirection:"column",
        gap:          "4px",
        opacity:      isDimmed ? 0.2 : 1,
        transform:    isHovered && !isDimmed ? "scale(1.05) translateY(-2px)" : "scale(1) translateY(0)",
        transition:   "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        cursor:       "pointer",
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: color,
          boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize:   "12px",
          fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
          fontWeight: 500,
          color:      "#f3f4f6",
          letterSpacing: "0.02em",
          lineHeight: 1.3,
        }}>
          {data.label}
        </span>
      </div>

      {isEntry && (
        <div style={{
          fontSize:      "9px",
          fontWeight:    800,
          color:         "#f97316",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          marginTop:     "2px",
          textShadow:    "0 0 5px rgba(249,115,22,0.5)",
        }}>
          ENTRY POINT
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  );
}

const nodeTypes = { custom: CustomNode, group: GroupNode };

/* ─── Edge defaults ──────────────────────────────────────────────────── */
const buildEdgeStyle = () => ({
  type:     "smoothstep",
  animated: true,
  style:    { 
    stroke: "url(#tealGlow)", 
    strokeWidth: 2, 
    opacity: 0.9,
    filter: "drop-shadow(0 0 5px rgba(16,185,129,0.8))"
  },
  markerEnd: {
    type:   MarkerType.ArrowClosed,
    width:  16,
    height: 16,
    color:  "#10b981",
  },
});

/* ─── Main component ─────────────────────────────────────────────────── */
export default function DependencyGraph({ nodes: initialNodes, edges: initialEdges, onNodeClick }) {
  const [searchQuery, setSearchQuery] = useState("");

  const mappedEdges = initialEdges.map((e) => ({
    ...e,
    ...buildEdgeStyle(),
    style: {
      ...buildEdgeStyle().style,
      strokeDasharray: e.animated ? "5 5" : "none", // Dashed lines for deps
    }
  }));

  const mapNodes = (query) =>
    initialNodes.map((n) => {
      if (n.data?.isGroup) return { ...n, type: "group" };
      const q = query.toLowerCase();
      const match = !q
        || n.data.label.toLowerCase().includes(q)
        || (n.data.filePath && n.data.filePath.toLowerCase().includes(q));
      return { ...n, type: "custom", data: { ...n.data, isDimmed: !match } };
    });

  const [nodes, setNodes, onNodesChange] = useNodesState(mapNodes(""));
  const [edges, setEdges, onEdgesChange] = useEdgesState(mappedEdges);
  const onConnect = useCallback((p) => setEdges((eds) => addEdge(p, eds)), [setEdges]);

  useEffect(() => {
    setNodes(mapNodes(searchQuery));
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: { ...e.style, opacity: searchQuery ? 0.1 : 0.9 },
      }))
    );
  }, [searchQuery]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#030712" }}>
      
      {/* SVG Definitions for gradients */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="tealGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>

      {/* Search bar */}
      <div
        className="absolute z-10"
        style={{ top: 20, left: "50%", transform: "translateX(-50%)", width: 340 }}
      >
        <div style={{ position: "relative" }}>
          <Search
            size={14}
            style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)", color: "#6b7280",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search nodes by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width:        "100%",
              background:   "rgba(17, 24, 39, 0.8)",
              backdropFilter: "blur(12px)",
              border:       "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "20px",
              padding:      "10px 16px 10px 38px",
              fontSize:     "13px",
              color:        "#e5e7eb",
              outline:      "none",
              boxShadow:    "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 10px rgba(16,185,129,0.1)",
              boxSizing:    "border-box",
              transition:   "all 0.3s ease",
            }}
            onFocus={(e)  => { 
              e.target.style.borderColor = "#10b981"; 
              e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16,185,129,0.3)";
            }}
            onBlur={(e)   => { 
              e.target.style.borderColor = "rgba(16, 185, 129, 0.3)"; 
              e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 10px rgba(16,185,129,0.1)";
            }}
          />
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          if (node.data?.isGroup) return;
          onNodeClick && onNodeClick(node);
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        colorMode="dark"
        style={{ background: "transparent" }}
        minZoom={0.1}
        maxZoom={2.5}
        defaultEdgeOptions={buildEdgeStyle()}
      >
        <Controls
          style={{
            background: "rgba(17, 24, 39, 0.8)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
          }}
        />

        <MiniMap
          nodeColor={(n) => {
            if (n.data?.isGroup) return "transparent";
            return n.data?.isEntry ? "#f97316" : "#10b981";
          }}
          maskColor="rgba(3, 7, 18, 0.7)"
          style={{
            background: "rgba(17, 24, 39, 0.8)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
          }}
        />

        <Background
          variant={BackgroundVariant.Lines}
          gap={32}
          lineWidth={1}
          color="rgba(16, 185, 129, 0.05)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1.5}
          color="rgba(16, 185, 129, 0.15)"
        />
      </ReactFlow>
    </div>
  );
}
