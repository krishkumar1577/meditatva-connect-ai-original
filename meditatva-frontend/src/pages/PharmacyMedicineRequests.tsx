import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PharmacyRequestCard from '@/components/PharmacyRequestCard';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { medicineRequestsAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
  Pill, MapPin, Clock, AlertTriangle,
  RefreshCw, Filter, Search, SortAsc,
  Store, DollarSign, Package, Users,
  ArrowLeft, Settings, Bell, TrendingUp
} from 'lucide-react';

interface MedicineRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  medicines: {
    name: string;
    dosage: string;
    quantity: number;
    notes: string;
  }[];
  urgency: 'normal' | 'urgent' | 'emergency';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  notes: string;
  specialRequirements: string;
  estimatedBudget?: number;
  prescription?: {
    required: boolean;
    fileUrl?: string;
  };
  createdAt: string;
  distance?: number;
  status: 'open' | 'responded' | 'accepted' | 'completed';
}

const PharmacyMedicineRequests: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated, accessToken } = useAuth();
  
  // Initialize requests as empty array to prevent errors
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'urgent' | 'emergency'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'distance' | 'urgency'>('time');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(10); // km

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to access pharmacy dashboard');
      navigate('/login?role=pharmacy');
      return;
    }
    
    if (user.role !== 'pharmacy') {
      toast.error('Access denied. Pharmacy account required.');
      navigate('/login?role=pharmacy');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'pharmacy') {
      loadNearbyRequests();
    }
  }, [isAuthenticated, user]);

  // Debug: log the requests state whenever it changes
  useEffect(() => {
    console.log('🔍 Requests state updated:', {
      isArray: Array.isArray(requests),
      length: Array.isArray(requests) ? requests.length : 'N/A',
      type: typeof requests,
      data: requests
    });
  }, [requests]);

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for new medicine requests
      socket.on('new_medicine_request', handleNewRequest);
      socket.on('request_update', handleRequestUpdate);

      return () => {
        socket.off('new_medicine_request');
        socket.off('request_update');
      };
    }
  }, [socket, isConnected]);

  // Authentication and role check with navigation
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?role=pharmacy&redirect=' + encodeURIComponent(location.pathname));
      return;
    }
    
    if (user && user.role !== 'pharmacy') {
      toast.error('Access denied. Pharmacy account required.');
      navigate('/login?role=pharmacy');
      return;
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  // Don't render anything if not authenticated
  if (!isAuthenticated || !user || user.role !== 'pharmacy') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const loadNearbyRequests = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading nearby medicine requests...');
      const data = await medicineRequestsAPI.getNearbyRequests();
      console.log('✅ Requests loaded:', data);
      
      // Handle different response structures
      let requestsArray = [];
      if (data.status === 'success' && data.data) {
        // For API responses with nested structure
        if (data.data.requests && Array.isArray(data.data.requests)) {
          requestsArray = data.data.requests;
        } 
        // For direct array responses
        else if (Array.isArray(data.data)) {
          requestsArray = data.data;
        }
      }
      
      console.log('📊 Setting requests array:', requestsArray);
      setRequests(requestsArray);
    } catch (error) {
      console.error('❌ Failed to load nearby requests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load nearby requests';
      
      // Handle different types of errors
      if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized')) {
        toast.error('Session expired. Please login again.');
        navigate('/login?role=pharmacy');
      } else if (errorMessage.includes('403') || errorMessage.toLowerCase().includes('forbidden')) {
        toast.error('Access denied. Pharmacy account required.');
        navigate('/login?role=pharmacy');
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        toast.warning('Connection issue. Using demo data for testing.');
        // You could set some demo data here if needed
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = (data: any) => {
    setRequests(prev => [data.request, ...prev]);
    
    const urgencyEmoji = {
      emergency: '🚨',
      urgent: '⚡',
      normal: '💊'
    };

    toast.success(
      `${urgencyEmoji[data.urgency]} New ${data.urgency} medicine request!`,
      {
        description: `From ${data.patientName} • ${data.medicines?.length || 0} medicines • ${data.distance?.toFixed(1) || 'N/A'} km away`,
        duration: 8000,
        action: {
          label: 'View',
          onClick: () => {
            document.getElementById(`request-${data.requestId}`)?.scrollIntoView({ 
              behavior: 'smooth' 
            });
          }
        }
      }
    );

    // Play sound for urgent/emergency requests
    if (data.urgency === 'urgent' || data.urgency === 'emergency') {
      playNotificationSound();
    }
  };

  const handleRequestUpdate = (data: any) => {
    setRequests(prev => prev.map(req => 
      req.id === data.requestId 
        ? { ...req, status: data.status }
        : req
    ));
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3'); // Add notification sound to public folder
      audio.play().catch(console.error);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const handleRespond = async (requestId: string, response: any) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'responded' as const }
        : req
    ));
  };

  const handleIgnore = async (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
    toast.info('Request ignored');
  };

  const getFilteredAndSortedRequests = () => {
    // Safety check: ensure requests is an array
    let filtered = Array.isArray(requests) ? requests : [];

    // Apply filters
    switch (filter) {
      case 'open':
        filtered = filtered.filter(req => req.status === 'open');
        break;
      case 'urgent':
        filtered = filtered.filter(req => req.urgency === 'urgent');
        break;
      case 'emergency':
        filtered = filtered.filter(req => req.urgency === 'emergency');
        break;
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.medicines.some(med => {
          // Handle both string and object formats
          const medicineName = typeof med === 'string' ? med : med.name;
          return medicineName.toLowerCase().includes(searchTerm.toLowerCase());
        }) ||
        req.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply distance filter
    filtered = filtered.filter(req => 
      !req.distance || req.distance <= maxDistance
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 999) - (b.distance || 999);
        case 'urgency':
          const urgencyOrder = { emergency: 0, urgent: 1, normal: 2 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        case 'time':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  };

  const getStatsData = () => {
    // Safety check: ensure requests is an array
    const requestsArray = Array.isArray(requests) ? requests : [];
    
    const totalRequests = requestsArray.length;
    const openRequests = requestsArray.filter(r => r.status === 'open').length;
    const urgentRequests = requestsArray.filter(r => r.urgency === 'urgent' || r.urgency === 'emergency').length;
    const respondedRequests = requestsArray.filter(r => r.status === 'responded').length;

    return { totalRequests, openRequests, urgentRequests, respondedRequests };
  };

  const stats = getStatsData();
  const filteredRequests = getFilteredAndSortedRequests();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Button
              variant="ghost"
              onClick={() => navigate('/pharmacy/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Medicine Requests
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Nearby patient requests waiting for response
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={loadNearbyRequests}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className={`p-3 ${isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isConnected ? 'Real-time connection active' : 'Connection lost - trying to reconnect...'}
              </span>
              {isConnected && (
                <Badge className="bg-green-100 text-green-800">
                  <Bell className="h-3 w-3 mr-1" />
                  Live notifications
                </Badge>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Pill className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-blue-900 dark:text-blue-100">
                    {stats.totalRequests}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Total Requests
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-green-900 dark:text-green-100">
                    {stats.openRequests}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Open Requests
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-orange-900 dark:text-orange-100">
                    {stats.urgentRequests}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Urgent/Emergency
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-purple-900 dark:text-purple-100">
                    {stats.respondedRequests}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Responded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Patient name, medicine, city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Filter</label>
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="open">Open Only</SelectItem>
                      <SelectItem value="urgent">Urgent Only</SelectItem>
                      <SelectItem value="emergency">Emergency Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Newest First</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="urgency">Urgency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Max Distance (km)</label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseInt(e.target.value) || 10)}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                      setSortBy('time');
                      setMaxDistance(10);
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Requests List */}
        <div>
          {loading ? (
            <Card className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">Loading nearby requests...</p>
            </Card>
          ) : filteredRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No requests found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your filters to see more requests.' 
                  : 'No medicine requests in your area right now.'}
              </p>
              <Button onClick={loadNearbyRequests} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Requests
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request, index) => (
                <div key={request.id} id={`request-${request.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PharmacyRequestCard
                      request={request}
                      onRespond={handleRespond}
                      onIgnore={handleIgnore}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Showing {filteredRequests.length} of {requests.length} requests
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PharmacyMedicineRequests;