/**
 * Driver Dashboard Component
 * GPS sharing, trip management, and student manifest
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import websocketService from '../services/websocket.service';
import BusMap from '../components/BusMap';
import ThemeToggle from '../components/ThemeToggle';
import './DriverDashboard.css';

// Optional: Uncomment for advanced GPS filtering and smoothing
// import { GPSKalmanFilter, isValidGPSUpdate } from '../services/location.service';

function DriverDashboard() {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [manifest, setManifest] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tripActive, setTripActive] = useState(false);
    const [endingTrip, setEndingTrip] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [delayMinutes, setDelayMinutes] = useState(0);
    const [breakdownMessage, setBreakdownMessage] = useState('');
    const [gpsError, setGpsError] = useState(null);
    const watchIdRef = useRef(null);

    // Optional: Uncomment for GPS smoothing with Kalman filter
    // const kalmanFilterRef = useRef(new GPSKalmanFilter());

    useEffect(() => {
        fetchDashboardData();
        connectWebSocket();

        return () => {
            stopLocationTracking();
            websocketService.disconnect();
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/driver/dashboard');
            setDashboardData(response.data.data);
            setTripActive(!!response.data.data.activeTrip);

            if (response.data.data.activeTrip) {
                // If trip is already active from backend, ensure we start tracking
                startLocationTracking();
                fetchManifest();
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setLoading(false);
        }
    };

    const fetchManifest = async () => {
        try {
            const response = await axios.get('/api/driver/manifest');
            setManifest(response.data.data);
        } catch (error) {
            console.error('Failed to fetch manifest:', error);
        }
    };

    const connectWebSocket = () => {
        const token = localStorage.getItem('token');
        websocketService.connect(token);
    };

    const startLocationTracking = () => {
        setGpsError(null);
        if (!navigator.geolocation) {
            const errorMsg = 'Geolocation is not supported by your browser';
            setGpsError(errorMsg);
            alert(errorMsg);
            return;
        }

        console.log('Requesting geolocation...');

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 GPS Update:', latitude, longitude);

                // Optional: Uncomment for GPS filtering and smoothing
                // const newPosition = { latitude, longitude };
                // 
                // // Filter out unrealistic GPS jumps
                // if (!isValidGPSUpdate(newPosition, currentLocation, 30, 3)) {
                //     console.warn('Invalid GPS update filtered out');
                //     return;
                // }
                // 
                // // Apply Kalman filter for smoothing
                // const smoothed = kalmanFilterRef.current.filter(latitude, longitude);
                // setCurrentLocation(smoothed);
                // setGpsError(null);
                // websocketService.sendLocation(smoothed.latitude, smoothed.longitude);

                // Default behavior (no filtering)
                setCurrentLocation({ latitude, longitude });
                setGpsError(null);

                // Send location via WebSocket
                websocketService.sendLocation(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Unknown GPS error';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'User denied the request for Geolocation. Please enable GPS.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get user location timed out.';
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = 'An unknown error occurred.';
                        break;
                }
                setGpsError(errorMessage);
                // Don't alert constantly in watchPosition, just update UI
            },
            {
                enableHighAccuracy: true,
                timeout: 10000, // Increased timeout to 10s
                maximumAge: 0
            }
        );
    };

    const stopLocationTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    };

    const handleStartTrip = async () => {
        try {
            const response = await axios.post('/api/driver/trip/start');

            if (response.data.success) {
                setTripActive(true);
                startLocationTracking();
                fetchManifest();
                alert('Trip started successfully! Your location is now being shared.');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to start trip');
        }
    };

    const handleEndTrip = async () => {
        console.log('🛑 End Trip button clicked');

        // Prevent double-clicks
        if (endingTrip) {
            console.log('⚠️ Already ending trip, please wait...');
            return;
        }

        // Show confirmation dialog
        const confirmed = window.confirm(
            '⚠️ END TRIP CONFIRMATION\n\n' +
            'Are you sure you want to end this trip?\n\n' +
            'This will:\n' +
            '• Stop GPS tracking\n' +
            '• Mark the trip as completed\n' +
            '• Clear your current location\n\n' +
            'Click OK to end the trip, or Cancel to continue.'
        );

        console.log('User confirmation:', confirmed);

        if (!confirmed) {
            console.log('❌ Trip end cancelled by user');
            return;
        }

        console.log('✅ Proceeding to end trip...');
        setEndingTrip(true);

        try {
            console.log('📡 Sending POST request to /api/driver/trip/end');
            const response = await axios.post('/api/driver/trip/end');
            console.log('📥 End trip response:', response.data);

            if (response.data.success) {
                console.log('✅ Trip ended successfully!');
                setTripActive(false);
                stopLocationTracking();
                setCurrentLocation(null);
                setGpsError(null);

                alert('✅ Trip ended successfully!');

                // Refresh dashboard data
                await fetchDashboardData();
                console.log('🔄 Dashboard data refreshed');
            } else {
                console.error('❌ Backend returned success: false');
                alert('Failed to end trip: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ End trip error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            const errorMessage = error.response?.data?.message || error.message || 'Failed to end trip';
            alert('❌ Error ending trip: ' + errorMessage);
        } finally {
            setEndingTrip(false);
        }
    };

    const handleReportBreakdown = async () => {
        if (!breakdownMessage.trim()) {
            alert('Please enter a breakdown message');
            return;
        }

        try {
            const response = await axios.post('/api/driver/breakdown', {
                message: breakdownMessage
            });

            if (response.data.success) {
                alert('Breakdown reported! Students have been notified.');
                setBreakdownMessage('');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to report breakdown');
        }
    };

    const handleUpdateDelay = async () => {
        if (delayMinutes <= 0) {
            alert('Please enter a valid delay time');
            return;
        }

        try {
            const response = await axios.post('/api/driver/delay', {
                delayMinutes: parseInt(delayMinutes)
            });

            if (response.data.success) {
                alert('Delay updated! Students have been notified.');
                setDelayMinutes(0);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update delay');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spin">⏳</div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="dashboard-error">
                <h2>⚠️ No Data Available</h2>
                <p>Please contact admin to assign you to a bus.</p>
                <button className="btn btn-primary" onClick={logout}>Logout</button>
            </div>
        );
    }

    const { driver, bus, stops } = dashboardData;

    return (
        <div className="driver-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="dashboard-title">
                            <span className="title-icon">🚗</span>
                            Driver Dashboard
                        </h1>
                        <p className="dashboard-subtitle">Welcome, {driver.name}</p>
                    </div>
                    <div className="header-right">
                        <ThemeToggle />
                        <div className="location-indicator" style={{ position: 'relative' }} title={gpsError}>
                            {currentLocation ? (
                                <>
                                    <span className="location-dot pulse"></span>
                                    <span className="location-text">GPS Active</span>
                                </>
                            ) : (
                                <>
                                    <span className="location-dot inactive"></span>
                                    <span className="location-text">
                                        {gpsError ? 'GPS Error' : 'GPS Inactive'}
                                    </span>
                                    {gpsError && <div className="gps-error-msg">{gpsError}</div>}
                                </>
                            )}
                        </div>
                        <button className="btn btn-secondary" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Bus Info */}
                <div className="info-grid">
                    <div className="info-card card">
                        <div className="info-icon">🚌</div>
                        <div className="info-content">
                            <h3 className="info-label">Bus Number</h3>
                            <p className="info-value">{bus.busNumber}</p>
                            <p className="info-meta">{bus.routeName}</p>
                        </div>
                    </div>

                    <div className="info-card card">
                        <div className="info-icon">📍</div>
                        <div className="info-content">
                            <h3 className="info-label">Current Location</h3>
                            <p className="info-value">
                                {currentLocation ? (
                                    <span className="text-success">Tracking</span>
                                ) : (
                                    <span className="text-muted">Not Started</span>
                                )}
                            </p>
                            {currentLocation && (
                                <p className="info-meta">
                                    {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="info-card card">
                        <div className="info-icon">👥</div>
                        <div className="info-content">
                            <h3 className="info-label">Total Students</h3>
                            <p className="info-value">
                                {manifest.reduce((sum, stop) => sum + stop.present_count, 0)}
                            </p>
                            <p className="info-meta">Expected today</p>
                        </div>
                    </div>

                    <div className="info-card card">
                        <div className="info-icon">🚦</div>
                        <div className="info-content">
                            <h3 className="info-label">Trip Status</h3>
                            <p className="info-value">
                                {tripActive ? (
                                    <span className="badge badge-success">Active</span>
                                ) : (
                                    <span className="badge badge-warning">Not Started</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trip Controls */}
                <div className="trip-controls card">
                    <h2 className="section-title">Trip Controls</h2>
                    <div className="controls-grid">
                        {!tripActive ? (
                            <button
                                className="btn btn-primary btn-large"
                                onClick={handleStartTrip}
                            >
                                <span>🚀</span>
                                Start Trip
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-danger btn-large"
                                onClick={handleEndTrip}
                                disabled={endingTrip}
                            >
                                {endingTrip ? (
                                    <>
                                        <span className="spin">⏳</span>
                                        Ending Trip...
                                    </>
                                ) : (
                                    <>
                                        <span>🛑</span>
                                        End Trip
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Student Manifest */}
                {tripActive && (
                    <div className="manifest-section card">
                        <h2 className="section-title">Student Manifest</h2>
                        <p className="section-description">Expected student count at each stop</p>
                        <div className="manifest-table">
                            <div className="table-header">
                                <div className="table-cell">Stop</div>
                                <div className="table-cell">Present</div>
                                <div className="table-cell">Absent</div>
                                <div className="table-cell">Total</div>
                            </div>
                            {manifest.map((stop) => (
                                <div key={stop.stop_id} className="table-row">
                                    <div className="table-cell">
                                        <strong>{stop.stop_name}</strong>
                                    </div>
                                    <div className="table-cell">
                                        <span className="badge badge-success">{stop.present_count}</span>
                                    </div>
                                    <div className="table-cell">
                                        <span className="badge badge-error">{stop.absent_count}</span>
                                    </div>
                                    <div className="table-cell">
                                        <strong>{stop.total_students}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Alerts Section */}
                {tripActive && (
                    <div className="alerts-grid">
                        <div className="alert-card card">
                            <h3 className="section-title">⚠️ Report Breakdown</h3>
                            <textarea
                                className="form-input"
                                placeholder="Describe the issue..."
                                value={breakdownMessage}
                                onChange={(e) => setBreakdownMessage(e.target.value)}
                                rows="3"
                            />
                            <button
                                className="btn btn-danger"
                                onClick={handleReportBreakdown}
                            >
                                Report Breakdown
                            </button>
                        </div>

                        <div className="alert-card card">
                            <h3 className="section-title">⏰ Update Delay</h3>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Delay in minutes"
                                value={delayMinutes}
                                onChange={(e) => setDelayMinutes(e.target.value)}
                                min="0"
                            />
                            <button
                                className="btn btn-warning"
                                onClick={handleUpdateDelay}
                            >
                                Notify Students
                            </button>
                        </div>
                    </div>
                )}

                {/* Map */}
                <div className="map-section card">
                    <h2 className="section-title">Route Map</h2>
                    <BusMap
                        stops={stops}
                        busLocation={currentLocation}
                        height="500px"
                    />
                </div>
            </div>
        </div>
    );
}

export default DriverDashboard;
