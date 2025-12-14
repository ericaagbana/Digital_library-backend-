const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "Digital Library Backend is running!",
    status: "online"
  });
});

// Simple books endpoint - fixed
app.get("/api/books", async (req, res) => {
  console.log("📚 Books API called");
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM books");
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    test: "ok",
    time: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const client = await pool.connect();
    const dbResult = await client.query("SELECT NOW()");
    client.release();
    
    res.json({
      status: "healthy",
      database: "connected",
      time: dbResult.rows[0].now,
      message: "All systems operational"
    });
  } catch (err) {
    res.json({
      status: "degraded",
      database: "error",
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Home: http://localhost:${PORT}`);
  console.log(`📚 Books: http://localhost:${PORT}/api/books`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
});
