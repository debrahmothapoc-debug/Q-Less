const express = require("express");
const db = require("../db");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.get("/drivers", async (req, res, next) => {
try {
const { rows } = await db.query(
“SELECT u.id, u.name, u.phone, u.is_active, d.id AS driver_id, d.taxi_plate, d.rating, r.from_place || ’ to ’ || r.to_place AS route_name FROM users u JOIN drivers d ON d.user_id = u.id LEFT JOIN routes r ON r.id = d.route_id WHERE u.role = ‘driver’ ORDER BY u.created_at DESC”
);
res.json(rows);
} catch (err) { next(err); }
});

router.post("/drivers", async (req, res, next) => {
const client = await db.getClient();
try {
await client.query(“BEGIN”);
const { name, phone, password, taxi_plate, route_id } = req.body;
if (!name || !phone || !password || !taxi_plate || !route_id) {
await client.query(“ROLLBACK”);
return res.status(422).json({ error: "All fields are required." });
}
const existing = await client.query(“SELECT id FROM users WHERE phone = $1”, [phone]);
if (existing.rows.length) {
await client.query(“ROLLBACK”);
return res.status(409).json({ error: "A user with this phone number already exists." });
}
const hash = await bcrypt.hash(password, 10);
const userRes = await client.query(
"INSERT INTO users (name, phone, password_hash, role) VALUES ($1, $2, $3, ‘driver’) RETURNING id",
[name, phone, hash]
);
const userId = userRes.rows[0].id;
const driverRes = await client.query(
“INSERT INTO drivers (user_id, route_id, taxi_plate) VALUES ($1, $2, $3) RETURNING id”,
[userId, route_id, taxi_plate]
);
await client.query(“COMMIT”);
res.status(201).json({ message: "Driver account created for " + name, user_id: userId, driver_id: driverRes.rows[0].id });
} catch (err) {
await client.query("ROLLBACK");
next(err);
} finally {
client.release();
}
});

router.patch(”/drivers/:id/deactivate”, async (req, res, next) => {
try {
await db.query(“UPDATE users SET is_active = FALSE WHERE id = $1”, [req.params.id]);
res.json({ message: “Driver deactivated.” });
} catch (err) { next(err); }
});

router.patch(”/drivers/:id/activate”, async (req, res, next) => {
try {
await db.query(“UPDATE users SET is_active = TRUE WHERE id = $1”, [req.params.id]);
res.json({ message: “Driver activated.” });
} catch (err) { next(err); }
});

module.exports = router;
