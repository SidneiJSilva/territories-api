const peopleService = require('../services/peopleService')

const allowedFields = {
  firstname: 'string',
  lastname: 'string',
  active: 'boolean',
  regularpionner: 'boolean',
  techskills: 'boolean',
  tpapproved: 'boolean',
}

async function updatePerson(req, res) {
  try {
    const peopleId = Number(req.params.id)
    const changes = req.body

    if (!Number.isInteger(peopleId) || peopleId <= 0) {
      return res.status(400).json({
        error: 'Invalid people ID',
      })
    }

    if (
      !changes ||
      typeof changes !== 'object' ||
      Array.isArray(changes)
    ) {
      return res.status(400).json({
        error: 'Request body must be an object',
      })
    }

    const fields = Object.keys(changes)

    if (fields.length === 0) {
      return res.status(400).json({
        error: 'No fields provided for update',
      })
    }

    const invalidFields = fields.filter(
      field => !Object.hasOwn(allowedFields, field),
    )

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: 'Invalid fields',
        fields: invalidFields,
      })
    }

    const invalidTypes = fields.filter(
      field => typeof changes[field] !== allowedFields[field],
    )

    if (invalidTypes.length > 0) {
      return res.status(400).json({
        error: 'Invalid field types',
        fields: invalidTypes,
      })
    }

    const person = await peopleService.updatePerson(
      peopleId,
      changes,
    )

    if (!person) {
      return res.status(404).json({
        error: 'Person not found',
      })
    }

    return res.json(person)
  } catch (error) {
    console.error('Error updating person:', error)

    return res.status(500).json({
      error: 'Unable to update person',
    })
  }
}

async function getPeople(req, res) {
  try {
    const people = await peopleService.fetchPeople();

    res.json(people);
  } catch (error) {
    console.error("Error fetching people:", error);

    res.status(500).json({
      error: "Unable to fetch people",
    });
  }
}

async function getPersonTerritories(req, res) {
  try {
    const peopleId = Number(req.params.id);
    const batch = Number(req.query.batch || 1);

    if (!Number.isInteger(peopleId) || peopleId <= 0) {
      return res.status(400).json({
        error: "Invalid people ID",
      });
    }

    if (!Number.isInteger(batch) || batch <= 0) {
      return res.status(400).json({
        error: "batch must be a positive integer",
      });
    }

    const result = await peopleService.fetchPersonTerritories(
      peopleId,
      batch,
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching person territories:", error);

    if (error.message === "PEOPLE_TERRITORIES_BATCH_SIZE_NOT_FOUND") {
      return res.status(500).json({
        error: "People territories batch size setting not found",
      });
    }

    res.status(500).json({
      error: "Unable to fetch person territories",
    });
  }
}

module.exports = {
  getPeople,
  getPersonTerritories,
  updatePerson
};