require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const Message = require("./models/Message");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.send("Socket server running"));

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  // Join a room
  socket.on("join-room", async (roomId) => {
    socket.join(roomId);
    console.log(`👥 ${socket.id} joined ${roomId}`);

    // Send chat history
    const messages = await Message.find({ chatRoom: roomId }).sort({ createdAt: 1 });
    socket.emit("chat-history", messages);
  });

  // Send chat message
  socket.on("send-message", async ({ roomId, message, userId }) => {
    const newMessage = await Message.create({
      chatRoom: roomId,
      sender: userId,
      content: message,
      type: "text",
    });

    io.to(roomId).emit("receive-message", newMessage);
  });

  // Typing indicators
  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("typing");
  });

  socket.on("stop-typing", (roomId) => {
    socket.to(roomId).emit("stop-typing");
  });

  // 📡 WebRTC Screen Sharing & Call Signaling

  socket.on("screen-offer", ({ roomId, offer }) => {
    console.log("🛰 Server relaying screen offer to:", roomId);
    socket.to(roomId).emit("screen-offer", { offer });
  });
  
  socket.on("screen-answer", ({ roomId, answer }) => {
    console.log("📡 Server relaying screen answer to:", roomId);
    socket.to(roomId).emit("screen-answer", { answer });
  });
  
  socket.on("ice-candidate", ({ roomId, candidate }) => {
    console.log("❄️ Server relaying ICE candidate to:", roomId);
    socket.to(roomId).emit("ice-candidate", { candidate });
  });
  

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Socket server at http://localhost:${PORT}`));
