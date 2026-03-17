/**
 * Redis Cache Service
 * Handles real-time location caching for instant map loads
 */

const redis = require('redis');

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.BUS_EXPIRY = 60 * 10; // 10 minutes (buses usually update every 5-10 seconds)
    }

    /**
     * Initialize Redis connection
     */
    async connect() {
        try {
            this.client = redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });

            this.client.on('error', (err) => {
                console.error('❌ Redis Error:', err.message);
            });

            this.client.on('connect', () => {
                console.log('📡 Redis: Connected');
                this.isConnected = true;
            });

            await this.client.connect();
        } catch (error) {
            console.error('❌ Redis Connection Failed:', error.message);
            console.log('⚠️ Falling back to memory cache (not persistent across restarts)');
            this.isConnected = false;
        }
    }

    /**
     * Store bus location
     */
    async setBusLocation(busId, data) {
        if (!this.isConnected) return;
        
        try {
            const key = `bus_location:${busId}`;
            await this.client.set(key, JSON.stringify(data), {
                EX: this.BUS_EXPIRY
            });
        } catch (error) {
            console.error('Redis Set Error:', error.message);
        }
    }

    /**
     * Get all active bus locations
     */
    async getAllBusLocations() {
        if (!this.isConnected) return [];

        try {
            const keys = await this.client.keys('bus_location:*');
            if (keys.length === 0) return [];

            const locations = await Promise.all(
                keys.map(async (key) => {
                    const data = await this.client.get(key);
                    return JSON.parse(data);
                })
            );

            return locations;
        } catch (error) {
            console.error('Redis Get Error:', error.message);
            return [];
        }
    }
}

module.exports = new CacheService();
