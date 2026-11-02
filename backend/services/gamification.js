// services/gamification.js
// Gamification system for AstroVitals.
// Manages daily health tasks, XP rewards, streak tracking, badge achievements,
// and level progression to motivate astronauts to maintain health monitoring habits.

const store = require('../data/store');
const { v4: uuidv4 } = require('uuid');

/**
 * Daily task definitions.
 * Each task represents a health action astronauts should perform daily.
 */
const DAILY_TASKS = [
  {
    id: 'log_vitals',
    title: 'Log Daily Vitals',
    description: 'Record your heart rate, blood pressure, SpO2, and body temperature.',
    xpReward: 50,
    icon: 'ClipboardList'
  },
  {
    id: 'log_sleep',
    title: 'Log Sleep Duration',
    description: 'Record how many hours you slept last night and rate your sleep quality.',
    xpReward: 30,
    icon: 'Moon'
  },
  {
    id: 'exercise_check',
    title: 'Complete Exercise Protocol',
    description: 'Complete your daily 2.5-hour exercise session (ARED + CEVIS/T2).',
    xpReward: 40,
    icon: 'Dumbbell'
  },
  {
    id: 'mood_checkin',
    title: 'Mood Check-In',
    description: 'Rate your current mood and stress levels, and write any notes about how you feel.',
    xpReward: 30,
    icon: 'Smile'
  },
  {
    id: 'hydration_check',
    title: 'Hydration Check',
    description: 'Assess and log your hydration level based on fluid intake and urine color.',
    xpReward: 20,
    icon: 'Droplets'
  },
  {
    id: 'blood_pressure',
    title: 'Blood Pressure Reading',
    description: 'Take three blood pressure readings and record the average systolic/diastolic values.',
    xpReward: 40,
    icon: 'Activity'
  }
];

/**
 * Badge definitions with conditions.
 * Badges reward sustained healthy behaviors and achievements.
 */
const BADGES = [
  {
    id: 'iron_bones',
    name: 'Iron Bones',
    description: 'Completed exercise protocol for 7 consecutive days. Your musculoskeletal countermeasures are exemplary!',
    icon: 'Bone',
    condition: 'exercise_streak_7'
  },
  {
    id: 'sleep_commander',
    name: 'Sleep Commander',
    description: 'Maintained optimal sleep (7-9 hours) for 7 consecutive days. Rest is a mission-critical resource!',
    icon: 'Moon',
    condition: 'optimal_sleep_7'
  },
  {
    id: 'mind_keeper',
    name: 'Mind Keeper',
    description: 'Completed 5 mood check-ins. Psychological awareness is key to crew well-being on long missions.',
    icon: 'Brain',
    condition: 'mood_checkins_5'
  },
  {
    id: 'vital_logger',
    name: 'Vital Logger',
    description: 'Logged health data for 30 days! Your consistent monitoring builds a powerful health baseline.',
    icon: 'Award',
    condition: 'log_days_30'
  },
  {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    description: 'Maintained good hydration (level 3+) for 7 consecutive days. Kidney stone risk reduced!',
    icon: 'Droplets',
    condition: 'hydration_streak_7'
  },
  {
    id: 'heart_guardian',
    name: 'Heart Guardian',
    description: 'All cardiovascular indicators stayed green for 7 consecutive days. Your heart is mission-ready!',
    icon: 'HeartPulse',
    condition: 'cardiovascular_green_7'
  }
];

/**
 * Get daily tasks for a given date, with completion status from the store.
 * Tasks are regenerated each day but completion status is preserved for the current day.
 *
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @returns {object} Daily tasks, gamification stats, and level info
 */
