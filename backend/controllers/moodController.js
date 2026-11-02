// controllers/moodController.js
// Handles subjective astronaut psychological check-ins, stress mitigation tips,
// isolation risk scoring, and flight psychologist escalation protocols.

const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

const CALMING_TIPS = [
  'Practice the 4-7-8 breathing technique: Inhale 4s, hold 7s, exhale 8s through pursed lips.',
  'Listen to Earth soundscapes (rainforest, ocean surf, autumn wind) through noise-canceling headphones.',
  'Engage in 15 minutes of non-mission reading or personal journaling.',
  'Call a crewmate for an unscheduled informal chat or meal break.',
  'Request high-bandwidth personal video message sync with family on Earth.',
  'Dim cabin lighting to amber spectrum (600nm) 1 hour prior to sleep cycle.'
];

function submitMood(req, res, next) {
  try {
    const { mood, stress, isolation, notes } = req.body;

    const moodVal = Number(mood);
    const stressVal = Number(stress); // 1 = minimal, 5 = severe stress
    const isolationVal = Number(isolation); // 1 = connected, 5 = severe isolation

    const entry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      mood: moodVal,
      stress: stressVal,
      isolation: isolationVal,
      notes: notes || ''
    };

    store.addMoodLog(entry);

    // Calculate mental wellness score
    // mood (1-5, high is good), stress (1-5, low is good), isolation (1-5, low is good)
    const invertedStress = 6 - stressVal;
    const invertedIsolation = 6 - isolationVal;
    const compositeScore = Math.round(((moodVal + invertedStress + invertedIsolation) / 15) * 100);

    let status = 'green';
    let summary = 'Psychological state is stable and resilient.';
    const recommendations = [];
    const urgentEscalation = moodVal <= 2 || stressVal >= 4 || isolationVal >= 4;

    if (urgentEscalation) {
      status = moodVal === 1 || stressVal === 5 || isolationVal === 5 ? 'red' : 'yellow';
      summary = status === 'red'
        ? 'High psychological distress detected. Autonomous stress mitigation and ground consultation strongly advised.'
        : 'Elevated stress and confinement fatigue detected. Active countermeasures recommended.';

      recommendations.push('Schedule a private behavioral health consultation (BHC) with the ground flight psychologist.');
      recommendations.push('Discuss workload redistribution with the mission commander.');
      recommendations.push('Increase leisure / Earth-comm window allocation in today’s flight plan.');
    } else {
      recommendations.push('Maintain regular crew social interaction and evening group meals.');
      recommendations.push('Continue daily relaxation protocol.');
    }

    // Award XP
    store.addXP(30);

    res.json({
      message: 'Mood check-in successfully recorded.',
      log: entry,
      compositeScore,
      status,
      summary,
      recommendations,
      calmingTips: CALMING_TIPS.sort(() => 0.5 - Math.random()).slice(0, 3),
      urgentEscalation
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitMood
};
