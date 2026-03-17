import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './BusMap.css'; // Reusing existing map styles

// Helper for smooth interpolation
const lerp = (start, end, t) => start + (end - start) * t;

// Helper for bearing calculation
function calculateBearing(startLat, startLng, endLat, endLng) {
    const startLatRad = (startLat * Math.PI) / 180;
    const endLatRad = (endLat * Math.PI) / 180;
    const dLngRad = ((endLng - startLng) * Math.PI) / 180;
    const y = Math.sin(dLngRad) * Math.cos(endLatRad);
    const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
        Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLngRad);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
}

function AdminMap({ buses = [], routes = [], height = '500px' }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const busMarkersRef = useRef(new Map()); // busId -> marker
    const animationsRef = useRef(new Map()); // busId -> animationId

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Center on India

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
            // Cleanup any pending animations
            animationsRef.current.forEach(id => cancelAnimationFrame(id));
        };
    }, []);

    // Handle Buses Updates
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        buses.forEach(bus => {
            if (!bus.current_lat || !bus.current_lng) return;

            if (busMarkersRef.current.has(bus.id)) {
                // Smooth Movement (LERP)
                const marker = busMarkersRef.current.get(bus.id);
                const startPos = marker.getLatLng();
                const targetLat = bus.current_lat;
                const targetLng = bus.current_lng;
                const startTime = performance.now();
                const duration = 2000; // 2 seconds for server updates

                // Calculate bearing for rotation
                const bearing = calculateBearing(startPos.lat, startPos.lng, targetLat, targetLng);

                // Cancel existing animation for this bus
                if (animationsRef.current.has(bus.id)) {
                    cancelAnimationFrame(animationsRef.current.get(bus.id));
                }

                function animate(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic Ease-Out

                    const currentLat = lerp(startPos.lat, targetLat, easeProgress);
                    const currentLng = lerp(startPos.lng, targetLng, easeProgress);

                    marker.setLatLng([currentLat, currentLng]);

                    // Update rotation
                    const element = marker.getElement();
                    if (element) {
                        const iconEl = element.querySelector('.bus-icon');
                        if (iconEl) iconEl.style.transform = `rotate(${bearing}deg)`;
                    }

                    if (progress < 1) {
                        animationsRef.current.set(bus.id, requestAnimationFrame(animate));
                    }
                }

                animationsRef.current.set(bus.id, requestAnimationFrame(animate));
                
                // Update popup content
                marker.setPopupContent(createBusPopup(bus));
            } else {
                // Create new marker with Emoji and Rotation support
                const busIcon = L.divIcon({
                    className: 'custom-bus-marker',
                    html: `
                        <div class="bus-marker-inner" style="background: ${getBusColor(bus.status)}; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); border-radius: 50%;">
                            <div class="bus-icon" style="transition: transform 0.5s ease;">🚌</div>
                        </div>
                    `,
                    iconSize: [45, 45],
                    iconAnchor: [22, 22],
                });

                const marker = L.marker([bus.current_lat, bus.current_lng], {
                    icon: busIcon,
                    zIndexOffset: 1000
                }).addTo(map);

                marker.bindPopup(createBusPopup(bus));
                busMarkersRef.current.set(bus.id, marker);

                // Auto-fit bounds on first bus load
                if (busMarkersRef.current.size === 1) {
                    map.setView([bus.current_lat, bus.current_lng], 13);
                }
            }
        });

    }, [buses]);

    // Helper functions
    const createBusPopup = (bus) => `
        <div class="map-popup">
            <h4>🚌 Bus ${bus.bus_number}</h4>
            <p><strong>Driver:</strong> ${bus.driver_name || 'Unassigned'}</p>
            <p><strong>Route:</strong> ${bus.route_name || 'N/A'}</p>
            <p><strong>Status:</strong> <span class="badge" style="background: ${getBusColor(bus.status)}; color: white; padding: 2px 6px; border-radius: 4px;">${bus.status}</span></p>
            <p class="text-xs text-muted" style="font-size: 0.75rem; margin-top: 5px;">Last update: ${new Date().toLocaleTimeString()}</p>
        </div>
    `;

    const getBusColor = (status) => {
        switch (status) {
            case 'active': return '#10b981'; // Green
            case 'breakdown': return '#ef4444'; // Red
            case 'maintenance': return '#f59e0b'; // Amber
            default: return '#6366f1'; // Indigo
        }
    };

    return (
        <div className="admin-map-container" style={{ marginBottom: '2rem' }}>
            <div
                ref={mapRef}
                className="admin-map"
                style={{ height, width: '100%', borderRadius: '1rem', border: '1px solid var(--border)' }}
            />
        </div>
    );
}

export default AdminMap;
