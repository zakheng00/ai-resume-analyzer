require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Resume Analyzer API',
    version: '1.0.0',
    endpoints: {
      resumes: '/api/resumes',
      analyses: '/api/analyses',
      health: '/health'
    }
  });
});

// Routes
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/analyses', require('./routes/analysisRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
