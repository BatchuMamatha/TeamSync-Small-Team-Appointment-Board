const express = require('express');
const cors = require('cors');
const path = require('path');
const appointmentsRouter = require('./routes/appointments');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from /public
const publicPath = path.join(__dirname, '..', '..', 'public');
app.use(express.static(publicPath));

// API routes
app.use('/api/appointments', appointmentsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error occurred.' });
});

module.exports = app;
