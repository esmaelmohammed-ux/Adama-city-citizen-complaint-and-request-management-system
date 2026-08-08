# Adama City — Citizen Complaint & Service Request System

Web platform for **Adama City Administration** to digitize municipal complaints and service requests: citizens report issues online, administrators assign work to departments, and officers resolve cases with full status tracking.

## Overview

| Concept | Description |
|---------|-------------|
| **Complaint** | Report a problem (broken streetlight, water leak, uncollected waste) |
| **Service Request** | Ask for a new service (waste bin, street cleaning, permit inquiry) |
| **Actors** | Citizen, Administrator, Department Officer |
| **Status flow** | Pending → In Progress → Resolved / Rejected / Closed *(role-restricted)* |
| **Architecture** | React (Vite) frontend → Express API → MongoDB Atlas (or local) |

## Documentation

- [Project Proposal v2.1](./Project_Proposal_Web_Based_Citizen_Complaint_and_Service_Request.md) — requirements, ER diagram, database schema, timeline, testing, deployment
- [Frontend README](./frontend/README.md) — SPA structure and scripts

## Quick Start

### 1. Backend API

```bash
cd backend
npm install
cp .env.example .env    # set Atlas credentials + JWT_SECRET
npm run seed            # demo users + sample data
npm run dev             # http://localhost:5000/api
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@test.com` | `citizen123` |
| Administrator | `admin@test.com` | `admin123` |
| Department Officer | `officer@test.com` | `officer123` |

> Frontend talks to the live API (`VITE_API_URL`). JWT is stored in `localStorage` after login.

## Features

| Area | Capabilities |
|------|----------------|
| **Public** | Guest landing (EN/AM/OM), smooth-scroll nav, login, citizen registration |
| **Citizen** | Submit complaint (optional photo) / service request, track status + history, notifications, profile |
| **Admin** | Assign to department/officer, reject pending items, manage users (activate/deactivate) & departments (add), reports summary, activity log |
| **Officer** | Department queue + assigned tasks, start work, resolve/close with notes |

**Status rules (implemented):**

- Admin routes to **department only** → stays **Pending** (department queue)
- Admin assigns to **officer** (or officer starts work) → **In Progress**
- Officer: Pending → In Progress; In Progress → Resolved / Closed *(cannot reject)*
- Admin: Pending → Rejected; In Progress → Resolved / Closed / Rejected; Resolved → Closed

**Complaint categories:** Road Maintenance, Waste Management, Water Supply, Street Lighting, Drainage, Public Safety, Noise Pollution, Other.

**Service types:** Waste Collection, Street Cleaning, Water Connection Inquiry, Public Facility Access, General Information, Other.

## Tech Stack

| Layer | Stack | Status |
|-------|-------|--------|
| Frontend | React, Vite, React Router, Context API, `fetch` | ✅ Done |
| Backend | Node.js, Express, Helmet, Multer, express-validator | ✅ Done |
| Database | MongoDB (Atlas or local) + Mongoose | ✅ Done |
| Auth | JWT + bcrypt, role-based route protection | ✅ Done |
| i18n | English, Amharic, Afaan Oromo (guest UI) | ✅ Done |

## Project Structure

```
Citizen/
├── frontend/                 # React SPA (Vite)
├── backend/                  # Node.js + Express REST API
├── Project_Proposal_....md   # Full system specification
└── README.md
```

## Backend Environment

Copy `backend/.env.example` → `backend/.env`:

| Variable | Purpose |
|----------|---------|
| `MONGODB_USER` / `MONGODB_PASSWORD` | Atlas database user |
| `MONGODB_CLUSTER` | Atlas host (e.g. `cluster0….mongodb.net`) |
| `MONGODB_DB` | Database name (default `adama_citizen`) |
| `MONGODB_URI` | Optional full URI (local or Atlas); used if user/password not set |
| `JWT_SECRET` | Required signing secret |
| `CLIENT_ORIGIN` | CORS origin (`http://localhost:5173`) |

Also whitelist your IP in MongoDB Atlas **Network Access**.

## Main API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/login` | POST | Login (returns JWT) |
| `/api/auth/register` | POST | Citizen registration |
| `/api/auth/me` | GET | Current user |
| `/api/complaints` | GET/POST | List / submit complaints |
| `/api/complaints/:id/assign` | PATCH | Assign to department/officer |
| `/api/complaints/:id/status` | PATCH | Update status |
| `/api/service-requests` | GET/POST | List / submit requests |
| `/api/service-requests/:id/assign` | PATCH | Assign request |
| `/api/service-requests/:id/status` | PATCH | Update request status |
| `/api/uploads` | POST | Complaint photo upload |
| `/api/users` | GET | List users (admin) |
| `/api/users/:id/active` | PATCH | Activate/deactivate user |
| `/api/departments` | GET/POST | List / add departments |
| `/api/notifications` | GET | User notifications |
| `/api/reports/summary` | GET | Dashboard-style counts |
| `/api/activity-logs` | GET | Admin activity log |

## Roadmap / Remaining Work

1. ~~Node.js/Express REST API~~ ✅
2. ~~Connect frontend to API~~ ✅
3. ~~JWT auth, password hashing, RBAC~~ ✅
4. ~~Photo upload for complaints~~ ✅
5. ~~Multi-language guest UI (EN/AM/OM)~~ ✅
6. Email/SMS notifications, email password reset
7. Full user/department edit-delete, report export, pagination
8. Production deployment (HTTPS, backups)
