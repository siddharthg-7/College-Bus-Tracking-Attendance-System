/**
 * Seed Data Script for VNR VJIET
 * Populates database with all 13 VNR VJIET bus routes
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'bus_tracker.db');
const db = new Database(dbPath);

console.log('🌱 Seeding database with VNR VJIET Route data...');

db.pragma('foreign_keys = OFF'); // Disable FK checks during seed

// --- Clear old route/stop/bus data to avoid duplication ---
db.prepare('DELETE FROM student_stops').run();
db.prepare('DELETE FROM trips').run();
db.prepare('DELETE FROM buses').run();
db.prepare('DELETE FROM stops').run();
db.prepare('DELETE FROM routes').run();
db.prepare('DELETE FROM users').run();

db.pragma('foreign_keys = ON');

const hashedPassword = require('bcryptjs').hashSync('password123', 10);

// --- Users ---
const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, password, role, full_name, email, phone)
    VALUES (?, ?, ?, ?, ?, ?)
`);

insertUser.run('admin', hashedPassword, 'admin', 'Admin User', 'admin@vnrvjiet.edu', '9876543210');

// 13 Drivers (one per route)
for (let i = 1; i <= 13; i++) {
    insertUser.run(`driver${i}`, hashedPassword, 'driver', `Driver ${i}`, `driver${i}@vnrvjiet.edu`, `90000000${i.toString().padStart(2, '0')}`);
}

// 1300 Students
for (let i = 1; i <= 1300; i++) {
    insertUser.run(`student${i}`, hashedPassword, 'student', `Student ${i}`, `student${i}@student.vnrvjiet.edu`, `8${i.toString().padStart(9, '0')}`);
}

console.log('✅ Created users');

// --- All 13 VNR VJIET Routes ---
const routesData = [
    {
        routeId: "R1",
        name: "Patancheru to VNR VJIET",
        stops: [
            { stopNo: 1, name: "Patancheru",        lat: 17.5287, lng: 78.2667 },
            { stopNo: 2, name: "Beeramguda Kaman",  lat: 17.5181, lng: 78.2911 },
            { stopNo: 3, name: "BHEL",               lat: 17.4891, lng: 78.2989 },
            { stopNo: 4, name: "Chandanagar",        lat: 17.4932, lng: 78.3396 },
            { stopNo: 5, name: "Miyapur",            lat: 17.4948, lng: 78.3489 },
            { stopNo: 6, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R2",
        name: "LB Nagar to VNR VJIET",
        stops: [
            { stopNo: 1, name: "LB Nagar",          lat: 17.3457, lng: 78.5522 },
            { stopNo: 2, name: "Dilsukhnagar",       lat: 17.3685, lng: 78.5247 },
            { stopNo: 3, name: "Malakpet",           lat: 17.3756, lng: 78.4901 },
            { stopNo: 4, name: "Koti",               lat: 17.3824, lng: 78.4835 },
            { stopNo: 5, name: "Abids",              lat: 17.3912, lng: 78.4735 },
            { stopNo: 6, name: "Lakdi ka pool",      lat: 17.4017, lng: 78.4632 },
            { stopNo: 7, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R3",
        name: "Nagole to VNR VJIET",
        stops: [
            { stopNo: 1, name: "Nagole",             lat: 17.3714, lng: 78.5695 },
            { stopNo: 2, name: "Uppal",              lat: 17.3984, lng: 78.5583 },
            { stopNo: 3, name: "Tarnaka",            lat: 17.4277, lng: 78.5264 },
            { stopNo: 4, name: "Secunderabad",       lat: 17.4399, lng: 78.4983 },
            { stopNo: 5, name: "JBS / Tadbund",      lat: 17.4496, lng: 78.4912 },
            { stopNo: 6, name: "Bowenpally",         lat: 17.4777, lng: 78.4719 },
            { stopNo: 7, name: "Balanagar",          lat: 17.4612, lng: 78.4422 },
            { stopNo: 8, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R4",
        name: "Yusufguda to VNR VJIET",
        stops: [
            { stopNo: 1, name: "Yusufguda",          lat: 17.4340, lng: 78.4269 },
            { stopNo: 2, name: "Jubilee Check Post", lat: 17.4338, lng: 78.4121 },
            { stopNo: 3, name: "Madhapur",           lat: 17.4483, lng: 78.3915 },
            { stopNo: 4, name: "Hi-Tech City",       lat: 17.4435, lng: 78.3772 },
            { stopNo: 5, name: "Kondapur",           lat: 17.4699, lng: 78.3578 },
            { stopNo: 6, name: "Miyapur X Roads",    lat: 17.4966, lng: 78.3501 },
            { stopNo: 7, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R5",
        name: "ECIL to VNR VJIET (Via Suchitra)",
        stops: [
            { stopNo: 1, name: "ECIL",               lat: 17.4672, lng: 78.5769 },
            { stopNo: 2, name: "Neredmet X Roads",   lat: 17.4705, lng: 78.5321 },
            { stopNo: 3, name: "Thirumalgiri",       lat: 17.4651, lng: 78.5085 },
            { stopNo: 4, name: "Suchitra",           lat: 17.4934, lng: 78.4735 },
            { stopNo: 5, name: "Kompally",           lat: 17.5358, lng: 78.4842 },
            { stopNo: 6, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R6",
        name: "Attapur to VNR VJIET",
        stops: [
            { stopNo: 1, name: "Attapur",            lat: 17.3767, lng: 78.4296 },
            { stopNo: 2, name: "Mehdipatnam",        lat: 17.3916, lng: 78.4414 },
            { stopNo: 3, name: "Banjara Hills",      lat: 17.4165, lng: 78.4436 },
            { stopNo: 4, name: "Ameerpet",           lat: 17.4375, lng: 78.4482 },
            { stopNo: 5, name: "Erragadda",          lat: 17.4563, lng: 78.4287 },
            { stopNo: 6, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R7",
        name: "Manikonda to VNR VJIET",
        stops: [
            { stopNo: 1, name: "Manikonda",          lat: 17.3995, lng: 78.3801 },
            { stopNo: 2, name: "Gachibowli",         lat: 17.4401, lng: 78.3489 },
            { stopNo: 3, name: "IKEA",               lat: 17.4385, lng: 78.3752 },
            { stopNo: 4, name: "KPHB 6th Phase",     lat: 17.4891, lng: 78.3865 },
            { stopNo: 5, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R8",
        name: "Kukatpally to VNR VJIET",
        stops: [
            { stopNo: 1, name: "Kukatpally",         lat: 17.4841, lng: 78.4063 },
            { stopNo: 2, name: "Nizampet X Roads",   lat: 17.4921, lng: 78.3861 },
            { stopNo: 3, name: "Bachupally",         lat: 17.5323, lng: 78.3789 },
            { stopNo: 4, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R9",
        name: "Suchitra (Direct) to VNR VJIET",
        stops: [
            { stopNo: 1, name: "Suchitra",           lat: 17.4934, lng: 78.4735 },
            { stopNo: 2, name: "Dairy Farm",         lat: 17.4821, lng: 78.4589 },
            { stopNo: 3, name: "KPHB",               lat: 17.4841, lng: 78.3889 },
            { stopNo: 4, name: "JNTU",               lat: 17.4928, lng: 78.3908 },
            { stopNo: 5, name: "Nizampet",           lat: 17.5181, lng: 78.3842 },
            { stopNo: 6, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R10",
        name: "ECIL to VNR VJIET (Via Shapur)",
        stops: [
            { stopNo: 1, name: "ECIL",               lat: 17.4672, lng: 78.5769 },
            { stopNo: 2, name: "Old Alwal",          lat: 17.5005, lng: 78.5042 },
            { stopNo: 3, name: "Suchitra",           lat: 17.4934, lng: 78.4735 },
            { stopNo: 4, name: "Shapur Signal",      lat: 17.4990, lng: 78.4350 },
            { stopNo: 5, name: "Gajularamaram",      lat: 17.5250, lng: 78.4100 },
            { stopNo: 6, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R11",
        name: "Anandbagh to VNR VJIET",
        stops: [
            { stopNo: 1, name: "Anandbagh",          lat: 17.4567, lng: 78.5426 },
            { stopNo: 2, name: "Malkajgiri",         lat: 17.4474, lng: 78.5240 },
            { stopNo: 3, name: "Musheerabad",        lat: 17.4143, lng: 78.4980 },
            { stopNo: 4, name: "Himayat Nagar",      lat: 17.3995, lng: 78.4830 },
            { stopNo: 5, name: "Khairatabad",        lat: 17.4126, lng: 78.4607 },
            { stopNo: 6, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R12",
        name: "Mothinagar to VNR VJIET",
        stops: [
            { stopNo: 1, name: "Mothinagar",         lat: 17.4335, lng: 78.4280 },
            { stopNo: 2, name: "Moosapet",           lat: 17.4653, lng: 78.4336 },
            { stopNo: 3, name: "KPHB",               lat: 17.4841, lng: 78.3889 },
            { stopNo: 4, name: "JNTU",               lat: 17.4928, lng: 78.3908 },
            { stopNo: 5, name: "Pragathi Nagar",     lat: 17.5160, lng: 78.3900 },
            { stopNo: 6, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    },
    {
        routeId: "R13",
        name: "Masjidbanda to VNR VJIET",
        stops: [
            { stopNo: 1, name: "Masjidbanda",        lat: 17.4650, lng: 78.3450 },
            { stopNo: 2, name: "HCU",                lat: 17.4580, lng: 78.3370 },
            { stopNo: 3, name: "BHEL",               lat: 17.4891, lng: 78.2989 },
            { stopNo: 4, name: "Madinaguda",         lat: 17.4940, lng: 78.3400 },
            { stopNo: 5, name: "Bachupally X Rds",   lat: 17.5323, lng: 78.3789 },
            { stopNo: 6, name: "VNR VJIET",          lat: 17.5387, lng: 78.3853 }
        ]
    }
];

// --- Haversine distance ---
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// --- Insert Routes & Stops ---
const insertRoute = db.prepare(`INSERT INTO routes (id, name, description, is_active) VALUES (?, ?, ?, ?)`);
const insertStop  = db.prepare(`INSERT INTO stops (route_id, name, latitude, longitude, sequence_order, distance_from_previous) VALUES (?, ?, ?, ?, ?, ?)`);

routesData.forEach(route => {
    insertRoute.run(route.routeId, route.name, `${route.name} Route`, 1);
    let prev = null;
    route.stops.forEach(stop => {
        const dist = prev ? haversineDistance(prev.lat, prev.lng, stop.lat, stop.lng) : 0;
        insertStop.run(route.routeId, stop.name, stop.lat, stop.lng, stop.stopNo, dist);
        prev = stop;
    });
});

console.log('✅ Created 13 routes and stops');

// --- Buses (one per route, look up driver ID dynamically) ---
const insertBus = db.prepare(`INSERT INTO buses (bus_number, route_id, driver_id, status) VALUES (?, ?, ?, ?)`);
const getDriverId = db.prepare(`SELECT id FROM users WHERE username = ?`);
routesData.forEach((route, i) => {
    const driver = getDriverId.get(`driver${i + 1}`);
    if (!driver) { console.warn(`⚠️  driver${i + 1} not found, skipping bus for ${route.routeId}`); return; }
    insertBus.run(`TS-08-VNR-${route.routeId}`, route.routeId, driver.id, 'idle');
});

console.log('✅ Created 13 buses assigned to routes');

// --- Assign students to stops (2–3 students per route, spread across stops) ---
const insertStudentStop = db.prepare(`INSERT OR IGNORE INTO student_stops (student_id, stop_id) VALUES (?, ?)`);

// Get stop IDs per route
const getStops = db.prepare(`SELECT id, sequence_order FROM stops WHERE route_id = ? ORDER BY sequence_order`);
// Get user IDs for students
const getStudentId = db.prepare(`SELECT id FROM users WHERE username = ?`);

let studentIdx = 1;
routesData.forEach(route => {
    const stops = getStops.all(route.routeId);
    if (stops.length < 2) return;

    // Assign 2 students per route to the 2nd stop from start
    for (let s = 0; s < 2 && studentIdx <= 26; s++, studentIdx++) {
        const student = getStudentId.get(`student${studentIdx}`);
        const stop = stops[Math.min(1, stops.length - 2)]; // 2nd stop
        if (student && stop) {
            insertStudentStop.run(student.id, stop.id);
            console.log(`📍 Assigned student${studentIdx} to ${route.routeId} (Stop ${stop.sequence_order})`);
        }
    }
});

// Assign remaining students to random routes
for (let i = studentIdx; i <= 1300; i++) {
    const student = getStudentId.get(`student${i}`);
    const route = routesData[i % routesData.length];
    const stops = getStops.all(route.routeId);
    
    // Attempt to distribute across all stops (skip origin 0, take random to end)
    const stopCount = stops.length;
    const stopIndex = stopCount > 1 ? Math.floor(Math.random() * (stopCount - 1)) + 1 : 0;
    const stop = stops[stopIndex];

    if (student && stop) {
        insertStudentStop.run(student.id, stop.id);
        // console.log(`📍 Assigned student${i} to ${route.routeId} (Stop ${stop.sequence_order})`); // Removed to prevent clutter in console
    }
}

console.log('✅ Assigned students to stops');

db.close();
console.log('🎉 VNR VJIET Database seeding complete!');