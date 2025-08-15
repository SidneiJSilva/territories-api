const pool = require('../db');

async function getTerritories(req, res) {
  try {
    const result = await pool.query('SELECT * FROM territories');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTerritoriesList(req, res) {
  try {
    const result = await pool.query(
      `
        SELECT
          t.id,
          t.number,
          t.link,
          t.synced,
          ta.label AS "territoryAreaLabel",
          tt.label AS "territoryTypeLabel",
          CASE
            WHEN a."returned-at" IS NULL AND a."assigned-at" IS NOT NULL THEN
              CASE
                WHEN now() - a."assigned-at" >= interval '4 months' THEN 'delayed'
                WHEN now() - a."assigned-at" >= interval '3 months 15 days' THEN 'delayed_soon'
                ELSE 'assigned'
              END
            WHEN a."returned-at" IS NOT NULL AND now() - a."returned-at" <= interval '15 days' THEN 'resting'
            ELSE 'available'
          END AS status,
          a.id AS "assignmentId",
          json_agg(
            json_build_object(
              'id', a_all.id,
              'assignedAt', a_all."assigned-at",
              'returnedAt', a_all."returned-at",
              'campaign', a_all.campaign,
              'peopleId', p_all.id,
              'firstName', p_all."first-name",
              'lastName', p_all."last-name"
            )
            ORDER BY a_all."assigned-at" DESC
          ) FILTER (WHERE a_all.id IS NOT NULL) AS assignments
        FROM territories t
        LEFT JOIN "territory-area" ta ON ta.id = t."area-id"
        LEFT JOIN "territory-type" tt ON tt.id = t."type-id"
        LEFT JOIN LATERAL (
          SELECT *
          FROM assignments a
          WHERE a."territory-id" = t.id
          ORDER BY a."assigned-at" DESC
          LIMIT 1
        ) a ON true
        LEFT JOIN assignments a_all ON a_all."territory-id" = t.id
        LEFT JOIN "territories-people" p_all ON p_all.id = a_all."people-id"
        GROUP BY t.id, ta.label, tt.label, a.id, a."assigned-at", a."returned-at"
        ORDER BY t.id;
      `
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTerritoryDetails(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT
          t.id,
          t.number,
          t.link,
          t.synced,
          ta.label AS "territoryAreaLabel",
          tt.label AS "territoryTypeLabel",
          CASE
            WHEN a."returned-at" IS NULL AND a."assigned-at" IS NOT NULL THEN
              CASE
                WHEN now() - a."assigned-at" >= interval '4 months' THEN 'delayed'
                WHEN now() - a."assigned-at" >= interval '3 months 15 days' THEN 'delayed_soon'
                ELSE 'assigned'
              END
            WHEN a."returned-at" IS NOT NULL AND now() - a."returned-at" <= interval '15 days' THEN 'resting'
            ELSE 'available'
          END AS status,
          a.id AS "assignmentId",
          json_agg(
            json_build_object(
              'id', a_all.id,
              'assignedAt', a_all."assigned-at",
              'returnedAt', a_all."returned-at",
              'campaign', a_all.campaign,
              'peopleId', p_all.id,
              'firstName', p_all."first-name",
              'lastName', p_all."last-name"
            )
            ORDER BY a_all."assigned-at" DESC
          ) FILTER (WHERE a_all.id IS NOT NULL) AS assignments
        FROM territories t
        LEFT JOIN "territory-area" ta ON ta.id = t."area-id"
        LEFT JOIN "territory-type" tt ON tt.id = t."type-id"
        LEFT JOIN LATERAL (
          SELECT *
          FROM assignments a
          WHERE a."territory-id" = t.id
          ORDER BY a."assigned-at" DESC
          LIMIT 1
        ) a ON true
        LEFT JOIN assignments a_all ON a_all."territory-id" = t.id
        LEFT JOIN "territories-people" p_all ON p_all.id = a_all."people-id"
        WHERE t.id = $1
        GROUP BY t.id, ta.label, tt.label, a.id, a."assigned-at", a."returned-at";
      `,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Território não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getTerritories, getTerritoryDetails, getTerritoriesList };
