const express = require("express");

const {
  createAssignment,
  returnAssignment,
  deleteAssignment
} = require("../controllers/assignmentsController");

const router = express.Router();

router.post("/", createAssignment);
router.patch("/:id/return", returnAssignment);
router.delete("/:id", deleteAssignment);

module.exports = router;