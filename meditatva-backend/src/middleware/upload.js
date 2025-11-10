const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type based on the upload type
  const uploadType = req.params.uploadType || req.body.uploadType;
  
  if (uploadType === 'audio') {
    // Audio files for meditations
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only audio files are allowed', 400), false);
    }
  } else if (uploadType === 'image') {
    // Image files for profiles, community posts
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed', 400), false);
    }
  } else if (uploadType === 'prescription') {
    // Prescription files (images and PDFs)
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Only image files (JPG, PNG, WebP) and PDF files are allowed for prescriptions', 400), false);
    }
  } else {
    // General files (images and audio)
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image and audio files are allowed', 400), false);
    }
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files at once
  },
});

// Middleware for single file upload
const uploadSingle = (fieldName) => upload.single(fieldName);

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Middleware for mixed file uploads
const uploadFields = (fields) => upload.fields(fields);

// Specific middleware for prescription uploads
const uploadPrescription = upload.single('prescription');

// Prescription-specific file filter
const prescriptionFileFilter = (req, file, cb) => {
  // Prescription files (images and PDFs)
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPG, PNG, WebP) and PDF files are allowed for prescriptions', 400), false);
  }
};

// Create prescription-specific multer instance
const prescriptionUpload = multer({
  storage,
  fileFilter: prescriptionFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for prescriptions
    files: 1, // Only one prescription file
  },
});

// Prescription upload middleware
const uploadPrescriptionFile = prescriptionUpload.single('prescription');

// Helper middleware to handle multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return next(new AppError('File too large. Maximum size allowed is 10MB', 400));
      case 'LIMIT_FILE_COUNT':
        return next(new AppError('Too many files. Maximum 5 files allowed', 400));
      case 'LIMIT_UNEXPECTED_FILE':
        return next(new AppError('Unexpected file field', 400));
      default:
        return next(new AppError(err.message, 400));
    }
  }
  next(err);
};

// Validate uploaded file
const validateFile = (file, allowedTypes = ['image', 'audio']) => {
  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  const fileType = file.mimetype.split('/')[0];
  if (!allowedTypes.includes(fileType) && !(allowedTypes.includes('pdf') && file.mimetype === 'application/pdf')) {
    throw new AppError(`Only ${allowedTypes.join(' and ')} files are allowed`, 400);
  }

  return true;
};

// Validate prescription file
const validatePrescription = (file) => {
  if (!file) {
    throw new AppError('Prescription file is required', 400);
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError('Prescription must be an image (JPG, PNG, WebP) or PDF file', 400);
  }

  // Check file size (max 5MB for prescriptions)
  if (file.size > 5 * 1024 * 1024) {
    throw new AppError('Prescription file must be less than 5MB', 400);
  }

  return true;
};

// Get file extension from mimetype
const getFileExtension = (mimetype) => {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'audio/aac': 'aac',
    'application/pdf': 'pdf',
  };

  return extensions[mimetype] || 'bin';
};

// Generate unique filename
const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = path.extname(originalName);
  
  return `${prefix}${timestamp}-${random}${extension}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadPrescription,
  uploadPrescriptionFile,
  handleUploadError,
  validateFile,
  validatePrescription,
  getFileExtension,
  generateFileName,
};
