const express = require("express");

const {
  getSettings,
  updateSetting,
} = require("../controllers/settingsController");

const router = express.Router();

router.get("/", getSettings);
router.patch("/:key", updateSetting);

module.exports = router;