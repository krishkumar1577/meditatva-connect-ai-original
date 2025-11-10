const MedicineRequest = require('../models/MedicineRequest');
const User = require('../models/User');
const { uploadPrescriptionToCloudinary, deletePrescriptionFromCloudinary, getOptimizedPrescriptionUrl } = require('../services/cloudinaryService');

class MedicineRequestController {
  constructor(socketHandler) {
    this.socketHandler = socketHandler;
  }

  // Patient creates new medicine request
  createRequest = async (req, res) => {
    try {
      const { medicines, urgency, location, notes, specialRequirements, estimatedBudget } = req.body;

      // Validate patient role
      if (req.user.role !== 'patient' && req.user.role !== 'user') {
        return res.status(403).json({
          status: 'error',
          message: 'Only patients can create medicine requests'
        });
      }

      // Handle prescription upload if file is provided
      let prescriptionData = null;
      if (req.file) {
        try {
          const uploadResult = await uploadPrescriptionToCloudinary(req.file, req.user._id);
          prescriptionData = {
            imageUrl: uploadResult.secure_url,
            cloudinaryId: uploadResult.public_id,
            originalName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadedAt: new Date()
          };
        } catch (uploadError) {
          console.error('Prescription upload error:', uploadError);
          return res.status(400).json({
            status: 'error',
            message: 'Failed to upload prescription. Please try again.'
          });
        }
      }

      // Create request
      const request = await MedicineRequest.create({
        patient: req.user._id,
        medicines,
        prescription: prescriptionData,
        urgency,
        patientLocation: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
          address: location.address,
          city: location.city,
          pincode: location.pincode,
          landmark: location.landmark
        },
        notes,
        specialRequirements,
        estimatedBudget
      });

      // Populate patient details
      await request.populate('patient', 'firstName lastName phone email');

      // Real-time notification to nearby pharmacies
      if (this.socketHandler) {
        this.socketHandler.notifyNearbyPharmacies(
          location.latitude,
          location.longitude,
          'new_medicine_request',
          {
            requestId: request._id,
            patientName: req.user.firstName,
            medicines: request.medicines,
            urgency: request.urgency,
            location: request.patientLocation,
            estimatedBudget: request.estimatedBudget,
            hasPrescription: !!prescriptionData,
            createdAt: request.createdAt
          }
        );

        // For urgent/emergency requests, notify all pharmacies
        if (urgency === 'urgent' || urgency === 'emergency') {
          this.socketHandler.notifyAllPharmacies('urgent_medicine_request', {
            requestId: request._id,
            patientName: req.user.firstName,
            medicines: request.medicines,
            urgency: request.urgency,
            location: request.patientLocation,
            hasPrescription: !!prescriptionData,
            createdAt: request.createdAt
          });
        }
      }

      res.status(201).json({
        status: 'success',
        message: 'Medicine request created successfully. Nearby pharmacies have been notified.',
        data: { request }
      });

    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create medicine request'
      });
    }
  };

  // Get nearby requests for pharmacies
  getNearbyRequests = async (req, res) => {
    try {
      // Validate pharmacy role
      if (req.user.role !== 'pharmacy') {
        return res.status(403).json({
          status: 'error',
          message: 'Only pharmacies can access this endpoint'
        });
      }

      const pharmacy = req.user;
      
      if (!pharmacy.pharmacyDetails?.location?.coordinates) {
        return res.status(400).json({
          status: 'error',
          message: 'Pharmacy location not set. Please update your profile.'
        });
      }

      const { longitude, latitude } = pharmacy.pharmacyDetails.location.coordinates;
      const radius = req.query.radius ? parseInt(req.query.radius) : 10000; // 10km default
      const urgencyFilter = req.query.urgency;
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const skip = (page - 1) * limit;

      // Build additional filters
      const additionalFilters = {};
      if (urgencyFilter) {
        additionalFilters.urgency = urgencyFilter;
      }

      // Check if pharmacy has already responded to filter out those requests
      const alreadyRespondedFilter = req.query.hideResponded === 'true';

      let requests = await MedicineRequest.findNearbyRequests(
        longitude,
        latitude,
        radius,
        { additionalFilters, limit: limit + skip }
      );

      // Filter out requests pharmacy already responded to
      if (alreadyRespondedFilter) {
        requests = requests.filter(request => 
          !request.responses.some(response => 
            response.pharmacy.toString() === req.user._id.toString()
          )
        );
      }

      // Apply pagination
      const paginatedRequests = requests.slice(skip, skip + limit);

      // Calculate distance for each request
      const requestsWithDistance = paginatedRequests.map(request => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          request.patientLocation.coordinates[1],
          request.patientLocation.coordinates[0]
        );
        
        return {
          ...request.toJSON(),
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          timeElapsed: Math.floor((Date.now() - request.createdAt.getTime()) / (1000 * 60)) // minutes
        };
      });

      res.json({
        status: 'success',
        data: {
          requests: requestsWithDistance,
          pagination: {
            currentPage: page,
            totalCount: requests.length,
            hasMore: requests.length > skip + limit
          }
        }
      });

    } catch (error) {
      console.error('Get nearby requests error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch nearby requests'
      });
    }
  };

  // Pharmacy responds to request
  respondToRequest = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { availableMedicines, message, estimatedTime, deliveryAvailable, deliveryCharge } = req.body;

      // Validate pharmacy role
      if (req.user.role !== 'pharmacy') {
        return res.status(403).json({
          status: 'error',
          message: 'Only pharmacies can respond to requests'
        });
      }

      const request = await MedicineRequest.findById(requestId).populate('patient', 'firstName lastName phone');

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Medicine request not found'
        });
      }

      if (request.status !== 'open') {
        return res.status(400).json({
          status: 'error',
          message: 'This request is no longer accepting responses'
        });
      }

      // Calculate total price
      let totalPrice = 0;
      let discount = 0;

      availableMedicines.forEach(med => {
        if (med.available && med.price) {
          totalPrice += med.price;
        }
      });

      // Apply discount logic if needed
      if (totalPrice > 1000) {
        discount = 5; // 5% discount for orders above 1000
      }

      const finalPrice = totalPrice - (totalPrice * discount / 100);

      // Add response to request
      await request.addResponse(req.user._id, {
        availableMedicines,
        totalPrice,
        discount,
        finalPrice,
        message,
        estimatedTime,
        deliveryAvailable: deliveryAvailable || false,
        deliveryCharge: deliveryCharge || 0
      });

      // Update pharmacy stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'pharmacyDetails.totalResponses': 1 }
      });

      // Real-time notification to patient
      if (this.socketHandler) {
        this.socketHandler.notifyUser(
          request.patient._id.toString(),
          'pharmacy_responded',
          {
            requestId: request._id,
            pharmacyId: req.user._id,
            pharmacyName: req.user.pharmacyDetails?.pharmacyName || req.user.firstName,
            availableMedicines,
            totalPrice,
            finalPrice,
            discount,
            estimatedTime,
            message,
            location: req.user.pharmacyDetails?.location,
            deliveryAvailable,
            deliveryCharge,
            respondedAt: new Date()
          }
        );
      }

      res.json({
        status: 'success',
        message: 'Response sent to patient successfully',
        data: { 
          requestId: request._id,
          responseCount: request.responses.length
        }
      });

    } catch (error) {
      console.error('Respond to request error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to respond to request'
      });
    }
  };

  // Patient views responses to their request
  getRequestResponses = async (req, res) => {
    try {
      const { requestId } = req.params;

      const request = await MedicineRequest.findById(requestId)
        .populate('patient', 'firstName lastName phone')
        .populate('responses.pharmacy', 'firstName lastName pharmacyDetails phone');

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Medicine request not found'
        });
      }

      // Authorization check
      if (request.patient._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only view responses to your own requests'
        });
      }

      // Calculate distances for pharmacy responses
      const responsesWithDistance = request.responses.map(response => {
        let distance = null;
        if (response.pharmacy.pharmacyDetails?.location?.coordinates) {
          distance = this.calculateDistance(
            request.patientLocation.coordinates[1],
            request.patientLocation.coordinates[0],
            response.pharmacy.pharmacyDetails.location.coordinates[1],
            response.pharmacy.pharmacyDetails.location.coordinates[0]
          );
          distance = Math.round(distance * 100) / 100;
        }

        return {
          ...response.toJSON(),
          distance
        };
      });

      res.json({
        status: 'success',
        data: {
          request: {
            ...request.toJSON(),
            responses: responsesWithDistance
          }
        }
      });

    } catch (error) {
      console.error('Get request responses error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch request responses'
      });
    }
  };

  // Patient accepts a pharmacy response
  acceptPharmacy = async (req, res) => {
    try {
      const { requestId, pharmacyId } = req.params;
      const { specialInstructions } = req.body;

      const request = await MedicineRequest.findById(requestId)
        .populate('responses.pharmacy', 'firstName lastName pharmacyDetails phone');

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Medicine request not found'
        });
      }

      // Authorization check
      if (request.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only accept responses to your own requests'
        });
      }

      if (request.status !== 'open') {
        return res.status(400).json({
          status: 'error',
          message: 'This request is no longer accepting responses'
        });
      }

      // Accept pharmacy
      await request.acceptPharmacy(pharmacyId, {
        specialInstructions,
        estimatedReadyTime: this.calculateEstimatedReadyTime(request, pharmacyId)
      });

      // Real-time notifications
      if (this.socketHandler) {
        // Notify accepted pharmacy
        this.socketHandler.notifyUser(
          pharmacyId,
          'request_accepted',
          {
            requestId: request._id,
            patientName: req.user.firstName,
            patientPhone: req.user.phone,
            medicines: request.medicines,
            specialInstructions,
            acceptedAt: new Date()
          }
        );

        // Notify other pharmacies that request is closed
        const otherPharmacies = request.responses
          .filter(r => r.pharmacy._id.toString() !== pharmacyId && r.isActive)
          .map(r => r.pharmacy._id.toString());

        otherPharmacies.forEach(pId => {
          this.socketHandler.notifyUser(
            pId,
            'request_closed',
            {
              requestId: request._id,
              reason: 'Patient selected another pharmacy',
              closedAt: new Date()
            }
          );
        });
      }

      res.json({
        status: 'success',
        message: 'Pharmacy response accepted successfully. You can now visit the pharmacy.',
        data: {
          request: await MedicineRequest.findById(requestId)
            .populate('acceptedPharmacy.pharmacy', 'firstName lastName pharmacyDetails phone')
        }
      });

    } catch (error) {
      console.error('Accept pharmacy error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to accept pharmacy response'
      });
    }
  };

  // Get patient's medicine requests
  getMyRequests = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      const options = {
        limit,
        skip: (page - 1) * limit
      };

      let requests = await MedicineRequest.getUserRequests(req.user._id, options);

      // Filter by status if provided
      if (status) {
        requests = requests.filter(request => request.status === status);
      }

      res.json({
        status: 'success',
        data: {
          requests,
          pagination: {
            currentPage: page,
            hasMore: requests.length === limit
          }
        }
      });

    } catch (error) {
      console.error('Get my requests error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch your requests'
      });
    }
  };

  // Update request status
  updateRequestStatus = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status, notes } = req.body;

      const request = await MedicineRequest.findById(requestId)
        .populate('patient', 'firstName lastName phone')
        .populate('acceptedPharmacy.pharmacy', 'firstName lastName pharmacyDetails');

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Medicine request not found'
        });
      }

      // Authorization check
      const isPatient = request.patient._id.toString() === req.user._id.toString();
      const isAcceptedPharmacy = request.acceptedPharmacy?.pharmacy?._id.toString() === req.user._id.toString();

      if (!isPatient && !isAcceptedPharmacy) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to update this request'
        });
      }

      // Update status
      request.status = status;
      if (notes) {
        request.notes = notes;
      }
      await request.save();

      // Real-time notifications
      if (this.socketHandler) {
        const targetUserId = isPatient 
          ? request.acceptedPharmacy?.pharmacy?._id.toString()
          : request.patient._id.toString();

        if (targetUserId) {
          this.socketHandler.notifyUser(
            targetUserId,
            'request_status_changed',
            {
              requestId: request._id,
              status,
              updatedBy: req.user.firstName,
              message: this.getStatusMessage(status),
              updatedAt: new Date()
            }
          );
        }
      }

      res.json({
        status: 'success',
        message: 'Request status updated successfully',
        data: { request }
      });

    } catch (error) {
      console.error('Update request status error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update request status'
      });
    }
  };

  // Add communication message
  addCommunication = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { message, type = 'text', metadata = {} } = req.body;

      const request = await MedicineRequest.findById(requestId)
        .populate('patient', 'firstName lastName')
        .populate('acceptedPharmacy.pharmacy', 'firstName lastName pharmacyDetails');

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Medicine request not found'
        });
      }

      // Authorization check
      const isPatient = request.patient._id.toString() === req.user._id.toString();
      const isAcceptedPharmacy = request.acceptedPharmacy?.pharmacy?._id.toString() === req.user._id.toString();

      if (!isPatient && !isAcceptedPharmacy) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only communicate about your own requests'
        });
      }

      // Add communication
      await request.addCommunication(req.user._id, message, type, metadata);

      // Real-time notification
      if (this.socketHandler) {
        const targetUserId = isPatient 
          ? request.acceptedPharmacy?.pharmacy?._id.toString()
          : request.patient._id.toString();

        if (targetUserId) {
          this.socketHandler.notifyUser(
            targetUserId,
            'new_message',
            {
              requestId: request._id,
              senderId: req.user._id,
              senderName: req.user.firstName,
              message,
              type,
              metadata,
              timestamp: new Date()
            }
          );
        }
      }

      res.json({
        status: 'success',
        message: 'Message sent successfully'
      });

    } catch (error) {
      console.error('Add communication error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to send message'
      });
    }
  };

  // Get prescription image securely
  getPrescriptionImage = async (req, res) => {
    try {
      const { requestId } = req.params;

      const request = await MedicineRequest.findById(requestId)
        .populate('patient', 'firstName lastName')
        .populate('responses.pharmacy', 'firstName lastName pharmacyDetails')
        .populate('acceptedPharmacy.pharmacy', 'firstName lastName pharmacyDetails');

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Medicine request not found'
        });
      }

      if (!request.prescription?.imageUrl) {
        return res.status(404).json({
          status: 'error',
          message: 'No prescription image found for this request'
        });
      }

      // Authorization check - Patient, responded pharmacies, or accepted pharmacy can view
      const isPatient = request.patient._id.toString() === req.user._id.toString();
      const hasResponded = request.responses.some(response => 
        response.pharmacy._id.toString() === req.user._id.toString()
      );
      const isAcceptedPharmacy = request.acceptedPharmacy?.pharmacy?._id.toString() === req.user._id.toString();

      if (!isPatient && !hasResponded && !isAcceptedPharmacy) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to view this prescription'
        });
      }

      // Get optimized image URL
      const optimizedUrl = getOptimizedPrescriptionUrl(request.prescription.cloudinaryId, {
        width: 800,
        height: 1000,
        crop: 'limit',
        quality: 'auto:good'
      });

      res.json({
        status: 'success',
        data: {
          prescriptionUrl: optimizedUrl,
          originalName: request.prescription.originalName,
          mimeType: request.prescription.mimeType,
          fileSize: request.prescription.fileSize,
          uploadedAt: request.prescription.uploadedAt
        }
      });

    } catch (error) {
      console.error('Get prescription image error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to get prescription image'
      });
    }
  };

  // Update prescription for existing request
  updatePrescription = async (req, res) => {
    try {
      const { requestId } = req.params;

      const request = await MedicineRequest.findById(requestId);

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Medicine request not found'
        });
      }

      // Authorization check - only patient can update prescription
      if (request.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only update prescriptions for your own requests'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Prescription file is required'
        });
      }

      // Delete old prescription if exists
      if (request.prescription?.cloudinaryId) {
        try {
          await deletePrescriptionFromCloudinary(request.prescription.cloudinaryId);
        } catch (deleteError) {
          console.error('Failed to delete old prescription:', deleteError);
          // Continue with upload even if deletion fails
        }
      }

      // Upload new prescription
      try {
        const uploadResult = await uploadPrescriptionToCloudinary(req.file, req.user._id);
        
        request.prescription = {
          imageUrl: uploadResult.secure_url,
          cloudinaryId: uploadResult.public_id,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadedAt: new Date()
        };

        await request.save();

        // Notify pharmacies about prescription update
        if (this.socketHandler) {
          // Notify pharmacies that have responded
          request.responses.forEach(response => {
            if (response.isActive) {
              this.socketHandler.notifyUser(
                response.pharmacy.toString(),
                'prescription_updated',
                {
                  requestId: request._id,
                  patientName: req.user.firstName,
                  message: 'Patient has updated the prescription'
                }
              );
            }
          });

          // Notify accepted pharmacy if any
          if (request.acceptedPharmacy?.pharmacy) {
            this.socketHandler.notifyUser(
              request.acceptedPharmacy.pharmacy.toString(),
              'prescription_updated',
              {
                requestId: request._id,
                patientName: req.user.firstName,
                message: 'Patient has updated the prescription'
              }
            );
          }
        }

        res.json({
          status: 'success',
          message: 'Prescription updated successfully',
          data: {
            prescription: {
              originalName: request.prescription.originalName,
              fileSize: request.prescription.fileSize,
              mimeType: request.prescription.mimeType,
              uploadedAt: request.prescription.uploadedAt
            }
          }
        });

      } catch (uploadError) {
        console.error('Prescription upload error:', uploadError);
        return res.status(400).json({
          status: 'error',
          message: 'Failed to upload prescription. Please try again.'
        });
      }

    } catch (error) {
      console.error('Update prescription error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update prescription'
      });
    }
  };

  // Helper methods
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculateEstimatedReadyTime(request, pharmacyId) {
    const pharmacyResponse = request.responses.find(
      r => r.pharmacy.toString() === pharmacyId
    );
    
    if (pharmacyResponse && pharmacyResponse.estimatedTime) {
      const minutes = parseInt(pharmacyResponse.estimatedTime.match(/\d+/)?.[0] || '30');
      return new Date(Date.now() + minutes * 60 * 1000);
    }
    
    return new Date(Date.now() + 30 * 60 * 1000); // Default 30 minutes
  }

  getStatusMessage(status) {
    const messages = {
      'accepted': 'Your request has been accepted by the pharmacy',
      'preparing': 'Pharmacy is preparing your medicines',
      'ready': 'Your medicines are ready for pickup',
      'completed': 'Order completed successfully',
      'cancelled': 'Request has been cancelled'
    };
    return messages[status] || 'Status updated';
  }
}

module.exports = MedicineRequestController;
