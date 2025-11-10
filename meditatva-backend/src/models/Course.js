const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Course title is required'],
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
  
  // Course Structure
  meditations: [{
    meditation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meditation',
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: 1
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    unlockAfter: {
      type: Number, // Days after course start or previous session completion
      default: 0
    },
    estimatedDuration: {
      type: Number, // In minutes
      required: true
    }
  }],
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['beginner-foundation', 'stress-management', 'sleep-improvement', 'advanced-mindfulness', 'healing-trauma', 'productivity-focus', 'emotional-wellness', 'spiritual-growth']
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
  
  // Course Details
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  duration: {
    estimated: {
      type: Number, // Total estimated duration in days
      required: [true, 'Estimated duration is required'],
      min: [1, 'Duration must be at least 1 day']
    },
    actual: {
      type: Number // Average completion time from users
    }
  },
  intensity: {
    type: String,
    enum: ['light', 'moderate', 'intensive'],
    default: 'moderate'
  },
  pace: {
    type: String,
    enum: ['self-paced', 'structured', 'guided'],
    default: 'self-paced'
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
    expertise: [String],
    credentials: [String]
  },
  
  // Media & Content
  image: {
    url: String,
    public_id: String
  },
  trailer: {
    url: String,
    public_id: String,
    duration: Number
  },
  curriculum: [{
    week: Number,
    title: String,
    description: String,
    learningObjectives: [String],
    meditations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meditation'
    }]
  }],
  
  // Prerequisites & Requirements
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  skillsRequired: [String],
  equipmentNeeded: [String],
  
  // Access Control
  accessLevel: {
    type: String,
    enum: ['free', 'basic', 'premium', 'pro'],
    default: 'free'
  },
  pricing: {
    type: {
      type: String,
      enum: ['free', 'one-time', 'subscription-included'],
      default: 'free'
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Enrollment & Progress
  enrolled: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      completedMeditations: [{
        meditation: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Meditation'
        },
        completedAt: Date,
        rating: {
          type: Number,
          min: 1,
          max: 5
        }
      }],
      currentWeek: {
        type: Number,
        default: 1
      },
      percentComplete: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      lastAccessedAt: {
        type: Date,
        default: Date.now
      }
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'dropped'],
      default: 'active'
    },
    completedAt: Date,
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificateUrl: String
  }],
  
  // Statistics
  stats: {
    totalEnrolled: {
      type: Number,
      default: 0
    },
    totalCompleted: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number // In days
    }
  },
  
  // Reviews & Feedback
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    },
    title: {
      type: String,
      maxlength: [100, 'Review title cannot exceed 100 characters']
    },
    content: {
      type: String,
      maxlength: [1000, 'Review content cannot exceed 1000 characters']
    },
    pros: [String],
    cons: [String],
    wouldRecommend: {
      type: Boolean,
      default: true
    },
    helpful: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isHelpful: Boolean
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Learning Outcomes
  learningOutcomes: [String],
  skills: [String],
  benefits: [String],
  
  // Course Status
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPopular: {
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
  
  // Certificates
  certificate: {
    template: String,
    requirements: {
      minimumCompletion: {
        type: Number,
        default: 80 // 80% completion required for certificate
      },
      timeLimit: Number, // Maximum days to complete for certificate
      assessmentRequired: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // AI & Personalization
  aiPersonalization: {
    adaptivePacing: {
      type: Boolean,
      default: false
    },
    personalizedRecommendations: {
      type: Boolean,
      default: true
    },
    difficultyAdjustment: {
      type: Boolean,
      default: false
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total meditation count
courseSchema.virtual('totalMeditations').get(function() {
  return this.meditations.length;
});

// Virtual for total estimated time
courseSchema.virtual('totalEstimatedTime').get(function() {
  return this.meditations.reduce((total, med) => total + med.estimatedDuration, 0);
});

// Virtual for URL-friendly slug
courseSchema.virtual('url').get(function() {
  return `/courses/${this.slug}`;
});

// Virtual for formatted duration
courseSchema.virtual('formattedDuration').get(function() {
  const days = this.duration.estimated;
  if (days < 7) {
    return `${days} days`;
  }
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  return remainingDays > 0 ? `${weeks}w ${remainingDays}d` : `${weeks} weeks`;
});

// Indexes
courseSchema.index({ category: 1, difficulty: 1 });
courseSchema.index({ 'instructor.user': 1 });
courseSchema.index({ status: 1, publishedAt: -1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ accessLevel: 1 });
courseSchema.index({ 'stats.averageRating': -1, 'stats.totalEnrolled': -1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ isFeatured: 1, isPopular: 1 });

// Text index for search
courseSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  'instructor.name': 'text'
});

// Pre-save middleware to generate slug
courseSchema.pre('save', function(next) {
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

// Pre-save middleware to update stats
courseSchema.pre('save', function(next) {
  this.stats.totalEnrolled = this.enrolled.length;
  this.stats.totalCompleted = this.enrolled.filter(e => e.status === 'completed').length;
  
  if (this.stats.totalEnrolled > 0) {
    this.stats.completionRate = (this.stats.totalCompleted / this.stats.totalEnrolled) * 100;
  }
  
  // Calculate average rating
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.stats.averageRating = totalRating / this.reviews.length;
    this.stats.totalRatings = this.reviews.length;
  }
  
  next();
});

// Method to enroll user
courseSchema.methods.enrollUser = function(userId) {
  const existingEnrollment = this.enrolled.find(e => 
    e.user.toString() === userId.toString()
  );
  
  if (existingEnrollment) {
    throw new Error('User already enrolled in this course');
  }
  
  this.enrolled.push({ user: userId });
  return this.save();
};

// Method to update user progress
courseSchema.methods.updateProgress = function(userId, meditationId, rating = null) {
  const enrollment = this.enrolled.find(e => 
    e.user.toString() === userId.toString()
  );
  
  if (!enrollment) {
    throw new Error('User not enrolled in this course');
  }
  
  // Add completed meditation if not already completed
  const alreadyCompleted = enrollment.progress.completedMeditations.find(cm =>
    cm.meditation.toString() === meditationId.toString()
  );
  
  if (!alreadyCompleted) {
    enrollment.progress.completedMeditations.push({
      meditation: meditationId,
      completedAt: new Date(),
      rating
    });
    
    // Update completion percentage
    enrollment.progress.percentComplete = 
      (enrollment.progress.completedMeditations.length / this.meditations.length) * 100;
    
    // Check if course is completed
    if (enrollment.progress.percentComplete >= (this.certificate?.requirements?.minimumCompletion || 100)) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }
    
    // Update last accessed
    enrollment.progress.lastAccessedAt = new Date();
  }
  
  return this.save();
};

// Method to add review
courseSchema.methods.addReview = function(userId, rating, title, content, pros = [], cons = []) {
  const existingReview = this.reviews.find(r => 
    r.user.toString() === userId.toString()
  );
  
  if (existingReview) {
    throw new Error('User has already reviewed this course');
  }
  
  this.reviews.push({
    user: userId,
    rating,
    title,
    content,
    pros,
    cons
  });
  
  return this.save();
};

// Method to get next meditation for user
courseSchema.methods.getNextMeditation = function(userId) {
  const enrollment = this.enrolled.find(e => 
    e.user.toString() === userId.toString()
  );
  
  if (!enrollment) {
    throw new Error('User not enrolled in this course');
  }
  
  const completedIds = enrollment.progress.completedMeditations.map(cm => 
    cm.meditation.toString()
  );
  
  // Find first uncompleted meditation in order
  for (const courseMeditation of this.meditations.sort((a, b) => a.order - b.order)) {
    if (!completedIds.includes(courseMeditation.meditation.toString())) {
      return courseMeditation;
    }
  }
  
  return null; // All meditations completed
};

// Static method to find popular courses
courseSchema.statics.findPopular = function(limit = 10) {
  return this.find({
    status: 'published',
    isPopular: true
  })
  .sort({ 'stats.totalEnrolled': -1, 'stats.averageRating': -1 })
  .limit(limit)
  .populate('instructor.user', 'firstName lastName profileImage');
};

// Static method to find featured courses
courseSchema.statics.findFeatured = function(limit = 5) {
  return this.find({
    status: 'published',
    isFeatured: true
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .populate('instructor.user', 'firstName lastName profileImage');
};

// Static method to find by category
courseSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({
    category,
    status: 'published'
  })
  .sort({ 'stats.averageRating': -1, 'stats.totalEnrolled': -1 })
  .limit(limit)
  .populate('instructor.user', 'firstName lastName profileImage');
};

// Static method to search courses
courseSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    status: 'published',
    $text: { $search: query }
  };
  
  // Apply filters
  if (filters.category) searchQuery.category = filters.category;
  if (filters.difficulty) searchQuery.difficulty = filters.difficulty;
  if (filters.accessLevel) searchQuery.accessLevel = { $in: filters.accessLevel };
  if (filters.duration) {
    const [min, max] = filters.duration;
    searchQuery['duration.estimated'] = { $gte: min, $lte: max };
  }
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' }, 'stats.averageRating': -1 })
    .populate('instructor.user', 'firstName lastName profileImage');
};

// Static method to get user's enrolled courses
courseSchema.statics.getUserCourses = function(userId) {
  return this.find({
    'enrolled.user': userId,
    status: 'published'
  })
  .populate('meditations.meditation', 'title duration')
  .populate('instructor.user', 'firstName lastName profileImage');
};

module.exports = mongoose.model('Course', courseSchema);
