// ─────────────────────────────────────────────
//  routes/pattern.js — Pattern Detection API
//
//  POST /api/pattern
//  Input:  { reasons: ["Too tired", "Low energy", "Felt sleepy", ...] }
//  Output: { insight: "Pattern detected: You often miss habits due to low energy." }
//
//  Claude reads all the user's past excuses and
//  finds a behavioral pattern hidden in them.
// ─────────────────────────────────────────────

const express        = require("express");
const router         = express.Router();
const { callClaude } = require("../utils/claude");

router.post("/", async (req, res) => {
  // 1. Get the array of past reasons from the request body
  const { reasons } = req.body;

  // 2. Validate — we need at least 2 reasons to detect a pattern
  if (!reasons || !Array.isArray(reasons) || reasons.length < 2) {
    return res.status(400).json({
      error: "Please provide a 'reasons' array with at least 2 past excuses",
    });
  }

  try {
    // 3. Tell Claude it is a behavioral pattern analyst
    const systemPrompt = `You are a behavioral pattern analyst for a habit tracking app.
Your job is to read a list of excuses a user gave for missing their habits and identify the common underlying pattern.

Rules:
- Look for theme clusters: time-based, energy-based, emotion-based, social-based, health-based, etc.
- Be insightful and specific — not generic.
- Always start your response with exactly: "Pattern detected:"
- Keep the insight to one clear, concise sentence (max 20 words).
- Do not add any extra text, greetings, or explanation. Just the one sentence.`;

    // 4. Format the reasons list for the prompt
    const reasonsList = reasons
      .map((r, i) => `${i + 1}. "${r}"`)
      .join("\n");

    const userPrompt = `Here are the user's past reasons for missing their habits:\n${reasonsList}\n\nWhat behavioral pattern do you detect?`;

    // 5. Call Claude — response is a plain string, not JSON
    const insight = await callClaude(systemPrompt, userPrompt);

    // 6. Clean up and ensure it starts with "Pattern detected:"
    const cleanInsight = insight.trim();

    res.json({
      success: true,
      data: {
        insight: cleanInsight,
        totalReasonsAnalyzed: reasons.length,
      },
    });

  } catch (error) {
    console.error("Pattern API error:", error.message);
    res.status(500).json({
      error: "Failed to detect pattern. Check your Claude API key and try again.",
      details: error.message,
    });
  }
});

module.exports = router;
