const express = require("express");
const { getPeople } = require("../controllers/peopleController");

const router = express.Router();

router.get("/", getPeople);

module.exports = router;