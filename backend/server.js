const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { authenticateSocket } = require("./middleware/authMiddleware");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

mongoose.connect("mongodb://localhost:27017/chatdb", { useNewUrlParser: true, useUnifiedTopology: true });

const onlineUsers = new Map();

io.use(authenticateSocket);
io.on("connection", (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);
  io.emit("online-users", Array.from(onlineUsers.keys()));

  socket.on("join", (room) => socket.join(room));
  socket.on("send-message", (data) => {
    const { to, message, timestamp } = data;
    const toSocketId = onlineUsers.get(to);
    if (toSocketId) io.to(toSocketId).emit("receive-message", { from: userId, message, timestamp });
  });
  socket.on("typing", ({ to }) => io.to(onlineUsers.get(to)).emit("typing", { from: userId }));
  socket.on("stop-typing", ({ to }) => io.to(onlineUsers.get(to)).emit("stop-typing", { from: userId }));
  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));