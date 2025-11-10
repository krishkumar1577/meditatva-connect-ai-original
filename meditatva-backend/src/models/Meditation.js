const mongoose = require('mongoose');

const meditationSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Meditation title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['mindfulness', 'sleep', 'stress-relief', 'focus', 'anxiety', 'healing', 'gratitude', 'loving-kindness']
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Content Details
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [120, 'Duration cannot exceed 120 minutes']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  language: {
    type: String,
    default: 'en'
  },
  
  // Media
  audio: {
    url: {
      type: String,
      required: [true, 'Audio URL is required']
    },
    public_id: String,
    duration: Number, // Audio duration in seconds
    format: String
  },
  image: {
    url: String,
    public_id: String
  },
  transcript: {
    type: String,
    maxlength: [10000, 'Transcript cannot exceed 10000 characters']
  },
  
  // Instructor Information
  instructor: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required']
    },
    name: {
      type: String,
      required: [true, 'Instructor name is required']
    },
    bio: String,
    voice: {
      type: String,
      enum: ['male', 'female', 'neutral']
    }
  },
  
  // Subscription Requirements
  accessLevel: {
    type: String,
    enum: ['free', 'basic', 'premium', 'pro'],
    default: 'free'
  },
  
  // Ratings & Reviews
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  
  // Statistics
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    },
    averageCompletionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    popularityScore: {
      type: Number,
      default: 0
    },
    weeklyPlays: {
      type: Number,
      default: 0
    },
    monthlyPlays: {
      type: Number,
      default: 0
    }
  },
  
  // Content Management
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  isFeature: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  
  // SEO
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  
  // Series Information (if part of a series)
  series: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    title: String,
    position: Number // Position in the series
  },
  
  // Prerequisites
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meditation'
  }],
  
  // Related Meditations
  relatedMeditations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meditation'
  }],
  
  // AI Generated Content
  aiGenerated: {
    isAiGenerated: {
      type: Boolean,
      default: false
    },
    aiModel: String,
    promptUsed: String,
    generatedAt: Date
  },
  
  // Mood Enhancement
  moodTargets: [{
    type: String,
    enum: ['stress', 'anxiety', 'depression', 'anger', 'sadness', 'fear', 'overwhelm', 'restlessness']
  }],
  expectedOutcomes: [{
    type: String,
    enum: ['relaxation', 'focus', 'energy', 'peace', 'clarity', 'motivation', 'confidence', 'compassion']
  }],
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for URL-friendly slug
meditationSchema.virtual('url').get(function() {
  return `/meditations/${this.slug}`;
});

// Virtual for formatted duration
meditationSchema.virtual('formattedDuration').get(function() {
  const minutes = this.duration;
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
});

// Indexes
meditationSchema.index({ category: 1, difficulty: 1 });
meditationSchema.index({ 'instructor.user': 1 });
meditationSchema.index({ status: 1, publishedAt: -1 });
meditationSchema.index({ tags: 1 });
meditationSchema.index({ accessLevel: 1 });
meditationSchema.index({ 'ratings.average': -1, 'stats.totalSessions': -1 });
meditationSchema.index({ slug: 1 });
meditationSchema.index({ createdAt: -1 });
meditationSchema.index({ isTrending: 1, isFeature: 1 });

// Text index for search
meditationSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  'instructor.name': 'text'
});

// Pre-save middleware to generate slug
meditationSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add random suffix if needed to ensure uniqueness
    if (this.isNew) {
      const random = Math.random().toString(36).substring(2, 8);
      this.slug += `-${random}`;
    }
  }
  next();
});

// Pre-save middleware to set published date
meditationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Method to add rating
meditationSchema.methods.addRating = function(rating) {
  const oldTotal = this.ratings.average * this.ratings.count;
  this.ratings.count += 1;
  this.ratings.average = (oldTotal + rating) / this.ratings.count;
  
  // Update distribution
  this.ratings.distribution[rating] += 1;
  
  return this.save();
};

// Method to increment session count
meditationSchema.methods.incrementSessions = function(completed = false) {
  this.stats.totalSessions += 1;
  
  if (completed) {
    this.stats.totalCompletions += 1;
  }
  
  // Update completion rate
  this.stats.averageCompletionRate = (this.stats.totalCompletions / this.stats.totalSessions) * 100;
  
  // Update popularity score (simple algorithm)
  this.stats.popularityScore = (this.stats.totalSessions * 0.5) + (this.ratings.average * 20);
  
  return this.save();
};

// Method to update weekly/monthly stats
meditationSchema.methods.updatePeriodStats = function(period = 'week') {
  if (period === 'week') {
    this.stats.weeklyPlays += 1;
  } else if (period === 'month') {
    this.stats.monthlyPlays += 1;
  }
  
  return this.save();
};

// Static method to find trending meditations
meditationSchema.statics.findTrending = function(limit = 10) {
  return this.find({
    status: 'published',
    isTrending: true
  })
  .sort({ 'stats.weeklyPlays': -1, 'ratings.average': -1 })
  .limit(limit);
};

// Static method to find featured meditations
meditationSchema.statics.findFeatured = function(limit = 5) {
  return this.find({
    status: 'published',
    isFeature: true
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

// Static method to find by category
meditationSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({
    category,
    status: 'published'
  })
  .sort({ 'ratings.average': -1, 'stats.totalSessions': -1 })
  .limit(limit);
};

// Static method to search meditations
meditationSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    status: 'published',
    $text: { $search: query }
  };
  
  // Apply filters
  if (filters.category) searchQuery.category = filters.category;
  if (filters.difficulty) searchQuery.difficulty = filters.difficulty;
  if (filters.duration) {
    const [min, max] = filters.duration;
    searchQuery.duration = { $gte: min, $lte: max };
  }
  if (filters.accessLevel) searchQuery.accessLevel = { $in: filters.accessLevel };
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' }, 'ratings.average': -1 });
};

module.exports = mongoose.model('Meditation', meditationSchema);
