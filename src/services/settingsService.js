const pool = require("../db");

async function fetchSettings() {
  const result = await pool.query(`
    SELECT
      key,
      value
    FROM settings
    ORDER BY key;
  `);

  return Object.fromEntries(
    result.rows.map(({ key, value }) => [key, value]),
  );
}

async function updateSetting(key, value) {
  const result = await pool.query(
    `
      UPDATE settings
      SET value = $1
      WHERE key = $2
      RETURNING
        key,
        value;
    `,
    [value, key],
  );

  if (result.rows.length === 0) {
    throw new Error("SETTING_NOT_FOUND");
  }

  return result.rows[0];
}

module.exports = {
  fetchSettings,
  updateSetting,
};