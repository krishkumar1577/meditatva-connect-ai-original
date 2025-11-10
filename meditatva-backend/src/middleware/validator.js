const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// User registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  
  body('role')
    .optional()
    .isIn(['patient', 'user', 'pharmacy', 'instructor', 'admin'])
    .withMessage('Invalid role'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date of birth'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// New password validation
const validateNewPassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date of birth'),
  
  body('preferences.meditationStyles')
    .optional()
    .isArray()
    .withMessage('Meditation styles must be an array'),
  
  body('preferences.sessionDuration')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Session duration must be between 1 and 120 minutes'),
  
  handleValidationErrors
];

// Meditation creation validation
const validateMeditation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .isIn(['mindfulness', 'sleep', 'stress-relief', 'focus', 'anxiety', 'healing', 'gratitude', 'loving-kindness'])
    .withMessage('Invalid category'),
  
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('duration')
    .isInt({ min: 1, max: 120 })
    .withMessage('Duration must be between 1 and 120 minutes'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  handleValidationErrors
];

// Session tracking validation
const validateSession = [
  body('meditationId')
    .isMongoId()
    .withMessage('Invalid meditation ID'),
  
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  
  body('completedAt')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid completion date'),
  
  body('moodBefore')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood before must be between 1 and 10'),
  
  body('moodAfter')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood after must be between 1 and 10'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  
  handleValidationErrors
];

// Mood log validation
const validateMoodLog = [
  body('mood')
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood must be between 1 and 10'),
  
  body('emotions')
    .optional()
    .isArray()
    .withMessage('Emotions must be an array'),
  
  body('sleepHours')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep hours must be between 0 and 24'),
  
  body('stressLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Stress level must be between 1 and 10'),
  
  body('energyLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy level must be between 1 and 10'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  
  handleValidationErrors
];

// Community post validation
const validateCommunityPost = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content is required and must be less than 2000 characters'),
  
  body('type')
    .isIn(['text', 'image', 'audio'])
    .withMessage('Invalid post type'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  handleValidationErrors
];

// Comment validation
const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment content is required and must be less than 500 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateNewPassword,
  validateProfileUpdate,
  validateMeditation,
  validateSession,
  validateMoodLog,
  validateCommunityPost,
  validateComment,
  handleValidationErrors,
};
