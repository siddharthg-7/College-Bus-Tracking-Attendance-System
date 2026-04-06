/**
 * Database Connection and Query Wrapper
 * Provides a clean interface for database operations
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseService {
    constructor() {
        const dbDir = path.join(__dirname, '..', 'database');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        const dbPath = path.join(dbDir, 'bus_tracker.db');
        this.db = new Database(dbPath);
        this.db.pragma('foreign_keys = ON');

        console.log('📦 Database connected');
        
        // Ensure tables exist BEFORE doing any startup cleanup
        this.initialize();
        
        // Auto-cleanup duplicates on startup (ensures production consistency)
        this.cleanupDuplicates();
    }

    /**
     * Initializes database tables if they do not exist
     */
    initialize() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('student', 'driver', 'admin')),
                full_name TEXT,
                email TEXT,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS routes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS stops (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                route_id TEXT NOT NULL,
                name TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                sequence_order INTEGER NOT NULL,
                distance_from_previous REAL DEFAULT 0,
                FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
                UNIQUE(route_id, name, sequence_order)
            );

            CREATE TABLE IF NOT EXISTS buses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bus_number TEXT UNIQUE NOT NULL,
                route_id TEXT NOT NULL,
                driver_id INTEGER,
                status TEXT DEFAULT 'idle' CHECK(status IN ('idle', 'active', 'breakdown', 'maintenance')),
                current_lat REAL,
                current_lng REAL,
                last_updated DATETIME,
                FOREIGN KEY (route_id) REFERENCES routes(id),
                FOREIGN KEY (driver_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS student_stops (
                student_id INTEGER NOT NULL,
                stop_id INTEGER NOT NULL,
                PRIMARY KEY (student_id, stop_id),
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                stop_id INTEGER NOT NULL,
                trip_id INTEGER,
                date DATE NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
                confirmed_at DATETIME,
                is_locked BOOLEAN DEFAULT 0,
                FOREIGN KEY (student_id) REFERENCES users(id),
                FOREIGN KEY (stop_id) REFERENCES stops(id),
                FOREIGN KEY (trip_id) REFERENCES trips(id)
            );

            CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bus_id INTEGER NOT NULL,
                driver_id INTEGER NOT NULL,
                route_id TEXT NOT NULL,
                started_at DATETIME NOT NULL,
                ended_at DATETIME,
                status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
                delay_minutes INTEGER DEFAULT 0,
                breakdown_reported BOOLEAN DEFAULT 0,
                breakdown_message TEXT,
                FOREIGN KEY (bus_id) REFERENCES buses(id),
                FOREIGN KEY (driver_id) REFERENCES users(id),
                FOREIGN KEY (route_id) REFERENCES routes(id)
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('arrival', 'lock', 'breakdown', 'delay', 'general')),
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trip_id INTEGER,
                event_type TEXT NOT NULL,
                description TEXT,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (trip_id) REFERENCES trips(id)
            );

            CREATE TABLE IF NOT EXISTS trip_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trip_id INTEGER NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                speed REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
            );
        `);
    }

    /**
     * Identifies and removes duplicate stops, merging any student assignments
     */
    cleanupDuplicates() {
        try {
            // Find duplicate groups
            const duplicates = this.db.prepare(`
                SELECT name, route_id, MIN(id) as keep_id, GROUP_CONCAT(id) as all_ids
                FROM stops 
                GROUP BY name, route_id 
                HAVING COUNT(*) > 1
            `).all();

            if (duplicates.length === 0) return;

            console.log(`🧹 Found ${duplicates.length} duplicate stop groups. Cleaning up...`);

            const transaction = this.db.transaction(() => {
                for (const group of duplicates) {
                    const idsToDelete = group.all_ids.split(',').filter(id => id != group.keep_id);
                    
                    for (const deleteId of idsToDelete) {
                        // Update references in other tables before deleting
                        this.db.prepare('UPDATE OR IGNORE student_stops SET stop_id = ? WHERE stop_id = ?').run(group.keep_id, deleteId);
                        this.db.prepare('UPDATE OR IGNORE attendance SET stop_id = ? WHERE stop_id = ?').run(group.keep_id, deleteId);
                        
                        // Delete the duplicate row
                        this.db.prepare('DELETE FROM stops WHERE id = ?').run(deleteId);
                    }
                }
            });

            transaction();
            console.log('✅ Duplicate stops cleanup complete');
        } catch (error) {
            console.error('❌ Failed to cleanup duplicates:', error);
        }
    }

    /**
     * Execute a query that returns multiple rows
     */
    query(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.all(params);
        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    }

    /**
     * Execute a query that returns a single row
     */
    queryOne(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.get(params);
        } catch (error) {
            console.error('QueryOne error:', error);
            throw error;
        }
    }

    /**
     * Execute an INSERT, UPDATE, or DELETE query
     */
    execute(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.run(params);
        } catch (error) {
            console.error('Execute error:', error);
            throw error;
        }
    }

    /**
     * Execute multiple queries in a transaction
     */
    transaction(callback) {
        const transaction = this.db.transaction(callback);
        return transaction();
    }

    /**
     * Close database connection
     */
    close() {
        this.db.close();
        console.log('📦 Database connection closed');
    }

    /**
     * Get database instance for advanced operations
     */
    getDb() {
        return this.db;
    }
}

// Singleton instance
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new DatabaseService();
        }
        return instance;
    },
    DatabaseService
};
