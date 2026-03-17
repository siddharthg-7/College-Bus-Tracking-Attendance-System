const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
    socket.on("send-location", function (data) {
        // Incoming GPS data from driver/client
        const {
            busId = socket.id,
            latitude,
            longitude,
            speed = null,
            heading = null,
            accuracy = null,
            timestamp = Date.now()
        } = data;

        const payload = {
            id: socket.id,
            busId,
            latitude,
            longitude,
            speed,
            heading,
            accuracy,
            timestamp,
            receivedAt: Date.now()
        };

        // Broadcast to all clients updates for real-time bus movement
        io.emit("receive-location", payload);
    });

    socket.on("disconnect", function () {
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

server.listen(3000);