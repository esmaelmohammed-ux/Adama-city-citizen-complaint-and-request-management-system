# Adama City Citizen Portal — Frontend

React + Vite single-page application for the Adama City **complaint** system. Talks to the Express API in `../backend`. Optional AI widgets call `../ai-service`.

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # Oxlint
```

## Setup

1. Start the backend (`../backend`) and seed data first.
2. Optional: start `../ai-service` for writing assist, triage, resolution drafts, and the chatbot.
3. Copy `.env.example` to `.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_AI_URL=http://localhost:5100
```

4. Run `npm install` then `npm run dev`.

## Architecture

- **Routing:** React Router with role-based `ProtectedRoute` / `PublicOnlyRoute`
- **State:** React Context (`AppContext`) calling the REST API via `services/api.js`
- **Auth:** JWT stored in `localStorage`
- **i18n:** English, Amharic, Afaan Oromo (`LanguageContext` + `i18n/`) for the public site and signed-in screens
- **Location:** `LocationSelect` — required Adama area (sub-cities, kebeles, landmarks) plus optional landmark text
- **AI:** `services/aiApi.js` → citizen assist, admin triage, officer resolution, floating chatbot
- **Feedback:** Success popup for new complaints; toasts for admin / officer actions
- **Styling:** Custom CSS (Adama municipal palette, responsive layout)

## Folder structure

```
src/
├── components/     # Layout, tables, LocationSelect, ImageUpload, AI widgets, guest UI
├── constants/      # Roles, statuses, categories, Adama location keys
├── context/        # AppContext, LanguageContext, ToastContext
├── data/           # Guest landing copy and images (not the live data store)
├── hooks/          # usePageMeta
├── i18n/           # en, am, om dictionaries
├── pages/
│   ├── admin/      # Dashboard, complaints, users, departments, reports, activity
│   ├── citizen/    # Dashboard, new complaint, my complaints, profile
│   ├── officer/    # Dashboard and assigned tasks
│   └── shared/     # Notifications (auto-marked seen when opened)
├── services/       # API client + AI client
└── utils/          # location labels, dates, storage, voice input, smooth scroll
```

## Roles and routes

| Role | Base path | Main screens |
|------|-----------|----------------|
| Guest | `/` | Landing, login, register, forgot / reset password |
| Citizen | `/citizen/*` | New complaint, my complaints (view / edit pending), notifications, profile |
| Administrator | `/admin/*` | Complaints, users, departments, reports, activity |
| Department Officer | `/officer/*` | Tasks, notifications |

## Demo accounts

Same as the root README after `npm run seed` in the backend:

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@test.com` | `citizen123` |
| Administrator | `admin@test.com` | `admin123` |
| Officer | `officer@test.com` | `officer123` |
