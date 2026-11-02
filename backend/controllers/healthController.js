// controllers/healthController.js
// Handles health summary generation, historical telemetry retrieval,
// and new metric log submission with real-time risk evaluation.

const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const riskEngine = require('../services/riskEngine');
const gamification = require('../services/gamification');

/**
 * Baseline default telemetry used when no logs have been recorded yet.
 */
const DEFAULT_BASELINE = {
  day: 1,
  timestamp: new Date().toISOString(),
  heart_rate: 72,
  blood_pressure_systolic: 118,
  blood_pressure_diastolic: 76,
  blood_glucose: 92,
  body_temperature: 36.6,
  sleep_hours: 7.5,
  mood: 4,
  spo2: 98,
  weight: 78.5,
  exercise_minutes: 150,
  hydration: 4
};

/**
 * GET /api/health/summary
 * Returns overall health score, category breakdown, individual indicator statuses,
 * and current environment details.
 */
function getSummary(req, res, next) {
  try {
    const logs = store.getHealthLogs();
    const env = req.query.environment || store.getCurrentEnvironment() || 'iss';
    const latestLog = logs.length > 0 ? logs[logs.length - 1] : { ...DEFAULT_BASELINE, id: 'baseline-default' };

    const evaluations = riskEngine.evaluateAllIndicators(latestLog, env);
    const categoryScores = riskEngine.calculateCategoryScores(evaluations);
    const overallScore = riskEngine.calculateOverallScore(categoryScores);

    // Get active non-dismissed alerts
    const alerts = store.getAlerts().filter(a => !a.dismissed);

    res.json({
      overallScore,
      categories: categoryScores,
      indicators: evaluations,
      environment: env,
      latestLog,
      totalLogs: logs.length,
      activeAlertsCount: alerts.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/health/history
 * Returns historical logs, optionally filtered by ?days=N (default 30).
 */
function getHistory(req, res, next) {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const logs = store.getHealthLogs();
    const sliceLogs = logs.slice(-days);

    res.json({
      days: sliceLogs.length,
      logs: sliceLogs
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/health/log
 * Records new telemetry reading, calculates risk, generates alerts,
 * and rewards gamification XP.
 */
function logHealth(req, res, next) {
  try {
    const data = req.body;
    const logs = store.getHealthLogs();
    const env = data.environment || store.getCurrentEnvironment() || 'iss';
    const currentDay = logs.length > 0 ? (logs[logs.length - 1].day || logs.length) + 1 : 1;

    const newEntry = {
      id: uuidv4(),
      day: data.day || currentDay,
      timestamp: data.timestamp || new Date().toISOString(),
      heart_rate: Number(data.heart_rate),
      blood_pressure_systolic: Number(data.blood_pressure_systolic),
      blood_pressure_diastolic: Number(data.blood_pressure_diastolic),
      blood_glucose: Number(data.blood_glucose),
      body_temperature: Number(data.body_temperature),
      sleep_hours: Number(data.sleep_hours),
      mood: Number(data.mood),
      spo2: Number(data.spo2),
      weight: Number(data.weight),
      exercise_minutes: Number(data.exercise_minutes),
      hydration: Number(data.hydration),
      notes: data.notes || ''
    };

    // Save log
    store.addHealthLog(newEntry);

    // Evaluate
    const evaluations = riskEngine.evaluateAllIndicators(newEntry, env);
    const categoryScores = riskEngine.calculateCategoryScores(evaluations);
    const overallScore = riskEngine.calculateOverallScore(categoryScores);

    // Detect trends across recent logs
    const allRecentLogs = store.getHealthLogs().slice(-5);
    const trends = [];
    ['sleep_hours', 'heart_rate', 'mood', 'exercise_minutes'].forEach(ind => {
      const trend = riskEngine.detectTrends(allRecentLogs, ind);
      if (trend && trend.trend !== 'stable') {
        trends.push(trend);
      }
    });

    // Generate alerts
    const newAlerts = riskEngine.generateAlerts(evaluations, trends);
    newAlerts.forEach(alert => store.addAlert(alert));

    // Gamification progress
    const xpReward = 50;
    const gamificationResult = store.addXP(xpReward);
    store.updateStreak(newEntry.timestamp);
    
    // Auto-complete tasks based on measurements present
    if (typeof gamification.autoCompleteTasks === 'function') {
      gamification.autoCompleteTasks(newEntry);
    }
    gamification.checkBadges();

    res.status(201).json({
      message: 'Health record logged successfully',
      log: newEntry,
      evaluations,
      overallScore,
      categoryScores,
      newAlerts,
      xpEarned: xpReward,
      gamification: store.getGamification()
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/health/environment
 * Update active mission environment.
 */
function setEnvironment(req, res, next) {
  try {
    const { environment } = req.body;
    if (!environment) {
      return res.status(400).json({ error: 'Environment ID is required' });
    }
    store.setCurrentEnvironment(environment);
    res.json({ message: 'Mission environment updated', environment });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getHistory,
  logHealth,
  setEnvironment
};
