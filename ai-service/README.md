# Adama Citizen — AI service

Optional sidecar for the Adama City Citizen **Complaint** system. The main React app calls this service for writing help, admin triage, officer resolution drafts, and a FAQ chatbot.

If this process is not running, the main app still works; AI panels show a connection error until you start it.

AI **suggests only**. Assign, reject, resolve, and close stay in the main Citizen app with a human confirmation.

## Used from the main app

| Place | What it does |
|-------|----------------|
| **Citizen — New complaint** | Improve title/description, suggest category, similar cases, browser **voice input** |
| **Admin — complaint detail** | Department / priority advice and duplicate risk |
| **Officer — task detail** | Draft a resolution note from the case |
| **Chat widget** | FAQ (tracking, roles, categories, login) on any signed-in or public page |

A standalone helper UI is also available at **http://localhost:5100**.

## Quick start

```bash
cd ai-service
npm install
cp .env.example .env
npm run dev
```

Frontend `.env` should include:

```
VITE_AI_URL=http://localhost:5100
```

### Providers

| `AI_PROVIDER` | Needs |
|---------------|--------|
| `gemini` (default, free tier) | `GEMINI_API_KEY` from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `openai` (paid) | `OPENAI_API_KEY` |
| `heuristic` (offline) | none |

Missing cloud keys → automatic **heuristic** fallback.

### Optional MongoDB (similar cases)

Use the same Atlas credentials as the main backend (`MONGODB_URI` or `MONGODB_USER` / `PASSWORD` / `CLUSTER` / `DB`).

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/ai/meta` | Provider + feature list |
| POST | `/api/ai/assist` | Citizen pack (improve + classify + similar) |
| POST | `/api/ai/triage` | Admin pack (classify + similar + advice) |
| POST | `/api/ai/resolution` | Officer resolution draft |
| POST | `/api/ai/chat` | FAQ chatbot `{ message, history? }` |
| POST | `/api/ai/categorize` | Classify only |
| POST | `/api/ai/improve` | Improve text only |
| POST | `/api/ai/similar` | Similar cases only |

## Voice

Microphone buttons in the main app use the **browser Web Speech API** (Chrome / Edge). Audio is not uploaded to this server.
