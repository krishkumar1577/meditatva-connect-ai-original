import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  // Medicine Request Events
  createMedicineRequest: (data: any) => void;
  respondToRequest: (data: any) => void;
  acceptPharmacy: (data: any) => void;
  updateRequestStatus: (data: any) => void;
  // Event Listeners
  onNewMedicineRequest: (callback: (data: any) => void) => void;
  onPharmacyResponse: (callback: (data: any) => void) => void;
  onRequestAccepted: (callback: (data: any) => void) => void;
  onRequestStatusChanged: (callback: (data: any) => void) => void;
  onNewMessage: (callback: (data: any) => void) => void;
  // Remove listeners
  removeListener: (event: string, callback?: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

// API configuration
const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('app.github.dev')) {
    return 'https://effective-yodel-9prqww454rjhxx5r-5000.app.github.dev';
  }
  return 'http://localhost:5000';
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { accessToken, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && accessToken && user) {
      // Initialize socket connection
      const newSocket = io(getApiUrl(), {
        auth: {
          token: accessToken
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        // Reconnection settings
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setIsConnected(true);
        toast.success('Real-time connection established', {
          duration: 2000
        });
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, reconnect manually
          setTimeout(() => {
            newSocket.connect();
          }, 1000);
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
        toast.success('Connection restored', { duration: 2000 });
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}`);
        if (attemptNumber === 1) {
          toast.info('Reconnecting...', { duration: 2000 });
        }
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('Reconnection failed:', error);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('Failed to reconnect after maximum attempts');
        toast.error('Connection lost. Please refresh the page.', {
          duration: 10000
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        
        // Handle auth errors (token might be expired)
        if (error.message === 'Authentication error') {
          toast.error('Authentication failed. Please login again.', {
            duration: 5000
          });
          // Could trigger logout here if needed
        } else {
          toast.error('Failed to establish real-time connection', {
            duration: 3000
          });
        }
      });

      // Medicine Request Event Handlers
      setupMedicineRequestHandlers(newSocket);

      // General notifications
      newSocket.on('notification', (data) => {
        toast.info(data.message, {
          duration: data.duration || 5000
        });
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Cleaning up socket connection');
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Clean up when not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [accessToken, isAuthenticated, user]);

  const setupMedicineRequestHandlers = (socket: Socket) => {
    // Patient receives new medicine request notifications
    socket.on('new_medicine_request', (data) => {
      if (user?.role === 'pharmacy') {
        toast.info(`New ${data.urgency} medicine request from ${data.patientName}`, {
          duration: 8000,
          action: {
            label: 'View',
            onClick: () => {
              // Navigate to requests page
              window.location.href = '/pharmacy/dashboard/requests';
            }
          }
        });

        // Play notification sound for urgent requests
        if (data.urgency === 'urgent' || data.urgency === 'emergency') {
          playNotificationSound();
        }
      }
    });

    // Patient receives pharmacy responses
    socket.on('pharmacy_responded', (data) => {
      if (user?.role === 'patient' || user?.role === 'user') {
        toast.success(`${data.pharmacyName} responded to your request`, {
          duration: 8000,
          description: `Total: ₹${data.finalPrice} • Ready in: ${data.estimatedTime}`,
          action: {
            label: 'View Response',
            onClick: () => {
              window.location.href = `/patient/requests/${data.requestId}`;
            }
          }
        });
      }
    });

    // Pharmacy receives acceptance notification
    socket.on('request_accepted', (data) => {
      if (user?.role === 'pharmacy') {
        toast.success(`${data.patientName} accepted your response!`, {
          duration: 10000,
          description: 'Prepare the medicines for pickup',
          action: {
            label: 'View Details',
            onClick: () => {
              window.location.href = `/pharmacy/dashboard/orders/${data.requestId}`;
            }
          }
        });
        playNotificationSound();
      }
    });

    // Request status updates
    socket.on('request_status_changed', (data) => {
      toast.info(data.message, {
        duration: 5000,
        description: `Updated by ${data.updatedBy}`
      });
    });

    // New messages
    socket.on('new_message', (data) => {
      toast.info(`New message from ${data.senderName}`, {
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = `/messages/${data.requestId}`;
          }
        }
      });
    });

    // Request closed notifications
    socket.on('request_closed', (data) => {
      toast.info('Medicine request closed', {
        description: data.reason,
        duration: 5000
      });
    });

    // Urgent request alerts
    socket.on('urgent_medicine_request', (data) => {
      if (user?.role === 'pharmacy') {
        toast.error(`🚨 ${data.urgency.toUpperCase()} REQUEST from ${data.patientName}`, {
          duration: 15000,
          description: `Please respond immediately`,
          action: {
            label: 'Respond Now',
            onClick: () => {
              window.location.href = `/pharmacy/dashboard/requests/${data.requestId}`;
            }
          }
        });
        playUrgentNotificationSound();
      }
    });

    // Typing indicators
    socket.on('user_typing', (data) => {
      // Handle typing indicators in chat UI
      console.log(`${data.userName} is typing...`);
    });

    socket.on('user_stopped_typing', (data) => {
      // Handle stop typing in chat UI
      console.log(`${data.userName} stopped typing`);
    });
  };

  const playNotificationSound = () => {
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Could not play notification sound:', e));
      } catch (e) {
        console.log('Audio not available');
      }
    }
  };

  const playUrgentNotificationSound = () => {
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio('/urgent-notification.mp3');
        audio.volume = 0.8;
        audio.play().catch(e => console.log('Could not play urgent notification sound:', e));
      } catch (e) {
        console.log('Audio not available');
      }
    }
  };

  // Emit functions
  const createMedicineRequest = (data: any) => {
    if (socket && isConnected) {
      socket.emit('medicine_request_created', data);
    }
  };

  const respondToRequest = (data: any) => {
    if (socket && isConnected) {
      socket.emit('pharmacy_response', data);
    }
  };

  const acceptPharmacy = (data: any) => {
    if (socket && isConnected) {
      socket.emit('pharmacy_accepted', data);
    }
  };

  const updateRequestStatus = (data: any) => {
    if (socket && isConnected) {
      socket.emit('request_status_update', data);
    }
  };

  // Event listener registration
  const onNewMedicineRequest = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('new_medicine_request', callback);
    }
  };

  const onPharmacyResponse = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('pharmacy_responded', callback);
    }
  };

  const onRequestAccepted = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('request_accepted', callback);
    }
  };

  const onRequestStatusChanged = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('request_status_changed', callback);
    }
  };

  const onNewMessage = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('new_message', callback);
    }
  };

  const removeListener = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    createMedicineRequest,
    respondToRequest,
    acceptPharmacy,
    updateRequestStatus,
    onNewMedicineRequest,
    onPharmacyResponse,
    onRequestAccepted,
    onRequestStatusChanged,
    onNewMessage,
    removeListener
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
