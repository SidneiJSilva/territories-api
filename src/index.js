const express = require("express");
const pool = require("./db");

const peopleRoutes = require("./routes/people");
const territoriesRoutes = require("./routes/territories");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1 AS connected");

    res.json({
      status: "ok",
      database: result.rows[0].connected === 1,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      database: false,
    });
  }
});

app.use("/people", peopleRoutes);
app.use("/territories", territoriesRoutes);

app.listen(PORT, () => {
  console.log(`Territories API running on port ${PORT}`);
});