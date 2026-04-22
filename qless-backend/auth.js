const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const { body } = require("express-validator");
const db       = require("../db");
const { authenticate }            = require("../middleware/auth");
const { validateRequest }         = require("../middleware/errorHandler");

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────────
router.post("/register",
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phone").trim().matches(/^0[6-8]\d{8}$/).withMessage("Enter a valid SA mobile number"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["commuter", "driver"]),
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, phone, password, role = "commuter" } = req.body;

      // Check duplicate
      const exists = await db.query("SELECT id FROM users WHERE phone = $1", [phone]);
      if (exists.rows.length) {
        return res.status(409).json({ error: "Phone number already registered." });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const { rows } = await db.query(`
        INSERT INTO users (name, phone, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, phone, role, created_at
      `, [name, phone, password_hash, role]);

      const user = rows[0];
      const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.status(201).json({ user, token });
    } catch (err) { next(err); }
  }
);

// ── POST /api/auth/login ──────────────────────────────────
router.post("/login",
  body("phone").trim().notEmpty(),
  body("password").notEmpty(),
  validateRequest,
  async (req, res, next) => {
    try {
      const { phone, password } = req.body;
      const { rows } = await db.query(
        "SELECT * FROM users WHERE phone = $1 AND is_active = TRUE", [phone]
      );
      if (!rows.length) {
        return res.status(401).json({ error: "Invalid phone number or password." });
      }
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: "Invalid phone number or password." });
      }

      const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      const { password_hash, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (err) { next(err); }
  }
);

// ── GET /api/auth/me ──────────────────────────────────────
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, phone, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found." });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
