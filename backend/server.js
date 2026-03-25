// ─────────────────────────────────────────────
//  server.js — Forge Backend Entry Point
//  Starts the Express server and registers routes
// ─────────────────────────────────────────────

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// ── Import route handlers ──────────────────────
const routineRouter = require("./routes/routine");
const lapseRouter   = require("./routes/lapse");
const patternRouter = require("./routes/pattern");
const notifyRouter  = require("./routes/notify");

// ── Register routes ────────────────────────────
// All API routes are prefixed with /api
app.use("/api/routine", routineRouter); // Routine Analysis
app.use("/api/lapse",   lapseRouter);   // Lapse Evaluation
app.use("/api/pattern", patternRouter); // Pattern Detection
app.use("/api/notify",  notifyRouter);  // Push Notifications

// ── Health check route ─────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Forge Backend is running 🔥",
    routes: [
      "POST /api/routine  — Routine Analysis",
      "POST /api/lapse    — Lapse Evaluation",
      "POST /api/pattern  — Pattern Detection",
      "POST /api/notify   — Push Notification",
    ],
  });
});

// ── Start the server ───────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Forge backend running at http://localhost:${PORT}`);
});
