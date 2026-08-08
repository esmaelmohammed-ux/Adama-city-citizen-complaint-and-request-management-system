# Adama City Citizen Portal — Frontend

React + Vite single-page application for the Adama City complaint and service request system. Talks to the Express API in `../backend`.

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # Oxlint
```

## Setup

1. Start the backend (`../backend`) and seed data first.
2. Ensure `.env` contains:

```
VITE_API_URL=http://localhost:5000/api
```

3. Run `npm install` then `npm run dev`.

## Architecture

- **Routing:** React Router with role-based `ProtectedRoute` / `PublicOnlyRoute`
- **State:** React Context (`AppContext`) calling the live REST API via `services/api.js`
- **Auth:** JWT stored in `localStorage` (optional remember-me)
- **i18n:** English, Amharic, Afaan Oromo (`LanguageContext` + `i18n/`)
- **Feedback:** Success popup for citizen submissions; toast notifications for admin/officer actions
- **Styling:** Custom CSS (Adama municipal palette, responsive layout)

## Folder structure

```
src/
├── components/     # Layout, tables, modals, Toast, SuccessPopup, guest UI
├── constants/      # Roles, statuses, categories
├── context/        # AppContext, LanguageContext, ToastContext
├── data/           # Guest landing content (not app data store)
├── hooks/          # usePageMeta
├── i18n/           # en, am, om dictionaries
├── pages/
│   ├── admin/      # Admin dashboards and management
│   ├── citizen/    # Citizen flows
│   ├── officer/    # Officer workflows
│   └── shared/     # Shared pages (notifications)
├── services/       # API client (fetch)
└── utils/          # dateFormat, storage helpers, smoothScroll
```

## Roles & routes

| Role | Base path |
|------|-----------|
| Guest (public) | `/` |
| Citizen | `/citizen/*` |
| Administrator | `/admin/*` |
| Department Officer | `/officer/*` |

## Demo accounts

Same as root README after `npm run seed` in backend:

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@test.com` | `citizen123` |
| Administrator | `admin@test.com` | `admin123` |
| Officer | `officer@test.com` | `officer123` |
