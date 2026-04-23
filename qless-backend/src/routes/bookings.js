 const express = require("express");
const db = require("../db");
const { authenticate } = require("../middleware/auth");
const router = express.Router();
function genRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "QL-";
  for (let i = 0; i < 4; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}
// POST /api/bookings — create a booking
router.post("/", async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const { time_slot_id, seats, name, phone } = req.body;
    if (!time_slot_id || !seats) {
      await client.query("ROLLBACK");
      return res.status(422).json({ error: "time_slot_id and seats are required." });
}
    // Get or create user
    let userId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const jwt = require("jsonwebtoken");
      try {
        const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        userId = payload.id;
      } catch {
        await client.query("ROLLBACK");
        return res.status(401).json({ error: "Invalid token." });
      }
    } else {
      if (!name || !phone) {
        await client.query("ROLLBACK");
        return res.status(422).json({ error: "Name and phone are required for guest bo
      }
      const existing = await client.query(
oking."
     "SELECT id FROM users WHERE phone = $1", [phone]
  );
  if (existing.rows.length) {
    userId = existing.rows[0].id;
  } else {
    const newUser = await client.query(
      "INSERT INTO users (name, phone, role) VALUES ($1, $2, 'commuter') RETURNING
      [name, phone]
    );
    userId = newUser.rows[0].id;
  }
}
// Check slot exists and has space
const slotRes = await client.query(`
  SELECT ts.id, ts.capacity, ts.departure_time, ts.slot_date,
         r.from_place, r.to_place, r.fare_rands,
         COALESCE(SUM(b.seats) FILTER (WHERE b.status = 'confirmed'), 0)::int AS b
  FROM time_slots ts
  JOIN routes r ON r.id = ts.route_id
  LEFT JOIN bookings b ON b.time_slot_id = ts.id
  WHERE ts.id = $1
  GROUP BY ts.id, r.from_place, r.to_place, r.fare_rands
`, [time_slot_id]);
if (!slotRes.rows.length) {
  await client.query("ROLLBACK");
  return res.status(404).json({ error: "Time slot not found." });
}
const slot = slotRes.rows[0];
const available = slot.capacity - slot.booked;
if (available < seats) {
  await client.query("ROLLBACK");
  return res.status(409).json({ error: "Not enough seats available.", available })
}
// Create booking
const bookingRef = genRef();
const result = await client.query(
  "INSERT INTO bookings (booking_ref, user_id, time_slot_id, seats) VALUES ($1, $2
  [bookingRef, userId, time_slot_id, seats]
);
await client.query("COMMIT");
id",
ooked
;
, $3, $

     res.status(201).json({
      booking: result.rows[0],
      slot: {
        departure_time: slot.departure_time,
        slot_date: slot.slot_date,
        from_place: slot.from_place,
        to_place: slot.to_place,
        fare_rands: slot.fare_rands,
      },
      message: "Booking confirmed!",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
} });
// GET /api/bookings/my — get logged in user's bookings
router.get("/my", authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        b.id, b.booking_ref, b.seats, b.status, b.created_at,
        ts.departure_time, ts.slot_date,
        r.from_place, r.to_place, r.fare_rands,
        u2.name AS driver_name, d.taxi_plate
      FROM bookings b
      JOIN time_slots ts ON ts.id = b.time_slot_id
      JOIN routes r ON r.id = ts.route_id
      JOIN drivers d ON d.id = ts.driver_id
      JOIN users u2 ON u2.id = d.user_id
      WHERE b.user_id = $1
      ORDER BY ts.slot_date DESC, ts.departure_time DESC
      LIMIT 50
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
});
// DELETE /api/bookings/:id — cancel a booking
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(
"SELECT * FROM bookings WHERE id = $1", [req.params.id]

 
