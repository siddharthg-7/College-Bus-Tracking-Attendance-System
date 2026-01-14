/**
 * Advanced Location Tracking Service (2026)
 * Production-grade GPS tracking with sensor fusion, dead reckoning, and geofencing
 * Implements industry-standard techniques used by Uber, Ola, and Google Maps
 */

/**
 * Haversine formula to calculate distance between two GPS coordinates
 * @param {Object} coord1 - {latitude, longitude}
 * @param {Object} coord2 - {latitude, longitude}
 * @returns {number} - Distance in meters
 */
export function calculateDistance(coord1, coord2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.latitude * Math.PI / 180;
    const φ2 = coord2.latitude * Math.PI / 180;
    const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Calculate velocity vector between two positions
 * @param {Object} from - {latitude, longitude, timestamp}
 * @param {Object} to - {latitude, longitude, timestamp}
 * @returns {Object} - {speed (m/s), heading (degrees), velocity}
 */
export function calculateVelocityVector(from, to) {
    if (!from || !to || !from.timestamp || !to.timestamp) {
        return { speed: 0, heading: 0, velocity: { lat: 0, lng: 0 } };
    }

    const distance = calculateDistance(from, to);
    const timeDelta = (to.timestamp - from.timestamp) / 1000; // seconds

    if (timeDelta <= 0) {
        return { speed: 0, heading: 0, velocity: { lat: 0, lng: 0 } };
    }

    const speed = distance / timeDelta; // m/s

    // Calculate heading (bearing)
    const lat1 = from.latitude * Math.PI / 180;
    const lat2 = to.latitude * Math.PI / 180;
    const dLon = (to.longitude - from.longitude) * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

    // Velocity components (for dead reckoning)
    const velocity = {
        lat: (to.latitude - from.latitude) / timeDelta,
        lng: (to.longitude - from.longitude) / timeDelta
    };

    return { speed, heading, velocity };
}

/**
 * Snap coordinates to roads using Google Roads API
 * Note: Requires Google Maps API key with Roads API enabled
 * @param {Array} coordinates - Array of {latitude, longitude} objects
 * @param {string} apiKey - Google Maps API key
 * @returns {Promise<Array>} - Snapped coordinates
 */
export async function snapToRoads(coordinates, apiKey) {
    if (!apiKey) {
        console.warn('Google Maps API key not provided. Skipping road snapping.');
        return coordinates;
    }

    try {
        // Convert coordinates to path string format
        const path = coordinates
            .map(coord => `${coord.latitude},${coord.longitude}`)
            .join('|');

        const url = `https://roads.googleapis.com/v1/snapToRoads?path=${path}&interpolate=true&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.snappedPoints) {
            return data.snappedPoints.map(point => ({
                latitude: point.location.latitude,
                longitude: point.location.longitude
            }));
        }

        return coordinates;
    } catch (error) {
        console.error('Road snapping failed:', error);
        return coordinates; // Fallback to original coordinates
    }
}

/**
 * Filter out GPS noise and outliers
 * @param {Object} newCoord - New GPS coordinate
 * @param {Object} lastCoord - Previous GPS coordinate
 * @param {number} maxSpeed - Maximum expected speed in m/s (default: 30 m/s = 108 km/h)
 * @param {number} timeDelta - Time between updates in seconds
 * @returns {boolean} - True if coordinate is valid
 */
export function isValidGPSUpdate(newCoord, lastCoord, maxSpeed = 30, timeDelta = 3) {
    if (!lastCoord) return true;

    const distance = calculateDistance(lastCoord, newCoord);
    const speed = distance / timeDelta;

    // Filter out unrealistic jumps (e.g., GPS errors)
    if (speed > maxSpeed) {
        console.warn(`GPS jump detected: ${speed.toFixed(2)} m/s (max: ${maxSpeed} m/s). Ignoring update.`);
        return false;
    }

    return true;
}

/**
 * Advanced Kalman Filter with Sensor Fusion
 * Combines GPS with velocity data for improved accuracy
 */
export class SensorFusionKalmanFilter {
    constructor(processNoise = 0.01, measurementNoise = 0.1, velocityWeight = 0.3) {
        this.processNoise = processNoise;
        this.measurementNoise = measurementNoise;
        this.velocityWeight = velocityWeight;

        this.estimatedLat = null;
        this.estimatedLng = null;
        this.errorLat = 1;
        this.errorLng = 1;

        this.lastVelocity = { lat: 0, lng: 0 };
        this.lastTimestamp = null;
    }

    filter(latitude, longitude, timestamp = Date.now(), velocity = null) {
        if (this.estimatedLat === null) {
            // Initialize
            this.estimatedLat = latitude;
            this.estimatedLng = longitude;
            this.lastTimestamp = timestamp;
            return { latitude, longitude };
        }

        // Time delta for prediction
        const timeDelta = timestamp - this.lastTimestamp;
        const dt = timeDelta / 1000; // seconds

        // Prediction with velocity (sensor fusion)
        let predictedLat = this.estimatedLat;
        let predictedLng = this.estimatedLng;

        if (velocity && dt > 0 && dt < 10) { // Use velocity if reasonable time delta
            predictedLat += this.lastVelocity.lat * dt * this.velocityWeight;
            predictedLng += this.lastVelocity.lng * dt * this.velocityWeight;
        }

        const predictedErrorLat = this.errorLat + this.processNoise;
        const predictedErrorLng = this.errorLng + this.processNoise;

        // Update with GPS measurement
        const kalmanGainLat = predictedErrorLat / (predictedErrorLat + this.measurementNoise);
        const kalmanGainLng = predictedErrorLng / (predictedErrorLng + this.measurementNoise);

        this.estimatedLat = predictedLat + kalmanGainLat * (latitude - predictedLat);
        this.estimatedLng = predictedLng + kalmanGainLng * (longitude - predictedLng);

        this.errorLat = (1 - kalmanGainLat) * predictedErrorLat;
        this.errorLng = (1 - kalmanGainLng) * predictedErrorLng;

        // Update velocity for next prediction
        if (velocity) {
            this.lastVelocity = velocity;
        }
        this.lastTimestamp = timestamp;

        return {
            latitude: this.estimatedLat,
            longitude: this.estimatedLng
        };
    }

    reset() {
        this.estimatedLat = null;
        this.estimatedLng = null;
        this.errorLat = 1;
        this.errorLng = 1;
        this.lastVelocity = { lat: 0, lng: 0 };
        this.lastTimestamp = null;
    }
}

/**
 * Standard Kalman filter for GPS smoothing
 * Reduces GPS jitter and noise
 */
export class GPSKalmanFilter {
    constructor(processNoise = 0.01, measurementNoise = 0.1) {
        this.processNoise = processNoise;
        this.measurementNoise = measurementNoise;
        this.estimatedLat = null;
        this.estimatedLng = null;
        this.errorLat = 1;
        this.errorLng = 1;
    }

    filter(latitude, longitude) {
        if (this.estimatedLat === null) {
            // Initialize
            this.estimatedLat = latitude;
            this.estimatedLng = longitude;
            return { latitude, longitude };
        }

        // Prediction
        const predictedLat = this.estimatedLat;
        const predictedLng = this.estimatedLng;
        const predictedErrorLat = this.errorLat + this.processNoise;
        const predictedErrorLng = this.errorLng + this.processNoise;

        // Update
        const kalmanGainLat = predictedErrorLat / (predictedErrorLat + this.measurementNoise);
        const kalmanGainLng = predictedErrorLng / (predictedErrorLng + this.measurementNoise);

        this.estimatedLat = predictedLat + kalmanGainLat * (latitude - predictedLat);
        this.estimatedLng = predictedLng + kalmanGainLng * (longitude - predictedLng);

        this.errorLat = (1 - kalmanGainLat) * predictedErrorLat;
        this.errorLng = (1 - kalmanGainLng) * predictedErrorLng;

        return {
            latitude: this.estimatedLat,
            longitude: this.estimatedLng
        };
    }

    reset() {
        this.estimatedLat = null;
        this.estimatedLng = null;
        this.errorLat = 1;
        this.errorLng = 1;
    }
}

/**
 * Dead Reckoning - Estimate position when GPS is unavailable
 * Uses last known velocity to predict current position
 */
export class DeadReckoning {
    constructor() {
        this.lastPosition = null;
        this.lastVelocity = null;
        this.lastTimestamp = null;
        this.isGPSAvailable = true;
    }

    /**
     * Update with GPS position
     */
    updateGPS(latitude, longitude, timestamp = Date.now()) {
        const newPosition = { latitude, longitude, timestamp };

        if (this.lastPosition) {
            // Calculate velocity
            this.lastVelocity = calculateVelocityVector(this.lastPosition, newPosition);
        }

        this.lastPosition = newPosition;
        this.lastTimestamp = timestamp;
        this.isGPSAvailable = true;

        return newPosition;
    }

    /**
     * Estimate position using dead reckoning (when GPS unavailable)
     */
    estimatePosition(timestamp = Date.now()) {
        if (!this.lastPosition || !this.lastVelocity) {
            return null;
        }

        const timeDelta = (timestamp - this.lastTimestamp) / 1000; // seconds

        // Don't extrapolate too far (max 30 seconds)
        if (timeDelta > 30) {
            return this.lastPosition;
        }

        // Predict position based on last velocity
        const estimatedLat = this.lastPosition.latitude + this.lastVelocity.velocity.lat * timeDelta;
        const estimatedLng = this.lastPosition.longitude + this.lastVelocity.velocity.lng * timeDelta;

        this.isGPSAvailable = false;

        return {
            latitude: estimatedLat,
            longitude: estimatedLng,
            timestamp,
            estimated: true, // Flag to indicate this is an estimate
            confidence: Math.max(0, 1 - timeDelta / 30) // Confidence decreases over time
        };
    }

    /**
     * Re-align with GPS after signal recovery
     */
    realignWithGPS(latitude, longitude, timestamp = Date.now()) {
        return this.updateGPS(latitude, longitude, timestamp);
    }

    reset() {
        this.lastPosition = null;
        this.lastVelocity = null;
        this.lastTimestamp = null;
        this.isGPSAvailable = true;
    }
}

/**
 * Adaptive Geofencing
 * Creates virtual boundaries that trigger events
 */
export class AdaptiveGeofence {
    constructor(center, baseRadius = 500) {
        this.center = center; // {latitude, longitude}
        this.baseRadius = baseRadius; // meters
        this.currentRadius = baseRadius;
        this.isInside = false;
        this.entryCallbacks = [];
        this.exitCallbacks = [];
    }

    /**
     * Update geofence center
     */
    updateCenter(latitude, longitude) {
        this.center = { latitude, longitude };
    }

    /**
     * Adapt radius based on conditions (traffic, urgency, etc.)
     */
    adaptRadius(factor = 1.0) {
        this.currentRadius = this.baseRadius * factor;
    }

    /**
     * Check if position is inside geofence
     */
    checkPosition(latitude, longitude) {
        const distance = calculateDistance(this.center, { latitude, longitude });
        const wasInside = this.isInside;
        this.isInside = distance <= this.currentRadius;

        // Trigger entry event
        if (!wasInside && this.isInside) {
            this.entryCallbacks.forEach(callback => callback({ distance, radius: this.currentRadius }));
        }

        // Trigger exit event
        if (wasInside && !this.isInside) {
            this.exitCallbacks.forEach(callback => callback({ distance, radius: this.currentRadius }));
        }

        return {
            isInside: this.isInside,
            distance,
            radius: this.currentRadius
        };
    }

    /**
     * Register entry callback
     */
    onEntry(callback) {
        this.entryCallbacks.push(callback);
    }

    /**
     * Register exit callback
     */
    onExit(callback) {
        this.exitCallbacks.push(callback);
    }

    reset() {
        this.isInside = false;
        this.currentRadius = this.baseRadius;
    }
}

/**
 * Exponential moving average for GPS smoothing (simpler alternative to Kalman)
 * @param {Object} newCoord - New GPS coordinate
 * @param {Object} lastSmoothed - Last smoothed coordinate
 * @param {number} alpha - Smoothing factor (0-1, higher = less smoothing)
 * @returns {Object} - Smoothed coordinate
 */
export function exponentialSmoothing(newCoord, lastSmoothed, alpha = 0.3) {
    if (!lastSmoothed) return newCoord;

    return {
        latitude: alpha * newCoord.latitude + (1 - alpha) * lastSmoothed.latitude,
        longitude: alpha * newCoord.longitude + (1 - alpha) * lastSmoothed.longitude
    };
}

/**
 * Hybrid Positioning - Combine GPS with Wi-Fi/Cellular data
 * Simulates hybrid positioning by adjusting confidence based on signal quality
 */
export function hybridPositioning(gpsCoord, accuracy = 10) {
    // In a real implementation, this would combine multiple data sources
    // For now, we adjust confidence based on GPS accuracy

    const confidence = accuracy < 10 ? 'high' : accuracy < 50 ? 'medium' : 'low';

    return {
        ...gpsCoord,
        accuracy,
        confidence,
        source: accuracy < 20 ? 'gps' : 'hybrid'
    };
}

export default {
    calculateDistance,
    calculateVelocityVector,
    snapToRoads,
    isValidGPSUpdate,
    GPSKalmanFilter,
    SensorFusionKalmanFilter,
    DeadReckoning,
    AdaptiveGeofence,
    exponentialSmoothing,
    hybridPositioning
};

