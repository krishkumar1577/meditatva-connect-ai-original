const mongoose = require('mongoose');

const medicineRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  medicines: [{
    name: { type: String, required: true },
    dosage: String,
    quantity: { type: Number, required: true },
    notes: String,
    alternatives: [String] // Alternative medicine names
  }],
  
  prescription: {
    imageUrl: String, // Cloudinary secure URL
    cloudinaryId: String, // Cloudinary public_id for deletion
    originalName: String, // Original filename
    fileSize: Number, // File size in bytes
    mimeType: String, // File mime type
    uploadedAt: { type: Date, default: Date.now },
    required: { type: Boolean, default: false }
  },
  
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  
  patientLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
    address: String,
    city: String,
    pincode: String,
    landmark: String
  },
  
  status: {
    type: String,
    enum: ['open', 'accepted', 'preparing', 'ready', 'completed', 'cancelled', 'expired'],
    default: 'open'
  },
  
  responses: [{
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    availableMedicines: [{
      medicineName: String,
      available: Boolean,
      price: Number,
      brand: String,
      expiryDate: Date,
      inStock: Number
    }],
    totalPrice: Number,
    discount: { type: Number, default: 0 },
    finalPrice: Number,
    message: String,
    estimatedTime: String, // "15 minutes", "1 hour"
    deliveryAvailable: Boolean,
    deliveryCharge: Number,
    respondedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],
  
  acceptedPharmacy: {
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acceptedAt: Date,
    estimatedReadyTime: Date,
    specialInstructions: String
  },
  
  communication: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['text', 'image', 'location'], default: 'text' },
    metadata: mongoose.Schema.Types.Mixed // For storing additional data like image URLs
  }],
  
  notes: String,
  specialRequirements: String,
  
  // Timing fields
  expiresAt: {
    type: Date,
    default: () => Date.now() + 24*60*60*1000 // 24 hours
  },
  
  estimatedBudget: Number,
  
  // Rating and feedback
  rating: {
    patientRating: Number, // 1-5 stars
    pharmacyRating: Number,
    patientFeedback: String,
    pharmacyFeedback: String
  },
  
  // Payment information
  payment: {
    method: { type: String, enum: ['cash', 'card', 'upi', 'online'], default: 'cash' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    amount: Number,
    transactionId: String
  },

  // Analytics
  analytics: {
    viewCount: { type: Number, default: 0 },
    responseCount: { type: Number, default: 0 },
    avgResponseTime: Number // in minutes
  }

}, {
  timestamps: true
});

// Indexes for performance
medicineRequestSchema.index({ patientLocation: '2dsphere' });
medicineRequestSchema.index({ status: 1, expiresAt: 1 });
medicineRequestSchema.index({ patient: 1, createdAt: -1 });
medicineRequestSchema.index({ 'responses.pharmacy': 1, createdAt: -1 });
medicineRequestSchema.index({ urgency: 1, status: 1, createdAt: -1 });

// Virtual for calculating distance (to be used with aggregation)
medicineRequestSchema.virtual('timeElapsed').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Pre-save middleware
medicineRequestSchema.pre('save', function(next) {
  // Auto-expire old requests
  if (this.status === 'open' && this.expiresAt < Date.now()) {
    this.status = 'expired';
  }
  
  // Calculate final price if discount is applied
  this.responses.forEach(response => {
    if (response.discount > 0) {
      response.finalPrice = response.totalPrice - (response.totalPrice * response.discount / 100);
    } else {
      response.finalPrice = response.totalPrice;
    }
  });
  
  next();
});

// Instance methods
medicineRequestSchema.methods.addResponse = function(pharmacyId, responseData) {
  // Check if pharmacy already responded
  const existingResponse = this.responses.find(
    r => r.pharmacy.toString() === pharmacyId.toString()
  );
  
  if (existingResponse) {
    throw new Error('Pharmacy has already responded to this request');
  }
  
  this.responses.push({
    pharmacy: pharmacyId,
    ...responseData
  });
  
  this.analytics.responseCount += 1;
  return this.save();
};

medicineRequestSchema.methods.acceptPharmacy = function(pharmacyId, additionalData = {}) {
  const pharmacyResponse = this.responses.find(
    r => r.pharmacy.toString() === pharmacyId.toString()
  );
  
  if (!pharmacyResponse) {
    throw new Error('Pharmacy response not found');
  }
  
  this.status = 'accepted';
  this.acceptedPharmacy = {
    pharmacy: pharmacyId,
    acceptedAt: new Date(),
    ...additionalData
  };
  
  // Deactivate other responses
  this.responses.forEach(response => {
    if (response.pharmacy.toString() !== pharmacyId.toString()) {
      response.isActive = false;
    }
  });
  
  return this.save();
};

medicineRequestSchema.methods.addCommunication = function(senderId, message, type = 'text', metadata = {}) {
  this.communication.push({
    sender: senderId,
    message,
    type,
    metadata
  });
  
  return this.save();
};

// Static methods
medicineRequestSchema.statics.findNearbyRequests = function(longitude, latitude, maxDistance = 10000, options = {}) {
  const query = {
    status: 'open',
    expiresAt: { $gt: Date.now() },
    patientLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // meters
      }
    },
    ...options.additionalFilters
  };
  
  return this.find(query)
    .populate('patient', 'firstName lastName phone email')
    .sort({ urgency: -1, createdAt: -1 })
    .limit(options.limit || 50);
};

medicineRequestSchema.statics.getUrgentRequests = function() {
  return this.find({
    status: 'open',
    urgency: { $in: ['urgent', 'emergency'] },
    expiresAt: { $gt: Date.now() }
  })
  .populate('patient', 'firstName lastName phone')
  .sort({ urgency: -1, createdAt: -1 });
};

medicineRequestSchema.statics.getUserRequests = function(userId, options = {}) {
  return this.find({ patient: userId })
    .populate('responses.pharmacy', 'firstName lastName pharmacyDetails phone')
    .populate('acceptedPharmacy.pharmacy', 'firstName lastName pharmacyDetails phone')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

module.exports = mongoose.model('MedicineRequest', medicineRequestSchema);
