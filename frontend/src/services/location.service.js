/**
 * Location Smoothing Service
 * Provides utilities for smooth GPS tracking and optional road snapping
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
 * Kalman filter for GPS smoothing (simplified version)
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

export default {
    calculateDistance,
    snapToRoads,
    isValidGPSUpdate,
    GPSKalmanFilter,
    exponentialSmoothing
};
