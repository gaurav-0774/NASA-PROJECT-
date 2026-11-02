// services/riskEngine.js
// Core health evaluation engine for AstroVitals.
// Evaluates individual indicators against medical reference ranges,
// applies environment hazard multipliers, detects trends over time,
// calculates category and overall health scores, and generates alerts.

const path = require('path');
const { v4: uuidv4 } = require('uuid');

const indicators = require(path.join(__dirname, '..', 'data', 'indicators.json'));
const environments = require(path.join(__dirname, '..', 'data', 'environments.json'));

/**
 * Map indicator categories to the environment hazard factors that affect them.
 * Each category can be influenced by one or more hazard dimensions.
 */
const CATEGORY_HAZARD_MAP = {
  cardiovascular: ['gravity', 'radiation'],
  bone_muscle: ['gravity'],
  immune: ['radiation', 'closedEnv'],
  nutrition: ['closedEnv', 'gravity'],
  mental_health: ['isolation', 'distance']
};

/**
 * Evaluate a single health indicator value against its reference ranges,
 * with environment-based range adjustments.
 *
 * Environment hazard multipliers tighten the normal range, making the system
 * more sensitive in harsher environments. For example, on Mars with higher
 * isolation, the mood threshold becomes more sensitive to slight declines.
 *
 * @param {string} indicatorId - The indicator ID (e.g., 'heart_rate')
 * @param {number} value - The measured value
 * @param {string} environmentId - The environment ID (e.g., 'iss', 'mars')
 * @returns {object} Evaluation result with status, ranges, message, and actions
 */
function evaluateIndicator(indicatorId, value, environmentId) {
  const indicator = indicators.find(i => i.id === indicatorId);
  if (!indicator) {
    return {
      id: indicatorId,
      status: 'unknown',
      value,
      message: `Unknown indicator: ${indicatorId}`,
      actions: []
    };
  }

  const env = environments.find(e => e.id === environmentId) || environments.find(e => e.id === 'iss');

  // Calculate environment hazard multiplier for this indicator's category
  const hazardKeys = CATEGORY_HAZARD_MAP[indicator.category] || [];
  let hazardMultiplier = 1.0;
  if (hazardKeys.length > 0) {
    const sum = hazardKeys.reduce((acc, key) => acc + (env[key] || 1.0), 0);
    hazardMultiplier = sum / hazardKeys.length;
  }

  // Tighten normal range based on hazard multiplier
  // Higher multiplier = narrower normal range = more sensitive detection
  const normalCenter = (indicator.normalRange.min + indicator.normalRange.max) / 2;
  const normalHalfWidth = (indicator.normalRange.max - indicator.normalRange.min) / 2;
  const adjustedHalfWidth = normalHalfWidth / hazardMultiplier;

  const adjustedNormal = {
    min: normalCenter - adjustedHalfWidth,
    max: normalCenter + adjustedHalfWidth
  };

  // Determine status
  let status = 'green';
  let message = '';
  let actions = [];

  if (value >= adjustedNormal.min && value <= adjustedNormal.max) {
    status = 'green';
    message = `${indicator.name} is within the healthy range at ${value} ${indicator.unit}.`;
  } else if (value >= indicator.warningRange.min && value <= indicator.warningRange.max) {
    status = 'yellow';
    message = `${indicator.name} is at ${value} ${indicator.unit}, outside the optimal range. ` +
              `Normal range is ${indicator.normalRange.min}-${indicator.normalRange.max} ${indicator.unit}.`;
    actions = getWarningActions(indicatorId);
  } else {
    status = 'red';
    message = `${indicator.name} is critically at ${value} ${indicator.unit}. ` +
              `This is outside safe limits (${indicator.warningRange.min}-${indicator.warningRange.max} ${indicator.unit}). ` +
              `Immediate attention required.`;
    actions = getCriticalActions(indicatorId);
  }

  return {
    id: indicatorId,
    name: indicator.name,
    status,
    value,
    unit: indicator.unit,
    category: indicator.category,
    normalRange: indicator.normalRange,
    adjustedNormal,
    warningRange: indicator.warningRange,
    criticalRange: indicator.criticalRange,
    message,
    actions,
    icon: indicator.icon,
    hazardMultiplier: Math.round(hazardMultiplier * 100) / 100
  };
}

