const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Date and Time
  logDate: {
    type: Date,
    required: [true, 'Log date is required'],
    default: Date.now
  },
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    required: [true, 'Time of day is required']
  },
  
  // Primary Mood Rating
  mood: {
    type: Number,
    required: [true, 'Mood rating is required'],
    min: [1, 'Mood rating must be between 1 and 10'],
    max: [10, 'Mood rating must be between 1 and 10']
  },
  
  // Detailed Emotions
  emotions: [{
    emotion: {
      type: String,
      enum: [
        'happy', 'joyful', 'content', 'peaceful', 'excited', 'optimistic',
        'sad', 'depressed', 'melancholy', 'grief', 'disappointed',
        'angry', 'frustrated', 'irritated', 'rage', 'resentful',
        'anxious', 'worried', 'nervous', 'fearful', 'panic',
        'stressed', 'overwhelmed', 'pressured', 'tense',
        'calm', 'relaxed', 'serene', 'tranquil',
        'focused', 'clear', 'motivated', 'determined',
        'tired', 'exhausted', 'fatigued', 'drained',
        'confused', 'uncertain', 'lost', 'indecisive',
        'grateful', 'blessed', 'appreciative',
        'lonely', 'isolated', 'disconnected',
        'confident', 'empowered', 'strong',
        'vulnerable', 'insecure', 'weak'
      ],
      required: true
    },
    intensity: {
      type: Number,
      min: [1, 'Emotion intensity must be between 1 and 5'],
      max: [5, 'Emotion intensity must be between 1 and 5'],
      required: true
    }
  }],
  
  // Physical Wellness
  physical: {
    energyLevel: {
      type: Number,
      min: [1, 'Energy level must be between 1 and 10'],
      max: [10, 'Energy level must be between 1 and 10']
    },
    stressLevel: {
      type: Number,
      min: [1, 'Stress level must be between 1 and 10'],
      max: [10, 'Stress level must be between 1 and 10']
    },
    sleepQuality: {
      type: Number,
      min: [1, 'Sleep quality must be between 1 and 10'],
      max: [10, 'Sleep quality must be between 1 and 10']
    },
    sleepHours: {
      type: Number,
      min: [0, 'Sleep hours cannot be negative'],
      max: [24, 'Sleep hours cannot exceed 24']
    },
    physicalSymptoms: [{
      type: String,
      enum: [
        'headache', 'muscle_tension', 'fatigue', 'nausea', 'dizziness',
        'heart_palpitations', 'shortness_of_breath', 'stomach_issues',
        'back_pain', 'joint_pain', 'restlessness', 'trembling'
      ]
    }]
  },
  
  // Activities & Lifestyle
  activities: [{
    type: String,
    enum: [
      'meditation', 'exercise', 'yoga', 'walking', 'running',
      'reading', 'music', 'socializing', 'work', 'studying',
      'cooking', 'cleaning', 'gaming', 'tv_watching', 'shopping',
      'nature', 'therapy', 'journaling', 'creative_work', 'volunteering'
    ]
  }],
  
  // Triggers & Influences
  triggers: [{
    type: String,
    enum: [
      'work_stress', 'relationship_issues', 'financial_worry', 'health_concerns',
      'family_problems', 'social_media', 'news', 'weather', 'hormones',
      'lack_of_sleep', 'poor_diet', 'lack_of_exercise', 'isolation',
      'major_life_change', 'deadline_pressure', 'conflict', 'rejection'
    ]
  }],
  
  // Environmental Context
  environment: {
    weather: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'foggy']
    },
    location: {
      type: String,
      enum: ['home', 'office', 'outdoors', 'social_setting', 'transport', 'other']
    },
    socialContext: {
      type: String,
      enum: ['alone', 'with_family', 'with_friends', 'with_colleagues', 'in_crowd', 'with_partner']
    }
  },
  
  // Notes & Reflections
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    trim: true
  },
  gratitude: [{
    type: String,
    maxlength: [200, 'Gratitude entry cannot exceed 200 characters'],
    trim: true
  }],
  intentions: {
    type: String,
    maxlength: [500, 'Intentions cannot exceed 500 characters'],
    trim: true
  },
  
  // Goals & Aspirations
  goals: {
    dailyGoals: [{
      goal: String,
      completed: {
        type: Boolean,
        default: false
      }
    }],
    moodGoal: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  
  // Medication & Supplements
  medication: [{
    name: String,
    dosage: String,
    timeTaken: Date,
    effectiveness: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Therapy & Treatment
  therapy: {
    hadSession: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['individual', 'group', 'family', 'couples', 'online']
    },
    effectiveness: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String
  },
  
  // Related Session
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  
  // Privacy Settings
  isPrivate: {
    type: Boolean,
    default: true
  },
  
  // Tags for organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for mood category
moodLogSchema.virtual('moodCategory').get(function() {
  if (this.mood >= 8) return 'excellent';
  if (this.mood >= 6) return 'good';
  if (this.mood >= 4) return 'neutral';
  if (this.mood >= 2) return 'poor';
  return 'very_poor';
});

// Virtual for dominant emotion
moodLogSchema.virtual('dominantEmotion').get(function() {
  if (!this.emotions.length) return null;
  
  return this.emotions.reduce((prev, current) => 
    (prev.intensity > current.intensity) ? prev : current
  );
});

// Virtual for stress category
moodLogSchema.virtual('stressCategory').get(function() {
  if (!this.physical.stressLevel) return null;
  
  if (this.physical.stressLevel >= 8) return 'high';
  if (this.physical.stressLevel >= 6) return 'moderate';
  if (this.physical.stressLevel >= 4) return 'mild';
  return 'low';
});

// Indexes
moodLogSchema.index({ user: 1, logDate: -1 });
moodLogSchema.index({ user: 1, timeOfDay: 1 });
moodLogSchema.index({ mood: 1 });
moodLogSchema.index({ 'physical.stressLevel': 1 });
moodLogSchema.index({ tags: 1 });
moodLogSchema.index({ createdAt: -1 });

// Ensure one log per user per time period per day
moodLogSchema.index(
  { user: 1, logDate: 1, timeOfDay: 1 },
  { unique: true }
);

// Pre-save middleware to set time of day if not provided
moodLogSchema.pre('save', function(next) {
  if (!this.timeOfDay && this.logDate) {
    const hour = this.logDate.getHours();
    
    if (hour >= 5 && hour < 12) {
      this.timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      this.timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      this.timeOfDay = 'evening';
    } else {
      this.timeOfDay = 'night';
    }
  }
  next();
});

// Method to calculate mood trend
moodLogSchema.methods.calculateTrend = async function(days = 7) {
  const startDate = new Date(this.logDate);
  startDate.setDate(startDate.getDate() - days);
  
  const logs = await this.constructor.find({
    user: this.user,
    logDate: { $gte: startDate, $lte: this.logDate }
  }).sort({ logDate: 1 });
  
  if (logs.length < 2) return null;
  
  const moods = logs.map(log => log.mood);
  const trend = moods[moods.length - 1] - moods[0];
  
  return {
    trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
    change: trend,
    average: moods.reduce((a, b) => a + b, 0) / moods.length
  };
};

// Static method to get user mood patterns
moodLogSchema.statics.getUserMoodPatterns = function(userId, period = 'month') {
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
  }
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        logDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          timeOfDay: '$timeOfDay',
          dayOfWeek: { $dayOfWeek: '$logDate' }
        },
        averageMood: { $avg: '$mood' },
        averageStress: { $avg: '$physical.stressLevel' },
        averageEnergy: { $avg: '$physical.energyLevel' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.dayOfWeek': 1, '_id.timeOfDay': 1 }
    }
  ]);
};

