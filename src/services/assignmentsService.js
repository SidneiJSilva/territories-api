const pool = require("../db");

async function createAssignment({
  territoryId,
  personId,
  campaignId = null,
  assignedAt,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Validate territory
    const territoryResult = await client.query(
      `
        SELECT id, active
        FROM territories
        WHERE id = $1
        FOR UPDATE;
      `,
      [territoryId],
    );

    if (territoryResult.rows.length === 0) {
      throw new Error("TERRITORY_NOT_FOUND");
    }

    const territory = territoryResult.rows[0];

    if (!territory.active) {
      throw new Error("TERRITORY_INACTIVE");
    }

    // 2. Validate person
    const personResult = await client.query(
      `
        SELECT id, active
        FROM people
        WHERE id = $1;
      `,
      [personId],
    );

    if (personResult.rows.length === 0) {
      throw new Error("PERSON_NOT_FOUND");
    }

    const person = personResult.rows[0];

    if (!person.active) {
      throw new Error("PERSON_INACTIVE");
    }

    // 3. Validate campaign, when provided
    if (campaignId !== null) {
      const campaignResult = await client.query(
        `
          SELECT id, active
          FROM campaigns
          WHERE id = $1;
        `,
        [campaignId],
      );

      if (campaignResult.rows.length === 0) {
        throw new Error("CAMPAIGN_NOT_FOUND");
      }

      if (!campaignResult.rows[0].active) {
        throw new Error("CAMPAIGN_INACTIVE");
      }
    }

    // 4. Make sure the territory has no active assignment
    const activeAssignmentResult = await client.query(
      `
        SELECT id
        FROM assignments
        WHERE territory_id = $1
          AND returned_at IS NULL;
      `,
      [territoryId],
    );

    if (activeAssignmentResult.rows.length > 0) {
      throw new Error("TERRITORY_NOT_AVAILABLE");
    }

    // 5. Create assignment
    const assignmentResult = await client.query(
      `
        INSERT INTO assignments (
          territory_id,
          person_id,
          campaign_id,
          assigned_at
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          territory_id AS "territoryId",
          person_id AS "personId",
          campaign_id AS "campaignId",
          assigned_at AS "assignedAt",
          returned_at AS "returnedAt";
      `,
      [
        territoryId,
        personId,
        campaignId,
        assignedAt,
      ],
    );

    await client.query(
      `
        UPDATE territories
        SET synced = FALSE
        WHERE id = $1;
      `,
      [territoryId],
    );

    await client.query("COMMIT");

    return assignmentResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function returnAssignment(assignmentId, returnedAt) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        SELECT
          id,
          territory_id,
          assigned_at,
          returned_at
        FROM assignments
        WHERE id = $1
        FOR UPDATE;
      `,
      [assignmentId],
    );

    if (result.rows.length === 0) {
      throw new Error("ASSIGNMENT_NOT_FOUND");
    }

    const assignment = result.rows[0];

    if (assignment.returned_at !== null) {
      throw new Error("ASSIGNMENT_ALREADY_RETURNED");
    }

    const returnedDate = new Date(returnedAt);

    if (Number.isNaN(returnedDate.getTime())) {
      throw new Error("INVALID_RETURN_DATE");
    }

    if (returnedDate < assignment.assigned_at) {
      throw new Error("RETURN_DATE_BEFORE_ASSIGNMENT");
    }

    const updateResult = await client.query(
      `
        UPDATE assignments
        SET returned_at = $1
        WHERE id = $2
        RETURNING
          id,
          territory_id AS "territoryId",
          person_id AS "personId",
          campaign_id AS "campaignId",
          assigned_at AS "assignedAt",
          returned_at AS "returnedAt";
      `,
      [returnedDate.toISOString(), assignmentId],
    );

    await client.query(
      `
        UPDATE territories
        SET synced = FALSE
        WHERE id = $1;
      `,
      [assignment.territory_id],
    );

    await client.query("COMMIT");

    return updateResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createAssignment,
  returnAssignment
};