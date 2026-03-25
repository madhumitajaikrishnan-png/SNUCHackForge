// ─────────────────────────────────────────────
//  routes/notify.js — Push Notification API
//
//  POST /api/notify
//  Input:  { token: "<FCM device token>", type: "morning" | "streak" | "lapse" | "encouragement" | "weekly" }
//  Output: { success: true, messageId: "...", notification: { title, body } }
//
//  Picks a motivational message template based on
//  the type and sends it via Firebase Cloud Messaging.
// ─────────────────────────────────────────────

const express                  = require("express");
const router                   = express.Router();
const { sendNotification }     = require("../utils/firebase");

// ── 5 Message Templates ────────────────────────
// Each type has a title + body for the push notification.
// You can add more types or customize the text here.
const MESSAGE_TEMPLATES = {
  // Sent in the morning to motivate the user to start their habits
  morning: {
    title: "🌅 Good Morning, Forge Warrior!",
    body:  "A new day, a new streak. Start strong — your habits are waiting for you!",
  },

  // Sent when the user is on a winning streak
  streak: {
    title: "🔥 You're on Fire!",
    body:  "Your streak is alive! Don't break the chain — every day counts. Keep going!",
  },

  // Sent after a habit was missed (gentle reminder, not harsh)
  lapse: {
    title: "💪 Slipped? No Problem.",
    body:  "One miss doesn't ruin progress. Dust off and restart today. You've got this!",
  },

  // General motivational nudge during the day
  encouragement: {
    title: "✨ You're Doing Great!",
    body:  "Consistency beats perfection. Every small step is building your better self.",
  },

  // Sent at the end of the week with a summary prompt
  weekly: {
    title: "📅 Weekly Check-In",
    body:  "Another week in the books! Review your progress and set the tone for next week.",
  },
};

router.post("/", async (req, res) => {
  // 1. Get token and notification type from request body
  const { token, type } = req.body;

  // 2. Validate the device token
  if (!token || token.trim().length === 0) {
    return res.status(400).json({
      error: "Please provide a valid FCM device 'token'",
    });
  }

  // 3. Validate the notification type
  const validTypes = Object.keys(MESSAGE_TEMPLATES);
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({
      error: `Please provide a valid 'type'. Options: ${validTypes.join(", ")}`,
    });
  }

  // 4. Look up the message template for this type
  const { title, body } = MESSAGE_TEMPLATES[type];

  try {
    // 5. Send the notification via Firebase Admin SDK
    const messageId = await sendNotification(token, title, body);

    // 6. Return success with the details of what was sent
    res.json({
      success: true,
      messageId,
      notification: { title, body },
    });

  } catch (error) {
    console.error("Notify API error:", error.message);
    res.status(500).json({
      error: "Failed to send notification. Check your Firebase credentials.",
      details: error.message,
    });
  }
});

// Extra route: list all available notification types
// GET /api/notify/types
router.get("/types", (req, res) => {
  const types = Object.entries(MESSAGE_TEMPLATES).map(([type, msg]) => ({
    type,
    title: msg.title,
    body:  msg.body,
  }));
  res.json({ availableTypes: types });
});

module.exports = router;
