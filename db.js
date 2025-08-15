const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'api_user',
  password: process.env.PGPASSWORD || 'sidnei1982',
  database: process.env.PGDATABASE || 'apidb',
  port: 5432
});

module.exports = pool;
