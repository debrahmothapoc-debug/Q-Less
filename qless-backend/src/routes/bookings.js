const express  = require("express");
const { body } = require("express-validator");
const db       = require("../db");
const { authenticate } = require("../middleware/auth");
const { validateRequest } = require("../middleware/errorHandler");
const { sendSMS, bookingConfirmationSMS } = require("../services/sms");

const router = express.Router();

function genRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "QL-";
  for (let i = 0; i < 4; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

router.post("/",
  body("time_slot_id").isUUID(),
  body("seats").isInt({ min: 1, max: 4 }),
  validateRequest,
  async (req, res, next) => {
    const client = await db.getClient();
    try {
      await client.query("BEGIN");
      const { time_slot_id, seats } = req.body;
      let userId;
      if (req.headers.authorization) {
        const jwt = require("jsonwebtoken");
        const token = req.headers.authorization.slice(7);
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        userId = payload.id;
      } else {
        const { name, phone } = req.body;
        if (!name || !phone) {
          await client.query("ROLLBACK");
          return res.status(422).json({ error: "Name and phone required for guest booking." });
        }
        const existing = await client.query("SELECT id FROM users WHERE phone = $1", [phone]);
        if (existing.rows.length) {
          userId = existing.rows[0].id;
        } else {
          const { rows } = await client.query(
            "INSERT INTO users (name, phone, role) VALUES ($1, $2, 'commuter') RETURNING id",
            [name, phone]
          );
          userId = rows[0].id;
        }
      }
      const slotRes = await client.query(`
        SELECT ts.*, r.from_place, r.to_place, r.fare_rands,
               COALESCE(SUM(b.seats) FILTER (WHERE b.status = 'confirmed'), 0) AS booked
        FROM time_slots ts
        JOIN routes r ON r.id = ts.route_id
        LEFT JOIN bookings b ON b.time_slot_id = ts.id
        WHERE ts.id = $1 AND ts.is_active = TRUE
        GROUP BY ts.id, r.from_place, r.to_place, r.fare_rands
        FOR UPDATE OF ts
      `, [time_slot_id]);
      if (!slotRes.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Time slot not found." });
      }
      const slot = slotRes.rows[0];
      const available = slot.capacity - parseInt(slot.booked);
      if (available < seats) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "Not enough seats available.", available });
      }
      let bookingRef = genRef();
      const { rows } = await client.query(
        "INSERT INTO bookings (booking_ref, user_id, time_slot_id, seats) VALUES ($1, $2, $3, $4) RETURNING *",
        [bookingRef, userId, time_slot_id, seats]
      );
      const booking = rows[0];
      await client.query("COMMIT");
      res.status(201).json({
        booking,
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
    }
  }
);

router.get("/my", authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT b.id, b.booking_ref, b.seats, b.status, b.created_at,
             ts.departure_time, ts.slot_date,
             r.from_place, r.to_place, r.fare_rands,
             u_d.name AS driver_name, d.taxi_plate
      FROM bookings b
      JOIN time_slots ts ON ts.id = b.time_slot_id
      JOIN routes r ON r.id = ts.route_id
      JOIN drivers d ON d.id = ts.driver_id
      JOIN users u_d ON u_d.id = d.user_id
      WHERE b.user_id = $1
      ORDER BY ts.slot_date DESC, ts.departure_time DESC
      LIMIT 50
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM bookings WHERE id = $1", [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Booking not found." });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: "Access denied." });
    await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [req.params.id]);
    res.json({ message: "Booking cancelled." });
  } catch (err) { next(err); }
});

module.exports = router;
