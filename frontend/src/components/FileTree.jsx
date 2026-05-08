import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, FileText, FileJson, File } from "lucide-react";

const EXT_ICONS = {
  js: { icon: FileCode, color: "#f59e0b" },
  jsx: { icon: FileCode, color: "#f59e0b" },
  ts: { icon: FileCode, color: "#38bdf8" },
  tsx: { icon: FileCode, color: "#38bdf8" },
  py: { icon: FileCode, color: "#10b981" },
  go: { icon: FileCode, color: "#22d3ee" },
  json: { icon: FileJson, color: "#9ca3af" },
  md: { icon: FileText, color: "#9ca3af" },
  css: { icon: FileCode, color: "#f472b6" },
  scss: { icon: FileCode, color: "#f472b6" },
  html: { icon: FileCode, color: "#fb923c" },
};

function getFileIcon(name) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  const entry = EXT_ICONS[ext];
  if (!entry) return { icon: File, color: "#484f58" };
  return entry;
}

function FileNode({ item, onSelect, selectedPath, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = item.type === "dir";
  const isSelected = selectedPath === item.path;
  const { icon: FileIcon, color: fileColor } = getFileIcon(item.name);

  return (
    <div>
      <button
        onClick={() => { if (isDir) setOpen(!open); else onSelect(item); }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: `3px 10px 3px ${10 + depth * 12}px`,
          background: isSelected ? "rgba(16,185,129,0.08)" : "transparent",
          color: isSelected ? "#10b981" : "#8b949e",
          border: "none",
          cursor: "pointer",
          fontSize: "12px",
          fontFamily: "'Geist Mono', 'Fira Code', 'JetBrains Mono', monospace",
          textAlign: "left",
          borderRadius: "4px",
          transition: "all 0.1s",
          lineHeight: 1.4,
        }}
        onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#c9d1d9"; } }}
        onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8b949e"; } }}
      >
        {isDir ? (
          <>
            {open
              ? <ChevronDown size={11} style={{ flexShrink: 0, color: "#484f58" }} />
              : <ChevronRight size={11} style={{ flexShrink: 0, color: "#484f58" }} />
            }
            {open
              ? <FolderOpen size={13} style={{ color: "#10b981", flexShrink: 0 }} />
              : <Folder size={13} style={{ color: "#484f58", flexShrink: 0 }} />
            }
          </>
        ) : (
          <>
            <span style={{ width: 11, flexShrink: 0 }} />
            <FileIcon size={12} style={{ color: isSelected ? "#10b981" : fileColor, flexShrink: 0 }} />
          </>
        )}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.name}
        </span>
      </button>
      {isDir && open && item.children?.map(child => (
        <FileNode key={child.path} item={child} onSelect={onSelect} selectedPath={selectedPath} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function FileTree({ fileTree, onSelect, selectedPath }) {
  return (
    <div style={{ padding: "4px 0" }}>
      {fileTree?.map(item => (
        <FileNode key={item.path} item={item} onSelect={onSelect} selectedPath={selectedPath} />
      ))}
    </div>
  );
}
