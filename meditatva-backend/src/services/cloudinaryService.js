const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility functions
const uploadPrescriptionToCloudinary = async (file, userId) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const publicId = `prescription_${userId}_${timestamp}_${randomString}`;

    const uploadOptions = {
      folder: 'meditatva/prescriptions',
      public_id: publicId,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      transformation: [
        { width: 1500, height: 2000, crop: 'limit', quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };

    let result;
    if (file.buffer) {
      // Upload from buffer (memory storage)
      result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        uploadOptions
      );
    } else if (file.path) {
      // Upload from file path
      result = await cloudinary.uploader.upload(file.path, uploadOptions);
    } else {
      throw new Error('Invalid file format');
    }
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload prescription to cloud storage');
  }
};

const deletePrescriptionFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image'
    });
    
    // If it's a PDF, try to delete as raw resource
    if (result.result === 'not found') {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw'
      });
    }
    
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete prescription from cloud storage');
  }
};

// Generate signed URL for secure access
const generateSignedPrescriptionUrl = (publicId, options = {}) => {
  try {
    const signedUrl = cloudinary.url(publicId, {
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      ...options
    });
    
    return signedUrl;
  } catch (error) {
    console.error('Cloudinary signed URL error:', error);
    throw new Error('Failed to generate secure prescription URL');
  }
};

// Get optimized prescription URL
const getOptimizedPrescriptionUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    quality: 'auto:good',
    fetch_format: 'auto',
    ...options
  });
};

module.exports = {
  cloudinary,
  uploadPrescriptionToCloudinary,
  deletePrescriptionFromCloudinary,
  generateSignedPrescriptionUrl,
  getOptimizedPrescriptionUrl
};