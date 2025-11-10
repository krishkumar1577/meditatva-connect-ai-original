const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  dateOfBirth: {
    type: Date
  },
  profileImage: {
    url: String,
    public_id: String
  },
  
  // Authentication & Security
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  refreshToken: String,
  
  // Role & Subscription
  role: {
    type: String,
    enum: ['patient', 'user', 'pharmacy', 'instructor', 'admin'],
    default: 'patient'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'pro'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'inactive'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  
  // Preferences
  preferences: {
    meditationStyles: [{
      type: String,
      enum: ['mindfulness', 'sleep', 'stress-relief', 'focus', 'anxiety', 'healing', 'gratitude', 'loving-kindness']
    }],
    sessionDuration: {
      type: Number,
      default: 10, // minutes
      min: [1, 'Session duration must be at least 1 minute'],
      max: [120, 'Session duration cannot exceed 120 minutes']
    },
    reminderTime: String, // Format: "HH:MM"
    enableNotifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  
  // Statistics & Progress
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalMinutesMeditated: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastMeditationDate: Date,
    level: {
      type: Number,
      default: 1
    },
    experiencePoints: {
      type: Number,
      default: 0
    }
  },
  
  // Pharmacy Details (for pharmacy users)
  pharmacyDetails: {
    isPharmacy: { type: Boolean, default: false },
    pharmacyName: String,
    licenseNumber: String,
    location: {
      type: { 
        type: String, 
        enum: ['Point'],
        required: function() { return this.isPharmacy; }
      },
      coordinates: { 
        type: [Number],
        required: function() { return this.isPharmacy; },
        validate: {
          validator: function(v) {
            return !this.isPharmacy || (Array.isArray(v) && v.length === 2);
          },
          message: 'Coordinates must be an array of [longitude, latitude]'
        }
      }, // [longitude, latitude]
      address: String,
      city: String,
      pincode: String,
      landmark: String
    },
    openingHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
    },
    services: {
      homeDelivery: { type: Boolean, default: false },
      deliveryRadius: { type: Number, default: 5 }, // km
      emergencyService: { type: Boolean, default: false },
      prescriptionRequired: { type: Boolean, default: true }
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalResponses: { type: Number, default: 0 },
    totalCompletedOrders: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // minutes
    specializations: [String], // e.g., ['diabetes', 'cardiology', 'pediatrics']
    verified: { type: Boolean, default: false }
  },

  // Contact Information  
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },

  // Social Features
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    showProgress: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: Boolean,
      default: true
    }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  return Math.floor((Date.now() - this.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.stripeCustomerId': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isDeleted: 1 });
userSchema.index({ 
  'pharmacyDetails.location': '2dsphere' 
}, { 
  partialFilterExpression: { 
    'pharmacyDetails.isPharmacy': true,
    'pharmacyDetails.location.coordinates': { $exists: true } 
  }
}); // For geospatial queries on verified pharmacies only
userSchema.index({ 'pharmacyDetails.isPharmacy': 1, 'pharmacyDetails.verified': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to update lastLogin
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('lastLogin')) {
    this.lastLogin = new Date();
  }
  next();
});

// Method to check password
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT tokens
userSchema.methods.generateTokens = function() {
  const accessToken = jwt.sign(
    { userId: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Method to update meditation stats
userSchema.methods.updateMeditationStats = function(sessionDuration) {
  this.stats.totalSessions += 1;
  this.stats.totalMinutesMeditated += sessionDuration;
  
  // Update streak
  const today = new Date();
  const lastMeditation = this.stats.lastMeditationDate;
  
  if (lastMeditation) {
    const daysDiff = Math.floor((today - lastMeditation) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.stats.currentStreak += 1;
      if (this.stats.currentStreak > this.stats.longestStreak) {
        this.stats.longestStreak = this.stats.currentStreak;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.stats.currentStreak = 1;
    }
    // If daysDiff === 0, same day meditation, don't update streak
  } else {
    // First meditation
    this.stats.currentStreak = 1;
    this.stats.longestStreak = 1;
  }
  
  this.stats.lastMeditationDate = today;
  
  // Update experience points and level
  this.stats.experiencePoints += Math.floor(sessionDuration * 10);
  this.stats.level = Math.floor(this.stats.experiencePoints / 1000) + 1;
  
  return this.save();
};

// Method to check if user has active subscription
userSchema.methods.hasActiveSubscription = function(requiredPlans = []) {
  if (this.subscription.status !== 'active') return false;
  if (requiredPlans.length === 0) return true;
  return requiredPlans.includes(this.subscription.plan);
};

// Static method to find users with expiring subscriptions
userSchema.statics.findExpiringSubscriptions = function(days = 7) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.find({
    'subscription.status': 'active',
    'subscription.currentPeriodEnd': { $lte: expiryDate },
    'subscription.cancelAtPeriodEnd': false
  });
};

// Don't return password, tokens in JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.refreshToken;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
