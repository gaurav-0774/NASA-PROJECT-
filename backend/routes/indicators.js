// routes/indicators.js
// Express router for indicator definitions and reference guidelines.

const express = require('express');
const router = express.Router();
const indicatorsController = require('../controllers/indicatorsController');

router.get('/', indicatorsController.getAll);
router.get('/:id', indicatorsController.getById);

module.exports = router;
