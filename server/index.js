const express = require("express");
const { Server } = require("socket.io");

const app = express();
const io = new Server({ cors: { origin: "*" } }); // Consider specifying allowed origins

app.use(express.json()); // Using built-in middleware

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  console.log("new connection");
  socket.on("join-room", (data) => {
    // Add validation for data
    const { roomId, emailId } = data;
    console.log("User", emailId, "Joined Room", roomId);
    emailToSocketMapping.set(emailId, socket.id);
    socketToEmailMapping.set(socket.id, emailId);
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-joined", { emailId });
  });
  // Handle other events similarly, with error handling and validation
});

const PORT = process.env.PORT || 8000; // Making port configurable
app.listen(PORT, () => console.log(`HTTP server running at ${PORT}`));
io.listen(process.env.SOCKET_PORT || 8001); // Separate port for Socket.IO, also configurable