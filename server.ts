import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

const db = new Database("afyasign.db");

// Initialize database
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      role TEXT, -- 'patient' or 'professional'
      avatar TEXT,
      preferred_language TEXT DEFAULT 'en',
      font_size TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS communication_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      type TEXT, -- 'request' or 'instruction'
      content TEXT,
      tsl_description TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS frequent_signs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      sign_id TEXT,
      usage_count INTEGER DEFAULT 1,
      UNIQUE(user_id, sign_id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  console.log("Database initialized successfully");
} catch (dbError) {
  console.error("Database initialization failed:", dbError);
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // API Routes
  app.get("/api/profile/:userId", (req, res) => {
    try {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.userId);
      if (user) {
        res.json(user);
      } else {
        console.log(`User not found: ${req.params.userId}`);
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/profile", (req, res) => {
    try {
      const { id, name, role, avatar, preferred_language, font_size } = req.body;
      console.log(`Updating/Creating profile for user: ${id}`);
      const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
      
      if (existing) {
        db.prepare(`
          UPDATE users 
          SET name = ?, role = ?, avatar = ?, preferred_language = ?, font_size = ? 
          WHERE id = ?
        `).run(name, role, avatar, preferred_language, font_size, id);
      } else {
        db.prepare(`
          INSERT INTO users (id, name, role, avatar, preferred_language, font_size)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, name, role, avatar, preferred_language, font_size);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/history/:userId", (req, res) => {
    try {
      const history = db.prepare(`
        SELECT * FROM communication_history 
        WHERE user_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 50
      `).all(req.params.userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/history", (req, res) => {
    try {
      const { user_id, type, content, tsl_description } = req.body;
      db.prepare(`
        INSERT INTO communication_history (user_id, type, content, tsl_description)
        VALUES (?, ?, ?, ?)
      `).run(user_id, type, content, tsl_description);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/frequent/:userId", (req, res) => {
    try {
      const frequent = db.prepare(`
        SELECT * FROM frequent_signs 
        WHERE user_id = ? 
        ORDER BY usage_count DESC 
        LIMIT 10
      `).all(req.params.userId);
      res.json(frequent);
    } catch (error) {
      console.error("Error fetching frequent signs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  console.log(`SQLite version: ${db.prepare("select sqlite_version()").get()["sqlite_version()"]}`);

  app.post("/api/frequent", (req, res) => {
    try {
      const { user_id, sign_id } = req.body;
      try {
        db.prepare(`
          INSERT INTO frequent_signs (user_id, sign_id, usage_count)
          VALUES (?, ?, 1)
          ON CONFLICT(user_id, sign_id) DO UPDATE SET usage_count = usage_count + 1
        `).run(user_id, sign_id);
      } catch (sqlError: any) {
        if (sqlError.message.includes("syntax error") || sqlError.message.includes("ON CONFLICT")) {
          // Fallback for older SQLite versions
          const existing = db.prepare("SELECT id, usage_count FROM frequent_signs WHERE user_id = ? AND sign_id = ?").get(user_id, sign_id);
          if (existing) {
            db.prepare("UPDATE frequent_signs SET usage_count = usage_count + 1 WHERE id = ?").run(existing.id);
          } else {
            db.prepare("INSERT INTO frequent_signs (user_id, sign_id, usage_count) VALUES (?, ?, 1)").run(user_id, sign_id);
          }
        } else {
          throw sqlError;
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating frequent signs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
      // Notify other users in the room
      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("send-message", ({ roomId, message }) => {
      console.log(`Message to room ${roomId}:`, message);
      // Broadcast to everyone in the room except sender
      socket.to(roomId).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
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
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
