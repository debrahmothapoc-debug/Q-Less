const express = require("express");
const db      = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// All driver routes require a driver JWT
router.use(authenticate, requireRole("driver", "admin"));

// ── GET /api/driver/dashboard ─────────────────────────────
// Summary stats for the logged-in driver's route today
router.get("/dashboard", async (req, res, next) => {
  try {
    // Find driver record for this user
    const driverRes = await db.query(
      "SELECT d.*, r.from_place, r.to_place, r.fare_rands FROM drivers d JOIN routes r ON r.id = d.route_id WHERE d.user_id = $1",
      [req.user.id]
    );
    if (!driverRes.rows.length) {
      return res.status(404).json({ error: "Driver profile not found." });
    }
    const driver = driverRes.rows[0];

    const today = new Date().toISOString().slice(0, 10);

    // All slots for today with booking totals
    const slotsRes = await db.query(`
      SELECT
        ts.id,
        ts.departure_time,
        ts.capacity,
        COALESCE(SUM(b.seats) FILTER (WHERE b.status = 'confirmed'), 0) AS booked_seats,
        COUNT(b.id) FILTER (WHERE b.status = 'confirmed') AS booking_count
      FROM time_slots ts
      LEFT JOIN bookings b ON b.time_slot_id = ts.id
      WHERE ts.driver_id = $1 AND ts.slot_date = $2 AND ts.is_active = TRUE
      GROUP BY ts.id
      ORDER BY ts.departure_time
    `, [driver.id, today]);

    const slots = slotsRes.rows;
    const totalBookedSeats = slots.reduce((s, r) => s + parseInt(r.booked_seats), 0);
    const confirmedTrips   = slots.filter(r => parseInt(r.booked_seats) > 0).length;
    const estimatedEarnings = totalBookedSeats * parseFloat(driver.fare_rands);

    res.json({
      driver: {
        name:      req.user.name,
        taxi_plate: driver.taxi_plate,
        route:     `${driver.from_place} → ${driver.to_place}`,
        capacity:  driver.capacity,
        rating:    driver.rating,
      },
      summary: {
        total_booked_seats: totalBookedSeats,
        confirmed_trips:    confirmedTrips,
        open_slots:         slots.length - confirmedTrips,
        estimated_earnings: `R${estimatedEarnings.toFixed(2)}`,
      },
      slots,
      date: today,
    });
  } catch (err) { next(err); }
});

// ── GET /api/driver/slots/:slotId/passengers ──────────────
// Passenger manifest for a specific slot
router.get("/slots/:slotId/passengers", async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        b.id, b.booking_ref, b.seats, b.status, b.created_at,
        u.name AS commuter_name, u.phone AS commuter_phone
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      WHERE b.time_slot_id = $1 AND b.status = 'confirmed'
      ORDER BY b.created_at
    `, [req.params.slotId]);

    res.json({
      passengers: rows,
      total_seats: rows.reduce((s, r) => s + r.seats, 0),
    });
  } catch (err) { next(err); }
});

// ── PATCH /api/driver/bookings/:bookingId/board ───────────
// Mark a commuter as boarded (scanned their ref at rank)
router.patch("/bookings/:bookingId/board", async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      UPDATE bookings SET status = 'boarded'
      WHERE id = $1 AND status = 'confirmed'
      RETURNING booking_ref, seats
    `, [req.params.bookingId]);

    if (!rows.length) {
      return res.status(404).json({ error: "Booking not found or already processed." });
    }
    res.json({ message: "Passenger boarded.", booking: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
