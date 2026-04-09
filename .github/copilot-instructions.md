# GitHub Copilot Instructions

## Project Overview
This is a **College Bus Tracking & Attendance System** — a full-stack real-time web application built with Node.js/Express (backend) and React/Vite (frontend). It enables students to track college buses live on a map and mark attendance, while drivers share GPS location and admins manage routes and users.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet / React-Leaflet for maps, Lucide React icons, Axios
- **Backend**: Node.js, Express 4, Socket.IO 4, JWT (jsonwebtoken + bcryptjs), express-validator
- **Database**: SQLite via `better-sqlite3` (persistence), Redis via `@upstash/redis` (caching / real-time state)
- **Auth**: Role-based JWT authentication — three roles: `student`, `driver`, `admin`

## Repository Layout
```
/
├── backend/          # Express API server + Socket.IO (entry: backend/server.js)
│   ├── dataStructures/
│   ├── database/     # SQLite init & queries
│   ├── middleware/   # JWT auth middleware
│   ├── routes/       # Express routers (auth, bus, admin, …)
│   ├── scripts/      # Seed / migration scripts
│   ├── services/     # Business logic (tracking, attendance, …)
│   └── utils/
├── frontend/         # React SPA (entry: frontend/src/main.jsx)
│   └── src/
│       ├── components/
│       ├── context/  # React context providers (AuthContext, …)
│       ├── pages/    # StudentDashboard, DriverDashboard, AdminDashboard, Login
│       ├── services/ # Axios API helpers
│       └── styles/
├── api/              # Serverless-style route handlers (Vercel deployment)
├── app.js            # Root Express entry (legacy / Vercel adapter)
└── public/ / views/  # Static assets
```

## Coding Conventions
- **JavaScript only** — no TypeScript; use JSDoc comments for type hints where helpful.
- **ES Modules** in the frontend (`import`/`export`), **CommonJS** (`require`/`module.exports`) in the backend.
- **Async/await** preferred over callbacks or raw `.then()` chains.
- **Express route handlers** follow the pattern: validate input with `express-validator`, check auth via `authMiddleware`, then call a service function.
- **Database access** goes through helper functions in `backend/database/`; never write raw SQL directly in route handlers.
- **Socket.IO events** are namespaced by role (e.g., `driver:location`, `student:attendance`).
- Frontend components use **functional React** with hooks; no class components.
- CSS uses **Tailwind utility classes**; component-specific styles live in `frontend/src/styles/`.

## Patterns to Follow
- Protect backend routes with the JWT middleware exported from `backend/middleware/auth.js`.
- Return consistent JSON responses: `{ success: true, data: … }` on success, `{ success: false, message: "…" }` on error.
- Emit Socket.IO events from service functions, not directly from route handlers.
- On the frontend, all API calls go through the service layer in `frontend/src/services/`.
- Real-time bus location is stored in Redis; historical data and attendance records go to SQLite.