const express = require("express");

const {
  getTerritories,
  getTerritoryDetails,
  updateTerritorySync,
  deleteTerritoryComment,
  addTerritoryComment
} = require("../controllers/territoriesController");

const router = express.Router();

router.get("/", getTerritories);
router.get("/:id", getTerritoryDetails);
router.patch("/:id/sync", updateTerritorySync);
router.delete("/:id/comments/:commentId", deleteTerritoryComment);
router.post("/:id/comments", addTerritoryComment);

module.exports = router;