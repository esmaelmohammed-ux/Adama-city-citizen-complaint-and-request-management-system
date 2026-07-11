<<<<<<< HEAD
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
=======
# Adama City — Citizen Complaint & Service Request System

Web platform for **Adama City Administration** to digitize municipal complaints and service requests: citizens report issues online, administrators assign work to departments, and officers resolve cases with full status tracking.

## Overview

| Concept | Description |
|---------|-------------|
| **Complaint** | Report a problem (broken streetlight, water leak, uncollected waste) |
| **Service Request** | Ask for a new service (waste bin, street cleaning, permit inquiry) |
| **Actors** | Citizen, Administrator, Department Officer |
| **Status flow** | Pending → In Progress → Resolved / Rejected / Closed |
| **Architecture** | React frontend → Node.js API → MongoDB (backend planned) |

## Documentation

- [Project Proposal v2.0](./Project_Proposal_Web_Based_Citizen_Complaint_and_Service_Request.md) — requirements, ER diagram, database schema, timeline, testing, deployment
- [Frontend README](./frontend/README.md) — app structure and scripts

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@test.com` | `citizen123` |
| Administrator | `admin@test.com` | `admin123` |
| Department Officer | `officer@test.com` | `officer123` |

> Frontend uses **mock data + localStorage** until the backend API is built.

## Features

| Area | Capabilities |
|------|----------------|
| **Public** | Landing, login, citizen registration |
| **Citizen** | Submit complaint/request, track status, search & filter, notifications, profile |
| **Admin** | Assign to departments, manage users & departments, reports, activity log |
| **Officer** | View assigned tasks, update progress, resolve/close with notes |

**Complaint categories:** Road Maintenance, Waste Management, Water Supply, Street Lighting, Drainage, Public Safety, Noise Pollution, Other.

**Service types:** Waste Collection, Street Cleaning, Water Connection Inquiry, Public Facility Access, General Information, Other.

## Tech Stack

| Layer | Stack | Status |
|-------|-------|--------|
| Frontend | React, Vite, React Router | ✅ Done |
| Backend | Node.js, Express | 🔲 Planned |
| Database | MongoDB | 🔲 Planned |
| Auth | JWT + bcrypt | 🔲 Planned (mock login in frontend) |

## Project Structure

```
Citizen/
├── frontend/                 # React SPA
├── backend/                  # Node.js + Express REST API
├── Project_Proposal_....md   # Full system specification
└── README.md
```

## Backend Quick Start

Requires **MongoDB** running locally (or set `MONGODB_URI` in `backend/.env`).

```bash
cd backend
npm install
cp .env.example .env    # first time only
npm run seed            # demo users + sample data
npm run dev             # http://localhost:5000/api
```

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/login` | POST | Login (returns JWT) |
| `/api/auth/register` | POST | Citizen registration |
| `/api/complaints` | GET/POST | List / submit complaints |
| `/api/service-requests` | GET/POST | List / submit requests |

## Roadmap

1. ~~Node.js/Express REST API~~ ✅ Initial backend implemented
2. Connect frontend to API (replace `AppContext` localStorage layer)
3. ~~JWT auth, password hashing, role-based access control~~ ✅
4. Photo upload for complaints, email/SMS notifications, deployment
>>>>>>> 7b79478db968e9bd6931f076da0b15e165d18312
