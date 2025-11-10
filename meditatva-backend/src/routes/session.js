const express = require('express');
const router = express.Router();

// Placeholder session routes
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Session routes working',
    routes: [
      'POST / - Start new session',
      'PUT /:id - Update session',
      'POST /:id/complete - Complete session',
      'GET /user/:userId - Get user sessions',
      'GET /stats - Get session statistics',
      'GET /streak - Get user streak'
    ]
  });
});

module.exports = router;
