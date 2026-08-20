const express = require("express");

const {
  createAssignment,
  returnAssignment
} = require("../controllers/assignmentsController");

const router = express.Router();

router.post("/", createAssignment);
router.patch("/:id/return", returnAssignment);

module.exports = router;