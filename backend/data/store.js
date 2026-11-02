// data/store.js
// In-memory data store with JSON file persistence.
// Holds all mutable application state: health logs, alerts, tasks, gamification, mood logs.
// Automatically persists to data/db.json after every mutation.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

/**
 * Default empty state for the store.
 * This is used when no db.json file exists on startup.
 */
function getDefaultState() {
  return {
    healthLogs: [],
    alerts: [],
    tasks: [],
    gamification: {
      xp: 0,
      streak: 0,
      badges: [],
      level: 1,
      lastLogDate: null
    },
    moodLogs: [],
    currentEnvironment: 'iss'
  };
}

// Initialize the store with default state
let state = getDefaultState();

/**
 * Attempt to load persisted state from db.json on module initialization.
 */
function loadFromFile() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      // Merge with defaults to ensure all keys exist even if db.json is partial
      state = {
        ...getDefaultState(),
        ...parsed,
        gamification: {
          ...getDefaultState().gamification,
          ...(parsed.gamification || {})
        }
      };
      console.log(`[Store] Loaded ${state.healthLogs.length} health logs from db.json`);
    } else {
      console.log('[Store] No db.json found, starting with empty state');
    }
  } catch (err) {
    console.error('[Store] Error loading db.json, starting fresh:', err.message);
    state = getDefaultState();
  }
}

/**
 * Persist current state to db.json.
 * Called automatically after every mutation.
 */
function saveToFile() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Error saving db.json:', err.message);
  }
}

// --- Health Logs ---

function getHealthLogs() {
  return state.healthLogs;
}

function addHealthLog(entry) {
  state.healthLogs.push(entry);
  saveToFile();
  return entry;
}

// --- Alerts ---

function getAlerts() {
  return state.alerts;
}

function addAlert(alert) {
  state.alerts.push(alert);
  saveToFile();
  return alert;
}

function dismissAlert(id) {
  const alert = state.alerts.find(a => a.id === id);
  if (alert) {
    alert.dismissed = true;
    saveToFile();
    return alert;
  }
  return null;
}

// --- Tasks ---

function getTasks() {
  return state.tasks;
}

function setTasks(tasks) {
  state.tasks = tasks;
  saveToFile();
}

function completeTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = true;
    task.completedAt = new Date().toISOString();
    saveToFile();
    return task;
  }
  return null;
}

// --- Mood Logs ---

function getMoodLogs() {
  return state.moodLogs;
}

function addMoodLog(entry) {
  state.moodLogs.push(entry);
  saveToFile();
  return entry;
}

// --- Gamification ---

function getGamification() {
  return state.gamification;
}

function addXP(amount) {
  state.gamification.xp += amount;
  // Level up every 500 XP
  state.gamification.level = Math.floor(state.gamification.xp / 500) + 1;
  saveToFile();
  return state.gamification;
}

function updateStreak(date) {
  const dateStr = typeof date === 'string' ? date.split('T')[0] : new Date(date).toISOString().split('T')[0];
  const lastLog = state.gamification.lastLogDate;

  if (!lastLog) {
    state.gamification.streak = 1;
  } else {
    const lastDate = new Date(lastLog);
    const currentDate = new Date(dateStr);
    const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      state.gamification.streak += 1;
    } else if (diffDays > 1) {
      state.gamification.streak = 1;
    }
    // If diffDays === 0, same day, no streak change
  }

  state.gamification.lastLogDate = dateStr;
  saveToFile();
}

function addBadge(badge) {
  const exists = state.gamification.badges.find(b => b.id === badge.id);
  if (!exists) {
    state.gamification.badges.push({
      ...badge,
      earnedAt: new Date().toISOString()
    });
    saveToFile();
    return true;
  }
  return false;
}

// --- Environment ---

function getCurrentEnvironment() {
  return state.currentEnvironment;
}

function setCurrentEnvironment(envId) {
  state.currentEnvironment = envId;
  saveToFile();
}

// --- Utility ---

function getAll() {
  return { ...state };
}

function resetAll() {
  state = getDefaultState();
  saveToFile();
  return state;
}

// Load persisted data on module initialization
loadFromFile();

module.exports = {
  getHealthLogs,
  addHealthLog,
  getAlerts,
  addAlert,
  dismissAlert,
  getTasks,
  setTasks,
  completeTask,
  getMoodLogs,
  addMoodLog,
  getGamification,
  addXP,
  updateStreak,
  addBadge,
  getCurrentEnvironment,
  setCurrentEnvironment,
  getAll,
  resetAll,
  loadFromFile,
  saveToFile
};
