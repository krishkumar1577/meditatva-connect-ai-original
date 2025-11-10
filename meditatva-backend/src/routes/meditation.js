const express = require('express');
const router = express.Router();

// Placeholder meditation routes
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Meditation routes working',
    routes: [
      'GET / - Get all meditations',
      'GET /:id - Get meditation by ID',
      'POST / - Create new meditation',
      'PUT /:id - Update meditation',
      'DELETE /:id - Delete meditation',
      'GET /search - Search meditations',
      'GET /categories - Get meditation categories',
      'POST /:id/rate - Rate meditation'
    ]
  });
});

module.exports = router;
