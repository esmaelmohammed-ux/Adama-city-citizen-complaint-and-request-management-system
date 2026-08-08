# Adama Citizen — AI Hub (sidecar)

Standalone AI layer for the Adama City Citizen Complaint & Service Request system.

**Does not modify** `backend/` or `frontend/`. Open the helper UI, get suggestions, paste into the main app.

## Modes (A + B + D)

| Mode | What it does |
|------|----------------|
| **Citizen** | Writing assist, category/service type, department, priority, similar cases, **voice input** |
| **Admin triage** | Routing advice, priority, duplicate risk, action checklist |
| **Officer** | Resolution note + citizen update draft from action taken |
| **Chatbot** | FAQ for tracking, roles, categories, departments, login |

## Quick start

```bash
cd ai-service
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5100**

### Providers

| `AI_PROVIDER` | Needs |
|---------------|--------|
| `gemini` (default, free tier) | `GEMINI_API_KEY` from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `openai` (paid) | `OPENAI_API_KEY` |
| `heuristic` (offline free) | none |

Missing cloud keys → automatic **heuristic** fallback.

### Optional MongoDB (duplicates)

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

🎤 buttons use the **browser Web Speech API** (Chrome/Edge). Audio is not uploaded to the server.

## Safety

AI **suggests only**. Assignment, reject, resolve, and close stay in the main Citizen app with human confirmation.
