const express = require('express');
const router = express.Router();

// Placeholder user routes
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'User routes working',
    routes: [
      'GET /profile - Get user profile',
      'PUT /profile - Update user profile',
      'GET /stats - Get user statistics',
      'PUT /preferences - Update user preferences',
      'DELETE /account - Delete user account'
    ]
  });
});

module.exports = router;