function getDailyTasks(date) {
  const dateStr = typeof date === 'string' ? date.split('T')[0] : new Date().toISOString().split('T')[0];
  const existingTasks = store.getTasks();

  // Check if tasks are for today
  const tasksForToday = existingTasks.filter(t => {
    const taskDate = t.date ? t.date.split('T')[0] : '';
    return taskDate === dateStr;
  });

  if (tasksForToday.length === DAILY_TASKS.length) {
    // Tasks already generated for today
    return {
      date: dateStr,
      tasks: tasksForToday,
      gamification: store.getGamification(),
      levelInfo: getLevelInfo(store.getGamification().xp)
    };
  }

  // Generate new tasks for today
  const newTasks = DAILY_TASKS.map(task => ({
    ...task,
    date: dateStr,
    completed: false,
    completedAt: null
  }));

  // Keep existing tasks from other days, add today's
  const otherDayTasks = existingTasks.filter(t => {
    const taskDate = t.date ? t.date.split('T')[0] : '';
    return taskDate !== dateStr;
  });

  store.setTasks([...otherDayTasks, ...newTasks]);

  return {
    date: dateStr,
    tasks: newTasks,
    gamification: store.getGamification(),
    levelInfo: getLevelInfo(store.getGamification().xp)
  };
}

/**
 * Mark a task as completed, award XP, update streak, and check for new badges.
 *
 * @param {string} taskId - The task ID to complete
 * @returns {object} Result with XP earned, new level info, and any new badges
 */
function completeTask(taskId) {
  const tasks = store.getTasks();
  const task = tasks.find(t => t.id === taskId && !t.completed);

  if (!task) {
    return { success: false, message: 'Task not found or already completed.' };
  }

  const taskDef = DAILY_TASKS.find(t => t.id === taskId);
  if (!taskDef) {
    return { success: false, message: 'Invalid task definition.' };
  }

  // Mark task complete in store
  store.completeTask(taskId);

  // Award XP
  const xpEarned = taskDef.xpReward;
  store.addXP(xpEarned);

  // Update streak
  store.updateStreak(new Date().toISOString());

  // Check for new badges
  const newBadges = checkBadges();

  const gamification = store.getGamification();

  return {
    success: true,
    taskId,
    xpEarned,
    totalXP: gamification.xp,
    streak: gamification.streak,
    levelInfo: getLevelInfo(gamification.xp),
    newBadges,
    message: `Completed "${taskDef.title}" and earned ${xpEarned} XP!`
  };
}

/**
 * Auto-complete tasks based on health log data.
 * When an astronaut logs their health data, relevant tasks are automatically completed.
 *
 * @param {object} logEntry - The health log entry
 * @returns {Array} Array of auto-completed task IDs with XP earned
 */
function autoCompleteTasks(logEntry) {
  const today = new Date().toISOString().split('T')[0];
  getDailyTasks(today); // Ensure tasks exist for today

  const completed = [];

  // Check which tasks can be auto-completed based on logged data
  if (logEntry.heart_rate && logEntry.blood_pressure_systolic && logEntry.spo2 && logEntry.body_temperature) {
    const result = completeTask('log_vitals');
    if (result.success) completed.push({ taskId: 'log_vitals', xpEarned: result.xpEarned });
  }

  if (logEntry.sleep_hours !== undefined && logEntry.sleep_hours !== null) {
    const result = completeTask('log_sleep');
    if (result.success) completed.push({ taskId: 'log_sleep', xpEarned: result.xpEarned });
  }

  if (logEntry.exercise_minutes && logEntry.exercise_minutes >= 120) {
    const result = completeTask('exercise_check');
    if (result.success) completed.push({ taskId: 'exercise_check', xpEarned: result.xpEarned });
  }

  if (logEntry.blood_pressure_systolic && logEntry.blood_pressure_diastolic) {
    const result = completeTask('blood_pressure');
    if (result.success) completed.push({ taskId: 'blood_pressure', xpEarned: result.xpEarned });
  }

  if (logEntry.hydration !== undefined && logEntry.hydration !== null) {
    const result = completeTask('hydration_check');
    if (result.success) completed.push({ taskId: 'hydration_check', xpEarned: result.xpEarned });
  }

  return completed;
}

/**
 * Check all badge conditions against store data and award any newly earned badges.
 *
 * @returns {Array} Array of newly awarded badge objects
 */
