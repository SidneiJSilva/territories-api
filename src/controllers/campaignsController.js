const campaignsService = require("../services/campaignsService");

async function getCampaigns(req, res) {
  try {
    const campaigns = await campaignsService.fetchCampaigns();

    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);

    res.status(500).json({
      error: "Unable to fetch campaigns",
    });
  }
}

async function updateCampaignStatus(req, res) {
  try {
    const campaignId = Number(req.params.id);
    const { active } = req.body;

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        error: "Invalid campaign ID",
      });
    }

    if (typeof active !== "boolean") {
      return res.status(400).json({
        error: "active must be a boolean",
      });
    }

    const campaign =
      await campaignsService.updateCampaignStatus(
        campaignId,
        active,
      );

    res.json(campaign);
  } catch (error) {
    console.error("Error updating campaign:", error);

    if (error.message === "CAMPAIGN_NOT_FOUND") {
      return res.status(404).json({
        error: "Campaign not found",
      });
    }

    res.status(500).json({
      error: "Unable to update campaign",
    });
  }
}

module.exports = {
  getCampaigns,
  updateCampaignStatus
};