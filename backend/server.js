// server.js
// Main entry point for AstroVitals REST API.
// NASA Space Apps Challenge 2026: Astronaut Health Self-Assessment System.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const healthRoutes = require('./routes/health');
const indicatorRoutes = require('./routes/indicators');
const bodyPartRoutes = require('./routes/bodyParts');
const alertRoutes = require('./routes/alerts');
const taskRoutes = require('./routes/tasks');
const demoRoutes = require('./routes/demo');
const moodRoutes = require('./routes/mood');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/indicators', indicatorRoutes);
app.use('/api/body-parts', bodyPartRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/mood', moodRoutes);

// Health check endpoint
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'online',
    service: 'AstroVitals Backend API',
    missionTime: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Path '${req.originalUrl}' not found on this spacecraft server.` });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AstroVitals Medical Gateway listening on port ${PORT}`);
  console.log(`📡 Ready for astronaut telemetry on http://localhost:${PORT}/api`);
});

module.exports = app;
