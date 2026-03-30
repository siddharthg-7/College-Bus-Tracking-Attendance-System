# College Bus Tracking and Attendance System

[![Status](https://img.shields.io/badge/Status-100%25%20Complete-brightgreen.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-blue.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61dafb.svg)]()
[![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20Redis-003b57.svg)]()
[![Real-time](https://img.shields.io/badge/Real--time-Socket.io-black.svg)]()

A production-grade, real-time bus tracking and attendance management system designed for modern educational institutions. The platform automates attendance using real-time ETA calculations powered by advanced data structures and algorithms.

---

## Features

### Real-Time GPS Tracking
- Live bus location updates via Socket.IO
- Smooth Marker Interpolation (LERP) for fluid vehicle movement
- Directional Bearing Rotation for realistic marker orientation
- Low-latency real-time communication between drivers, students, and admins

### Instant Map Loads
- Redis-powered caching for last known bus locations
- Zero-wait bus visibility upon user login
- High-performance state management for active trips

### ETA-Based Attendance Lock
- Attendance can only be marked if the bus is more than 10 minutes away
- Accurate ETA calculation using Dijkstra's Algorithm and Haversine Distance
- Prevents proxy or late attendance marking

### Role-Based Dashboards
- Student: View bus location, ETA, and mark attendance
- Driver: Share live GPS, manage trip lifecycle, view student list
- Admin: Monitor system, manage routes, buses, and analytics

---

## Data Structures and Algorithms

| Data Structure | Implementation | Purpose |
|---------------|---------------|---------|
| Graph | Adjacency List | Route and stop representation |
| Hash Map | Custom | O(1) lookups for users and sessions |
| Priority Queue | Min Heap | Optimized Dijkstra ETA calculation |
| Queue | FIFO | Notification and event processing |
| Key-Value Store | Redis | Real-time location caching |

### Algorithms Used
- Dijkstra's Algorithm (shortest path calculation)
- Haversine Formula (GPS distance calculation)
- Linear Interpolation (LERP) for smooth movement
- Dynamic attendance locking based on ETA

---

## Technical Stack

| Category | Technology |
|----------|------------|
| Frontend | React.js, Vite, Leaflet, Lucide React |
| Backend | Node.js, Express.js, Socket.IO |
| Database | SQLite (Primary), Redis (Cache) |
| Styling | Tailwind CSS / Vanilla CSS |

---

## Project Structure

.
├── backend/
│   ├── dataStructures/
│   ├── services/
│   ├── routes/
│   ├── database/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── index.html
└── docs/

---

## Quick Start

For a detailed walkthrough, please see the SETUP_GUIDE.md.

### Environment Setup
1. Install dependencies: `npm install`
2. Initialize Database: `cd backend && npm run init-db && npm run seed`
3. Run Services: `npm run dev` (Backend) and `cd ../frontend && npm run dev` (Frontend)

---

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | password123 |
| Driver | driver1 | password123 |
| Student | student1 | password123 |

---

## Security

### What is Hashed?

**User passwords** are the only data that is hashed in this system. Every password — for students, drivers, and admins — is hashed with **bcryptjs** using **10 salt rounds** before being written to the database. The plaintext password is never stored.

| Data | Hashed? | Algorithm | Where |
|------|---------|-----------|-------|
| User passwords | ✅ Yes | bcrypt (10 salt rounds) | `backend/services/auth.service.js`, `backend/routes/admin.routes.js` |
| JWT tokens | ❌ No (signed, not hashed) | HMAC-SHA256 (HS256) | `backend/services/auth.service.js` |
| GPS coordinates | ❌ No | Stored as-is | `backend/routes/driver.routes.js` |
| Attendance records | ❌ No | Stored as-is | `backend/routes/driver.routes.js` |

#### How Password Hashing Works

1. A user registers or is created (by admin or seed script).
2. Their plaintext password is passed to `bcrypt.hash(password, 10)`.
3. bcrypt internally generates a random salt and combines it with the password.
4. The result is a 60-character hash string (e.g. `$2b$10$...`) that is stored in the `users.password` column.
5. At login, `bcrypt.compare(plaintext, hash)` re-derives and checks the hash — the original password is never recoverable from the stored value.

### Other Security Practices

| Feature | Implementation |
|---------|---------------|
| Session tokens | JWT signed with `JWT_SECRET`, expire in 7 days |
| SQL injection prevention | Parameterized queries (better-sqlite3) |
| Role-based access control | `authenticate` + `authorize(role)` middleware on all routes |
| Password never returned | `password` field is stripped from all API responses |
| CORS | Configured allowed origins |

---

## Documentation
- ARCHITECTURE.md
- REDIS_SETUP.md
- SETUP_GUIDE.md
- PROJECT_SUMMARY.md

---

Built for college communities.
