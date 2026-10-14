const pool = require("../db");


async function fetchTerritories() {
  const result = await pool.query(`
    SELECT
      *,
      CASE
        WHEN status = 'assigned' AND assigned_at IS NOT NULL
          THEN GREATEST(
            0,
            CURRENT_DATE - assigned_at::date
          )
        ELSE NULL
      END AS worked_days
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
        a.id AS "assignmentId",
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

  const commentsResult = await pool.query(
    `
      SELECT
        id,
        territory_id AS "territoryId",
        comment,
        created_at AS "createdAt"
      FROM comments
      WHERE territory_id = $1
      ORDER BY created_at DESC, id DESC;
    `,
    [id],
  );

  return {
    ...territory,
    assignmentid: assignmentsResult.rows[0]?.assignmentId || null,
    assignments: assignmentsResult.rows,
    comments: commentsResult.rows,
  };
}

async function deleteTerritoryComment(territoryId, commentId) {
  const result = await pool.query(
    `
      DELETE FROM comments
      WHERE id = $1
        AND territory_id = $2
      RETURNING id;
    `,
    [commentId, territoryId],
  );

  if (result.rows.length === 0) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  return result.rows[0];
}

async function updateTerritorySync(territoryId, synced) {
  const result = await pool.query(
    `
      UPDATE territories
      SET synced = $1
      WHERE id = $2
      RETURNING
        id,
        synced;
    `,
    [synced, territoryId],
  );

  if (result.rows.length === 0) {
    throw new Error("TERRITORY_NOT_FOUND");
  }

  return result.rows[0];
}


async function addTerritoryComment(territoryId, comment) {
  const result = await pool.query(
    `
      INSERT INTO comments (territory_id, comment)
      SELECT id, $2
      FROM territories
      WHERE id = $1
      RETURNING
        id,
        territory_id AS "territoryId",
        comment,
        created_at AS "createdAt";
    `,
    [territoryId, comment],
  );

  if (result.rows.length === 0) {
    throw new Error("TERRITORY_NOT_FOUND");
  }

  return result.rows[0];
}


module.exports = {
  fetchTerritories,
  fetchTerritoryDetails,
  updateTerritorySync,
  deleteTerritoryComment,
  addTerritoryComment
};