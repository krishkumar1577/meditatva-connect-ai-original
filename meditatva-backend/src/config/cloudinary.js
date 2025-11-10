const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload files
const uploadToCloudinary = async (filePath, folder = 'meditatva') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto', // Automatically detect file type
      quality: 'auto:good',
      fetch_format: 'auto',
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('File upload failed');
  }
};

// Helper function to delete files
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('File deletion failed');
  }
};

// Helper function to upload audio files specifically
const uploadAudio = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'meditatva/audio',
      resource_type: 'video', // Use 'video' for audio files in Cloudinary
      quality: 'auto:good',
      ...options,
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
      format: result.format,
    };
  } catch (error) {
    console.error('Audio upload error:', error);
    throw new Error('Audio upload failed');
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadAudio,
};
