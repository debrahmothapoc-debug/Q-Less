const express  = require("express");
const { body } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const db       = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");
const { validateRequest }           = require("../middleware/errorHandler");
const { sendSMS, bookingConfirmationSMS, cancellationSMS } = require("../services/sms");

const router = express.Router();

/** Generate a human-friendly booking reference: QL-XXXX */
function genRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "QL-";
  for (let i = 0; i < 4; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

// ── POST /api/bookings ────────────────────────────────────
// Create a new booking (commuters only, or unauthenticated with name+phone)
router.post("/",
  body("time_slot_id").isUUID().withMessage("Valid time slot ID required"),
  body("seats").isInt({ min: 1, max: 4 }).withMessage("Seats must be 1–4"),
  // For guest (unauthenticated) bookings:
  body("name").if((_, { req }) => !req.headers.authorization)
    .trim().notEmpty().withMessage("Name required for guest booking"),
  body("phone").if((_, { req }) => !req.headers.authorization)
    .trim().matches(/^0[6-8]\d{8}$/).withMessage("Valid SA mobile number required"),
  validateRequest,
  async (req, res, next) => {
    const client = await db.getClient();
    try {
      await client.query("BEGIN");

      const { time_slot_id, seats } = req.body;

      // ── Resolve user ──────────────────────────────────
      let userId;
      if (req.headers.authorization) {
        // Authenticated commuter
        const jwt = require("jsonwebtoken");
        const token = req.headers.authorization.slice(7);
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        userId = payload.id;
      } else {
        // Guest: find or create user by phone
        const { name, phone } = req.body;
        const existing = await client.query(
          "SELECT id FROM users WHERE phone = $1", [phone]
        );
        if (existing.rows.length) {
          userId = existing.rows[0].id;
        } else {
          const { rows } = await client.query(`
            INSERT INTO users (name, phone, role) VALUES ($1, $2, 'commuter') RETURNING id
          `, [name, phone]);
          userId = rows[0].id;
        }
      }

      // ── Lock & check slot availability ───────────────
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
        return res.status(409).json({
          error: `Only ${available} seat(s) available on this slot.`,
          available,
        });
      }

      // ── Check user doesn't already have a booking on this slot ──
      const dupCheck = await client.query(`
        SELECT id FROM bookings
        WHERE user_id = $1 AND time_slot_id = $2 AND status = 'confirmed'
      `, [userId, time_slot_id]);
      if (dupCheck.rows.length) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "You already have a booking on this slot." });
      }

      // ── Create booking ────────────────────────────────
      let bookingRef;
      let attempts = 0;
      while (attempts < 5) {
        bookingRef = genRef();
        const exists = await client.query(
          "SELECT 1 FROM bookings WHERE booking_ref = $1", [bookingRef]
        );
        if (!exists.rows.length) break;
        attempts++;
      }

      const { rows } = await client.query(`
        INSERT INTO bookings (booking_ref, user_id, time_slot_id, seats)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [bookingRef, userId, time_slot_id, seats]);

      const booking = rows[0];
      await client.query("COMMIT");

      // ── Send SMS (async, non-blocking) ────────────────
      const userRes = await db.query("SELECT phone FROM users WHERE id = $1", [userId]);
      if (userRes.rows.length) {
        const phone = userRes.rows[0].phone;
        const msg = bookingConfirmationSMS(booking, slot, slot);
        sendSMS(phone, msg).then(async (result) => {
          if (!result.error) {
            await db.query("UPDATE bookings SET sms_sent = TRUE WHERE id = $1", [booking.id]);
          }
        });
      }

      res.status(201).json({
        booking,
        slot: {
          departure_time: slot.departure_time,
          slot_date:      slot.slot_date,
          from_place:     slot.from_place,
          to_place:       slot.to_place,
          fare_rands:     slot.fare_rands,
        },
        message: "Booking confirmed! SMS sent to your number.",
      });
    } catch (err) {
      await client.query("ROLLBACK");
      next(err);
    } finally {
      client.release();
    }
  }
);

// ── GET /api/bookings/my ──────────────────────────────────
// Commuter's own bookings
router.get("/my", authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        b.id, b.booking_ref, b.seats, b.status, b.created_at,
        ts.departure_time, ts.slot_date,
        r.from_place, r.to_place, r.fare_rands,
        u_d.name AS driver_name, d.taxi_plate
      FROM bookings b
      JOIN time_slots ts ON ts.id = b.time_slot_id
      JOIN routes     r  ON r.id  = ts.route_id
      JOIN drivers    d  ON d.id  = ts.driver_id
      JOIN users    u_d  ON u_d.id = d.user_id
      WHERE b.user_id = $1
      ORDER BY ts.slot_date DESC, ts.departure_time DESC
      LIMIT 50
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
});

// ── DELETE /api/bookings/:id ──────────────────────────────
// Cancel a booking (commuter cancels own, driver can cancel any on their route)
router.delete("/:id", authenticate, async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Fetch booking with slot info
    const { rows } = await client.query(`
      SELECT b.*, ts.departure_time, ts.slot_date, r.from_place, r.to_place
      FROM bookings b
      JOIN time_slots ts ON ts.id = b.time_slot_id
      JOIN routes     r  ON r.id  = ts.route_id
      WHERE b.id = $1
    `, [req.params.id]);

    if (!rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Booking not found." });
    }

    const booking = rows[0];

    // Authorisation: commuter can only cancel own; driver can cancel bookings on their route
    if (req.user.role === "commuter" && booking.user_id !== req.user.id) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "You can only cancel your own bookings." });
    }

    if (booking.status === "cancelled") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Booking is already cancelled." });
    }

    await client.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1", [booking.id]
    );

    await client.query("COMMIT");

    // SMS cancellation notice
    const userRes = await db.query("SELECT phone FROM users WHERE id = $1", [booking.user_id]);
    if (userRes.rows[0]) {
      sendSMS(userRes.rows[0].phone, cancellationSMS(booking, booking, booking));
    }

    res.json({ message: "Booking cancelled.", booking_ref: booking.booking_ref });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
