import { Server } from "socket.io";

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*" },
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => socket.join(roomId));

    socket.on("chat-message", ({ roomId, message }) => {
      io.to(roomId).emit("chat-message", message);
    });
  });

  res.end();
}
