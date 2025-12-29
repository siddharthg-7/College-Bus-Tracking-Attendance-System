# College Bus Tracking & Attendance System

[![Status](https://img.shields.io/badge/Status-100%25%20Complete-brightgreen.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-blue.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61dafb.svg)]()
[![Database](https://img.shields.io/badge/Database-SQLite-003b57.svg)]()
[![Real-time](https://img.shields.io/badge/Real--time-Socket.io-black.svg)]()

A **production-grade, real-time bus tracking and attendance management system** designed for modern educational institutions. This system goes beyond simple tracking by implementing sophisticated Data Structures and Algorithms (DSA) to automate attendance based on real-time ETAs.

---

##  Key Features

###  Real-Time GPS Tracking
*   **High Precision**: Live bus location updates via Socket.IO.
*   **Active Monitoring**: Animated bus markers on an interactive Leaflet map.
*   **Zero Latency**: Real-time communication between driver devices and student/admin dashboards.

### ETA-Based Attendance Lock
*   **Smart Automation**: Students can only mark attendance if the bus is more than 10 minutes away from their stop.
*   **Algorithmic Accuracy**: Uses **Dijkstra's Pathfinding** and **Haversine Distance** for precise ETA calculation.
*   **Fraud Prevention**: Prevents students from marking attendance once the bus is too close.

###  Role-Based Dashboards
*   **Student**: Track assigned bus, view ETA, confirm attendance, and manage notifications.
*   **Driver**: Share live GPS, manage trip status (Start/End), and view student manifest per stop.
*   **Admin**: System-wide monitoring, analytics, log management, and route/stop configuration.

###  Smart Notification System
*   **Queue-Based**: Proprietary FIFO notification management.
*   **Multi-Channel**: Browser push notifications + real-time WebSocket alerts.
*   **Event-Driven**: Automated alerts for trip starts, delays, breakdowns, and attendance windows.

---

##  Technical Depth (DSA & Engineering)

One of the project's core strengths is its heavy reliance on robust Data Structures and Algorithms implemented from scratch in JavaScript:

| Data Structure | Implementation | Purpose |
| :--- | :--- | :--- |
| **Graph** | Adjacency List | Representing bus routes, stops, and road intersections. |
| **Hash Map** | Custom implementation | O(1) complexity for user lookups, bus status, and session tracking. |
| **Priority Queue** | Min-Heap | Optimizing Dijkstra's algorithm for sub-millisecond ETA calculations. |
| **Queue** | FIFO Buffer | Managing sequential notification delivery and event processing. |

### Core Algorithms
*   **Dijkstra’s Algorithm**: Shortest path calculation on weighted route graphs.
*   **Haversine Distance**: Calculating spherical distance between GPS coordinates.
*   **Attendance Lock Logic**: Dynamic thresholding based on real-time traffic and distance.

---

##  Design Philosophy

The application features a **Premium Dark Mode** UI designed for high readability and professional aesthetics:
*   **Visuals**: Glassmorphism, smooth CSS transitions, and micro-animations.
*   **Color Palette**: Deep navy backgrounds with vibrant indigo, purple, and emerald accents.
*   **Responsiveness**: Mobile-first design ensures drivers and students can use the platform on any device.

---

##  Project Structure

```text
.
├── backend/                # Express server + DSA Implementations
│   ├── dataStructures/     # Custom HashMap, Graph, Queue, Heap
│   ├── services/           # DB, Auth, Attendance Lock, Notifications
│   ├── routes/             # RESTful API Endpoints
│   ├── database/           # SQLite schema and scripts
│   └── server.js           # Entry point
├── frontend/               # React (Vite) Application
│   ├── src/
│   │   ├── components/     # UI Components (Map, Panels, UI)
│   │   ├── pages/          # Dashboards (Student, Driver, Admin)
│   │   ├── context/        # Auth & Global State
│   │   └── services/       # WebSocket & API clients
│   └── index.html
└── docs/                   # Architecture, Quickstart, and Summary
```

---

##  Quick Start

### 1. Prerequisites
*   **Node.js** (v18 or higher)
*   **npm** or **yarn**

### 2. Setup Backend
```bash
cd backend
npm install
npm run init-db    # Initialize SQLite database
npm run seed       # Seed demo data
npm run dev        # Start development server (Port 5000)
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev        # Start Vite dev server (Port 5173)
```

### 4. Demo Credentials
| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `password123` |
| **Driver** | `driver1` | `password123` |
| **Student** | `student1` | `password123` |

---

##  Security & Performance
*   **Authentication**: Stateless JWT-based auth with Role-Based Access Control (RBAC).
*   **Security**: Password hashing via `bcrypt`, SQL injection prevention, and input validation.
*   **Performance**: O(1) user lookups and cached ETA calculations for 500ms+ response times.

---

##  Documentation
For more detailed information, please refer to the following:
*   [Architecture Overview](./ARCHITECTURE.md)
*   [Quickstart Guide](./QUICKSTART.md)
*   [Project Summary](./PROJECT_SUMMARY.md)

---

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

##  License
This project is licensed under the ISC License.

---
*Built with ❤️ for College Communities.*
