# 🔥 Forge Backend

AI-powered habit tracking backend — **Dev 4** responsibilities:  
Claude API integration · Pattern Detection · Firebase Notifications

---

## 📁 Folder Structure

```
backend/
├── server.js               ← Express entry point
├── .env.example            ← Copy to .env and fill in keys
├── package.json
├── routes/
│   ├── routine.js          ← POST /api/routine  (Routine Analysis)
│   ├── lapse.js            ← POST /api/lapse    (Lapse Evaluation)
│   ├── pattern.js          ← POST /api/pattern  (Pattern Detection ⭐)
│   └── notify.js           ← POST /api/notify   (Push Notification)
└── utils/
    ├── claude.js           ← Shared Claude API helper
    └── firebase.js         ← Firebase Admin SDK + sendNotification()
```

---

## ⚡ How to Run

### 1. Go into the backend folder
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
copy .env.example .env
```
Open `.env` and add:
- `CLAUDE_API_KEY` → from [console.anthropic.com](https://console.anthropic.com/)
- `FIREBASE_SERVICE_ACCOUNT_PATH` → path to your Firebase JSON key

> **Firebase JSON key:** Go to Firebase Console → Project Settings → Service Accounts → Generate New Private Key

### 4. Start the server
```bash
node server.js
# or for auto-reload during development:
npm run dev
```

Server runs at: **http://localhost:3001**

---

## 📡 API Reference & Sample Requests

### 1. Routine Analysis — `POST /api/routine`

**Request:**
```json
{
  "wakeTime": "6:00 AM",
  "workHours": 8,
  "freeTime": 3,
  "energyPeak": "morning"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "habits": [
      { "name": "Morning Meditation", "reason": "Matches your peak energy at dawn" },
      { "name": "Evening Walk",       "reason": "Great for decompressing after work" },
      { "name": "Reading",            "reason": "Ideal for winding down your free time" }
    ],
    "timeSlots": [
      { "habit": "Morning Meditation", "bestTime": "6:15 AM", "duration": "15 minutes" },
      { "habit": "Evening Walk",       "bestTime": "6:30 PM", "duration": "30 minutes" },
      { "habit": "Reading",            "bestTime": "9:00 PM", "duration": "30 minutes" }
    ]
  }
}
```

---

### 2. Lapse Evaluation — `POST /api/lapse`

**Request:**
```json
{
  "reason": "I had a really bad migraine and couldn't get out of bed."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verdict": "APPROVE",
    "explanation": "A migraine is a genuine health issue. Rest up and get back on track tomorrow!"
  }
}
```

---

### 3. Pattern Detection ⭐ — `POST /api/pattern`

**Request:**
```json
{
  "reasons": [
    "Too tired after work",
    "Low energy in the evening",
    "Felt exhausted",
    "Couldn't wake up on time",
    "Too sleepy"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insight": "Pattern detected: You often miss habits due to persistent low energy and fatigue.",
    "totalReasonsAnalyzed": 5
  }
}
```

---

### 4. Push Notification — `POST /api/notify`

**Request:**
```json
{
  "token": "<FCM_DEVICE_REGISTRATION_TOKEN>",
  "type": "morning"
}
```

**Available types:** `morning` · `streak` · `lapse` · `encouragement` · `weekly`

**Response:**
```json
{
  "success": true,
  "messageId": "projects/forge-app/messages/0:12345",
  "notification": {
    "title": "🌅 Good Morning, Forge Warrior!",
    "body": "A new day, a new streak. Start strong — your habits are waiting for you!"
  }
}
```

> **Tip:** List all templates: `GET /api/notify/types`

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `CLAUDE_API_KEY` | Anthropic API key |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service account JSON |
| `PORT` | Server port (default: 3001) |

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `express` | Web framework |
| `axios` | HTTP client for Claude API calls |
| `dotenv` | Load `.env` variables |
| `firebase-admin` | Firebase Cloud Messaging |
| `nodemon` | Auto-restart during development |
