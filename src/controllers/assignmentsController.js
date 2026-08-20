const assignmentsService = require("../services/assignmentsService");

async function createAssignment(req, res) {
  try {
    const {
      territoryId,
      personId,
      campaignId,
      assignedAt,
    } = req.body;

    if (!territoryId || !personId || !assignedAt) {
      return res.status(400).json({
        error: "territoryId, personId and assignedAt are required",
      });
    }

    const assignment =
      await assignmentsService.createAssignment({
        territoryId,
        personId,
        campaignId,
        assignedAt,
      });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);

    const errors = {
      TERRITORY_NOT_FOUND: [404, "Territory not found"],
      TERRITORY_INACTIVE: [409, "Territory is inactive"],
      PERSON_NOT_FOUND: [404, "Person not found"],
      PERSON_INACTIVE: [409, "Person is inactive"],
      CAMPAIGN_NOT_FOUND: [404, "Campaign not found"],
      CAMPAIGN_INACTIVE: [409, "Campaign is inactive"],
      TERRITORY_NOT_AVAILABLE: [409, "Territory is not available"],
    };

    const [status, message] = errors[error.message] || [
      500,
      "Unable to create assignment",
    ];

    res.status(status).json({
      error: message,
    });
  }
}

async function returnAssignment(req, res) {
  try {
    const { id } = req.params;
    const { returnedAt } = req.body;

    if (!returnedAt) {
      return res.status(400).json({
        error: "returnedAt is required",
      });
    }

    const assignment = await assignmentsService.returnAssignment(
      id,
      returnedAt,
    );

    res.json(assignment);
  } catch (error) {
    console.error("Error returning assignment:", error);

    const errors = {
      ASSIGNMENT_NOT_FOUND: [404, "Assignment not found"],
      ASSIGNMENT_ALREADY_RETURNED: [409, "Assignment already returned"],
      INVALID_RETURN_DATE: [400, "Invalid return date"],
      RETURN_DATE_BEFORE_ASSIGNMENT: [
        400,
        "Return date cannot be before assignment date",
      ],
    };

    const [status, message] = errors[error.message] || [
      500,
      "Unable to return assignment",
    ];

    res.status(status).json({
      error: message,
    });
  }
}

module.exports = {
  createAssignment,
  returnAssignment
};