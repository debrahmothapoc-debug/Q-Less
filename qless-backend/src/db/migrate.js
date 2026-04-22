/**
 * Q-Less Database Migration
 * Run: node src/db/migrate.js
 *
 * Tables:
 *   users        — commuters & drivers
 *   routes       — taxi routes (from → to)
 *   time_slots   — scheduled departure slots per route
 *   bookings     — a commuter's reservation on a slot
 *   booking_seats — individual seat records per booking
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const { pool } = require("./index");

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── Enable UUID extension ─────────────────────────────
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // ── users ─────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(120) NOT NULL,
        phone         VARCHAR(20)  NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        role          VARCHAR(10)  NOT NULL DEFAULT 'commuter'
                      CHECK (role IN ('commuter', 'driver', 'admin')),
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ── routes ────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_place   VARCHAR(120) NOT NULL,
        to_place     VARCHAR(120) NOT NULL,
        duration_min INTEGER NOT NULL,
        fare_rands   NUMERIC(6,2) NOT NULL,
        is_active    BOOLEAN NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ── drivers (links a user to a route + taxi info) ────
    await client.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        route_id      UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
        taxi_plate    VARCHAR(20) NOT NULL,
        capacity      INTEGER NOT NULL DEFAULT 15,
        rating        NUMERIC(3,1) NOT NULL DEFAULT 5.0,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, route_id)
      );
    `);

    // ── time_slots ────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id     UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
        driver_id    UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
        departure_time TIME NOT NULL,
        slot_date    DATE NOT NULL DEFAULT CURRENT_DATE,
        capacity     INTEGER NOT NULL DEFAULT 15,
        is_active    BOOLEAN NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(route_id, driver_id, departure_time, slot_date)
      );
    `);

    // ── bookings ──────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_ref    VARCHAR(12) NOT NULL UNIQUE,
        user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        time_slot_id   UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
        seats          INTEGER NOT NULL CHECK (seats BETWEEN 1 AND 4),
        status         VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                       CHECK (status IN ('confirmed', 'boarded', 'cancelled', 'no_show')),
        sms_sent       BOOLEAN NOT NULL DEFAULT FALSE,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ── indexes ───────────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_user      ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_slot      ON bookings(time_slot_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_ref       ON bookings(booking_ref);
      CREATE INDEX IF NOT EXISTS idx_time_slots_route   ON time_slots(route_id);
      CREATE INDEX IF NOT EXISTS idx_time_slots_date    ON time_slots(slot_date);
      CREATE INDEX IF NOT EXISTS idx_drivers_route      ON drivers(route_id);
    `);

    // ── auto-update updated_at trigger ───────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;
    `);
    for (const tbl of ["users", "bookings"]) {
      await client.query(`
        DROP TRIGGER IF EXISTS trg_${tbl}_updated_at ON ${tbl};
        CREATE TRIGGER trg_${tbl}_updated_at
          BEFORE UPDATE ON ${tbl}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      `);
    }

    await client.query("COMMIT");
    console.log("✅ Migration complete — all tables created.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
