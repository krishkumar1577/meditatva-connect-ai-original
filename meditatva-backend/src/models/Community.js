const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  // Post Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  
  // Post Content
  content: {
    text: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [2000, 'Post content cannot exceed 2000 characters']
    },
    media: [{
      type: {
        type: String,
        enum: ['image', 'audio', 'video'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      public_id: String,
      thumbnail: String, // For videos
      duration: Number, // For audio/video in seconds
      caption: {
        type: String,
        maxlength: [200, 'Media caption cannot exceed 200 characters']
      }
    }],
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String,
      position: {
        start: Number,
        end: Number
      }
    }]
  },
  
  // Post Type & Category
  type: {
    type: String,
    enum: ['text', 'image', 'audio', 'meditation_share', 'progress_share', 'question', 'inspiration', 'challenge'],
    required: [true, 'Post type is required'],
    default: 'text'
  },
  category: {
    type: String,
    enum: ['general', 'meditation_tips', 'progress', 'support', 'inspiration', 'challenges', 'events', 'resources'],
    default: 'general'
  },
  
  // Tags & Topics
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Related Content
  relatedMeditation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meditation'
  },
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [300, 'Reply cannot exceed 300 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    shareNote: {
      type: String,
      maxlength: [200, 'Share note cannot exceed 200 characters']
    }
  }],
  
  // Stats
  stats: {
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    sharesCount: {
      type: Number,
      default: 0
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    engagementScore: {
      type: Number,
      default: 0
    }
  },
  
  // Moderation
  isReported: {
    type: Boolean,
    default: false
  },
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'misinformation', 'other'],
      required: true
    },
    description: {
      type: String,
      maxlength: [500, 'Report description cannot exceed 500 characters']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    }
  }],
  
  // Privacy & Visibility
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  
  // Location (optional)
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    country: String,
    city: String
  },
  
  // Challenge or Event Related
  challenge: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    title: String,
    progress: Number // percentage
  },
  event: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    title: String
  },
  
  // Post Status
  status: {
    type: String,
    enum: ['published', 'hidden', 'deleted'],
    default: 'published'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  deletedAt: Date,
  
  // Trending & Featured
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  featuredAt: Date,
  
  // AI Content Detection
  aiContentDetection: {
    isAiGenerated: {
      type: Boolean,
      default: false
    },
    confidence: Number, // 0-1
    checkedAt: Date
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time since posted
communitySchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

// Virtual for like status
communitySchema.virtual('isLiked').get(function() {
  if (!this.currentUserId) return false;
  return this.likes.some(like => like.user.toString() === this.currentUserId.toString());
});

// Virtual for user's comment count
communitySchema.virtual('userCommentCount').get(function() {
  if (!this.currentUserId) return 0;
  return this.comments.filter(comment => 
    comment.author.toString() === this.currentUserId.toString()
  ).length;
});

// Indexes
communitySchema.index({ author: 1, createdAt: -1 });
communitySchema.index({ category: 1, createdAt: -1 });
communitySchema.index({ type: 1, visibility: 1 });
communitySchema.index({ tags: 1 });
communitySchema.index({ 'stats.engagementScore': -1 });
communitySchema.index({ isTrending: 1, isFeatured: 1 });
communitySchema.index({ status: 1, createdAt: -1 });
communitySchema.index({ 'location.coordinates': '2dsphere' });

// Text index for search
communitySchema.index({
  'content.text': 'text',
  tags: 'text'
}, {
  weights: {
    'content.text': 10,
    tags: 5
  }
});

// Compound index for feed queries
communitySchema.index({ 
  visibility: 1, 
  status: 1, 
  createdAt: -1 
});

// Pre-save middleware to update stats
communitySchema.pre('save', function(next) {
  this.stats.likesCount = this.likes.length;
  this.stats.commentsCount = this.comments.length;
  this.stats.sharesCount = this.shares.length;
  
  // Calculate engagement score
  this.stats.engagementScore = (
    this.stats.likesCount * 1 +
    this.stats.commentsCount * 3 +
    this.stats.sharesCount * 5 +
    this.stats.viewsCount * 0.1
  );
  
  next();
});

// Pre-save middleware to set edited flag
communitySchema.pre('save', function(next) {
  if (this.isModified('content.text') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Method to add like
communitySchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.likes.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to remove like
communitySchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => 
    like.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to add comment
communitySchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content.trim()
  });
  
  return this.save();
};

// Method to edit comment
communitySchema.methods.editComment = function(commentId, newContent) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.content = newContent.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    return this.save();
  }
  
  throw new Error('Comment not found');
};

// Method to delete comment
communitySchema.methods.deleteComment = function(commentId) {
  this.comments.pull(commentId);
  return this.save();
};

// Method to add reply to comment
communitySchema.methods.addReply = function(commentId, authorId, content) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.replies.push({
      author: authorId,
      content: content.trim()
    });
    return this.save();
  }
  
  throw new Error('Comment not found');
};

// Method to add share
communitySchema.methods.addShare = function(userId, shareNote = '') {
  this.shares.push({
    user: userId,
    shareNote: shareNote.trim()
  });
  
  return this.save();
};

// Method to increment view count
communitySchema.methods.incrementViews = function() {
  this.stats.viewsCount += 1;
  return this.save();
};

// Method to report post
communitySchema.methods.addReport = function(reporterId, reason, description = '') {
  this.reports.push({
    reporter: reporterId,
    reason,
    description: description.trim()
  });
  
  this.isReported = true;
  return this.save();
};

// Static method to get trending posts
communitySchema.statics.findTrending = function(limit = 20) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return this.find({
    status: 'published',
    visibility: 'public',
    createdAt: { $gte: oneDayAgo }
  })
  .sort({ 'stats.engagementScore': -1 })
  .limit(limit)
  .populate('author', 'firstName lastName profileImage')
  .populate('comments.author', 'firstName lastName profileImage');
};

// Static method to get featured posts
communitySchema.statics.findFeatured = function(limit = 10) {
  return this.find({
    status: 'published',
    visibility: 'public',
    isFeatured: true
  })
  .sort({ featuredAt: -1 })
  .limit(limit)
  .populate('author', 'firstName lastName profileImage');
};

// Static method to get user feed
communitySchema.statics.getFeed = function(userId, followingIds = [], page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    status: 'published',
    $or: [
      { visibility: 'public' },
      { author: { $in: [userId, ...followingIds] } }
    ]
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('author', 'firstName lastName profileImage')
  .populate('relatedMeditation', 'title duration category')
  .populate('comments.author', 'firstName lastName profileImage');
};

// Static method to search posts
communitySchema.statics.searchPosts = function(query, filters = {}) {
  const searchQuery = {
    status: 'published',
    visibility: 'public',
    $text: { $search: query }
  };
  
  // Apply filters
  if (filters.category) searchQuery.category = filters.category;
  if (filters.type) searchQuery.type = filters.type;
  if (filters.tags && filters.tags.length) {
    searchQuery.tags = { $in: filters.tags };
  }
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' }, 'stats.engagementScore': -1 })
    .populate('author', 'firstName lastName profileImage');
};

// Static method to get posts by category
communitySchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({
    category,
    status: 'published',
    visibility: 'public'
  })
  .sort({ 'stats.engagementScore': -1 })
  .limit(limit)
  .populate('author', 'firstName lastName profileImage');
};

module.exports = mongoose.model('Community', communitySchema);
