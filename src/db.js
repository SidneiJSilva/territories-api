const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "territories_user",
  password: process.env.PGPASSWORD || "territories_dev",
  database: process.env.PGDATABASE || "territories",
  port: Number(process.env.PGPORT) || 5432,
});

module.exports = pool;