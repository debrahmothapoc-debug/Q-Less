/**
 * Q-Less Seed Data
 * Run: node src/db/seed.js
 * Seeds SA routes, drivers and time slots for today.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const { pool } = require("./index");
const bcrypt = require("bcryptjs");

const ROUTES = [
  { from_place: "Soweto (Bara)",    to_place: "Johannesburg CBD", duration_min: 45, fare_rands: 14.50 },
  { from_place: "Tembisa",          to_place: "Sandton",          duration_min: 55, fare_rands: 18.00 },
  { from_place: "Katlehong",        to_place: "Germiston",        duration_min: 30, fare_rands: 11.00 },
  { from_place: "Mamelodi",         to_place: "Pretoria CBD",     duration_min: 40, fare_rands: 13.00 },
  { from_place: "Mitchell's Plain", to_place: "Cape Town CBD",    duration_min: 50, fare_rands: 16.00 },
];

const DRIVER_USERS = [
  { name: "Sipho Dlamini",  phone: "0711000001", taxi_plate: "GP 34-56 AB" },
  { name: "Thabo Mokoena",  phone: "0711000002", taxi_plate: "GP 12-78 CD" },
  { name: "Bongani Zulu",   phone: "0711000003", taxi_plate: "GP 90-11 EF" },
  { name: "Lerato Sithole", phone: "0711000004", taxi_plate: "GP 45-23 GH" },
  { name: "Andile Nkosi",   phone: "0711000005", taxi_plate: "CA 67-34 IJ" },
];

// Morning and afternoon peak slots
const SLOT_TIMES = [
  "05:00","05:30","06:00","06:30","07:00","07:30","08:00","08:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00",
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const passwordHash = await bcrypt.hash("Driver@123", 10);

    // ── Insert routes ─────────────────────────────────────
    const routeIds = [];
    for (const r of ROUTES) {
      const { rows } = await client.query(`
        INSERT INTO routes (from_place, to_place, duration_min, fare_rands)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [r.from_place, r.to_place, r.duration_min, r.fare_rands]);
      if (rows[0]) routeIds.push(rows[0].id);
    }
    // If already seeded, fetch existing IDs
    if (routeIds.length === 0) {
      const { rows } = await client.query(`SELECT id FROM routes ORDER BY created_at`);
      routeIds.push(...rows.map(r => r.id));
    }
    console.log(`Routes: ${routeIds.length} inserted/found`);

    // ── Insert driver users + driver records ──────────────
    const driverIds = [];
    for (let i = 0; i < DRIVER_USERS.length; i++) {
      const du = DRIVER_USERS[i];
      // Upsert user
      const { rows: uRows } = await client.query(`
        INSERT INTO users (name, phone, password_hash, role)
        VALUES ($1, $2, $3, 'driver')
        ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [du.name, du.phone, passwordHash]);
      const userId = uRows[0].id;

      // Upsert driver
      const { rows: dRows } = await client.query(`
        INSERT INTO drivers (user_id, route_id, taxi_plate, capacity)
        VALUES ($1, $2, $3, 15)
        ON CONFLICT (user_id, route_id) DO UPDATE SET taxi_plate = EXCLUDED.taxi_plate
        RETURNING id
      `, [userId, routeIds[i], du.taxi_plate]);
      driverIds.push(dRows[0].id);
    }
    console.log(`Drivers: ${driverIds.length} inserted/found`);

    // ── Insert time slots for today ───────────────────────
    const today = new Date().toISOString().slice(0, 10);
    let slotCount = 0;
    for (let i = 0; i < routeIds.length; i++) {
      for (const t of SLOT_TIMES) {
        await client.query(`
          INSERT INTO time_slots (route_id, driver_id, departure_time, slot_date, capacity)
          VALUES ($1, $2, $3, $4, 15)
          ON CONFLICT (route_id, driver_id, departure_time, slot_date) DO NOTHING
        `, [routeIds[i], driverIds[i], t, today]);
        slotCount++;
      }
    }
    console.log(`Time slots: ${slotCount} created for ${today}`);

    // ── Demo commuter user ────────────────────────────────
    await client.query(`
      INSERT INTO users (name, phone, password_hash, role)
      VALUES ('Demo Commuter', '0720000001', $1, 'commuter')
      ON CONFLICT (phone) DO NOTHING
    `, [await bcrypt.hash("Commuter@123", 10)]);

    await client.query("COMMIT");
    console.log("✅ Seed complete!");
    console.log("\nDemo login:");
    console.log("  Commuter  phone: 0720000001  password: Commuter@123");
    console.log("  Driver    phone: 0711000001  password: Driver@123");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
