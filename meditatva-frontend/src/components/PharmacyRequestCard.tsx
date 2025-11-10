import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import PrescriptionViewer from './PrescriptionViewer';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';
import {
  Clock, MapPin, User, Phone, Pill, 
  AlertTriangle, CheckCircle, XCircle, 
  DollarSign, Package, Timer, Eye,
  MessageSquare, Calendar, Navigation
} from 'lucide-react';

interface Medicine {
  name: string;
  dosage: string;
  quantity: number;
  notes: string;
}

interface MedicineRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  medicines: Medicine[];
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
  createdAt: string;
  distance?: number;
}

interface PharmacyRequestCardProps {
  request: MedicineRequest;
  onRespond: (requestId: string, response: any) => void;
  onIgnore: (requestId: string) => void;
}

const PharmacyRequestCard: React.FC<PharmacyRequestCardProps> = ({
  request,
  onRespond,
  onIgnore
}) => {
  const { socket } = useSocket();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Response form state
  const [availableMedicines, setAvailableMedicines] = useState(
    request.medicines.map(med => ({
      name: med.name,
      available: true,
      price: 0,
      brand: '',
      inStock: 10,
      substitutes: []
    }))
  );
  const [estimatedTime, setEstimatedTime] = useState('30 minutes');
  const [responseNotes, setResponseNotes] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'normal': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const requestTime = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - requestTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const calculateTotalAmount = () => {
    return availableMedicines
      .filter(med => med.available)
      .reduce((total, med) => {
        const originalMed = request.medicines.find(m => m.name === med.name);
        return total + (med.price * (originalMed?.quantity || 1));
      }, 0);
  };

  const updateMedicineAvailability = (index: number, field: string, value: any) => {
    setAvailableMedicines(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const handleSubmitResponse = async () => {
    // Validate response
    const availableMeds = availableMedicines.filter(med => med.available);
    if (availableMeds.length === 0) {
      toast.error('Please mark at least one medicine as available or suggest alternatives');
      return;
    }

    // Check if available medicines have prices
    const invalidPrices = availableMeds.filter(med => !med.price || med.price <= 0);
    if (invalidPrices.length > 0) {
      toast.error('Please set valid prices for all available medicines');
      return;
    }

    if (!contactNumber.trim()) {
      toast.error('Please provide a contact number');
      return;
    }

    setIsSubmitting(true);

    try {
      const responseData = {
        availableMedicines,
        totalAmount: calculateTotalAmount(),
        estimatedTime,
        notes: responseNotes,
        contactNumber: contactNumber,
        pharmacyLocation: {
          // This would come from pharmacy profile
          latitude: 0, // Replace with actual pharmacy location
          longitude: 0
        }
      };

      // API call to respond to request
      const response = await fetch(`/api/medicine-requests/${request.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(responseData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Emit real-time event
        socket?.emit('pharmacy_response', {
          requestId: request.id,
          patientId: request.patientId,
          response: {
            pharmacyId: result.data.pharmacyId,
            totalAmount: responseData.totalAmount,
            estimatedTime: responseData.estimatedTime,
            availableMedicines: responseData.availableMedicines
          }
        });

        toast.success('Response sent successfully!');
        setShowResponseForm(false);
        onRespond(request.id, responseData);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send response');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMapsDirection = () => {
    const { latitude, longitude } = request.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card className={`hover:shadow-lg transition-all duration-200 ${
          request.urgency === 'emergency' ? 'ring-2 ring-red-300 bg-red-50/30' : 
          request.urgency === 'urgent' ? 'ring-1 ring-yellow-300 bg-yellow-50/30' : ''
        }`}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  request.urgency === 'emergency' ? 'bg-red-500/20' :
                  request.urgency === 'urgent' ? 'bg-yellow-500/20' :
                  'bg-blue-500/20'
                }`}>
                  <Pill className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{request.patientName}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeAgo(request.createdAt)}</span>
                    </div>
                    {request.distance && (
                      <div className="flex items-center gap-1">
                        <Navigation className="h-4 w-4" />
                        <span>{request.distance.toFixed(1)} km away</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getUrgencyColor(request.urgency)}>
                  {request.urgency === 'emergency' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {request.urgency.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Patient Contact */}
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{request.patientPhone}</span>
            </div>

            {/* Medicines Requested */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Medicines Requested:</h4>
              <div className="space-y-2">
                {request.medicines.slice(0, 3).map((medicine, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <span className="font-medium">{medicine.name}</span>
                      {medicine.dosage && (
                        <span className="text-gray-500 ml-2">({medicine.dosage})</span>
                      )}
                      {medicine.notes && (
                        <p className="text-xs text-gray-600 mt-1">{medicine.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">Qty: {medicine.quantity}</span>
                    </div>
                  </div>
                ))}
                {request.medicines.length > 3 && (
                  <p className="text-sm text-gray-500">+{request.medicines.length - 3} more medicines</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm">{request.location.address}</p>
                <p className="text-xs text-gray-600">{request.location.city}, {request.location.pincode}</p>
                {request.location.landmark && (
                  <p className="text-xs text-gray-600">Near: {request.location.landmark}</p>
                )}
              </div>
            </div>

            {/* Budget */}
            {request.estimatedBudget && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Budget: ₹{request.estimatedBudget}</span>
              </div>
            )}

            {/* Special Requirements */}
            {request.specialRequirements && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Special Requirements:</strong> {request.specialRequirements}
                </p>
              </div>
            )}

            {/* Notes */}
            {request.notes && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-sm">
                  <strong>Notes:</strong> {request.notes}
                </p>
              </div>
            )}

            {/* Prescription */}
            {(request.prescription?.required || request.prescription?.imageUrl) && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  {request.prescription?.imageUrl ? 'Prescription uploaded' : 'Prescription required'}
                </span>
                {request.prescription?.imageUrl && (
                  <PrescriptionViewer
                    requestId={request.id}
                    trigger={
                      <Button variant="link" size="sm" className="text-blue-600 p-0">
                        <Eye className="h-4 w-4 mr-1" />
                        View Prescription
                      </Button>
                    }
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <Separator />
            <div className="flex gap-3 justify-between items-center">
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowResponseForm(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Respond
                </Button>
                <Button
                  variant="outline"
                  onClick={openMapsDirection}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Directions
                </Button>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => onIgnore(request.id)}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600"
              >
                <XCircle className="h-4 w-4" />
                Ignore
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Response Form Modal */}
      <Dialog open={showResponseForm} onOpenChange={setShowResponseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Respond to Medicine Request
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Patient: {request.patientName}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Contact: {request.patientPhone} | Distance: {request.distance?.toFixed(1) || 'N/A'} km
              </p>
            </div>

            {/* Medicine Availability */}
            <div>
              <h3 className="font-semibold mb-3">Medicine Availability & Pricing</h3>
              <div className="space-y-3">
                {availableMedicines.map((medicine, index) => {
                  const originalMed = request.medicines[index];
                  return (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{medicine.name}</h4>
                            {originalMed?.dosage && (
                              <p className="text-sm text-gray-600">Dosage: {originalMed.dosage}</p>
                            )}
                            <p className="text-sm text-gray-600">Quantity needed: {originalMed?.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={medicine.available}
                              onChange={(e) => updateMedicineAvailability(index, 'available', e.target.checked)}
                              className="rounded"
                            />
                            <Label className="text-sm">Available</Label>
                          </div>
                        </div>

                        {medicine.available && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor={`price-${index}`}>Price per unit (₹)</Label>
                              <Input
                                id={`price-${index}`}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={medicine.price || ''}
                                onChange={(e) => updateMedicineAvailability(index, 'price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`brand-${index}`}>Brand (Optional)</Label>
                              <Input
                                id={`brand-${index}`}
                                placeholder="Brand name"
                                value={medicine.brand}
                                onChange={(e) => updateMedicineAvailability(index, 'brand', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`stock-${index}`}>In Stock</Label>
                              <Input
                                id={`stock-${index}`}
                                type="number"
                                min="1"
                                value={medicine.inStock}
                                onChange={(e) => updateMedicineAvailability(index, 'inStock', parseInt(e.target.value) || 1)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Response Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimated-time">Estimated Ready Time</Label>
                <Input
                  id="estimated-time"
                  placeholder="e.g., 30 minutes, 1 hour"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-number">Contact Number</Label>
                <Input
                  id="contact-number"
                  type="tel"
                  placeholder="Your pharmacy contact number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="response-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="response-notes"
                placeholder="Any additional information, instructions, or alternative suggestions..."
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Total Summary */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-green-900 dark:text-green-100">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₹{calculateTotalAmount().toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Ready in: {estimatedTime}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowResponseForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitResponse}
                disabled={isSubmitting || calculateTotalAmount() === 0}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Timer className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Send Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PharmacyRequestCard;