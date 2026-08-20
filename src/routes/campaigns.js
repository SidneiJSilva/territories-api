const express = require("express");

const {
  getCampaigns,
  updateCampaignStatus
} = require("../controllers/campaignsController");

const router = express.Router();

router.get("/", getCampaigns);
router.patch("/:id", updateCampaignStatus);

module.exports = router;