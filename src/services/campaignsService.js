const pool = require("../db");

async function fetchCampaigns() {
  const result = await pool.query(`
    SELECT
      id,
      name,
      active
    FROM campaigns
    WHERE active = TRUE
    ORDER BY name;
  `);

  return result.rows;
}

async function updateCampaignStatus(campaignId, active) {
  const result = await pool.query(
    `
      UPDATE campaigns
      SET active = $1
      WHERE id = $2
      RETURNING
        id,
        name,
        active;
    `,
    [active, campaignId],
  );

  if (result.rows.length === 0) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  return result.rows[0];
}

module.exports = {
  fetchCampaigns,
  updateCampaignStatus
};