// ─────────────────────────────────────────────
//  utils/claude.js — Claude API Helper
//  Wraps the Anthropic Messages API so all routes
//  can call Claude without repeating axios setup.
// ─────────────────────────────────────────────

const axios = require("axios");

/**
 * callClaude — sends a prompt to Claude and returns the response text.
 *
 * @param {string} systemPrompt - Instructions that define Claude's role/behavior
 * @param {string} userPrompt   - The actual question or task for Claude
 * @returns {string}            - Claude's text response
 */
async function callClaude(systemPrompt, userPrompt) {
  // Make sure the API key is set in .env
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error("CLAUDE_API_KEY is missing from your .env file");
  }

  // Call the Anthropic Messages API
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-3-haiku-20240307", // Fast + affordable — great for hackathons
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    },
    {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    }
  );

  // Extract the text content from Claude's reply
  return response.data.content[0].text;
}

module.exports = { callClaude };
