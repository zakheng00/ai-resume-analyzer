const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

// POST /api/analyses - Create new analysis
router.post('/', analysisController.createAnalysis);

// GET /api/analyses/:id - Get analysis results
router.get('/:id', analysisController.getAnalysis);

// GET /api/analyses/resume/:resumeId - Get all analyses for a resume
router.get('/resume/:resumeId', analysisController.getAnalysisByResume);

module.exports = router;
