import { Router } from "express";
import RepoAnalysis from "../models/RepoAnalysis.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const items = await RepoAnalysis.find()
      .select("repoUrl owner repo description language stars analyzedAt")
      .sort({ analyzedAt: -1 })
      .limit(50)
      .lean();

    res.json({
      items: items.map((item) => ({ ...item, id: item._id.toString() })),
      total: items.length,
    });
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await RepoAnalysis.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "NOT_FOUND", message: "Not found" });
    res.json({ ...item, id: item._id.toString(), cached: true });
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await RepoAnalysis.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "NOT_FOUND", message: "Not found" });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
  }
});

export default router;
