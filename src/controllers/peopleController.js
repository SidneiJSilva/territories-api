const peopleService = require("../services/peopleService");

async function getPeople(req, res) {
  try {
    const people = await peopleService.fetchPeople();

    res.json(people);
  } catch (error) {
    console.error("Error fetching people:", error);

    res.status(500).json({
      error: "Unable to fetch people",
    });
  }
}

async function getPersonTerritories(req, res) {
  try {
    const peopleId = Number(req.params.id);
    const batch = Number(req.query.batch || 1);

    if (!Number.isInteger(peopleId) || peopleId <= 0) {
      return res.status(400).json({
        error: "Invalid people ID",
      });
    }

    if (!Number.isInteger(batch) || batch <= 0) {
      return res.status(400).json({
        error: "batch must be a positive integer",
      });
    }

    const result = await peopleService.fetchPersonTerritories(
      peopleId,
      batch,
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching person territories:", error);

    if (error.message === "PEOPLE_TERRITORIES_BATCH_SIZE_NOT_FOUND") {
      return res.status(500).json({
        error: "People territories batch size setting not found",
      });
    }

    res.status(500).json({
      error: "Unable to fetch person territories",
    });
  }
}

module.exports = {
  getPeople,
  getPersonTerritories
};