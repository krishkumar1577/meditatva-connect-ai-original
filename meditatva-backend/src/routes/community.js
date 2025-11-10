const express = require('express');
const router = express.Router();

// Placeholder community routes
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Community routes working',
    routes: [
      'GET /posts - Get community posts',
      'POST /posts - Create new post',
      'GET /posts/:id - Get post by ID',
      'PUT /posts/:id - Update post',
      'DELETE /posts/:id - Delete post',
      'POST /posts/:id/like - Like/unlike post',
      'POST /posts/:id/comment - Add comment',
      'GET /feed - Get personalized feed'
    ]
  });
});

module.exports = router;
