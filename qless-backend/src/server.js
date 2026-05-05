require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── ROUTES ────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/routes",   require("./routes/routes"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/driver",   require("./routes/driver"));
app.use("/api/admin",    require("./routes/admin"));

// ── HEALTH CHECK ──────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "Q-Less API running", version: "1.0.0" }));

// ── SETUP ENDPOINT ────────────────────────────────────────
// Visit /setup to reset and reseed the database
app.get("/setup", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Drop and recreate tables
    await client.query(`
      DROP TABLE IF EXISTS bookings CASCADE;
      DROP TABLE IF EXISTS time_slots CASCADE;
      DROP TABLE IF EXISTS drivers CASCADE;
      DROP TABLE IF EXISTS routes CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'commuter',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE routes (
        id SERIAL PRIMARY KEY,
        from_place TEXT NOT NULL,
        to_place TEXT NOT NULL,
        fare_rands NUMERIC(6,2) NOT NULL,
        duration_min INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE drivers (
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        route_id INT REFERENCES routes(id),
        taxi_plate TEXT NOT NULL,
        rating NUMERIC(2,1) DEFAULT 5.0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE time_slots (
        id SERIAL PRIMARY KEY,
        route_id INT REFERENCES routes(id),
        driver_id INT REFERENCES drivers(id),
        departure_time TIME NOT NULL,
        slot_date DATE NOT NULL,
        capacity INT DEFAULT 15,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(driver_id, slot_date, departure_time)
      );

      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        booking_ref TEXT UNIQUE NOT NULL,
        user_id INT REFERENCES users(id),
        time_slot_id INT REFERENCES time_slots(id),
        seats INT NOT NULL DEFAULT 1,
        status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Seed 5 SA routes — each unique, no duplicates
    const routeRes = await client.query(`
      INSERT INTO routes (from_place, to_place, fare_rands, duration_min) VALUES
        ('Soweto (Bara)',    'Johannesburg CBD', 14.50, 45),
        ('Tembisa',         'Sandton',          18.00, 55),
        ('Katlehong',       'Germiston',        11.00, 30),
        ('Mamelodi',        'Pretoria CBD',     13.00, 40),
        ('Mitchell''s Plain','Cape Town CBD',   16.00, 50)
      RETURNING id;
    `);
    const routeIds = routeRes.rows.map(r => r.id);

    // Seed 5 drivers using bcrypt
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("Driver@123", 10);

    const drivers = [
      { name: "Sipho Dlamini",   phone: "0711000001", plate: "GP 34-56 AB", route: routeIds[0] },
      { name: "Thabo Mokoena",   phone: "0711000002", plate: "GP 78-90 CD", route: routeIds[1] },
      { name: "Andile Nkosi",    phone: "0711000003", plate: "GP 11-22 EF", route: routeIds[2] },
      { name: "Lerato Sithole",  phone: "0711000004", plate: "GP 33-44 GH", route: routeIds[3] },
      { name: "Bongani Zulu",    phone: "0711000005", plate: "WC 55-66 IJ", route: routeIds[4] },
    ];

    const driverIds = [];
    for (const d of drivers) {
      const u = await client.query(
        "INSERT INTO users (name, phone, password_hash, role) VALUES ($1,$2,$3,'driver') RETURNING id",
        [d.name, d.phone, hash]
      );
      const dr = await client.query(
        "INSERT INTO drivers (user_id, route_id, taxi_plate) VALUES ($1,$2,$3) RETURNING id",
        [u.rows[0].id, d.route, d.plate]
      );
      driverIds.push({ driverId: dr.rows[0].id, routeId: d.route });
    }

    // Seed 1 commuter
    const commHash = await bcrypt.hash("Commuter@123", 10);
    await client.query(
      "INSERT INTO users (name, phone, password_hash, role) VALUES ($1,$2,$3,'commuter')",
      ["Demo Commuter", "0720000001", commHash]
    );

    // Generate today's time slots for all drivers
    const today = new Date().toISOString().slice(0, 10);
    const times = [
      "05:00","05:30","06:00","06:30","07:00","07:30","08:00","08:30",
      "15:00","15:30","16:00","16:30","17:00","17:30","18:00"
    ];

    for (const { driverId, routeId } of driverIds) {
      for (const t of times) {
        await client.query(
          `INSERT INTO time_slots (route_id, driver_id, departure_time, slot_date, capacity)
           VALUES ($1,$2,$3,$4,15) ON CONFLICT DO NOTHING`,
          [routeId, driverId, t, today]
        );
      }
    }

    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Database reset and seeded successfully",
      data: {
        routes: routeIds.length,
        drivers: driverIds.length,
        slots_date: today,
        slots_per_driver: times.length,
      }
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Setup error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ── AUTO DAILY SLOT GENERATION ────────────────────────────
async function generateDailySlots() {
  const client = await pool.connect();
  try {
    const today = new Date().toISOString().slice(0, 10);
    const times = [
      "05:00","05:30","06:00","06:30","07:00","07:30","08:00","08:30",
      "15:00","15:30","16:00","16:30","17:00","17:30","18:00"
    ];
    const drivers = await client.query(
      "SELECT d.id, d.route_id FROM drivers d JOIN users u ON u.id = d.user_id WHERE u.is_active = TRUE"
    );
    let count = 0;
    for (const driver of drivers.rows) {
      for (const t of times) {
        await client.query(
          `INSERT INTO time_slots (route_id, driver_id, departure_time, slot_date, capacity)
           VALUES ($1,$2,$3,$4,15) ON CONFLICT DO NOTHING`,
          [driver.route_id, driver.id, t, today]
        );
        count++;
      }
    }
    console.log(`[SLOTS] Generated ${count} slots for ${today}`);
  } catch (e) {
    console.error("[SLOTS] Error:", e.message);
  } finally {
    client.release();
  }
}

// Run on startup then every 24 hours
generateDailySlots();
setInterval(generateDailySlots, 24 * 60 * 60 * 1000);

// ── ERROR HANDLER ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ── START ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Q-Less API running on port ${PORT}`);
});
