// controllers/alertsController.js
// Manages medical triage alerts, prioritizing severe warnings and providing
// emergency intervention workflows.

const store = require('../data/store');

/**
 * GET /api/alerts
 * Returns all active alerts sorted by severity (red/critical first) and recency.
 */
function getAll(req, res, next) {
  try {
    const alerts = store.getAlerts();
    const active = alerts.filter(a => !a.dismissed);

    // Sort order: red > yellow > green, then newest first
    const severityWeight = { red: 3, yellow: 2, green: 1 };
    active.sort((a, b) => {
      const weightDiff = (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.json(active);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/alerts/:id
 * Dismisses an active alert.
 */
function dismiss(req, res, next) {
  try {
    const { id } = req.params;
    const dismissed = store.dismissAlert(id);
    if (!dismissed) {
      return res.status(404).json({ error: `Alert '${id}' not found` });
    }
    res.json({ message: 'Alert dismissed', alert: dismissed });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  dismiss
};
