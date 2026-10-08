const territoriesService = require("../services/territoriesService");

async function getTerritories(req, res) {
  try {
    const territories = await territoriesService.fetchTerritories();

    res.json(territories);
  } catch (error) {
    console.error("Error fetching territories:", error);

    res.status(500).json({
      error: "Unable to fetch territories",
    });
  }
}

async function getTerritoryDetails(req, res) {
  try {
    const { id } = req.params;

    const territory = await territoriesService.fetchTerritoryDetails(id);

    if (!territory) {
      return res.status(404).json({
        error: "Territory not found",
      });
    }

    res.json(territory);
  } catch (error) {
    console.error("Error fetching territory:", error);

    res.status(500).json({
      error: "Unable to fetch territory",
    });
  }
}

async function updateTerritorySync(req, res) {
  try {
    const territoryId = Number(req.params.id);
    const { synced } = req.body;

    if (!Number.isInteger(territoryId) || territoryId <= 0) {
      return res.status(400).json({
        error: "Invalid territory ID",
      });
    }

    if (typeof synced !== "boolean") {
      return res.status(400).json({
        error: "synced must be a boolean",
      });
    }

    const territory = await territoriesService.updateTerritorySync(
      territoryId,
      synced,
    );

    res.json(territory);
  } catch (error) {
    console.error("Error updating territory sync:", error);

    if (error.message === "TERRITORY_NOT_FOUND") {
      return res.status(404).json({
        error: "Territory not found",
      });
    }

    res.status(500).json({
      error: "Unable to update territory sync status",
    });
  }
}

module.exports = {
  getTerritories,
  getTerritoryDetails,
  updateTerritorySync
};