function checkBadges() {
  const healthLogs = store.getHealthLogs();
  const moodLogs = store.getMoodLogs();
  const newBadges = [];

  for (const badge of BADGES) {
    const alreadyEarned = store.getGamification().badges.find(b => b.id === badge.id);
    if (alreadyEarned) continue;

    let earned = false;

    switch (badge.condition) {
      case 'exercise_streak_7':
        earned = checkConsecutiveDays(healthLogs, 'exercise_minutes', 7, val => val >= 120);
        break;

      case 'optimal_sleep_7':
        earned = checkConsecutiveDays(healthLogs, 'sleep_hours', 7, val => val >= 7 && val <= 9);
        break;

      case 'mood_checkins_5':
        earned = moodLogs.length >= 5;
        break;

      case 'log_days_30': {
        const uniqueDays = new Set(healthLogs.map(log => {
          const d = log.timestamp || log.date;
          return d ? d.split('T')[0] : null;
        }).filter(Boolean));
        earned = uniqueDays.size >= 30;
        break;
      }

      case 'hydration_streak_7':
        earned = checkConsecutiveDays(healthLogs, 'hydration', 7, val => val >= 3);
        break;

      case 'cardiovascular_green_7':
        earned = checkConsecutiveDays(healthLogs, null, 7, (val, log) => {
          const hr = log.heart_rate;
          const sys = log.blood_pressure_systolic;
          const dia = log.blood_pressure_diastolic;
          return hr >= 60 && hr <= 100 &&
                 sys >= 90 && sys <= 120 &&
                 dia >= 60 && dia <= 80;
        });
        break;

      default:
        break;
    }

    if (earned) {
      const added = store.addBadge({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon
      });
      if (added) {
        newBadges.push(badge);
        // Bonus XP for earning a badge
        store.addXP(100);
      }
    }
  }

  return newBadges;
}

/**
 * Check if a condition was met for N consecutive days in the health logs.
 *
 * @param {Array} logs - Health log entries
 * @param {string|null} field - The field to check, or null for multi-field checks
 * @param {number} days - Number of consecutive days required
 * @param {Function} condition - Function(value, log) => boolean
 * @returns {boolean} Whether the streak condition is met
 */
function checkConsecutiveDays(logs, field, days, condition) {
  if (logs.length < days) return false;

  // Group logs by date, take the latest entry per day
  const byDate = {};
  for (const log of logs) {
    const dateStr = (log.timestamp || log.date || '').split('T')[0];
    if (!dateStr) continue;
    byDate[dateStr] = log;
  }

  // Sort dates descending
  const sortedDates = Object.keys(byDate).sort().reverse();

  if (sortedDates.length < days) return false;

  // Check the most recent N days
  let consecutive = 0;
  for (let i = 0; i < sortedDates.length && consecutive < days; i++) {
    const log = byDate[sortedDates[i]];
    const value = field ? log[field] : null;

    if (value === undefined && field !== null) break;

    if (condition(value, log)) {
      consecutive++;
    } else {
      break;
    }
  }

  return consecutive >= days;
}

/**
 * Calculate level information from XP.
 * Level formula: 500 XP per level.
 *
 * @param {number} xp - Total XP earned
 * @returns {object} Level info with level number, current XP in level, XP needed, and progress
 */
function getLevelInfo(xp) {
  const xpPerLevel = 500;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const currentLevelXP = xp % xpPerLevel;
  const xpForNext = xpPerLevel;
  const progress = Math.round((currentLevelXP / xpForNext) * 100);

  const LEVEL_TITLES = [
    'Space Cadet',
    'Health Apprentice',
    'Vital Monitor',
    'Wellness Officer',
    'Health Commander',
    'Chief Medical Officer',
    'Vitals Virtuoso',
    'Health Legend',
    'Astro Medic',
    'Grand Health Marshal'
  ];

  return {
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    currentXP: currentLevelXP,
    xpForNext,
    totalXP: xp,
    progress
  };
}

module.exports = {
  DAILY_TASKS,
  BADGES,
  getDailyTasks,
  completeTask,
  autoCompleteTasks,
  checkBadges,
  getLevelInfo
};
