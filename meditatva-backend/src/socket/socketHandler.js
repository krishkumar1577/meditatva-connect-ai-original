const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userRooms = new Map(); // userId -> Set of room names
    this.setupSocketAuth();
    this.setupEventHandlers();
  }

  setupSocketAuth() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket auth error:', error);
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.user.firstName} (${socket.userId})`);
      
      // Store connection
      this.connectedUsers.set(socket.userId, socket.id);
      this.userRooms.set(socket.userId, new Set());

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Join pharmacy users to pharmacy room
      if (socket.user.role === 'pharmacy') {
        socket.join('pharmacies');
        
        // Join location-based room for nearby requests
        if (socket.user.pharmacyDetails && socket.user.pharmacyDetails.location) {
          const { coordinates } = socket.user.pharmacyDetails.location;
          const locationRoom = this.getLocationRoom(coordinates[1], coordinates[0]); // lat, lng
          socket.join(locationRoom);
          this.userRooms.get(socket.userId).add(locationRoom);
        }
      }

      // Handle medicine request events
      this.handleMedicineRequestEvents(socket);

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.user.firstName} (${socket.userId})`);
        this.connectedUsers.delete(socket.userId);
        this.userRooms.delete(socket.userId);
      });
    });
  }

  handleMedicineRequestEvents(socket) {
    // Patient creates new medicine request
    socket.on('medicine_request_created', (data) => {
      console.log(`📋 Medicine request created by ${socket.user.firstName}`);
      
      // Notify nearby pharmacies
      const { latitude, longitude, urgency } = data;
      const locationRoom = this.getLocationRoom(latitude, longitude);
      
      socket.to(locationRoom).emit('new_medicine_request', {
        requestId: data.requestId,
        patientName: socket.user.firstName,
        medicines: data.medicines,
        urgency: urgency,
        location: data.location,
        createdAt: new Date(),
        patientId: socket.userId
      });

      // Also broadcast to all pharmacies if urgent/emergency
      if (urgency === 'urgent' || urgency === 'emergency') {
        socket.to('pharmacies').emit('urgent_medicine_request', {
          requestId: data.requestId,
          patientName: socket.user.firstName,
          medicines: data.medicines,
          urgency: urgency,
          location: data.location,
          createdAt: new Date()
        });
      }
    });

    // Pharmacy responds to request
    socket.on('pharmacy_response', (data) => {
      console.log(`🏥 Pharmacy ${socket.user.pharmacyDetails?.pharmacyName} responded to request`);
      
      // Notify the patient
      this.io.to(`user_${data.patientId}`).emit('pharmacy_responded', {
        requestId: data.requestId,
        pharmacyId: socket.userId,
        pharmacyName: socket.user.pharmacyDetails?.pharmacyName || socket.user.firstName,
        availableMedicines: data.availableMedicines,
        totalPrice: data.totalPrice,
        estimatedTime: data.estimatedTime,
        message: data.message,
        location: socket.user.pharmacyDetails?.location,
        respondedAt: new Date()
      });
    });

    // Patient accepts pharmacy
    socket.on('pharmacy_accepted', (data) => {
      console.log(`✅ Patient accepted pharmacy ${data.pharmacyId}`);
      
      // Notify the accepted pharmacy
      this.io.to(`user_${data.pharmacyId}`).emit('request_accepted', {
        requestId: data.requestId,
        patientName: socket.user.firstName,
        patientPhone: socket.user.phone,
        message: 'Patient has accepted your response! Prepare the medicines.',
        acceptedAt: new Date()
      });

      // Notify other responding pharmacies that request is closed
      if (data.otherPharmacyIds && data.otherPharmacyIds.length > 0) {
        data.otherPharmacyIds.forEach(pharmacyId => {
          this.io.to(`user_${pharmacyId}`).emit('request_closed', {
            requestId: data.requestId,
            reason: 'Patient selected another pharmacy',
            closedAt: new Date()
          });
        });
      }
    });

    // Request status updates
    socket.on('request_status_update', (data) => {
      const { requestId, status, targetUserId } = data;
      
      this.io.to(`user_${targetUserId}`).emit('request_status_changed', {
        requestId,
        status,
        updatedAt: new Date(),
        message: this.getStatusMessage(status)
      });
    });

    // Typing indicators for chat
    socket.on('typing_start', (data) => {
      socket.to(`user_${data.targetUserId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.firstName,
        requestId: data.requestId
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`user_${data.targetUserId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        requestId: data.requestId
      });
    });
  }

  // Helper methods
  getLocationRoom(lat, lng) {
    // Create location-based rooms with ~5km radius
    const gridSize = 0.05; // approximately 5km
    const latGrid = Math.floor(lat / gridSize);
    const lngGrid = Math.floor(lng / gridSize);
    return `location_${latGrid}_${lngGrid}`;
  }

  getStatusMessage(status) {
    const messages = {
      'accepted': 'Request accepted by pharmacy',
      'preparing': 'Pharmacy is preparing your medicines',
      'ready': 'Medicines are ready for pickup',
      'completed': 'Order completed successfully',
      'cancelled': 'Request has been cancelled'
    };
    return messages[status] || 'Status updated';
  }

  // Public methods for use in controllers
  notifyUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  notifyNearbyPharmacies(latitude, longitude, event, data) {
    const locationRoom = this.getLocationRoom(latitude, longitude);
    this.io.to(locationRoom).emit(event, data);
  }

  notifyAllPharmacies(event, data) {
    this.io.to('pharmacies').emit(event, data);
  }

  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = SocketHandler;