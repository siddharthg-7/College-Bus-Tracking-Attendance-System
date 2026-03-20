/**
 * Redis Cache Service
 * Handles real-time location caching for instant map loads
 */

const { Redis } = require('@upstash/redis');
const standardRedis = require('redis'); // For local dev fallback

class CacheService {
    constructor() {
        this.client = null;
        this.upstashClient = null;
        this.isConnected = false;
        this.memoryCache = new Map();
        this.BUS_EXPIRY = 60 * 10; // 10 minutes
        
        // Upstash REST Credentials
        this.UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
        this.UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
    }

    /**
     * Initialize Redis connection (Upstash HTTP or local Standard)
     */
    async connect() {
        try {
            // Priority 1: Upstash HTTP (Highly stable for Render/Free tier)
            if (this.UPSTASH_URL && this.UPSTASH_TOKEN) {
                console.log('📡 Upstash Redis REST: Initializing...');
                this.upstashClient = new Redis({
                    url: this.UPSTASH_URL,
                    token: this.UPSTASH_TOKEN,
                });
                this.isConnected = true;
                console.log('✅ Upstash Redis REST: Ready');
                return;
            }

            // Priority 2: Standard Local Redis (For developers with local redis)
            if (process.env.NODE_ENV !== 'production' || process.env.REDIS_URL) {
                this.client = standardRedis.createClient({
                    url: process.env.REDIS_URL || 'redis://localhost:6379',
                    socket: {
                        reconnectStrategy: (retries) => (retries > 3 ? new Error('Stop') : 2000)
                    }
                });

                this.client.on('error', () => { this.isConnected = false; });
                this.client.on('connect', () => { this.isConnected = true; });

                await this.client.connect();
                console.log('✅ Local Redis: Ready');
                return;
            }
        } catch (error) {
            console.warn('⚠️ All Redis connections failed. Using memory fallback.');
        }
        
        this.isConnected = false;
    }

    /**
     * Store bus location
     */
    async setBusLocation(busId, data) {
        // Always store in memory for zero-latency local lookups
        this.memoryCache.set(busId, data);
        setTimeout(() => this.memoryCache.delete(busId), this.BUS_EXPIRY * 1000);

        if (!this.isConnected) return;
        
        try {
            const key = `bus_location:${busId}`;
            
            if (this.upstashClient) {
                // Upstash HTTP set
                await this.upstashClient.set(key, JSON.stringify(data), {
                    ex: this.BUS_EXPIRY
                });
            } else if (this.client) {
                // Standard Redis set
                await this.client.set(key, JSON.stringify(data), {
                    EX: this.BUS_EXPIRY
                });
            }
        } catch (error) {
            // Silence silent background cache failures
        }
    }

    /**
     * Get all active bus locations
     */
    async getAllBusLocations() {
        // 1. Try Upstash HTTP (Most reliable for production state)
        if (this.upstashClient) {
            try {
                const keys = await this.upstashClient.keys('bus_location:*');
                if (keys.length > 0) {
                    // Upstash HTTP get multiple
                    const pipe = this.upstashClient.pipeline();
                    keys.forEach(k => pipe.get(k));
                    const results = await pipe.exec();
                    return results.filter(r => r !== null);
                }
            } catch (error) {
                console.error('Upstash REST Get Error:', error.message);
            }
        }

        // 2. Try Standard Local Redis
        if (this.client && this.isConnected) {
            try {
                const keys = await this.client.keys('bus_location:*');
                if (keys.length > 0) {
                    return await Promise.all(
                        keys.map(async (k) => JSON.parse(await this.client.get(k)))
                    );
                }
            } catch (error) {
                console.error('Local Redis Get Error:', error.message);
            }
        }

        // 3. Absolute Fallback: Local Memory
        return Array.from(this.memoryCache.values());
    }
}

module.exports = new CacheService();
