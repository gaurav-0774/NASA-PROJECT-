// controllers/bodyPartsController.js
// Handles retrieval of human body anatomical systems, linked health metrics,
// and real-time status evaluations for the interactive 3D/SVG body figure.

const bodyParts = require('../data/bodyParts.json');
const indicators = require('../data/indicators.json');
const store = require('../data/store');
const riskEngine = require('../services/riskEngine');

/**
 * Determine aggregate status ('green', 'yellow', 'red') from linked indicator statuses.
 */
function getSystemStatus(evaluations, linkedIndicatorIds) {
  const linkedEvals = evaluations.filter(e => linkedIndicatorIds.includes(e.id));
  if (linkedEvals.length === 0) return 'green';
  if (linkedEvals.some(e => e.status === 'red')) return 'red';
  if (linkedEvals.some(e => e.status === 'yellow')) return 'yellow';
  return 'green';
}

/**
 * GET /api/body-parts
 * Returns all body systems with their current aggregate status.
 */
function getAll(req, res, next) {
  try {
    const logs = store.getHealthLogs();
    const env = store.getCurrentEnvironment() || 'iss';
    const latestLog = logs.length > 0 ? logs[logs.length - 1] : {};
    const evaluations = riskEngine.evaluateAllIndicators(latestLog, env);

    const partsWithStatus = bodyParts.map(part => {
      const status = getSystemStatus(evaluations, part.linkedIndicators);
      return {
        ...part,
        status,
        activeStatusDescription: part.statusInfo[status] || part.statusInfo.green
      };
    });

    res.json(partsWithStatus);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/body-parts/:id
 * Returns deep detail on a selected body system, its linked indicators,
 * current readings, and prioritized clinical guidance.
 */
function getById(req, res, next) {
  try {
    const part = bodyParts.find(p => p.id === req.params.id);
    if (!part) {
      return res.status(404).json({ error: `Body system '${req.params.id}' not found` });
    }

    const logs = store.getHealthLogs();
    const env = store.getCurrentEnvironment() || 'iss';
    const latestLog = logs.length > 0 ? logs[logs.length - 1] : {};
    const evaluations = riskEngine.evaluateAllIndicators(latestLog, env);

    const status = getSystemStatus(evaluations, part.linkedIndicators);
    
    // Find detailed evaluation for each linked indicator
    const linkedDetails = part.linkedIndicators.map(indId => {
      const indDef = indicators.find(i => i.id === indId);
      const evalResult = evaluations.find(e => e.id === indId);
      return {
        id: indId,
        name: indDef ? indDef.name : indId,
        unit: indDef ? indDef.unit : '',
        value: latestLog[indId] !== undefined ? latestLog[indId] : null,
        status: evalResult ? evalResult.status : 'unknown',
        message: evalResult ? evalResult.message : '',
        normalRange: indDef ? indDef.normalRange : null
      };
    });

    res.json({
      ...part,
      status,
      activeStatusDescription: part.statusInfo[status] || part.statusInfo.green,
      linkedIndicatorsData: linkedDetails,
      evaluatedAt: latestLog.timestamp || new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById
};
