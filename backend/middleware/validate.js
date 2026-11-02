// middleware/validate.js
// Request validation middleware for health logging and health metrics.

/**
 * Validates physically possible bounds for astronaut health measurements.
 */
const PHYSICALLY_POSSIBLE_BOUNDS = {
  heart_rate: { min: 20, max: 250, name: 'Heart Rate (bpm)' },
  blood_pressure_systolic: { min: 40, max: 280, name: 'Systolic Blood Pressure (mmHg)' },
  blood_pressure_diastolic: { min: 30, max: 200, name: 'Diastolic Blood Pressure (mmHg)' },
  blood_glucose: { min: 20, max: 600, name: 'Blood Glucose (mg/dL)' },
  body_temperature: { min: 30, max: 45, name: 'Body Temperature (°C)' },
  sleep_hours: { min: 0, max: 24, name: 'Sleep Hours' },
  mood: { min: 1, max: 5, name: 'Mood Scale (1-5)' },
  spo2: { min: 50, max: 100, name: 'Blood Oxygen SpO2 (%)' },
  weight: { min: 30, max: 200, name: 'Body Mass (kg)' },
  exercise_minutes: { min: 0, max: 600, name: 'Exercise Minutes' },
  hydration: { min: 1, max: 5, name: 'Hydration Scale (1-5)' }
};

function validateHealthLog(req, res, next) {
  const data = req.body;

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Request body must be a valid JSON object' });
  }

  const errors = [];

  for (const [key, bounds] of Object.entries(PHYSICALLY_POSSIBLE_BOUNDS)) {
    if (data[key] !== undefined && data[key] !== null) {
      const val = Number(data[key]);
      if (isNaN(val)) {
        errors.push(`${bounds.name} must be a number`);
      } else if (val < bounds.min || val > bounds.max) {
        errors.push(`${bounds.name} out of plausible bounds (${bounds.min}-${bounds.max})`);
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

function validateMood(req, res, next) {
  const { mood, stress, isolation } = req.body;
  const errors = [];

  if (mood === undefined || mood < 1 || mood > 5) {
    errors.push('Mood must be between 1 and 5');
  }
  if (stress === undefined || stress < 1 || stress > 5) {
    errors.push('Stress must be between 1 and 5');
  }
  if (isolation === undefined || isolation < 1 || isolation > 5) {
    errors.push('Isolation feeling must be between 1 and 5');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

module.exports = {
  validateHealthLog,
  validateMood
};
