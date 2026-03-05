import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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

  const app = express();
  
  const upload = multer({ 
    dest: 'uploads/',
    limits: {
      fileSize: 10 * 1024 * 1024 * 1024 // 10GB limit
    }
  });

  const server = http.createServer(app);
  server.timeout = 30 * 60 * 1000; // 30 minutes
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory store for rooms and tasks (simulating a DB)
  let rooms: any[] = [
    {
      id: 1,
      title: "Introduction to Cyber Security",
      description: "Learn the basics of cyber security, including common threats and how to protect yourself.",
      difficulty: "Easy",
      category: "Education",
      tasks: [
        { id: 1, question: "What is the default port for HTTP?", points: 10, answer: "80" },
        { id: 2, question: "What does SQL stand for?", points: 20, answer: "Structured Query Language" }
      ]
    },
    {
      id: 2,
      title: "Web Exploitation 101",
      description: "Dive into common web vulnerabilities like XSS and SQL Injection.",
      difficulty: "Medium",
      category: "Web",
      tasks: [
        { id: 3, question: "What is the flag in /etc/passwd?", points: 50, answer: "HACK{passwd_flag}" }
      ]
    }
  ];

  let users: any[] = [
    { id: "1", username: "admin", points: 2500, solvedLabs: [1, 2], streak: 12, avatar_url: "https://picsum.photos/seed/admin/100/100" },
    { id: "2", username: "cyber_ghost", points: 2100, solvedLabs: [1], streak: 8, avatar_url: "https://picsum.photos/seed/ghost/100/100" },
    { id: "3", username: "null_pointer", points: 1850, solvedLabs: [2], streak: 5, avatar_url: "https://picsum.photos/seed/null/100/100" },
    { id: "4", username: "root_kit", points: 1500, solvedLabs: [], streak: 3, avatar_url: "https://picsum.photos/seed/root/100/100" },
    { id: "5", username: "buffer_overflow", points: 1200, solvedLabs: [], streak: 2, avatar_url: "https://picsum.photos/seed/buffer/100/100" }
  ];

  let activityFeed: any[] = [
    { id: 1, type: 'solve', user: 'cyber_ghost', room: 'Web Exploitation 101', points: 50, timestamp: new Date().toISOString() },
    { id: 2, type: 'streak', user: 'admin', streak: 12, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 3, type: 'solve', user: 'null_pointer', room: 'Introduction to Cyber Security', points: 20, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() }
  ];

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { username } = req.body;
    res.json({
      user: { id: "1", username: username || "hacker", points: 100, solvedLabs: [], streak: 5 },
      token: "mock-token"
    });
  });

  app.post("/api/auth/register", (req, res) => {
    const { username } = req.body;
    res.json({
      user: { id: "1", username: username || "hacker", points: 100, solvedLabs: [], streak: 5 },
      token: "mock-token"
    });
  });

  app.get("/api/auth/google/url", (req, res) => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: `${req.protocol}://${req.get('host')}/auth/google/callback`,
      client_id: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    res.json({ url: `${rootUrl}?${qs.toString()}` });
  });

  app.get("/auth/google/callback", (req, res) => {
    // In a real app, you'd exchange the code for tokens and get user info
    // For this demo, we'll just return a success message
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS',
                user: { id: "google-123", username: "GoogleUser", points: 100, solvedLabs: [], streak: 1 },
                token: "google-mock-token"
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  app.get("/api/rooms", (req, res) => {
    res.json(rooms);
  });

  app.get("/api/rooms/:id", (req, res) => {
    const roomId = parseInt(req.params.id);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ error: "Room not found" });
    }
  });

  app.post("/api/rooms", upload.single('file'), (req, res) => {
    console.log("Received room upload request:", req.body);
    if (!req.file) {
      console.warn("Upload request missing file");
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("File uploaded successfully:", req.file.originalname, "size:", req.file.size);
    
    const { title, description, difficulty, category } = req.body;
    const newRoom = {
      id: rooms.length + 1,
      title: title || "New Vulnerable Machine",
      description: description || "A custom uploaded vulnerable machine.",
      difficulty: difficulty || "Medium",
      category: category || "Custom",
      tasks: [],
      file: req.file ? req.file.filename : null,
      originalName: req.file ? req.file.originalname : null
    };
    rooms.push(newRoom);
    res.json(newRoom);
  });

  app.put("/api/rooms/:id/tasks", (req, res) => {
    const roomId = parseInt(req.params.id);
    const { tasks } = req.body;
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex !== -1) {
      rooms[roomIndex].tasks = tasks;
      res.json(rooms[roomIndex]);
    } else {
      res.status(404).json({ error: "Room not found" });
    }
  });

  app.get("/api/users/:id/profile", (req, res) => {
    res.json({
      id: req.params.id,
      username: "hacker",
      points: 100,
      solvedLabs: []
    });
  });

  app.get("/api/leaderboard", (req, res) => {
    const sortedUsers = [...users].sort((a, b) => b.points - a.points);
    res.json(sortedUsers);
  });

  app.get("/api/activity", (req, res) => {
    res.json(activityFeed.slice(0, 20));
  });

  app.post("/api/submissions", (req, res) => {
    const { taskId, answer } = req.body;
    
    // Find task in rooms
    let foundTask: any = null;
    let foundRoom: any = null;
    for (const room of rooms) {
      const task = room.tasks?.find((t: any) => t.id === taskId);
      if (task) {
        foundTask = task;
        foundRoom = room;
        break;
      }
    }

    if (!foundTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (answer === foundTask.answer) {
      // Update user points (mocking for the current user)
      const user = users.find(u => u.id === "1"); // Assuming current user is ID 1
      if (user) {
        user.points += foundTask.points;
        
        // Add to activity feed
        const newActivity = {
          id: Date.now(),
          type: 'solve',
          user: user.username,
          room: foundRoom.title,
          points: foundTask.points,
          timestamp: new Date().toISOString()
        };
        activityFeed.unshift(newActivity);
        
        // Broadcast updates
        io.emit("leaderboard-update", [...users].sort((a, b) => b.points - a.points));
        io.emit("activity-update", newActivity);
      }
      
      res.json({ status: "correct", points: foundTask.points });
    } else {
      res.json({ status: "incorrect" });
    }
  });

  // VPN Configuration Endpoint
  app.get("/api/vpn/config", (req, res) => {
    const username = "hacker"; // In a real app, get from token
    const config = `
client
dev tun
proto udp
remote hacklab.network 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
auth-user-pass
verb 3
<ca>
-----BEGIN CERTIFICATE-----
MIIB... (Mock CA)
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
MIIB... (Mock Cert)
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIIB... (Mock Key)
-----END PRIVATE KEY-----
</key>
    `.trim();
    
    res.setHeader('Content-Type', 'application/x-openvpn-profile');
    res.setHeader('Content-Disposition', `attachment; filename=hacklab-${username}.ovpn`);
    res.send(config);
  });

  // OVA files are stored in the 'uploads/' directory on the server.
  // Multer handles the file storage automatically based on the 'upload' configuration.

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
