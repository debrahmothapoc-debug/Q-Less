/**
 * Q-Less API Server
 * ─────────────────
 * Start:  node src/server.js
 * Dev:    npm run dev   (uses nodemon)
 */

require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");

// ── Route handlers ────────────────────────────────────────
const authRoutes    = require("./routes/auth");
const routeRoutes   = require("./routes/routes");
const bookingRoutes = require("./routes/bookings");
const driverRoutes  = require("./routes/driver");
const { errorHandler } = require("./middleware/errorHandler");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & parsing middleware ─────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// Stricter limit on auth endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts, please try again in 15 minutes." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ── Health check ──────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app:    "Q-Less API",
    env:    process.env.NODE_ENV,
    time:   new Date().toISOString(),
  });
});
app.get("/test-booking", async (req, res) => {
  try {
    const { pool } = require("./db");
    const slots = await pool.query(`SELECT id, departure_time, slot_date FROM time_slots LIMIT 5`);
    const users = await pool.query(`SELECT id, phone FROM users LIMIT 3`);
    res.json({ slots: slots.rows, users: users.rows });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── API routes ────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/routes",  routeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/driver",  driverRoutes);

app.get("/setup", async (req, res) => {
  try {
    const { pool } = require("./db");
    await pool.query(`DROP TABLE IF EXISTS bookings CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS time_slots CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS drivers CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS routes CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS users CASCADE`);
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await pool.query(`CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL, phone VARCHAR(20) NOT NULL UNIQUE, password_hash VARCHAR(255), role VARCHAR(10) NOT NULL DEFAULT 'commuter', is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await pool.query(`CREATE TABLE routes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), from_place VARCHAR(120) NOT NULL, to_place VARCHAR(120) NOT NULL, duration_min INTEGER NOT NULL, fare_rands NUMERIC(6,2) NOT NULL, is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await pool.query(`CREATE TABLE drivers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE, taxi_plate VARCHAR(20) NOT NULL, capacity INTEGER NOT NULL DEFAULT 15, rating NUMERIC(3,1) NOT NULL DEFAULT 5.0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id, route_id))`);
    await pool.query(`CREATE TABLE time_slots (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE, driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE, departure_time TIME NOT NULL, slot_date DATE NOT NULL DEFAULT CURRENT_DATE, capacity INTEGER NOT NULL DEFAULT 15, is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(route_id, driver_id, departure_time, slot_date))`);
    await pool.query(`CREATE TABLE bookings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_ref VARCHAR(12) NOT NULL UNIQUE, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE, seats INTEGER NOT NULL CHECK (seats BETWEEN 1 AND 4), status VARCHAR(20) NOT NULL DEFAULT 'confirmed', sms_sent BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    const bcrypt = require("bcryptjs");
    const dh = await bcrypt.hash("Driver@123", 10);
    const ch = await bcrypt.hash("Commuter@123", 10);
    const rts = [["Soweto (Bara)","Johannesburg CBD",45,14.50],["Tembisa","Sandton",55,18.00],["Katlehong","Germiston",30,11.00],["Mamelodi","Pretoria CBD",40,13.00],["Mitchell's Plain","Cape Town CBD",50,16.00]];
    const drvs = [["Sipho Dlamini","0711000001","GP 34-56 AB"],["Thabo Mokoena","0711000002","GP 12-78 CD"],["Bongani Zulu","0711000003","GP 90-11 EF"],["Lerato Sithole","0711000004","GP 45-23 GH"],["Andile Nkosi","0711000005","CA 67-34 IJ"]];
    const times = ["05:00","05:30","06:00","06:30","07:00","07:30","08:00","08:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];
    const today = new Date().toISOString().slice(0,10);
    const routeIds = [];
    for (const [f,t,d,fare] of rts) {
      const r = await pool.query(`INSERT INTO routes (from_place,to_place,duration_min,fare_rands) VALUES ($1,$2,$3,$4) RETURNING id`,[f,t,d,fare]);
      routeIds.push(r.rows[0].id);
    }
    const driverIds = [];
    for (let i = 0; i < drvs.length; i++) {
      const [name,phone,plate] = drvs[i];
      const u = await pool.query(`INSERT INTO users (name,phone,password_hash,role) VALUES ($1,$2,$3,'driver') RETURNING id`,[name,phone,dh]);
      const d = await pool.query(`INSERT INTO drivers (user_id,route_id,taxi_plate) VALUES ($1,$2,$3) RETURNING id`,[u.rows[0].id,routeIds[i],plate]);
      driverIds.push(d.rows[0].id);
    }
    for (let i = 0; i < routeIds.length; i++) {
      for (const t of times) {
        await pool.query(`INSERT INTO time_slots (route_id,driver_id,departure_time,slot_date) VALUES ($1,$2,$3,$4)`,[routeIds[i],driverIds[i],t,today]);
      }
    }
    await pool.query(`INSERT INTO users (name,phone,password_hash,role) VALUES ('Demo Commuter','0720000001',$1,'commuter')`,[ch]);
    res.json({ success: true, message: "Clean setup complete!", routes: routeIds.length, date: today });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ──────────────────────────────────
app.use(errorHandler);
// ── Auto-generate daily slots at midnight ─────────────────
async function generateDailySlots() {
  try {
    const { pool } = require("./db");
    const today = new Date().toISOString().slice(0, 10);
    const times = ["05:00","05:30","06:00","06:30","07:00","07:30","08:00","08:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];
    const drivers = await pool.query(`SELECT d.id, d.route_id FROM drivers d JOIN users u ON u.id = d.user_id WHERE u.is_active = TRUE`);
    let count = 0;
    for (const driver of drivers.rows) {
      for (const t of times) {
        await pool.query(`INSERT INTO time_slots (route_id, driver_id, departure_time, slot_date, capacity) VALUES ($1, $2, $3, $4, 15) ON CONFLICT DO NOTHING`, [driver.route_id, driver.id, t, today]);
        count++;
      }
    }
    console.log(`[SLOTS] Generated ${count} slots for ${today}`);
  } catch(e) {
    console.error("[SLOTS] Error:", e.message);
  }
}

// Run on startup and then every 24 hours
generateDailySlots();
setInterval(generateDailySlots, 24 * 60 * 60 * 1000);

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🚌  Q-Less API running on :${PORT}   ║
  ║   ENV: ${(process.env.NODE_ENV || "development").padEnd(27)}║
  ╚══════════════════════════════════════╝

  Endpoints:
    GET  /health
    POST /api/auth/register
    POST /api/auth/login
    GET  /api/auth/me
    GET  /api/routes
    GET  /api/routes/:id/slots
    POST /api/bookings
    GET  /api/bookings/my
    DEL  /api/bookings/:id
    GET  /api/driver/dashboard
    GET  /api/driver/slots/:id/passengers
    PATCH /api/driver/bookings/:id/board
  `);
});

module.exports = app;
