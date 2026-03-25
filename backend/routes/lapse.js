// ─────────────────────────────────────────────
//  routes/lapse.js — Lapse Evaluation API
//
//  POST /api/lapse
//  Input:  { reason: "I had a migraine" }
//  Output: { verdict: "APPROVE" | "DENY", explanation: "..." }
//
//  Claude judges whether the excuse for missing
//  a habit is genuine or not.
// ─────────────────────────────────────────────

const express        = require("express");
const router         = express.Router();
const { callClaude } = require("../utils/claude");

router.post("/", async (req, res) => {
  // 1. Get the user's excuse from the request body
  const { reason } = req.body;

  // 2. Validate — reason is required
  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({
      error: "Please provide a 'reason' for missing the habit",
    });
  }

  try {
    // 3. Tell Claude how to judge excuses
    const systemPrompt = `You are a strict but fair habit accountability coach.
A user missed their habit and gave an excuse. Decide if it is GENUINE or not.

Rules:
- APPROVE if the reason is a real hardship (illness, emergency, mental health crisis, etc.)
- DENY if the reason is vague, lazy, or avoidable (e.g. "I forgot", "I was busy", "didn't feel like it")
- Be firm but empathetic — think like a coach, not a judge.

Always respond with valid JSON in this exact format:
{
  "verdict": "APPROVE" or "DENY",
  "explanation": "One or two sentences explaining your decision in a supportive tone."
}
Do not include any text outside the JSON.`;

    // 4. Send the excuse to Claude
    const userPrompt = `The user missed their habit today. Their reason: "${reason}"
Should this lapse be approved (genuine excuse) or denied?`;

    // 5. Call Claude and parse result
    const rawResponse = await callClaude(systemPrompt, userPrompt);
    const parsed = JSON.parse(rawResponse);

    // 6. Return the verdict
    res.json({
      success: true,
      data: parsed,
    });

  } catch (error) {
    console.error("Lapse API error:", error.message);
    res.status(500).json({
      error: "Failed to evaluate lapse. Check your Claude API key and try again.",
      details: error.message,
    });
  }
});

module.exports = router;
