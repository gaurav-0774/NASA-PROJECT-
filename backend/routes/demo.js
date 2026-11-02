// routes/demo.js
// Express router for instant demo data seeding.

const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');

router.post('/seed', demoController.seedDemo);

module.exports = router;
