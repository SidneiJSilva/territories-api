const express = require('express');
const router = express.Router();
const { getPeopleList } = require('../controllers/peopleController');

router.get('/', getPeopleList);

module.exports = router;
