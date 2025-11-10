import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import PrescriptionViewer from '@/components/PrescriptionViewer';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Clock, MapPin, Pill, Phone, Store, User,
  CheckCircle, AlertCircle, XCircle, Plus,
  Eye, ArrowLeft, DollarSign, Timer,
  Package, Truck, MessageSquare, Star,
  RefreshCw, Filter, Calendar
} from 'lucide-react';

interface PharmacyResponse {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyPhone: string;
  pharmacyAddress: string;
  pharmacyRating: number;
  medicines: {
    name: string;
    available: boolean;
    price: number;
    brand?: string;
    inStock: number;
  }[];
  totalAmount: number;
  estimatedTime: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  respondedAt: string;
  acceptedAt?: string;
}

interface MedicineRequest {
  id: string;
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
    imageUrl?: string;
    originalName?: string;
    required: boolean;
  };
  status: 'active' | 'fulfilled' | 'cancelled' | 'expired';
  createdAt: string;
  responses: PharmacyResponse[];
  acceptedResponse?: string;
}

const PatientRequests: React.FC = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MedicineRequest | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<PharmacyResponse | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'fulfilled' | 'cancelled'>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for real-time updates
      socket.on('pharmacy_response', handlePharmacyResponse);
      socket.on('request_update', handleRequestUpdate);
      socket.on('medicine_delivered', handleMedicineDelivered);

      return () => {
        socket.off('pharmacy_response');
        socket.off('request_update');
        socket.off('medicine_delivered');
      };
    }
  }, [socket, isConnected]);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/medicine-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      } else {
        toast.error('Failed to load medicine requests');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load medicine requests');
    } finally {
      setLoading(false);
    }
  };

  const handlePharmacyResponse = (data: any) => {
    setRequests(prev => prev.map(req => 
      req.id === data.requestId 
        ? { ...req, responses: [...req.responses, data.response] }
        : req
    ));
    
    toast.success(`New response from ${data.response.pharmacyName}`, {
      description: `Total: ₹${data.response.totalAmount} • ETA: ${data.response.estimatedTime}`,
      action: {
        label: 'View',
        onClick: () => {
          const request = requests.find(r => r.id === data.requestId);
          if (request) setSelectedRequest(request);
        }
      }
    });
  };

  const handleRequestUpdate = (data: any) => {
    setRequests(prev => prev.map(req => 
      req.id === data.requestId 
        ? { ...req, status: data.status }
        : req
    ));
  };

  const handleMedicineDelivered = (data: any) => {
    setRequests(prev => prev.map(req => 
      req.id === data.requestId 
        ? { ...req, status: 'fulfilled' }
        : req
    ));
    
    toast.success('Medicine delivered successfully!', {
      description: 'Your order has been completed.',
    });
  };

  const acceptPharmacyResponse = async (requestId: string, responseId: string) => {
    try {
      const response = await fetch(`/api/medicine-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ responseId })
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, acceptedResponse: responseId, status: 'fulfilled' }
            : req
        ));
        
        // Emit socket event
        socket?.emit('accept_pharmacy_response', { requestId, responseId });
        
        toast.success('Pharmacy response accepted!', {
          description: 'The pharmacy has been notified and will prepare your order.'
        });
        
        setSelectedRequest(null);
      } else {
        toast.error('Failed to accept response');
      }
    } catch (error) {
      console.error('Error accepting response:', error);
      toast.error('Failed to accept response');
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      const response = await fetch(`/api/medicine-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'cancelled' }
            : req
        ));
        
        socket?.emit('cancel_medicine_request', { requestId });
        
        toast.success('Request cancelled successfully');
      } else {
        toast.error('Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    }
  };

  const getStatusColor = (status: MedicineRequest['status']) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fulfilled': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: MedicineRequest['urgency']) => {
    switch (urgency) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              onClick={() => navigate('/patient/dashboard')}
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
                Track your medicine requests and pharmacy responses
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/patient/request-medicine')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600"
            >
              <Plus className="h-4 w-4" />
              New Request
            </Button>
            <Button
              variant="outline"
              onClick={loadRequests}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {['all', 'active', 'fulfilled', 'cancelled'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status as any)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
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
                    {requests.length}
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
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-green-900 dark:text-green-100">
                    {requests.filter(r => r.status === 'fulfilled').length}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Fulfilled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-yellow-900 dark:text-yellow-100">
                    {requests.filter(r => r.status === 'active').length}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Store className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-purple-900 dark:text-purple-100">
                    {requests.reduce((acc, req) => acc + req.responses.length, 0)}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Total Responses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">Loading your requests...</p>
            </Card>
          ) : filteredRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No {filter !== 'all' ? filter : ''} requests found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {filter === 'all' 
                  ? "You haven't made any medicine requests yet." 
                  : `No ${filter} requests at the moment.`}
              </p>
              <Button
                onClick={() => navigate('/patient/request-medicine')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Request
              </Button>
            </Card>
          ) : (
            <AnimatePresence>
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <Pill className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {request.medicines.map(m => m.name).join(', ')}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(request.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            <Badge className={getUrgencyColor(request.urgency)}>
                              {request.urgency}
                            </Badge>
                          </div>
                        </div>

                        {/* Medicine List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {request.medicines.slice(0, 2).map((medicine, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span>{medicine.name}</span>
                              {medicine.dosage && (
                                <span className="text-gray-500">({medicine.dosage})</span>
                              )}
                              <span className="ml-auto font-medium">Qty: {medicine.quantity}</span>
                            </div>
                          ))}
                          {request.medicines.length > 2 && (
                            <p className="text-sm text-gray-500 col-span-full">
                              +{request.medicines.length - 2} more medicines
                            </p>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{request.location.address}, {request.location.city}</span>
                        </div>

                        {/* Responses Summary */}
                        {request.responses.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Store className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  {request.responses.length} pharmacy responses
                                </span>
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                Best price: ₹{Math.min(...request.responses.map(r => r.totalAmount))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                            {request.responses.length > 0 && request.status === 'active' && (
                              <Badge className="bg-green-100 text-green-800">
                                {request.responses.length} responses available
                              </Badge>
                            )}
                          </div>
                          
                          {request.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelRequest(request.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Cancel Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Request Details Modal */}
        <AnimatePresence>
          {selectedRequest && (
            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <Pill className="h-6 w-6" />
                    Request Details
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Request Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Request Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                          <Badge className={getStatusColor(selectedRequest.status)}>
                            {selectedRequest.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Urgency</p>
                          <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                            {selectedRequest.urgency}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                          <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                        </div>
                        {selectedRequest.estimatedBudget && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                            <p className="font-medium">₹{selectedRequest.estimatedBudget}</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Medicines</p>
                        <div className="space-y-2">
                          {selectedRequest.medicines.map((medicine, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{medicine.name}</p>
                                  {medicine.dosage && (
                                    <p className="text-sm text-gray-600">Dosage: {medicine.dosage}</p>
                                  )}
                                  {medicine.notes && (
                                    <p className="text-sm text-gray-600">Notes: {medicine.notes}</p>
                                  )}
                                </div>
                                <p className="font-semibold">Qty: {medicine.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Location</p>
                        <p className="font-medium">{selectedRequest.location.address}</p>
                        <p className="text-sm text-gray-600">{selectedRequest.location.city}, {selectedRequest.location.pincode}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pharmacy Responses */}
                  {selectedRequest.responses.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Store className="h-5 w-5" />
                          Pharmacy Responses ({selectedRequest.responses.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedRequest.responses.map((response, idx) => (
                            <Card key={idx} className="border border-gray-200 dark:border-gray-700">
                              <CardContent className="p-4">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-semibold text-lg">{response.pharmacyName}</h4>
                                      <p className="text-sm text-gray-600">{response.pharmacyAddress}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1">
                                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                          <span className="text-sm">{response.pharmacyRating}</span>
                                        </div>
                                        <Separator orientation="vertical" className="h-4" />
                                        <div className="flex items-center gap-1">
                                          <Phone className="h-4 w-4" />
                                          <span className="text-sm">{response.pharmacyPhone}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-2xl font-bold text-green-600">₹{response.totalAmount}</p>
                                      <p className="text-sm text-gray-600">ETA: {response.estimatedTime}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {response.medicines.map((med, medIdx) => (
                                      <div key={medIdx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <div>
                                          <span className="font-medium">{med.name}</span>
                                          {!med.available && (
                                            <Badge className="ml-2 bg-red-100 text-red-800">
                                              Out of Stock
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="font-semibold">₹{med.price}</span>
                                      </div>
                                    ))}
                                  </div>

                                  {response.notes && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                                      <p className="text-sm text-blue-900 dark:text-blue-100">
                                        <strong>Note:</strong> {response.notes}
                                      </p>
                                    </div>
                                  )}

                                  {selectedRequest.status === 'active' && !selectedRequest.acceptedResponse && (
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => acceptPharmacyResponse(selectedRequest.id, response.id)}
                                        className="flex items-center gap-2"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Accept This Offer
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => setSelectedResponse(response)}
                                      >
                                        View More Details
                                      </Button>
                                    </div>
                                  )}

                                  {selectedRequest.acceptedResponse === response.id && (
                                    <Badge className="bg-green-100 text-green-800 w-fit">
                                      ✓ Accepted
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatientRequests;