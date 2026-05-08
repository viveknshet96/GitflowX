import mongoose from "mongoose";

const FileTreeItemSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["file", "dir"], required: true },
    size: Number,
    language: String,
    children: { type: Array, default: [] },
  },
  { _id: false }
);

const GraphNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String },           // "group" | "custom" | undefined
    parentId: { type: String },       // links child to group node
    extent: { type: String },         // "parent" for child nodes
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    style: {                          // used by group nodes for width/height
      width: Number,
      height: Number,
    },
    data: {
      label: String,
      filePath: String,
      language: String,
      isEntry: Boolean,
      isGroup: Boolean,
      size: Number,
      domain: String,
    },
  },
  { _id: false }
);

const GraphEdgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    animated: { type: Boolean, default: false },
  },
  { _id: false }
);

const RepoAnalysisSchema = new mongoose.Schema(
  {
    repoUrl: { type: String, required: true },
    owner: { type: String, required: true },
    repo: { type: String, required: true },
    branch: { type: String, default: "main" },
    description: String,
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    language: String,
    topics: { type: [String], default: [] },
    entryPoint: String,
    runCommand: String,
    techStack: { type: [String], default: [] },
    summary: String,
    architecture: String,
    keyFiles: {
      type: [
        {
          path: String,
          description: String,
        },
      ],
      default: [],
    },
    nodes: { type: [GraphNodeSchema], default: [] },
    edges: { type: [GraphEdgeSchema], default: [] },
    fileTree: { type: Array, default: [] },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

RepoAnalysisSchema.index({ owner: 1, repo: 1 }, { unique: true });

export default mongoose.model("RepoAnalysis", RepoAnalysisSchema);
