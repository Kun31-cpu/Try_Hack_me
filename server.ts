import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

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

  const PORT = parseInt(process.env.PORT || "3000");

  app.use(cors());
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));
  app.use(express.raw({ limit: '100mb', type: '*/*' }));

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

  let notifications: any[] = [
    { id: 1, type: 'system', title: 'Welcome!', message: 'Welcome to HackLab. Start your first challenge today!', timestamp: new Date().toISOString(), read: false },
    { id: 2, type: 'award', title: 'Achievement Unlocked', message: 'You have completed your first lab!', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: true }
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

  app.put("/api/rooms/:id", (req, res) => {
    const roomId = parseInt(req.params.id);
    const { 
      title, description, difficulty, machine_ip, bannerUrl, avatarUrl,
      video1Url, video1Title, video1Enabled, video2Url, video2Title, video2Enabled, videoAutoplay
    } = req.body;
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex !== -1) {
      rooms[roomIndex] = {
        ...rooms[roomIndex],
        title: title || rooms[roomIndex].title,
        description: description || rooms[roomIndex].description,
        difficulty: difficulty || rooms[roomIndex].difficulty,
        machine_ip: machine_ip || rooms[roomIndex].machine_ip,
        bannerUrl: bannerUrl || rooms[roomIndex].bannerUrl,
        avatarUrl: avatarUrl || rooms[roomIndex].avatarUrl,
        video1Url: video1Url !== undefined ? video1Url : rooms[roomIndex].video1Url,
        video1Title: video1Title !== undefined ? video1Title : rooms[roomIndex].video1Title,
        video1Enabled: video1Enabled !== undefined ? video1Enabled : rooms[roomIndex].video1Enabled,
        video2Url: video2Url !== undefined ? video2Url : rooms[roomIndex].video2Url,
        video2Title: video2Title !== undefined ? video2Title : rooms[roomIndex].video2Title,
        video2Enabled: video2Enabled !== undefined ? video2Enabled : rooms[roomIndex].video2Enabled,
        videoAutoplay: videoAutoplay !== undefined ? videoAutoplay : rooms[roomIndex].videoAutoplay
      };
      res.json(rooms[roomIndex]);
    } else {
      res.status(404).json({ error: "Room not found" });
    }
  });

  app.post("/api/rooms/:id/clone", (req, res) => {
    const roomId = parseInt(req.params.id);
    const roomToClone = rooms.find(r => r.id === roomId);
    
    if (roomToClone) {
      const clonedRoom = {
        ...roomToClone,
        id: rooms.length + 1,
        title: `${roomToClone.title} (Clone)`,
        // Deep copy tasks with new IDs if necessary, though for this mock keeping them or giving new ones is fine
        tasks: roomToClone.tasks ? JSON.parse(JSON.stringify(roomToClone.tasks)) : []
      };
      rooms.push(clonedRoom);
      res.json(clonedRoom);
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

    // Create notification for new room
    const newNotification = {
      id: Date.now(),
      type: 'new_room',
      title: 'New Challenge!',
      message: `A new challenge "${newRoom.title}" has been uploaded.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    notifications.unshift(newNotification);
    io.emit("notification-new", newNotification);

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

  app.get("/api/notifications", (req, res) => {
    res.json(notifications.slice(0, 20));
  });

  app.post("/api/feedback", async (req, res) => {
    const { feedback, userEmail, username } = req.body;
    
    if (!feedback) {
      return res.status(400).json({ error: "Feedback is required" });
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'kbera1363@gmail.com',
      subject: `New Feedback from HackLab User: ${username || 'Anonymous'}`,
      text: `
        User: ${username || 'Anonymous'}
        Email: ${userEmail || 'Not provided'}
        
        Feedback:
        ${feedback}
      `
    };

    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials not configured. Feedback will not be sent via email.");
        // We'll still return success to the user but log the warning
        return res.json({ success: true, message: "Feedback received (SMTP not configured)" });
      }

      await transporter.sendMail(mailOptions);
      console.log("Feedback email sent successfully to kbera1363@gmail.com");
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending feedback email:", error);
      res.status(500).json({ error: "Failed to send feedback email" });
    }
  });

  app.post("/api/notifications/read", (req, res) => {
    notifications.forEach(n => n.read = true);
    res.json({ success: true });
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
        
        // Add to notifications
        const solveNotification = {
          id: Date.now() + 1,
          type: 'solve',
          title: 'Challenge Completed!',
          message: `You successfully solved ${foundTask.question} in ${foundRoom.title}.`,
          timestamp: new Date().toISOString(),
          read: false
        };
        notifications.unshift(solveNotification);
        io.emit("notification-new", solveNotification);

        // Broadcast updates
        io.emit("leaderboard-update", [...users].sort((a, b) => b.points - a.points));
        io.emit("activity-update", newActivity);
        
        // Notify about leaderboard change if rank changed (simplified)
        const rankNotification = {
          id: Date.now() + 2,
          type: 'leaderboard',
          title: 'Leaderboard Update',
          message: `${user.username} just earned ${foundTask.points} points!`,
          timestamp: new Date().toISOString(),
          read: false
        };
        notifications.unshift(rankNotification);
        io.emit("notification-new", rankNotification);
      }
      
      res.json({ status: "correct", points: foundTask.points });
    } else {
      res.json({ status: "incorrect" });
    }
  });

  let userSSHKeys: Record<string, { publicKey: string, privateKey: string }> = {};
  let userMachines: Record<string, Record<number, 'stopped' | 'starting' | 'running'>> = {};

  app.get("/api/user/machines", (req, res) => {
    const userId = "1"; // Mocking current user
    res.json(userMachines[userId] || {});
  });

  app.post("/api/user/machines/:roomId/status", (req, res) => {
    const userId = "1"; // Mocking current user
    const roomId = parseInt(req.params.roomId);
    const { status, username } = req.body;

    if (!userMachines[userId]) userMachines[userId] = {};
    userMachines[userId][roomId] = status;

    // Broadcast to others that someone's machine status changed (for "Public" view)
    io.emit("global-presence-update", {
      userId,
      username: username || "hacker",
      roomId,
      status
    });

    res.json({ success: true, status });
  });

  app.get("/api/user/ssh-key", (req, res) => {
    const userId = "1"; // Mocking current user
    if (userSSHKeys[userId]) {
      res.json(userSSHKeys[userId]);
    } else {
      res.status(404).json({ error: "No SSH key found" });
    }
  });

  app.post("/api/user/ssh-key/generate", (req, res) => {
    const userId = "1"; // Mocking current user
    
    // Simulate SSH key generation
    const mockPublicKey = `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7...hacker@hacklab`;
    const mockPrivateKey = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAYEAr+...
-----END OPENSSH PRIVATE KEY-----`;

    userSSHKeys[userId] = {
      publicKey: mockPublicKey,
      privateKey: mockPrivateKey
    };

    res.json(userSSHKeys[userId]);
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
