const aiService = require('../services/aiService');
const { body, validationResult } = require('express-validator');

/**
 * AI Controller - Handles all AI-related endpoints
 * Integrates with Gemini AI for various healthcare and wellness use cases
 */

/**
 * Test AI connection and capabilities
 */
const testConnection = async (req, res) => {
  try {
    const result = await aiService.testConnection();
    
    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'AI connection successful',
        data: result,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'error',
        message: 'AI connection failed',
        error: result.error,
        configured: result.configured,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ AI connection test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during AI test',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get medical advice based on symptoms
 * POST /api/ai/medical-advice
 */
const getMedicalAdvice = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { symptoms, language } = req.body;

    // Generate medical advice
    const result = await aiService.getMedicalAdvice(symptoms, language);

    // Log the request (without sensitive data)
    console.log(`📋 Medical advice requested: ${symptoms.substring(0, 50)}...`);

    res.status(200).json({
      status: 'success',
      message: 'Medical advice generated successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Medical advice generation failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate medical advice',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get pharmacy business insights
 * POST /api/ai/pharmacy-insights
 */
const getPharmacyInsights = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { query, businessData } = req.body;

    const result = await aiService.getPharmacyInsights(query, businessData);

    console.log(`💼 Pharmacy insights requested: ${query.substring(0, 50)}...`);

    res.status(200).json({
      status: 'success',
      message: 'Pharmacy insights generated successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Pharmacy insights generation failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate pharmacy insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Generate meditation content
 * POST /api/ai/meditation-content
 */
const generateMeditationContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { preferences, contentType } = req.body;

    const result = await aiService.generateMeditationContent(preferences, contentType);

    console.log(`🧘 Meditation content generated: ${contentType} for ${preferences?.duration || 'default'} duration`);

    res.status(200).json({
      status: 'success',
      message: 'Meditation content generated successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Meditation content generation failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate meditation content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Analyze meditation progress
 * POST /api/ai/analyze-progress
 */
const analyzeMeditationProgress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { progressData } = req.body;

    const result = await aiService.analyzeMeditationProgress(progressData);

    console.log(`📊 Progress analysis completed for user with ${progressData?.sessionsCount || 0} sessions`);

    res.status(200).json({
      status: 'success',
      message: 'Progress analysis completed successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Progress analysis failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get mood insights and recommendations
 * POST /api/ai/mood-insights
 */
const getMoodInsights = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { moodData } = req.body;

    const result = await aiService.getMoodInsights(moodData);

    console.log(`😊 Mood insights generated for ${moodData?.entries?.length || 0} mood entries`);

    res.status(200).json({
      status: 'success',
      message: 'Mood insights generated successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Mood insights generation failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate mood insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Handle chat conversations with AI
 * POST /api/ai/chat
 */
const handleChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { message, context, sessionId } = req.body;

    // Determine the type of assistance needed based on context
    let result;
    switch (context?.type) {
      case 'medical':
        result = await aiService.getMedicalAdvice(message, context.language);
        break;
      case 'pharmacy':
        result = await aiService.getPharmacyInsights(message, context.businessData);
        break;
      case 'meditation':
        result = await aiService.generateMeditationContent(
          { context: message, ...context.preferences }, 
          'guide'
        );
        break;
      default:
        // Default to medical advice for general health queries
        result = await aiService.getMedicalAdvice(message);
        break;
    }

    // Store conversation in session if sessionId provided
    // TODO: Implement session storage for conversation history

    console.log(`💬 Chat handled - Type: ${context?.type || 'general'}, Session: ${sessionId || 'none'}`);

    res.status(200).json({
      status: 'success',
      message: 'Chat response generated successfully',
      data: {
        response: result.advice || result.insights || result.content,
        sessionId: sessionId,
        context: context,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Chat handling failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process chat message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get AI service status and capabilities
 * GET /api/ai/status
 */
const getAIStatus = async (req, res) => {
  try {
    const connectionTest = await aiService.testConnection();
    
    const status = {
      service: 'MediTatva AI Service',
      version: '1.0.0',
      model: 'gemini-2.0-flash',
      capabilities: [
        'Medical advice and symptom analysis',
        'Pharmacy business insights',
        'Meditation content generation',
        'Progress analysis and recommendations',
        'Mood insights and wellness guidance',
        'Multi-language support'
      ],
      connection: connectionTest,
      endpoints: [
        'GET /api/ai/status - Service status',
        'GET /api/ai/test - Connection test',
        'POST /api/ai/medical-advice - Medical advice',
        'POST /api/ai/pharmacy-insights - Pharmacy insights',
        'POST /api/ai/meditation-content - Meditation content',
        'POST /api/ai/analyze-progress - Progress analysis',
        'POST /api/ai/mood-insights - Mood insights',
        'POST /api/ai/chat - General chat interface'
      ],
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      status: 'success',
      data: status
    });

  } catch (error) {
    console.error('❌ AI status check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get AI service status',
      timestamp: new Date().toISOString()
    });
  }
};

// Validation middleware
const validateMedicalAdvice = [
  body('symptoms')
    .notEmpty()
    .withMessage('Symptoms description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Symptoms must be between 10-1000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string')
];

const validatePharmacyInsights = [
  body('query')
    .notEmpty()
    .withMessage('Query is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Query must be between 10-500 characters'),
  body('businessData')
    .optional()
    .isObject()
    .withMessage('Business data must be an object')
];

const validateMeditationContent = [
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object'),
  body('contentType')
    .optional()
    .isIn(['script', 'guide', 'plan'])
    .withMessage('Content type must be script, guide, or plan')
];

const validateProgressAnalysis = [
  body('progressData')
    .isObject()
    .withMessage('Progress data must be an object')
    .notEmpty()
    .withMessage('Progress data is required')
];

const validateMoodInsights = [
  body('moodData')
    .isObject()
    .withMessage('Mood data must be an object')
    .notEmpty()
    .withMessage('Mood data is required')
];

const validateChat = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1-1000 characters'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  body('sessionId')
    .optional()
    .isString()
    .withMessage('Session ID must be a string')
];

module.exports = {
  testConnection,
  getMedicalAdvice: [validateMedicalAdvice, getMedicalAdvice],
  getPharmacyInsights: [validatePharmacyInsights, getPharmacyInsights],
  generateMeditationContent: [validateMeditationContent, generateMeditationContent],
  analyzeMeditationProgress: [validateProgressAnalysis, analyzeMeditationProgress],
  getMoodInsights: [validateMoodInsights, getMoodInsights],
  handleChat: [validateChat, handleChat],
  getAIStatus
};
