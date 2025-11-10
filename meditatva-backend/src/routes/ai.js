const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Test and status routes
router.get('/test', aiController.testConnection);
router.get('/status', aiController.getAIStatus);

// Medical AI endpoints
router.post('/medical-advice', aiController.getMedicalAdvice);

// Pharmacy AI endpoints
router.post('/pharmacy-insights', aiController.getPharmacyInsights);

// Meditation AI endpoints
router.post('/meditation-content', aiController.generateMeditationContent);
router.post('/analyze-progress', aiController.analyzeMeditationProgress);
router.post('/mood-insights', aiController.getMoodInsights);

// General chat interface
router.post('/chat', aiController.handleChat);

module.exports = router;
