const socket = io();

// Constants
const ANIMATION_DURATION = 1500; // 1.5s for smooth transition
const lerp = (start, end, t) => start + (end - start) * t;

/**
 * Calculate bearing between two points
 */
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

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        socket.emit("send-location", { latitude, longitude, speed, heading });
    }, (error) => {
        console.error("Geolocation error:", error);
    },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "College Bus Tracker",
    maxZoom: 19
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude, speed, bearing: busBearing } = data;
    
    // Auto-center on first location
    if (Object.keys(markers).length === 0) {
        map.setView([latitude, longitude], 16);
    }

    if (markers[id]) {
        // Smooth Movement (LERP)
        const markerObj = markers[id];
        const startPos = markerObj.getLatLng();
        const startLat = startPos.lat;
        const startLng = startPos.lng;
        const startTime = performance.now();
        
        // Calculate bearing if not provided by backend
        const bearing = busBearing !== undefined ? busBearing : calculateBearing(startLat, startLng, latitude, longitude);

        function animateMarker(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
            
            // Cubic easing for "buttery smooth" movement
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentLat = lerp(startLat, latitude, easeProgress);
            const currentLng = lerp(startLng, longitude, easeProgress);

            markerObj.setLatLng([currentLat, currentLng]);

            // Update rotation
            const element = markerObj.getElement();
            if (element) {
                const iconContainer = element.querySelector('.bus-emoji-container');
                if (iconContainer) {
                    iconContainer.style.transform = `rotate(${bearing}deg)`;
                }
            }

            if (progress < 1) {
                requestAnimationFrame(animateMarker);
            }
        }

        requestAnimationFrame(animateMarker);
    } else {
        // Create new marker with Emoji
        const busIcon = L.divIcon({
            className: 'custom-bus-marker',
            html: `
                <div class="bus-marker-wrapper">
                    <div class="bus-emoji-container" style="transition: transform 0.3s ease;">🚌</div>
                    <div class="bus-pulse"></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        markers[id] = L.marker([latitude, longitude], { icon: busIcon }).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
