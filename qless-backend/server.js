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

// ── API routes ────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/routes",  routeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/driver",  driverRoutes);

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ──────────────────────────────────
app.use(errorHandler);

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
