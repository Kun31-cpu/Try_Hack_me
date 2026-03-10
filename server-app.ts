import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp(io?: Server) {
  const app = express();
  
  const upload = multer({ 
    dest: 'uploads/',
    limits: {
      fileSize: 10 * 1024 * 1024 * 1024 // 10GB limit
    }
  });

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
        { id: 1, question: "What is the default port for HTTP?", points: 10, answer: "80", difficulty: "Easy" },
        { id: 2, question: "What does SQL stand for?", points: 20, answer: "Structured Query Language", difficulty: "Easy" },
        { id: 3, question: "What is the default port for HTTPS?", points: 15, answer: "443", difficulty: "Easy" },
        { id: 4, question: "What is the default port for SSH?", points: 25, answer: "22", difficulty: "Medium" }
      ]
    },
    {
      id: 2,
      title: "Web Exploitation 101",
      description: "Dive into common web vulnerabilities like XSS and SQL Injection.",
      difficulty: "Medium",
      category: "Web",
      tasks: [
        { id: 5, question: "What is the flag in /etc/passwd?", points: 50, answer: "HACK{passwd_flag}", difficulty: "Medium" },
        { id: 6, question: "What is the flag in /root/root.txt?", points: 100, answer: "HACK{root_flag}", difficulty: "Hard" }
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
  app.get("/api/health", (req, res) => {
    return res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    const user = users.find(u => u.username === username);
    if (user) {
      res.json({
        user: { ...user },
        token: "mock-token-" + user.id
      });
    } else {
      // For demo purposes, if user not found, create a mock one
      const newUser = { id: Date.now().toString(), username, points: 0, solvedLabs: [], streak: 0 };
      users.push(newUser);
      res.json({
        user: newUser,
        token: "mock-token-" + newUser.id
      });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = { 
      id: (users.length + 1).toString(), 
      username, 
      points: 0, 
      solvedLabs: [], 
      streak: 0,
      avatar_url: `https://picsum.photos/seed/${username}/100/100`
    };
    users.push(newUser);
    res.json({
      user: newUser,
      token: "mock-token-" + newUser.id
    });
  });

  app.get("/api/users/:id/profile", (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (user) {
      const solvedLabs = rooms.filter(r => user.solvedLabs.includes(r.id));
      return res.json({ ...user, solvedLabs });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/api/leaderboard", (req, res) => {
    const sortedUsers = [...users].sort((a, b) => b.points - a.points);
    return res.json(sortedUsers);
  });

  app.get("/api/activity", (req, res) => {
    return res.json(activityFeed.slice(0, 20));
  });

  app.get("/api/notifications", (req, res) => {
    return res.json(notifications.slice(0, 20));
  });

  app.post("/api/notifications/read", (req, res) => {
    notifications.forEach(n => n.read = true);
    return res.json({ success: true });
  });

  app.get("/api/rooms", (req, res) => {
    return res.json(rooms);
  });

  app.get("/api/rooms/:id", (req, res) => {
    const roomId = parseInt(req.params.id);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      return res.json(room);
    } else {
      return res.status(404).json({ error: "Room not found" });
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
      return res.json(rooms[roomIndex]);
    } else {
      return res.status(404).json({ error: "Room not found" });
    }
  });

  app.delete("/api/rooms/:id", (req, res) => {
    const roomId = parseInt(req.params.id);
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex !== -1) {
      rooms.splice(roomIndex, 1);
      return res.json({ success: true, message: "Room deleted successfully" });
    } else {
      return res.status(404).json({ error: "Room not found" });
    }
  });

  app.post("/api/rooms/:id/reset", (req, res) => {
    const roomId = parseInt(req.params.id);
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex !== -1) {
      return res.json({ success: true, message: "Room data reset successfully" });
    } else {
      return res.status(404).json({ error: "Room not found" });
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
        tasks: roomToClone.tasks ? JSON.parse(JSON.stringify(roomToClone.tasks)) : []
      };
      rooms.push(clonedRoom);
      return res.json(clonedRoom);
    } else {
      return res.status(404).json({ error: "Room not found" });
    }
  });

  app.post("/api/rooms", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
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

    const newNotification = {
      id: Date.now(),
      type: 'new_room',
      title: 'New Challenge!',
      message: `A new challenge "${newRoom.title}" has been uploaded.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    notifications.unshift(newNotification);
    if (io) io.emit("notification-new", newNotification);

    return res.json(newRoom);
  });

  app.put("/api/rooms/:id/tasks", (req, res) => {
    const roomId = parseInt(req.params.id);
    const { tasks } = req.body;
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex !== -1) {
      rooms[roomIndex].tasks = tasks;
      return res.json(rooms[roomIndex]);
    } else {
      return res.status(404).json({ error: "Room not found" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    const { feedback, username, userEmail } = req.body;
    
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
        return res.json({ success: true, message: "Feedback received (SMTP not configured)" });
      }

      await transporter.sendMail(mailOptions);
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to send feedback email" });
    }
  });

  app.post("/api/submissions", (req, res) => {
    const { taskId, answer } = req.body;
    
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
      const user = users.find(u => u.id === "1");
      if (user) {
        user.points += foundTask.points;
        
        const newActivity = {
          id: Date.now(),
          type: 'solve',
          user: user.username,
          room: foundRoom.title,
          points: foundTask.points,
          timestamp: new Date().toISOString()
        };
        activityFeed.unshift(newActivity);
        
        const solveNotification = {
          id: Date.now() + 1,
          type: 'solve',
          title: 'Challenge Completed!',
          message: `You successfully solved ${foundTask.question} in ${foundRoom.title}.`,
          timestamp: new Date().toISOString(),
          read: false
        };
        notifications.unshift(solveNotification);
        if (io) {
          io.emit("notification-new", solveNotification);
          io.emit("leaderboard-update", [...users].sort((a, b) => b.points - a.points));
          io.emit("activity-update", newActivity);
        }

        return res.json({ status: "correct", points: foundTask.points });
      }
    }

    return res.json({ status: "incorrect" });
  });

  let userSSHKeys: Record<string, { publicKey: string, privateKey: string }> = {};
  let userMachines: Record<string, Record<number, 'stopped' | 'starting' | 'running'>> = {};

  app.get("/api/user/machines", (req, res) => {
    const userId = "1"; // Mocking current user
    return res.json(userMachines[userId] || {});
  });

  app.post("/api/user/machines/:roomId/status", (req, res) => {
    const userId = "1"; // Mocking current user
    const roomId = parseInt(req.params.roomId);
    const { status, username } = req.body;

    if (!userMachines[userId]) userMachines[userId] = {};
    userMachines[userId][roomId] = status;

    if (io) {
      io.emit("global-presence-update", {
        userId,
        username: username || "Hacker",
        roomId,
        status
      });
    }

    return res.json({ success: true });
  });

  app.get("/api/user/ssh-key", (req, res) => {
    const userId = "1"; // Mocking current user
    if (userSSHKeys[userId]) {
      return res.json(userSSHKeys[userId]);
    } else {
      return res.status(404).json({ error: "No SSH key found" });
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

    return res.json(userSSHKeys[userId]);
  });

  app.get("/api/vpn/config", (req, res) => {
    const username = "Hacker";
    const config = `
client
dev tun
proto udp
remote hacklab-vpn.example.com 1194
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
    return res.send(config);
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  return app;
}
