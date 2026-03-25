// ─────────────────────────────────────────────
//  utils/firebase.js — Firebase Admin SDK Helper
//  Initializes Firebase once and exports a helper
//  function to send push notifications via FCM.
// ─────────────────────────────────────────────

const admin = require("firebase-admin");
const path  = require("path");

// Only initialize Firebase if it hasn't been initialized yet
// (prevents "already initialized" errors on hot-reloads)
if (!admin.apps.length) {
  // Load the service account file path from .env
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    console.warn(
      "⚠️  FIREBASE_SERVICE_ACCOUNT_PATH is not set. Notifications will not work."
    );
  } else {
    // Resolve the path relative to the project root
    const serviceAccount = require(path.resolve(serviceAccountPath));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized");
  }
}

/**
 * sendNotification — sends a push notification to a device via FCM.
 *
 * @param {string} token - The FCM device registration token
 * @param {string} title - Notification title
 * @param {string} body  - Notification body text
 * @returns {string}     - FCM message ID
 */
async function sendNotification(token, title, body) {
  const message = {
    notification: {
      title, // e.g. "🌅 Good Morning!"
      body,  // e.g. "Start your day strong — your habits are waiting!"
    },
    token, // The target device's FCM token
  };

  // Send the message and return the FCM message ID
  const messageId = await admin.messaging().send(message);
  return messageId;
}

module.exports = { sendNotification };
