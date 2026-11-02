// controllers/demoController.js
// Generates realistic 30-day mission telemetry exhibiting clinical anomalies
// (sleep deprivation, elevated resting heart rate, mood drop, partial recovery)
// for instant hackathon judge demonstration.

const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const riskEngine = require('../services/riskEngine');
const gamification = require('../services/gamification');

function jitter(val, percent = 0.05) {
  const delta = val * percent * (Math.random() * 2 - 1);
  return Math.round((val + delta) * 10) / 10;
}

/**
 * POST /api/demo/seed
 * Resets store and loads 30 days of synthetic mission health data.
 */
function seedDemo(req, res, next) {
  try {
    store.resetAll();

    const env = 'mars'; // Default to Mars for exciting demonstration
    store.setCurrentEnvironment(env);

    const logs = [];
    const now = new Date();
    const startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);

    for (let day = 1; day <= 30; day++) {
      const date = new Date(startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);

      let sleepHours;
      let heartRate;
      let systolic;
      let diastolic;
      let mood;
      let exerciseMin;
      let temp;
      let glucose;
      let spo2;
      let weight;
      let hydration;

      if (day <= 10) {
        // Nominal Phase: High adaptation, nominal readings
        sleepHours = jitter(7.8, 0.04);
        heartRate = Math.round(jitter(68, 0.05));
        systolic = Math.round(jitter(116, 0.03));
        diastolic = Math.round(jitter(74, 0.03));
        mood = 4;
        exerciseMin = Math.round(jitter(150, 0.05));
        temp = jitter(36.6, 0.01);
        glucose = Math.round(jitter(90, 0.04));
        spo2 = Math.round(jitter(98, 0.01));
        weight = jitter(78.2, 0.01);
        hydration = 4;
      } else if (day <= 20) {
        // Stress & Insomnia Phase: High mission workload, declining sleep, rising HR
        const t = (day - 10) / 10;
        sleepHours = jitter(7.8 - t * 2.8, 0.05); // Drops towards 5.0h
        heartRate = Math.round(jitter(68 + t * 20, 0.05)); // Climbs to 88 bpm
        systolic = Math.round(jitter(116 + t * 14, 0.04)); // Climbs to ~130
        diastolic = Math.round(jitter(74 + t * 10, 0.04)); // Climbs to ~84
        mood = Math.round(4 - t * 1.5); // Drops to 3 or 2
        exerciseMin = Math.round(jitter(150 - t * 40, 0.08)); // Drops to ~110 min
        temp = jitter(36.8, 0.01);
        glucose = Math.round(jitter(98, 0.05));
        spo2 = Math.round(jitter(97, 0.01));
        weight = jitter(77.6, 0.01);
        hydration = 3;
      } else if (day <= 25) {
        // Acute Hazard Phase: Confinement fatigue, severe mood drop, missed exercise
        const t = (day - 20) / 5;
        sleepHours = jitter(4.8 - t * 0.8, 0.06); // ~4.0 - 4.5h
        heartRate = Math.round(jitter(88 + t * 6, 0.05)); // ~94 bpm
        systolic = Math.round(jitter(132 + t * 6, 0.04)); // ~138 mmHg
        diastolic = Math.round(jitter(85 + t * 4, 0.04)); // ~89 mmHg
        mood = 2; // Critical mood
        exerciseMin = Math.round(jitter(80 - t * 35, 0.1)); // Critical ~45 min
        temp = jitter(37.1, 0.01);
        glucose = Math.round(jitter(108, 0.06));
        spo2 = Math.round(jitter(96, 0.01));
        weight = jitter(76.8, 0.01);
        hydration = 2; // Warning hydration
      } else {
        // Intervention & Recovery Phase: Flight surgeon protocol adjustment, sleep hygiene
        const t = (day - 25) / 5;
        sleepHours = jitter(4.2 + t * 2.5, 0.05); // Rebounds to 6.7h
        heartRate = Math.round(jitter(92 - t * 16, 0.05)); // Drops back to ~76 bpm
        systolic = Math.round(jitter(136 - t * 16, 0.04)); // Drops back to ~120
        diastolic = Math.round(jitter(88 - t * 10, 0.04)); // Drops back to ~78
        mood = Math.min(5, Math.round(2 + t * 2)); // Rebounds to 4
        exerciseMin = Math.round(jitter(55 + t * 85, 0.08)); // Back to 140 min
        temp = jitter(36.7, 0.01);
        glucose = Math.round(jitter(94, 0.04));
        spo2 = Math.round(jitter(98, 0.01));
        weight = jitter(77.2, 0.01);
        hydration = 4;
      }

      const log = {
        id: uuidv4(),
        day,
        timestamp: date.toISOString(),
        heart_rate: Math.max(45, Math.min(180, heartRate)),
        blood_pressure_systolic: Math.max(70, Math.min(200, systolic)),
        blood_pressure_diastolic: Math.max(40, Math.min(120, diastolic)),
        blood_glucose: Math.max(50, Math.min(250, glucose)),
        body_temperature: Math.max(34, Math.min(41, temp)),
        sleep_hours: Math.max(1, Math.min(14, sleepHours)),
        mood: Math.max(1, Math.min(5, mood)),
        spo2: Math.max(85, Math.min(100, spo2)),
        weight: Math.max(40, Math.min(150, weight)),
        exercise_minutes: Math.max(0, Math.min(300, exerciseMin)),
        hydration: Math.max(1, Math.min(5, hydration)),
        notes: day === 22 ? 'Noticed persistent fatigue and headaches during EVA preparation.' : ''
      };

      logs.push(log);
      store.addHealthLog(log);
    }

    // Evaluate latest log and generate alerts
    const latestLog = logs[logs.length - 1];
    const evaluations = riskEngine.evaluateAllIndicators(latestLog, env);
    const recentLogs = logs.slice(-7);

    // Detect trends
    const trends = [];
    ['sleep_hours', 'heart_rate', 'mood', 'exercise_minutes'].forEach(ind => {
      const trend = riskEngine.detectTrends(recentLogs, ind);
      if (trend) trends.push(trend);
    });

    // Add active alert highlights to demo
    const alerts = riskEngine.generateAlerts(evaluations, trends);
    alerts.forEach(a => store.addAlert(a));

    // Award initial demo gamification achievements
    store.addXP(850); // Level 2
    store.updateStreak(latestLog.timestamp);
    store.addBadge({
      id: 'iron_bones',
      name: 'Iron Bones',
      description: 'Completed 7+ consecutive days of countermeasures exercise'
    });
    store.addBadge({
      id: 'vital_logger',
      name: 'Vital Logger',
      description: 'Recorded 30 days of continuous mission telemetry'
    });

    res.json({
      message: 'Demo dataset seeded successfully! 30 days of realistic flight telemetry loaded.',
      daysGenerated: 30,
      logsCount: logs.length,
      alertsCount: alerts.length,
      environment: env,
      xp: store.getGamification().xp,
      level: store.getGamification().level
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  seedDemo
};
