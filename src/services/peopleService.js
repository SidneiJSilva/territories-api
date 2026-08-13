const pool = require("../db");

async function fetchPeople() {
  const result = await pool.query(`
    SELECT
      id,
      first_name AS "firstName",
      last_name AS "lastName",
      active
    FROM people
    WHERE active = TRUE
    ORDER BY first_name ASC, last_name ASC;
  `);

  return result.rows;
}

module.exports = {
  fetchPeople,
};