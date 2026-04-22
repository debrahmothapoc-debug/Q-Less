const express = require("express");
const db      = require("../db");

const router = express.Router();

// ── GET /api/routes ───────────────────────────────────────
// Returns all active routes with driver info
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        r.id,
        r.from_place,
        r.to_place,
        r.duration_min,
        r.fare_rands,
        u.name   AS driver_name,
        d.taxi_plate,
        d.capacity,
        d.rating,
        d.id     AS driver_id
      FROM routes r
      JOIN drivers d ON d.route_id = r.id
      JOIN users  u ON u.id = d.user_id
      WHERE r.is_active = TRUE
      ORDER BY r.from_place
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/routes/:routeId/slots?date=YYYY-MM-DD ───────
// Returns time slots for a route on a given date, with booked seat counts
router.get("/:routeId/slots", async (req, res, next) => {
  try {
    const { routeId } = req.params;
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const { rows } = await db.query(`
      SELECT
        ts.id,
        ts.departure_time,
        ts.slot_date,
        ts.capacity,
        COALESCE(SUM(b.seats) FILTER (WHERE b.status = 'confirmed'), 0) AS booked_seats,
        ts.capacity - COALESCE(SUM(b.seats) FILTER (WHERE b.status = 'confirmed'), 0) AS available_seats
      FROM time_slots ts
      LEFT JOIN bookings b ON b.time_slot_id = ts.id
      WHERE ts.route_id = $1
        AND ts.slot_date = $2
        AND ts.is_active = TRUE
      GROUP BY ts.id
      ORDER BY ts.departure_time
    `, [routeId, date]);

    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
