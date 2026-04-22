const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || "qless_db",
  user:     process.env.DB_USER     || "qless_user",
  password: process.env.DB_PASSWORD || "",
  max: 20,                 // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
  process.exit(-1);
});

// Helper: run a query with values
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === "development") {
    console.log(`[DB] ${duration}ms — ${text.slice(0, 80)}`);
  }
  return res;
}

// Helper: get a client for transactions
async function getClient() {
  const client = await pool.connect();
  const release = client.release.bind(client);
  client.release = () => {
    client.release = release;
    return release();
  };
  return client;
}

module.exports = { query, getClient, pool };
