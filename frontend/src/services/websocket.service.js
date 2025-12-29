/**
 * WebSocket Service
 * Manages Socket.IO connection for real-time updates
 */

import { io } from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(token) {
        if (this.socket?.connected) {
            return;
        }

        // Use relative URL so it works on mobile/network (proxied via Vite)
        this.socket = io({
            autoConnect: false
        });

        this.socket.connect();

        // Authenticate after connection
        this.socket.on('connect', () => {
            console.log('🔌 WebSocket connected');
            if (token) {
                this.socket.emit('authenticate', { token });
            }
        });

        this.socket.on('authenticated', (data) => {
            console.log('✅ WebSocket authenticated:', data);
        });

        this.socket.on('auth-error', (data) => {
            console.error('❌ WebSocket auth error:', data.message);
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Send GPS location (for drivers)
    sendLocation(latitude, longitude) {
        if (this.socket?.connected) {
            this.socket.emit('send-location', { latitude, longitude });
        }
    }

    // Listen for bus location updates
    onLocationUpdate(callback) {
        if (this.socket) {
            this.socket.on('receive-location', callback);
        } else {
            console.warn('Socket not initialized when calling onLocationUpdate');
        }
    }

    // Listen for ETA updates
    onETAUpdate(callback) {
        if (this.socket) {
            this.socket.on('eta-update', callback);
        }
    }

    // Listen for notifications
    onNotification(callback) {
        if (this.socket) {
            this.socket.on('notification', callback);
        }
    }

    // Join a room
    joinRoom(room) {
        if (this.socket?.connected) {
            this.socket.emit('join-room', { room });
        }
    }

    // Leave a room
    leaveRoom(room) {
        if (this.socket?.connected) {
            this.socket.emit('leave-room', { room });
        }
    }

    // Remove event listener
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    // Check if connected
    isConnected() {
        return this.socket?.connected || false;
    }
}

// Singleton instance
const websocketService = new WebSocketService();
export default websocketService;