/**
 * Evaluate all indicators present in a health log entry.
 *
 * @param {object} latestLog - Health log entry with indicator values as fields
 * @param {string} environmentId - Current environment ID
 * @returns {Array} Array of evaluation results
 */
function evaluateAllIndicators(latestLog, environmentId) {
  const evaluations = [];
  const indicatorIds = indicators.map(i => i.id);

  for (const indicatorId of indicatorIds) {
    if (latestLog[indicatorId] !== undefined && latestLog[indicatorId] !== null) {
      const evaluation = evaluateIndicator(indicatorId, latestLog[indicatorId], environmentId);
      evaluations.push(evaluation);
    }
  }

  return evaluations;
}

/**
 * Detect trends in an indicator over the last N days.
 * Analyzes direction (rising/declining), volatility, and consecutive patterns.
 *
 * @param {Array} healthLogs - All health log entries (sorted by date ascending)
 * @param {string} indicatorId - The indicator to analyze
 * @param {number} days - Number of days to look back (default: 3)
 * @returns {object} Trend analysis with direction, message, and data points
 */
function detectTrends(healthLogs, indicatorId, days = 3) {
  if (!healthLogs || healthLogs.length < 2) {
    return { trend: 'insufficient_data', message: 'Not enough data points for trend analysis.', dataPoints: [] };
  }

  const indicator = indicators.find(i => i.id === indicatorId);
  if (!indicator) {
    return { trend: 'unknown', message: `Unknown indicator: ${indicatorId}`, dataPoints: [] };
  }

  // Get the last N days of data
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  const recentLogs = healthLogs
    .filter(log => {
      const logDate = new Date(log.timestamp || log.date);
      return logDate >= cutoff && log[indicatorId] !== undefined && log[indicatorId] !== null;
    })
    .sort((a, b) => new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date));

  if (recentLogs.length < 2) {
    return { trend: 'insufficient_data', message: 'Not enough recent data points for trend analysis.', dataPoints: [] };
  }

  const values = recentLogs.map(log => log[indicatorId]);
  const dataPoints = recentLogs.map(log => ({
    value: log[indicatorId],
    date: log.timestamp || log.date
  }));

  // Count consecutive changes
  let increases = 0;
  let decreases = 0;
  let volatilityChanges = 0;

  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff > 0) {
      increases++;
    } else if (diff < 0) {
      decreases++;
    }
    if (i >= 2) {
      const prevDiff = values[i - 1] - values[i - 2];
      if ((diff > 0 && prevDiff < 0) || (diff < 0 && prevDiff > 0)) {
        volatilityChanges++;
      }
    }
  }

  const totalChanges = increases + decreases;
  const changeRatio = totalChanges > 0 ? Math.max(increases, decreases) / totalChanges : 0;

  // Calculate magnitude of change
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const percentChange = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

  let trend = 'stable';
  let message = '';

  // Determine trend direction and significance
  if (volatilityChanges >= values.length * 0.4) {
    trend = 'volatile';
    message = `${indicator.name} has been fluctuating significantly over the last ${days} days, ` +
              `ranging from ${Math.min(...values)} to ${Math.max(...values)} ${indicator.unit}.`;
  } else if (changeRatio >= 0.7 && increases > decreases && Math.abs(percentChange) > 3) {
    trend = 'rising';
    message = `${indicator.name} has been rising for ${increases} consecutive readings over the last ${days} days ` +
              `(${firstValue} → ${lastValue} ${indicator.unit}, ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%).`;
  } else if (changeRatio >= 0.7 && decreases > increases && Math.abs(percentChange) > 3) {
    trend = 'declining';
    message = `${indicator.name} has declined for ${decreases} consecutive readings over the last ${days} days ` +
              `(${firstValue} → ${lastValue} ${indicator.unit}, ${percentChange.toFixed(1)}%).`;
  } else {
    trend = 'stable';
    message = `${indicator.name} has been stable over the last ${days} days, ` +
              `averaging ${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)} ${indicator.unit}.`;
  }

  return {
    trend,
    message,
    dataPoints,
    percentChange: Math.round(percentChange * 10) / 10,
    firstValue,
    lastValue,
    daysAnalyzed: days
  };
}

