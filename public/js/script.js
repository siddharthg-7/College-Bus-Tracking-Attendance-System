const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const {
            latitude,
            longitude,
            speed,
            heading,
            accuracy
        } = position.coords;

        // Send rich GPS data to server for real-time tracking
        socket.emit("send-location", {
            latitude,
            longitude,
            speed: speed || 0,
            heading: heading || 0,
            accuracy: accuracy || null,
            timestamp: position.timestamp || Date.now()
        });
    }, (error) => {
        console.log(error);
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
    attribution: "GNIT"
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, busId, latitude, longitude, speed, heading, accuracy, timestamp } = data;

    // Keep each vehicle marker moving in real-time
    const markerKey = busId || id;
    if (!markers[markerKey]) {
        markers[markerKey] = L.marker([latitude, longitude]).addTo(map);
        markers[markerKey].bindPopup(`Bus: ${markerKey}<br/>Speed: ${speed || 'n/a'} m/s<br/>Accuracy: ${accuracy || 'n/a'}m`);
    } else {
        markers[markerKey].setLatLng([latitude, longitude]);
        markers[markerKey].setPopupContent(`Bus: ${markerKey}<br/>Speed: ${speed || 'n/a'} m/s<br/>Accuracy: ${accuracy || 'n/a'}m<br/>Updated: ${new Date(timestamp).toLocaleTimeString()}`);
    }

    // Optional: center map on current bus (toggle as desired)
    map.setView([latitude, longitude], 16);
});
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
