import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("toddlerplay.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    title TEXT,
    instructions TEXT,
    supplies TEXT,
    safety TEXT,
    mess_level TEXT,
    benefit TEXT,
    age_group TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    is_premium BOOLEAN DEFAULT 0,
    daily_generations_count INTEGER DEFAULT 0,
    last_generation_date TEXT
  );

  INSERT OR IGNORE INTO user_settings (id, is_premium) VALUES (1, 0);
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/favorites", (req, res) => {
    const favorites = db.prepare("SELECT * FROM favorites ORDER BY created_at DESC").all();
    res.json(favorites);
  });

  app.post("/api/favorites", (req, res) => {
    const { id, title, instructions, supplies, safety, mess_level, benefit, age_group } = req.body;
    const insert = db.prepare(`
      INSERT OR REPLACE INTO favorites (id, title, instructions, supplies, safety, mess_level, benefit, age_group)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, title, JSON.stringify(instructions), JSON.stringify(supplies), safety, mess_level, benefit, age_group);
    res.json({ success: true });
  });

  app.delete("/api/favorites/:id", (req, res) => {
    db.prepare("DELETE FROM favorites WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/user/status", (req, res) => {
    const settings = db.prepare("SELECT * FROM user_settings WHERE id = 1").get();
    res.json(settings);
  });

  app.post("/api/user/upgrade", (req, res) => {
    db.prepare("UPDATE user_settings SET is_premium = 1 WHERE id = 1").run();
    res.json({ success: true });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