/**
 * Calculate health scores by category.
 * Each category score is the average of its constituent indicator scores.
 * Score mapping: green=100, yellow=60, red=20.
 *
 * @param {Array} evaluations - Array of indicator evaluations
 * @returns {object} Category scores with score and status for each
 */
function calculateCategoryScores(evaluations) {
  const STATUS_SCORES = { green: 100, yellow: 60, red: 20 };
  const categories = {};

  // Group evaluations by category
  for (const evaluation of evaluations) {
    const cat = evaluation.category;
    if (!cat) continue;

    if (!categories[cat]) {
      categories[cat] = { indicators: [], totalScore: 0, count: 0 };
    }

    const score = STATUS_SCORES[evaluation.status] || 0;
    categories[cat].indicators.push({
      id: evaluation.id,
      name: evaluation.name,
      status: evaluation.status,
      score
    });
    categories[cat].totalScore += score;
    categories[cat].count += 1;
  }

  // Calculate average score per category and assign status
  const result = {};
  for (const [catId, catData] of Object.entries(categories)) {
    const avgScore = catData.count > 0 ? Math.round(catData.totalScore / catData.count) : 0;
    let status = 'green';
    if (avgScore < 50) {
      status = 'red';
    } else if (avgScore < 80) {
      status = 'yellow';
    }

    result[catId] = {
      score: avgScore,
      status,
      indicators: catData.indicators
    };
  }

  // Ensure all expected categories are present even if no indicators were logged
  const ALL_CATEGORIES = ['cardiovascular', 'bone_muscle', 'immune', 'nutrition', 'mental_health'];
  for (const cat of ALL_CATEGORIES) {
    if (!result[cat]) {
      result[cat] = { score: 0, status: 'unknown', indicators: [] };
    }
  }

  return result;
}

/**
 * Calculate a single overall health score from category scores.
 * Uses weighted average — cardiovascular and mental health weighted higher
 * due to their critical importance in spaceflight.
 *
 * @param {object} categoryScores - Category score object from calculateCategoryScores
 * @returns {number} Overall score from 0 to 100
 */
