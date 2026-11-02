// controllers/indicatorsController.js
// Provides metadata and reference guidelines for all monitored health indicators.

const path = require('path');
const indicators = require('../data/indicators.json');

/**
 * GET /api/indicators
 * Returns all indicator definitions including normal/warning ranges,
 * measurement guidelines, spaceflight hazard impacts, and UI icons.
 */
function getAll(req, res, next) {
  try {
    const { category } = req.query;
    if (category) {
      const filtered = indicators.filter(i => i.category === category);
      return res.json(filtered);
    }
    res.json(indicators);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/indicators/:id
 * Returns a single indicator definition by ID.
 */
function getById(req, res, next) {
  try {
    const indicator = indicators.find(i => i.id === req.params.id);
    if (!indicator) {
      return res.status(404).json({ error: `Indicator '${req.params.id}' not found` });
    }
    res.json(indicator);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById
};
