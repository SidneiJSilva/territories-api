const pool = require("../db");

async function fetchTerritories() {
  const result = await pool.query(`
    SELECT *
    FROM territories_view
    WHERE active = TRUE
    ORDER BY number;
  `);

  return result.rows;
}

async function fetchTerritoryDetails(id) {
  const territoryResult = await pool.query(
    `
      SELECT *
      FROM territories_view
      WHERE id = $1;
    `,
    [id],
  );

  if (territoryResult.rows.length === 0) {
    return null;
  }

  const territory = territoryResult.rows[0];

  const assignmentsResult = await pool.query(
    `
      SELECT
        a.id,
        a.assigned_at AS "assignedAt",
        a.returned_at AS "returnedAt",
        a.campaign_id AS "campaignId",

        c.name AS campaign,

        p.id AS "personId",
        p.first_name AS "firstName",
        p.last_name AS "lastName"

      FROM assignments a

      INNER JOIN people p
        ON p.id = a.person_id

      LEFT JOIN campaigns c
        ON c.id = a.campaign_id

      WHERE a.territory_id = $1

      ORDER BY a.assigned_at DESC;
    `,
    [id],
  );

  return {
    ...territory,
    assignments: assignmentsResult.rows,
  };
}

module.exports = {
  fetchTerritories,
  fetchTerritoryDetails,
};