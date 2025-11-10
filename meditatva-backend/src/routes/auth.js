const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/demo-login', authController.demoLogin);

// Protected routes (require authentication)
router.use(authenticateToken); // All routes below this middleware require authentication

router.get('/me', authController.getCurrentUser);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

// Health check route
router.get('/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'Auth service is working',
    endpoints: [
      'POST /api/auth/register - User registration',
      'POST /api/auth/login - User login', 
      'POST /api/auth/logout - User logout (protected)',
      'POST /api/auth/refresh-token - Refresh access token',
      'POST /api/auth/demo-login - Demo login for testing',
      'GET /api/auth/me - Get current user (protected)',
      'PUT /api/auth/profile - Update profile (protected)',
      'PUT /api/auth/change-password - Change password (protected)'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
