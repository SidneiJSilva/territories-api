const express = require('express')
const {
  getPeople,
  getPersonTerritories,
  updatePerson,
} = require('../controllers/peopleController')

const router = express.Router()

router.get('/', getPeople)
router.get('/:id/territories', getPersonTerritories)
router.patch('/:id', updatePerson)

module.exports = router