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

async function fetchPersonTerritories(peopleId, batch) {
  const settingsResult = await pool.query(
    `
      SELECT value
      FROM settings
      WHERE key = 'people_territories_batch_size';
    `,
  );

  if (settingsResult.rows.length === 0) {
    throw new Error("PEOPLE_TERRITORIES_BATCH_SIZE_NOT_FOUND");
  }

  const batchSize = settingsResult.rows[0].value;
  const limit = batchSize * batch;

  const result = await pool.query(
    `
      SELECT
        a.id,
        a."territory_id" AS "territoryId",
        a."assigned_at" AS "assignedAt",
        a."returned_at" AS "returnedAt",
        CASE
          WHEN c.id IS NOT NULL THEN
            json_build_object(
              'id', c.id,
              'name', c.name
            )
          ELSE NULL
        END AS campaign,
        ta.label AS "territoryArea"
      FROM assignments a
      JOIN territories t
        ON t.id = a.territory_id
      LEFT JOIN territory_areas ta
        ON ta.id = t.area_id
      LEFT JOIN campaigns c
        ON c.id = a.campaign_id
      WHERE a.person_id = $1
      ORDER BY a.assigned_at DESC
      LIMIT $2;
    `,
    [peopleId, limit],
  );

  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM assignments
      WHERE person_id = $1;
    `,
    [peopleId],
  );

  const total = countResult.rows[0].total;

  return {
    data: result.rows,
    total,
    batch,
    batchSize,
    hasMore: result.rows.length < total,
  };
}

module.exports = {
  fetchPeople,
  fetchPersonTerritories
};