const pool = require('../db');

async function getPeopleList(req, res) {
  try {
    const result = await pool.query('SELECT * FROM "territories-people"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getPeopleList };
