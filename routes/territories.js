const express = require('express');
const router = express.Router();
const { getTerritories, getTerritoryDetails, getTerritoriesList } = require('../controllers/territoriesController');

router.get('/', getTerritories);
router.get('/list', getTerritoriesList);
router.get('/:id', getTerritoryDetails);

module.exports = router;
