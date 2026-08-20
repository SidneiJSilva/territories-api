const fs = require("fs");
const path = require("path");
const pool = require("./db");

const MIGRATIONS_DIR = path.join(__dirname, "../migrations");

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function getMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
}

async function getAppliedMigrations() {
  const result = await pool.query(`
    SELECT version
    FROM schema_migrations
    ORDER BY version;
  `);

  return new Set(result.rows.map((row) => row.version));
}

async function runMigrations() {
  await ensureMigrationsTable();

  const migrationFiles = getMigrationFiles();
  const appliedMigrations = await getAppliedMigrations();

  for (const file of migrationFiles) {
    if (appliedMigrations.has(file)) {
      console.log(`Skipping ${file}`);
      continue;
    }

    console.log(`Running ${file}`);

    const migrationPath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(migrationPath, "utf8");

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(sql);

      await client.query(
        `
          INSERT INTO schema_migrations (version)
          VALUES ($1);
        `,
        [file],
      );

      await client.query("COMMIT");

      console.log(`Completed ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(`Failed ${file}`);
      throw error;
    } finally {
      client.release();
    }
  }
}

runMigrations()
  .then(async () => {
    console.log("Migrations completed");
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Migration failed:", error);
    await pool.end();
    process.exit(1);
  });