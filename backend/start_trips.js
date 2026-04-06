const DB = require('better-sqlite3');
const db = new DB('database/bus_tracker.db');
const activeBuses = db.prepare("SELECT * FROM buses").all();
if(activeBuses.length > 0) {
    for (let bus of activeBuses) {
        db.prepare("INSERT INTO trips (bus_id, driver_id, route_id, started_at, status) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'active')").run(bus.id, bus.driver_id, bus.route_id);
        db.prepare("UPDATE buses SET status = 'active', current_lat = 17.3980, current_lng = 78.4010 WHERE id = ?").run(bus.id);
        console.log(`Mock trip started for Bus ${bus.id}`);
    }
}
