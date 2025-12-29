/**
 * Bus Map Component
 * Displays route, stops, and live bus location using Leaflet
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './BusMap.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function BusMap({ stops = [], busLocation = null, myStopId = null, height = '400px' }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const busMarkerRef = useRef(null);
    const routeLineRef = useRef(null);
    const stopMarkersRef = useRef([]);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current).setView([28.6139, 77.2090], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update stops and route
    useEffect(() => {
        if (!mapInstanceRef.current || !stops.length) return;

        const map = mapInstanceRef.current;

        // Clear existing stop markers
        stopMarkersRef.current.forEach(marker => marker.remove());
        stopMarkersRef.current = [];

        // Clear existing route line
        if (routeLineRef.current) {
            routeLineRef.current.remove();
            routeLineRef.current = null;
        }

        // Create custom icons
        const stopIcon = L.divIcon({
            className: 'custom-stop-marker',
            html: '<div class="stop-marker-inner">📍</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });

        const myStopIcon = L.divIcon({
            className: 'custom-stop-marker my-stop',
            html: '<div class="stop-marker-inner">🏠</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        // Add stop markers
        const coordinates = [];
        stops.forEach(stop => {
            const isMyStop = stop.id === myStopId;
            const marker = L.marker([stop.latitude, stop.longitude], {
                icon: isMyStop ? myStopIcon : stopIcon
            }).addTo(map);

            marker.bindPopup(`
        <div class="map-popup">
          <h4>${stop.name}</h4>
          <p>${isMyStop ? '🏠 Your Stop' : 'Stop #' + stop.sequence_order}</p>
        </div>
      `);

            stopMarkersRef.current.push(marker);
            coordinates.push([stop.latitude, stop.longitude]);
        });

        // Draw route line
        if (coordinates.length > 1) {
            const routeLine = L.polyline(coordinates, {
                color: '#6366f1',
                weight: 4,
                opacity: 0.7,
                smoothFactor: 1
            }).addTo(map);

            routeLineRef.current = routeLine;

            // Fit map to show all stops
            map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
        }
    }, [stops, myStopId]);

    // Update bus location
    useEffect(() => {
        if (!mapInstanceRef.current || !busLocation) return;

        const map = mapInstanceRef.current;

        // Remove existing bus marker
        if (busMarkerRef.current) {
            busMarkerRef.current.remove();
        }

        // Create bus icon
        const busIcon = L.divIcon({
            className: 'custom-bus-marker',
            html: `
        <div class="bus-marker-inner">
          <div class="bus-icon">🚌</div>
          <div class="bus-pulse"></div>
        </div>
      `,
            iconSize: [50, 50],
            iconAnchor: [25, 25],
        });

        // Add bus marker
        const busMarker = L.marker([busLocation.latitude, busLocation.longitude], {
            icon: busIcon
        }).addTo(map);

        busMarker.bindPopup(`
      <div class="map-popup">
        <h4>🚌 Bus Location</h4>
        <p>Live tracking active</p>
      </div>
    `);

        busMarkerRef.current = busMarker;

        // Center map on bus (optional - can be commented out if you prefer static view)
        // map.setView([busLocation.latitude, busLocation.longitude], map.getZoom());
    }, [busLocation]);

    return (
        <div className="bus-map-container">
            <div
                ref={mapRef}
                className="bus-map"
                style={{ height, width: '100%', borderRadius: 'var(--radius-lg)' }}
            />
            {!busLocation && (
                <div className="map-overlay">
                    <p>🚌 Waiting for bus to start trip...</p>
                </div>
            )}
        </div>
    );
}

export default BusMap;
