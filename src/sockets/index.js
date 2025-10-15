// src/sockets/index.js
export default function initSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Optional: join a room or group
    socket.on("join", (data) => {
      if (data?.room) {
        socket.join(data.room);
        console.log(`${socket.id} joined room ${data.room}`);
      }
    });

    // Simple ping-pong test (optional)
    socket.on("client:ping", (payload) => {
      socket.emit("server:pong", { time: Date.now(), payload });
    });

    // Log disconnections
    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} (${reason})`);
    });
  });
}
