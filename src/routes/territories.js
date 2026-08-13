const express = require("express");

const {
  getTerritories,
  getTerritoryDetails,
} = require("../controllers/territoriesController");

const router = express.Router();

router.get("/", getTerritories);
router.get("/:id", getTerritoryDetails);

module.exports = router;