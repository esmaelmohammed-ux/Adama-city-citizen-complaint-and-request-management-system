# Adama City Citizen Portal — Frontend

React + Vite single-page application for the Adama City complaint and service request system.

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Architecture

- **Routing:** React Router with role-based protected routes
- **State:** React Context + `localStorage` (mock backend until API is built)
- **Styling:** Custom CSS (teal municipal theme, responsive layout)

## Folder structure

```
src/
├── components/     # Layout, tables, modals, UI primitives
├── constants/      # Roles, statuses, categories
├── context/        # AppContext (auth + data operations)
├── data/           # Seed/demo data
├── pages/
│   ├── admin/      # Admin dashboards and management
│   ├── citizen/    # Citizen flows
│   ├── officer/    # Officer workflows
│   └── shared/     # Shared pages (notifications)
└── utils/          # Storage helpers
```

## Connecting to a backend later

Replace methods in `src/context/AppContext.jsx` with Axios calls to your API. Keep the same state shape so pages require minimal changes.

Suggested env variable:

```
VITE_API_URL=http://localhost:5000/api
```