function calculateOverallScore(categoryScores) {
  const WEIGHTS = {
    cardiovascular: 1.3,
    bone_muscle: 1.0,
    immune: 1.1,
    nutrition: 0.9,
    mental_health: 1.2
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [cat, data] of Object.entries(categoryScores)) {
    if (data.status === 'unknown') continue;
    const weight = WEIGHTS[cat] || 1.0;
    weightedSum += data.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

/**
 * Generate alert objects from evaluations and trends.
 * Alerts are created for yellow/red status indicators and concerning trends.
 *
 * @param {Array} evaluations - Array of indicator evaluations
 * @param {Array} trends - Array of trend objects (optional)
 * @returns {Array} Array of alert objects
 */
function generateAlerts(evaluations, trends) {
  const alerts = [];

  // Generate alerts for warning and critical indicators
  for (const evaluation of evaluations) {
    if (evaluation.status === 'yellow') {
      alerts.push({
        id: uuidv4(),
        severity: 'warning',
        indicator: evaluation.id,
        indicatorName: evaluation.name,
        message: evaluation.message,
        action: evaluation.actions.length > 0 ? evaluation.actions[0] : 'Monitor closely and consult flight surgeon if condition persists.',
        actions: evaluation.actions,
        timestamp: new Date().toISOString(),
        dismissed: false
      });
    } else if (evaluation.status === 'red') {
      alerts.push({
        id: uuidv4(),
        severity: 'critical',
        indicator: evaluation.id,
        indicatorName: evaluation.name,
        message: evaluation.message,
        action: evaluation.actions.length > 0 ? evaluation.actions[0] : 'Seek immediate medical evaluation. Contact flight surgeon.',
        actions: evaluation.actions,
        timestamp: new Date().toISOString(),
        dismissed: false
      });
    }
  }

  // Generate alerts for concerning trends
  if (trends && Array.isArray(trends)) {
    for (const trendObj of trends) {
      if (trendObj.trend === 'declining' || trendObj.trend === 'rising') {
        const indicator = indicators.find(i => i.id === trendObj.indicatorId);
        const indicatorName = indicator ? indicator.name : trendObj.indicatorId;

        // Only alert if the trend is in a concerning direction
        const isConcerning = isTrendConcerning(trendObj.indicatorId, trendObj.trend);
        if (isConcerning) {
          alerts.push({
            id: uuidv4(),
            severity: 'info',
            indicator: trendObj.indicatorId,
            indicatorName,
            message: trendObj.message,
            action: `${indicatorName} shows a ${trendObj.trend} trend. Review recent lifestyle factors and adjust accordingly.`,
            actions: [],
            timestamp: new Date().toISOString(),
            dismissed: false
          });
        }
      } else if (trendObj.trend === 'volatile') {
        const indicator = indicators.find(i => i.id === trendObj.indicatorId);
        const indicatorName = indicator ? indicator.name : trendObj.indicatorId;
        alerts.push({
          id: uuidv4(),
          severity: 'info',
          indicator: trendObj.indicatorId,
          indicatorName,
          message: trendObj.message,
          action: `${indicatorName} is showing high variability. Try to maintain consistent routines and measurement conditions.`,
          actions: [],
          timestamp: new Date().toISOString(),
          dismissed: false
        });
      }
    }
  }

  return alerts;
}

/**
 * Determine if a trend direction is concerning for a given indicator.
 * For example, rising heart rate is concerning, but rising exercise minutes is not.
 */
function isTrendConcerning(indicatorId, trend) {
  const CONCERNING_DIRECTIONS = {
    heart_rate: 'rising',
    blood_pressure_systolic: 'rising',
    blood_pressure_diastolic: 'rising',
    blood_glucose: 'rising',
    body_temperature: 'rising',
    sleep_hours: 'declining',
    mood: 'declining',
    spo2: 'declining',
    weight: 'declining',
    exercise_minutes: 'declining',
    hydration: 'declining'
  };

  return CONCERNING_DIRECTIONS[indicatorId] === trend;
}

/**
 * Get recommended actions for a warning-level indicator.
 */
function getWarningActions(indicatorId) {
  const ACTIONS = {
    heart_rate: [
      'Practice deep breathing exercises for 5 minutes',
      'Reduce caffeine intake if applicable',
      'Ensure adequate rest and hydration',
      'Monitor for 24 hours and recheck'
    ],
    blood_pressure_systolic: [
      'Reduce sodium intake in next meals',
      'Perform relaxation exercises',
      'Increase water intake',
      'Recheck blood pressure in 2 hours'
    ],
    blood_pressure_diastolic: [
      'Engage in light aerobic exercise',
      'Practice stress management techniques',
      'Monitor blood pressure more frequently',
      'Report to flight surgeon if trend continues'
    ],
    blood_glucose: [
      'Review recent food intake and timing',
      'Have a balanced snack if glucose is low',
      'Avoid sugary foods if glucose is elevated',
      'Recheck in 1 hour'
    ],
    body_temperature: [
      'Rest and increase fluid intake',
      'Monitor for additional symptoms (chills, aches)',
      'Take temperature again in 30 minutes',
      'Report to flight surgeon if temperature continues to rise'
    ],
    sleep_hours: [
      'Adjust sleep environment (light, noise, temperature)',
      'Follow a consistent sleep schedule',
      'Avoid screens 1 hour before bedtime',
      'Try relaxation techniques before sleep'
    ],
    mood: [
      'Talk to a crewmate about how you are feeling',
      'Engage in a favorite hobby or activity',
      'Schedule a call with family or ground-based support',
      'Practice mindfulness meditation for 10 minutes'
    ],
    spo2: [
      'Check cabin oxygen levels and CO2 scrubber status',
      'Practice deep breathing exercises',
      'Sit upright and rest for 5 minutes, then recheck',
      'Report to flight surgeon if SpO2 remains below 95%'
    ],
    weight: [
      'Review caloric intake — you may need to eat more',
      'Ensure adequate protein consumption',
      'Check exercise intensity — avoid overtraining',
      'Log food intake for the next 3 days for analysis'
    ],
    exercise_minutes: [
      'Schedule exercise sessions in your daily timeline',
      'Start with a lighter workout if feeling fatigued',
      'Alternate between ARED resistance and aerobic exercise',
      'Set alarms as reminders for exercise time'
    ],
    hydration: [
      'Drink a glass of water right now',
      'Set hourly hydration reminders',
      'Add flavor packets to water to encourage drinking',
      'Monitor urine color throughout the day'
    ]
  };

  return ACTIONS[indicatorId] || ['Monitor closely and report if condition worsens'];
}

/**
 * Get recommended actions for a critical-level indicator.
 */
function getCriticalActions(indicatorId) {
  const ACTIONS = {
    heart_rate: [
      'Stop current activity and rest immediately',
      'Contact flight surgeon via emergency channel',
      'Begin continuous cardiac monitoring',
      'Prepare emergency cardiac medications if advised'
    ],
    blood_pressure_systolic: [
      'Contact flight surgeon immediately',
      'Lie down and elevate legs if hypotensive, sit upright if hypertensive',
      'Begin continuous blood pressure monitoring',
      'Do not perform EVA or operate critical systems until cleared'
    ],
    blood_pressure_diastolic: [
      'Contact flight surgeon immediately',
      'Rest in a comfortable position',
      'Begin continuous monitoring every 15 minutes',
      'Prepare for possible pharmacological intervention'
    ],
    blood_glucose: [
      'If low: consume fast-acting glucose (juice, glucose tablets) immediately',
      'If high: contact flight surgeon for insulin protocol',
      'Do not operate critical systems until glucose stabilizes',
      'Recheck every 15 minutes until within safe range'
    ],
    body_temperature: [
      'Begin infection isolation protocol if fever',
      'Contact flight surgeon for antimicrobial therapy guidance',
      'Increase fluid intake significantly',
      'Monitor vitals every 30 minutes'
    ],
    sleep_hours: [
      'Report to flight surgeon — sleep medication may be needed',
      'Reduce workload for the next 24-48 hours',
      'Environmental assessment of sleep quarters',
      'Consider schedule adjustment to allow recovery sleep'
    ],
    mood: [
      'Request private psychological consultation immediately',
      'Do not perform high-risk tasks or EVA',
      'Crewmate wellness check protocol activated',
      'Consider pharmaceutical intervention with flight surgeon approval'
    ],
    spo2: [
      'Emergency: check cabin atmosphere immediately',
      'Apply supplemental oxygen from emergency supply',
      'Alert all crew members to check their own SpO2',
      'Contact Mission Control for atmospheric system diagnosis'
    ],
    weight: [
      'Contact flight surgeon — significant mass change detected',
      'Begin detailed nutritional logging',
      'Assess for underlying medical conditions',
      'Adjust exercise and nutrition protocol under medical guidance'
    ],
    exercise_minutes: [
      'Assess reason for exercise deficit — injury? equipment failure? schedule?',
      'Prioritize exercise in daily schedule — musculoskeletal health at risk',
      'Contact flight surgeon for modified exercise protocol if injured',
      'Begin accelerated countermeasure program to recover lost conditioning'
    ],
    hydration: [
      'Drink 500ml of water with electrolytes immediately',
      'Contact flight surgeon if unable to tolerate fluids',
      'Monitor urine output for next 6 hours',
      'Assess for underlying cause of dehydration (illness, medication side effects)'
    ]
  };

  return ACTIONS[indicatorId] || ['Seek immediate medical evaluation. Contact flight surgeon.'];
}

module.exports = {
  evaluateIndicator,
  evaluateAllIndicators,
  detectTrends,
  calculateCategoryScores,
  calculateOverallScore,
  generateAlerts
};
