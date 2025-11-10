# Prescription Upload Feature Implementation Guide

## Overview
This guide documents the implementation of prescription file upload functionality in the Meditatva Connect AI medicine request system.

## Features Implemented

### Backend Implementation

#### 1. Cloudinary Service (`src/services/cloudinaryService.js`)
- **File Upload**: Supports images (JPG, PNG, WebP) and PDF files up to 5MB
- **Secure Storage**: Files uploaded to `meditatva/prescriptions` folder with unique naming
- **Image Optimization**: Automatic compression and format conversion
- **Secure URLs**: Time-limited signed URLs for secure access
- **File Management**: Delete functionality for updating prescriptions

#### 2. Updated Multer Middleware (`src/middleware/upload.js`)
- **Multi-format Support**: Added support for prescription files (images + PDF)
- **Validation**: File type, size, and security checks
- **Memory Storage**: Uses memory storage for direct Cloudinary upload
- **Prescription-specific**: Dedicated middleware for prescription uploads

#### 3. Enhanced Medicine Request Model (`src/models/MedicineRequest.js`)
- **Prescription Schema**: Extended with file metadata (URL, size, type, upload date)
- **Security**: Cloudinary public ID stored for secure deletion
- **Metadata**: Original filename and file information preserved

#### 4. Updated Controller (`src/controllers/medicineRequestController.js`)
- **File Upload**: Prescription upload during request creation
- **Secure Access**: Authorization checks for viewing prescriptions
- **Update Functionality**: Replace existing prescriptions
- **Error Handling**: Comprehensive error handling for upload failures

#### 5. New API Endpoints (`src/routes/medicineRequest.js`)
```
POST /api/medicine-requests (with file upload)
GET /api/medicine-requests/:id/prescription
PUT /api/medicine-requests/:id/prescription
```

### Frontend Implementation

#### 1. Enhanced Medicine Request Form (`src/components/MedicineRequestForm.tsx`)
- **File Selection**: Drag-drop and click-to-upload interface
- **Multi-format Support**: Accepts images and PDF files
- **Preview**: Shows selected file name and type
- **Validation**: Client-side file size and type validation
- **Form Integration**: Seamless integration with existing request form

#### 2. Prescription Viewer Component (`src/components/PrescriptionViewer.tsx`)
- **Secure Display**: Fetches prescriptions with proper authorization
- **Multi-format Preview**: 
  - Images: Full-size preview with zoom functionality
  - PDFs: Embedded PDF viewer
- **Download**: Secure download functionality
- **File Info**: Displays file metadata (size, upload date, format)
- **Error Handling**: Graceful error handling for failed loads

#### 3. Updated Pharmacy Dashboard (`src/components/PharmacyRequestCard.tsx`)
- **Prescription Indicator**: Shows when prescription is uploaded
- **Quick View**: One-click prescription viewing
- **Secure Access**: Only authorized pharmacies can view prescriptions

## Technical Specifications

### Security Features
1. **Authorization**: Only patients, responding pharmacies, and accepted pharmacies can view prescriptions
2. **Secure URLs**: Time-limited signed URLs prevent unauthorized access
3. **File Validation**: Server-side validation prevents malicious uploads
4. **Encrypted Storage**: Files stored securely on Cloudinary with access controls

### File Handling
- **Supported Formats**: JPEG, PNG, WebP, PDF
- **Size Limit**: 5MB maximum file size
- **Compression**: Automatic image optimization for faster loading
- **Naming**: Unique filename generation prevents conflicts

### API Integration
```javascript
// Creating request with prescription
const formData = new FormData();
formData.append('prescription', file);
formData.append('medicines', JSON.stringify(medicines));
// ... other form data

// Viewing prescription
GET /api/medicine-requests/${requestId}/prescription
Authorization: Bearer ${token}
```

## Setup Requirements

### Environment Variables
Add to `.env` file:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Dependencies
Backend dependencies already installed:
- `cloudinary` - Cloud file storage
- `multer` - File upload middleware

## Usage Flow

### Patient Workflow
1. **Create Request**: Upload prescription during medicine request creation
2. **View Status**: See if prescription was successfully uploaded
3. **Update**: Replace prescription if needed

### Pharmacy Workflow
1. **View Requests**: See requests with prescription indicators
2. **Access Prescription**: Click "View Prescription" to see uploaded files
3. **Download**: Download prescription for offline reference
4. **Respond**: Use prescription info to provide accurate medicine quotes

## Error Handling
- **Upload Failures**: Graceful degradation if upload fails
- **Access Denied**: Clear messaging for unauthorized access attempts
- **File Errors**: Validation errors with helpful messages
- **Network Issues**: Retry mechanisms for failed requests

## Testing Checklist

### Backend Tests
- [ ] File upload with valid formats
- [ ] File size validation
- [ ] Authorization checks
- [ ] Cloudinary integration
- [ ] Error handling

### Frontend Tests  
- [ ] File selection UI
- [ ] Upload progress indication
- [ ] Prescription viewing
- [ ] Download functionality
- [ ] Error states

## Future Enhancements
1. **Bulk Upload**: Multiple prescription files per request
2. **OCR Integration**: Extract medicine names from prescription images
3. **File Versioning**: Keep history of prescription updates
4. **Advanced Preview**: PDF annotation and markup tools
5. **Mobile Optimization**: Camera capture integration

## Troubleshooting

### Common Issues
1. **Cloudinary Config**: Ensure environment variables are set correctly
2. **File Size**: Check file size limits on both frontend and backend
3. **CORS**: Verify CORS settings for file uploads
4. **Memory**: Monitor memory usage for large file uploads

### Logs to Check
- Upload errors in browser console
- Server logs for Cloudinary API responses
- Network tab for failed requests
- File validation errors

## API Documentation

### Upload Prescription
```
POST /api/medicine-requests
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- prescription: File (image/pdf, max 5MB)
- medicines: JSON string
- location: JSON string
- ... other fields
```

### View Prescription
```
GET /api/medicine-requests/{id}/prescription
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "prescriptionUrl": "https://...",
    "originalName": "prescription.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 1234567,
    "uploadedAt": "2024-01-01T10:00:00Z"
  }
}
```

### Update Prescription
```
PUT /api/medicine-requests/{id}/prescription
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- prescription: File (image/pdf, max 5MB)
```

This implementation provides a complete, secure, and user-friendly prescription upload system that enhances the medicine request workflow for both patients and pharmacies.