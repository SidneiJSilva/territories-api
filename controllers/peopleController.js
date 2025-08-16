const pool = require('../db');

async function getPeopleList(req, res) {
  try {
    const result = await pool.query(
      `
        SELECT
          p.id AS peopleid,
          p."first-name" AS firstname,
          p."last-name" AS lastname
        FROM "territories-people" p
        ORDER BY firstname ASC;
      `
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getPeopleList };
