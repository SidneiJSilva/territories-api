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

module.exports = {
  getPeople,
};