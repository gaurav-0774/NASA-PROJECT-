// controllers/tasksController.js
// Handles mission routine checklists, habit tracking, XP rewards, and astronaut achievements.

const store = require('../data/store');
const gamification = require('../services/gamification');

/**
 * GET /api/tasks
 * Returns today's protocol checklist along with current XP, rank title, badges, and streak.
 */
function getTasks(req, res, next) {
  try {
    const tasks = gamification.getDailyTasks();
    const gamificationState = store.getGamification();
    const levelInfo = gamification.getLevelInfo(gamificationState.xp);

    res.json({
      tasks,
      gamification: {
        ...gamificationState,
        ...levelInfo
      },
      availableBadges: gamification.BADGES
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/tasks/:id/complete
 * Manually marks a daily task completed and awards associated XP.
 */
function completeTask(req, res, next) {
  try {
    const { id } = req.params;
    const task = gamification.completeTask(id);

    if (!task) {
      return res.status(404).json({ error: `Task '${id}' not found` });
    }

    const gamificationState = store.getGamification();
    const levelInfo = gamification.getLevelInfo(gamificationState.xp);

    res.json({
      message: `Task '${task.title}' marked as completed!`,
      task,
      gamification: {
        ...gamificationState,
        ...levelInfo
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTasks,
  completeTask
};
