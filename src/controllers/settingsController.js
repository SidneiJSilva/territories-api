const settingsService = require("../services/settingsService");

async function getSettings(req, res) {
  try {
    const settings = await settingsService.fetchSettings();

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);

    res.status(500).json({
      error: "Unable to fetch settings",
    });
  }
}

async function updateSetting(req, res) {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!key) {
      return res.status(400).json({
        error: "Setting key is required",
      });
    }

    if (!Number.isInteger(value)) {
      return res.status(400).json({
        error: "Setting value must be an integer",
      });
    }

    if (value < 0) {
      return res.status(400).json({
        error: "Setting value cannot be negative",
      });
    }

    const setting = await settingsService.updateSetting(
      key,
      value,
    );

    res.json(setting);
  } catch (error) {
    console.error("Error updating setting:", error);

    if (error.message === "SETTING_NOT_FOUND") {
      return res.status(404).json({
        error: "Setting not found",
      });
    }

    res.status(500).json({
      error: "Unable to update setting",
    });
  }
}

module.exports = {
  getSettings,
  updateSetting,
};