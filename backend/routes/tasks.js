// routes/tasks.js
// Express router for routine tasks, habit tracking, and gamification.

const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

router.get('/', tasksController.getTasks);
router.post('/:id/complete', tasksController.completeTask);

module.exports = router;
