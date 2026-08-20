const express = require("express");

const {
  getTerritories,
  getTerritoryDetails,
  updateTerritorySync
} = require("../controllers/territoriesController");

const router = express.Router();

router.get("/", getTerritories);
router.get("/:id", getTerritoryDetails);
router.patch("/:id/sync", updateTerritorySync);

module.exports = router;