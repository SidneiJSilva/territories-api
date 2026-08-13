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

module.exports = {
  getTerritories,
  getTerritoryDetails,
};