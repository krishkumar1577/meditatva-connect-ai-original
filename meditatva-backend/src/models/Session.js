const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // User and Meditation Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  meditation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meditation',
    required: [true, 'Meditation is required']
  },
  
  // Session Details
  startedAt: {
    type: Date,
    required: [true, 'Start time is required'],
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  duration: {
    planned: {
      type: Number,
      required: [true, 'Planned duration is required'],
      min: [1, 'Duration must be at least 1 minute']
    },
    actual: {
      type: Number,
      min: [0, 'Actual duration cannot be negative']
    }
  },
  
  // Completion Status
  status: {
    type: String,
    enum: ['started', 'paused', 'completed', 'abandoned'],
    default: 'started'
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Mood Tracking
  moodBefore: {
    type: Number,
    min: [1, 'Mood rating must be between 1 and 10'],
    max: [10, 'Mood rating must be between 1 and 10']
  },
  moodAfter: {
    type: Number,
    min: [1, 'Mood rating must be between 1 and 10'],
    max: [10, 'Mood rating must be between 1 and 10']
  },
  emotionsBefore: [{
    emotion: {
      type: String,
      enum: ['happy', 'sad', 'anxious', 'stressed', 'calm', 'angry', 'excited', 'tired', 'focused', 'overwhelmed']
    },
    intensity: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  emotionsAfter: [{
    emotion: {
      type: String,
      enum: ['happy', 'sad', 'anxious', 'stressed', 'calm', 'angry', 'excited', 'tired', 'focused', 'overwhelmed']
    },
    intensity: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Session Notes
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    trim: true
  },
  experience: {
    quality: {
      type: Number,
      min: 1,
      max: 5 // 1 = Poor, 5 = Excellent
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5 // 1 = Very Easy, 5 = Very Hard
    },
    focus: {
      type: Number,
      min: 1,
      max: 5 // 1 = Very Distracted, 5 = Very Focused
    }
  },
  
  // Environmental Context
  environment: {
    location: {
      type: String,
      enum: ['home', 'office', 'outdoors', 'commute', 'gym', 'other'],
      default: 'home'
    },
    noise_level: {
      type: String,
      enum: ['silent', 'quiet', 'moderate', 'noisy'],
      default: 'quiet'
    },
    time_of_day: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    }
  },
  
  // Device & Technical Info
  deviceInfo: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'smart_speaker']
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web', 'alexa', 'google_home']
    },
    appVersion: String
  },
  
  // Session Interruptions
  interruptions: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['pause', 'background', 'notification', 'call', 'manual']
    },
    duration: Number // seconds
  }],
  
  // Achievements & Streaks
  achievements: [{
    type: {
      type: String,
      enum: ['first_session', 'streak_7', 'streak_30', 'streak_100', 'milestone_10h', 'milestone_50h', 'daily_goal']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Goals & Intentions
  intention: {
    type: String,
    maxlength: [200, 'Intention cannot exceed 200 characters'],
    trim: true
  },
  goalProgress: {
    dailyGoalMet: {
      type: Boolean,
      default: false
    },
    weeklyGoalProgress: Number, // percentage
    monthlyGoalProgress: Number // percentage
  },
  
  // Rating & Feedback
  rating: {
    meditation: {
      type: Number,
      min: 1,
      max: 5
    },
    instructor: {
      type: Number,
      min: 1,
      max: 5
    },
    audio_quality: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  feedback: {
    type: String,
    maxlength: [500, 'Feedback cannot exceed 500 characters'],
    trim: true
  },
  
  // Social Features
  isShared: {
    type: Boolean,
    default: false
  },
  sharedAt: Date,
  socialNote: {
    type: String,
    maxlength: [280, 'Social note cannot exceed 280 characters']
  },
  
  // Analytics
  analytics: {
    heartRateVariability: Number, // If integrated with wearables
    stressLevel: Number,
    focusScore: Number,
    progressScore: Number
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for mood improvement
sessionSchema.virtual('moodImprovement').get(function() {
  if (this.moodBefore && this.moodAfter) {
    return this.moodAfter - this.moodBefore;
  }
  return null;
});

// Virtual for session duration in minutes
sessionSchema.virtual('durationMinutes').get(function() {
  if (this.duration.actual) {
    return Math.round(this.duration.actual / 60);
  }
  return this.duration.planned;
});

// Virtual for session date
sessionSchema.virtual('sessionDate').get(function() {
  return this.startedAt.toDateString();
});

// Indexes
sessionSchema.index({ user: 1, startedAt: -1 });
sessionSchema.index({ meditation: 1, completedAt: -1 });
sessionSchema.index({ user: 1, meditation: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ startedAt: -1 });
sessionSchema.index({ 'goalProgress.dailyGoalMet': 1 });

// Pre-save middleware to calculate completion percentage
sessionSchema.pre('save', function(next) {
  if (this.duration.actual && this.duration.planned) {
    this.completionPercentage = Math.min(
      Math.round((this.duration.actual / (this.duration.planned * 60)) * 100),
      100
    );
    
    // Update status based on completion
    if (this.completionPercentage >= 80) {
      this.status = 'completed';
    } else if (this.completionPercentage > 0) {
      this.status = 'paused';
    }
  }
  next();
});

// Pre-save middleware to set time of day
sessionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('startedAt')) {
    const hour = this.startedAt.getHours();
    
    if (hour >= 5 && hour < 12) {
      this.environment.time_of_day = 'morning';
    } else if (hour >= 12 && hour < 17) {
      this.environment.time_of_day = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      this.environment.time_of_day = 'evening';
    } else {
      this.environment.time_of_day = 'night';
    }
  }
  next();
});

// Method to complete session
sessionSchema.methods.complete = function(actualDuration) {
  this.completedAt = new Date();
  this.duration.actual = actualDuration;
  this.status = 'completed';
  
  return this.save();
};

// Method to pause session
sessionSchema.methods.pause = function() {
  const now = new Date();
  const pauseDuration = Math.floor((now - this.startedAt) / 1000);
  
  this.interruptions.push({
    type: 'pause',
    duration: pauseDuration,
    timestamp: now
  });
  
  this.status = 'paused';
  return this.save();
};

// Method to add interruption
sessionSchema.methods.addInterruption = function(type, duration) {
  this.interruptions.push({
    type,
    duration,
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to add rating
sessionSchema.methods.addRating = function(ratings) {
  this.rating = { ...this.rating, ...ratings };
  return this.save();
};

// Static method to get user session stats
sessionSchema.statics.getUserStats = function(userId, period = 'month') {
  const startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        startedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalMinutes: { $sum: '$duration.actual' },
        averageMoodBefore: { $avg: '$moodBefore' },
        averageMoodAfter: { $avg: '$moodAfter' },
        averageRating: { $avg: '$rating.meditation' }
      }
    }
  ]);
};

// Static method to get meditation session stats
sessionSchema.statics.getMeditationStats = function(meditationId) {
  return this.aggregate([
    {
      $match: {
        meditation: mongoose.Types.ObjectId(meditationId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        averageCompletionRate: { $avg: '$completionPercentage' },
        averageRating: { $avg: '$rating.meditation' },
        averageMoodImprovement: {
          $avg: { $subtract: ['$moodAfter', '$moodBefore'] }
        }
      }
    }
  ]);
};

// Static method to get daily session count for streak calculation
sessionSchema.statics.getDailySessionCounts = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        status: 'completed',
        startedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$startedAt'
          }
        },
        sessionCount: { $sum: 1 },
        totalMinutes: { $sum: '$duration.actual' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

module.exports = mongoose.model('Session', sessionSchema);
