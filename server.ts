import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createApp } from "./server-app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("Starting server initialization...");
  
  // Ensure uploads directory exists
  try {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      console.log("Creating uploads directory...");
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    console.error("Warning: Could not create uploads directory:", err);
  }

  const PORT = parseInt(process.env.PORT || "3000");
  const server = http.createServer();
  server.timeout = 30 * 60 * 1000; // 30 minutes
  
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const app = await createApp(io);
  server.on('request', app);

  // WebSocket logic for "Global Presence"
  const roomConnections: Record<number, Set<string>> = {};

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", (roomId: number) => {
      socket.join(`room-${roomId}`);
      if (!roomConnections[roomId]) {
        roomConnections[roomId] = new Set();
      }
      roomConnections[roomId].add(socket.id);
      
      // Broadcast current connections to everyone in the room
      io.to(`room-${roomId}`).emit("presence-update", {
        roomId,
        count: roomConnections[roomId].size,
        users: Array.from(roomConnections[roomId])
      });
    });

    socket.on("leave-room", (roomId: number) => {
      socket.leave(`room-${roomId}`);
      if (roomConnections[roomId]) {
        roomConnections[roomId].delete(socket.id);
        io.to(`room-${roomId}`).emit("presence-update", {
          roomId,
          count: roomConnections[roomId].size
        });
      }
    });

    socket.on("disconnect", () => {
      for (const roomId in roomConnections) {
        if (roomConnections[roomId].has(socket.id)) {
          roomConnections[roomId].delete(socket.id);
          io.to(`room-${roomId}`).emit("presence-update", {
            roomId: parseInt(roomId),
            count: roomConnections[roomId].size
          });
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
  process.exit(1);
});
