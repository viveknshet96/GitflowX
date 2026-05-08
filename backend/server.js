import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import repoRoutes from "./routes/repoRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/repos", repoRoutes);
app.use("/api/history", historyRoutes);

app.get("/api/healthz", (req, res) => {
  res.json({ status: "ok" });
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/gitflowx")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
