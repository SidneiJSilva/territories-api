const express = require("express");
const { getPeople, getPersonTerritories } = require("../controllers/peopleController");

const router = express.Router();

router.get("/", getPeople);
router.get("/:id/territories", getPersonTerritories);

module.exports = router;