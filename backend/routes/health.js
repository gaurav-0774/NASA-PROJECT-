// routes/health.js
// Express router for telemetry summary, historical logs, and new measurements.

const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { validateHealthLog } = require('../middleware/validate');

router.get('/summary', healthController.getSummary);
router.get('/history', healthController.getHistory);
router.post('/log', validateHealthLog, healthController.logHealth);
router.post('/environment', healthController.setEnvironment);

module.exports = router;
