// ─────────────────────────────────────────────
//  routes/routine.js — Routine Analysis API
//
//  POST /api/routine
//  Input:  { wakeTime, workHours, freeTime, energyPeak }
//  Output: { habits: [...], timeSlots: [...] }
//
//  Sends the user's daily schedule to Claude and
//  asks it to recommend 3 habits and optimal times.
// ─────────────────────────────────────────────

const express      = require("express");
const router       = express.Router();
const { callClaude } = require("../utils/claude");

router.post("/", async (req, res) => {
  // 1. Extract data from the request body
  const { wakeTime, workHours, freeTime, energyPeak } = req.body;

  // 2. Validate — all fields are required
  if (!wakeTime || !workHours || !freeTime || !energyPeak) {
    return res.status(400).json({
      error: "Please provide wakeTime, workHours, freeTime, and energyPeak",
    });
  }

  try {
    // 3. Define Claude's role for this task
    const systemPrompt = `You are a habit coach and productivity expert. 
Given a person's daily routine, suggest exactly 3 healthy habits and the best time slots to do them.
Always respond with valid JSON in this exact format:
{
  "habits": [
    { "name": "habit name", "reason": "short reason why it suits them" },
    { "name": "habit name", "reason": "short reason why it suits them" },
    { "name": "habit name", "reason": "short reason why it suits them" }
  ],
  "timeSlots": [
    { "habit": "habit name", "bestTime": "e.g. 6:30 AM", "duration": "20 minutes" },
    { "habit": "habit name", "bestTime": "e.g. 1:00 PM", "duration": "15 minutes" },
    { "habit": "habit name", "bestTime": "e.g. 8:00 PM", "duration": "30 minutes" }
  ]
}
Do not include any text outside the JSON.`;

    // 4. Build the user-specific prompt
    const userPrompt = `Here is my daily routine:
- Wake time: ${wakeTime}
- Work hours per day: ${workHours}
- Free time available: ${freeTime} hours
- Peak energy time: ${energyPeak}

Based on this, suggest 3 habits and the best times to do them.`;

    // 5. Call Claude and parse the JSON response
    const rawResponse = await callClaude(systemPrompt, userPrompt);
    const parsed = JSON.parse(rawResponse);

    // 6. Send back the structured result
    res.json({
      success: true,
      data: parsed,
    });

  } catch (error) {
    console.error("Routine API error:", error.message);
    res.status(500).json({
      error: "Failed to analyze routine. Check your Claude API key and try again.",
      details: error.message,
    });
  }
});

module.exports = router;
