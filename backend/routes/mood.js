// routes/mood.js
// Express router for astronaut psychological self-assessments.

const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');
const { validateMood } = require('../middleware/validate');

router.post('/', validateMood, moodController.submitMood);

module.exports = router;
