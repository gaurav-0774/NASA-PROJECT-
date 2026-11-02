// routes/alerts.js
// Express router for active warnings and clinical alerts.

const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

router.get('/', alertsController.getAll);
router.delete('/:id', alertsController.dismiss);

module.exports = router;
