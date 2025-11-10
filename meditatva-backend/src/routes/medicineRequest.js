const express = require('express');
const router = express.Router();
const MedicineRequestController = require('../controllers/medicineRequestController');
const { authenticateToken } = require('../middleware/auth');
const { uploadPrescriptionFile, validatePrescription } = require('../middleware/upload');

// Initialize controller (will be injected with socketHandler from app.js)
let medicineRequestController;

// Initialize controller with socket handler
const initializeController = (socketHandler) => {
  medicineRequestController = new MedicineRequestController(socketHandler);
  return router;
};

// Middleware to parse JSON fields from FormData
const parseFormDataFields = (req, res, next) => {
  try {
    // Parse JSON fields from FormData
    if (req.body.medicines && typeof req.body.medicines === 'string') {
      req.body.medicines = JSON.parse(req.body.medicines);
    }
    if (req.body.location && typeof req.body.location === 'string') {
      req.body.location = JSON.parse(req.body.location);
    }
    if (req.body.estimatedBudget && typeof req.body.estimatedBudget === 'string') {
      req.body.estimatedBudget = parseInt(req.body.estimatedBudget);
    }
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON data in form fields'
    });
  }
  next();
};

// Validation middleware
const validateMedicineRequest = (req, res, next) => {
  const { medicines, location } = req.body;

  if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'At least one medicine is required'
    });
  }

  // Validate each medicine
  for (const medicine of medicines) {
    if (!medicine.name || !medicine.quantity || medicine.quantity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Each medicine must have a name and valid quantity'
      });
    }
  }

  if (!location || !location.latitude || !location.longitude) {
    return res.status(400).json({
      status: 'error',
      message: 'Location (latitude and longitude) is required'
    });
  }

  next();
};

// Prescription validation middleware
const handlePrescriptionUpload = (req, res, next) => {
  uploadPrescriptionFile(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    
    // Validate prescription if file was uploaded
    if (req.file) {
      try {
        validatePrescription(req.file);
      } catch (validationError) {
        return res.status(400).json({
          status: 'error',
          message: validationError.message
        });
      }
    }
    
    next();
  });
};

const validatePharmacyResponse = (req, res, next) => {
  const { availableMedicines } = req.body;

  if (!availableMedicines || !Array.isArray(availableMedicines) || availableMedicines.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Available medicines information is required'
    });
  }

  // Validate each available medicine
  for (const medicine of availableMedicines) {
    if (!medicine.medicineName || medicine.available === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Each medicine must have name and availability status'
      });
    }
    
    if (medicine.available && (!medicine.price || medicine.price <= 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'Available medicines must have valid price'
      });
    }
  }

  next();
};

// Routes

// Create new medicine request (Patient only)
router.post('/', 
  authenticateToken, 
  handlePrescriptionUpload,
  parseFormDataFields,
  validateMedicineRequest,
  (req, res) => medicineRequestController.createRequest(req, res)
);

// Get nearby requests (Pharmacy only)
router.get('/nearby', 
  authenticateToken,
  (req, res) => medicineRequestController.getNearbyRequests(req, res)
);

// Get patient's own requests
router.get('/', 
  authenticateToken,
  (req, res) => medicineRequestController.getMyRequests(req, res)
);

// Get responses for a specific request (Patient only)
router.get('/:requestId/responses', 
  authenticateToken,
  (req, res) => medicineRequestController.getRequestResponses(req, res)
);

// Respond to a request (Pharmacy only)
router.post('/:requestId/respond', 
  authenticateToken,
  validatePharmacyResponse,
  (req, res) => medicineRequestController.respondToRequest(req, res)
);

// Accept a pharmacy response (Patient only)
router.post('/:requestId/accept', 
  authenticateToken,
  (req, res) => medicineRequestController.acceptPharmacy(req, res)
);

// Update request status (Patient or accepted pharmacy)
router.patch('/:requestId/status', 
  authenticateToken,
  (req, res) => medicineRequestController.updateRequestStatus(req, res)
);

// Add communication message (Patient or accepted pharmacy)
router.post('/:requestId/messages', 
  authenticateToken,
  (req, res) => medicineRequestController.addCommunication(req, res)
);

// Get prescription image securely
router.get('/:requestId/prescription', 
  authenticateToken,
  (req, res) => medicineRequestController.getPrescriptionImage(req, res)
);

// Update prescription for existing request (Patient only)
router.put('/:requestId/prescription', 
  authenticateToken,
  handlePrescriptionUpload,
  (req, res) => medicineRequestController.updatePrescription(req, res)
);

// Get urgent requests (for emergency dashboard)
router.get('/urgent', 
  authenticateToken,
  async (req, res) => {
    try {
      const MedicineRequest = require('../models/MedicineRequest');
      const urgentRequests = await MedicineRequest.getUrgentRequests();
      
      res.json({
        status: 'success',
        data: { requests: urgentRequests }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch urgent requests'
      });
    }
  }
);

// Get request statistics (for analytics)
router.get('/stats', 
  authenticateToken,
  async (req, res) => {
    try {
      const MedicineRequest = require('../models/MedicineRequest');
      
      let matchFilter = {};
      
      // Role-based filtering
      if (req.user.role === 'patient' || req.user.role === 'user') {
        matchFilter.patient = req.user._id;
      } else if (req.user.role === 'pharmacy') {
        matchFilter['responses.pharmacy'] = req.user._id;
      }

      const stats = await MedicineRequest.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            openRequests: {
              $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
            },
            completedRequests: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            urgentRequests: {
              $sum: { $cond: [{ $eq: ['$urgency', 'urgent'] }, 1, 0] }
            },
            emergencyRequests: {
              $sum: { $cond: [{ $eq: ['$urgency', 'emergency'] }, 1, 0] }
            }
          }
        }
      ]);

      res.json({
        status: 'success',
        data: { stats: stats[0] || {} }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch statistics'
      });
    }
  }
);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Medicine Request service is operational',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST / - Create medicine request',
      'GET /nearby - Get nearby requests (pharmacy)',
      'GET /my-requests - Get user requests',
      'GET /:requestId/responses - Get request responses',
      'POST /:requestId/respond - Respond to request (pharmacy)',
      'POST /:requestId/accept/:pharmacyId - Accept pharmacy',
      'PATCH /:requestId/status - Update request status',
      'POST /:requestId/messages - Add communication',
      'GET /urgent - Get urgent requests',
      'GET /stats - Get statistics'
    ]
  });
});

module.exports = { router, initializeController };