// Static method to get mood correlations with activities
moodLogSchema.statics.getMoodActivityCorrelations = function(userId) {
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        activities: { $exists: true, $not: { $size: 0 } }
      }
    },
    {
      $unwind: '$activities'
    },
    {
      $group: {
        _id: '$activities',
        averageMood: { $avg: '$mood' },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gte: 3 } } // Only include activities with at least 3 entries
    },
    {
      $sort: { averageMood: -1 }
    }
  ]);
};

// Static method to get mood trends
moodLogSchema.statics.getMoodTrends = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        logDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$logDate'
          }
        },
        averageMood: { $avg: '$mood' },
        averageStress: { $avg: '$physical.stressLevel' },
        averageEnergy: { $avg: '$physical.energyLevel' },
        entries: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

// Static method to identify triggers
moodLogSchema.statics.identifyTriggers = function(userId) {
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        triggers: { $exists: true, $not: { $size: 0 } },
        mood: { $lte: 4 } // Low mood entries only
      }
    },
    {
      $unwind: '$triggers'
    },
    {
      $group: {
        _id: '$triggers',
        frequency: { $sum: 1 },
        averageMoodWhenPresent: { $avg: '$mood' }
      }
    },
    {
      $sort: { frequency: -1 }
    }
  ]);
};

module.exports = mongoose.model('MoodLog', moodLogSchema);
