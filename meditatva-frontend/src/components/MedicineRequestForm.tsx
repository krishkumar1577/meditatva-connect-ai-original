import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Plus, X, MapPin, Clock, AlertTriangle, 
  Upload, Camera, Pill, DollarSign
} from 'lucide-react';

interface Medicine {
  name: string;
  dosage: string;
  quantity: number;
  notes: string;
}

interface MedicineRequestFormProps {
  onSuccess?: () => void;
  initialLocation?: any;
}

const MedicineRequestForm: React.FC<MedicineRequestFormProps> = ({ 
  onSuccess, 
  initialLocation 
}) => {
  const { createMedicineRequest } = useSocket();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '', quantity: 1, notes: '' }
  ]);
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [notes, setNotes] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState<number | ''>('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  
  // Location state
  const [location, setLocation] = useState(initialLocation || {
    latitude: null,
    longitude: null,
    address: '',
    city: '',
    pincode: '',
    landmark: ''
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (!initialLocation) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setIsGettingLocation(false);
          
          // Reverse geocoding to get address
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Could not get your location. Please enter manually.');
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // You can use Google Maps API or any other geocoding service
      // For demo, we'll use a simple format
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results[0]) {
          const result = data.results[0].components;
          setLocation(prev => ({
            ...prev,
            address: data.results[0].formatted,
            city: result.city || result.town || result.village || '',
            pincode: result.postcode || ''
          }));
        }
      }
    } catch (error) {
      console.log('Reverse geocoding failed:', error);
      // Continue without reverse geocoding
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', quantity: 1, notes: '' }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string | number) => {
    const updated = medicines.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedicines(updated);
  };

  const handlePrescriptionUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload an image (JPG, PNG, WebP) or PDF file');
        return;
      }
      
      setPrescriptionFile(file);
      setPrescriptionRequired(true);
      toast.success('Prescription uploaded successfully');
    }
  };

  const validateForm = () => {
    // Check if at least one medicine is specified
    const validMedicines = medicines.filter(med => med.name.trim() !== '');
    if (validMedicines.length === 0) {
      toast.error('Please add at least one medicine');
      return false;
    }

    // Check if location is available
    if (!location.latitude || !location.longitude) {
      toast.error('Location is required. Please enable location access or enter manually.');
      return false;
    }

    // Validate medicine quantities
    for (const med of validMedicines) {
      if (med.quantity <= 0) {
        toast.error('Medicine quantity must be greater than 0');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty medicines
      const validMedicines = medicines.filter(med => med.name.trim() !== '');

      // Prepare form data for file upload
      const formData = new FormData();
      
      // Add prescription file if uploaded
      if (prescriptionFile) {
        formData.append('prescription', prescriptionFile);
      }

      // Add other form data as JSON strings
      formData.append('medicines', JSON.stringify(validMedicines));
      formData.append('urgency', urgency);
      formData.append('location', JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.city,
        pincode: location.pincode,
        landmark: location.landmark
      }));
      if (notes) formData.append('notes', notes);
      if (specialRequirements) formData.append('specialRequirements', specialRequirements);
      if (estimatedBudget) formData.append('estimatedBudget', estimatedBudget.toString());

      // API call
      const response = await fetch('/api/medicine-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          // Don't set Content-Type for FormData - browser will set it automatically
        },
        body: formData
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Emit real-time event
        createMedicineRequest({
          requestId: result.data.request._id,
          medicines: validMedicines,
          urgency,
          latitude: location.latitude,
          longitude: location.longitude,
          location: location,
          estimatedBudget,
          hasPrescription: !!prescriptionFile
        });

        toast.success('Medicine request created successfully! Nearby pharmacies have been notified.');
        
        // Reset form
        setMedicines([{ name: '', dosage: '', quantity: 1, notes: '' }]);
        setNotes('');
        setSpecialRequirements('');
        setEstimatedBudget('');
        setPrescriptionFile(null);
        setPrescriptionRequired(false);
        setUrgency('normal');

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.message || 'Failed to create medicine request');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to create medicine request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const urgencyColors = {
    normal: 'bg-green-100 text-green-800 border-green-200',
    urgent: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    emergency: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Pill className="h-6 w-6 text-blue-600" />
            Request Medicines
          </CardTitle>
          <p className="text-muted-foreground">
            Fill out this form to request medicines from nearby pharmacies
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Urgency Level */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Request Urgency</Label>
              <Select value={urgency} onValueChange={(value: any) => setUrgency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Normal - Within 24 hours
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Urgent - Within 2-4 hours
                    </div>
                  </SelectItem>
                  <SelectItem value="emergency">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Emergency - Immediate
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Badge className={urgencyColors[urgency]}>
                {urgency === 'emergency' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
              </Badge>
            </div>

            {/* Medicine List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Required Medicines</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedicine}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Medicine
                </Button>
              </div>
              
              <AnimatePresence>
                {medicines.map((medicine, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`medicine-${index}`}>Medicine Name *</Label>
                        <Input
                          id={`medicine-${index}`}
                          placeholder="e.g., Paracetamol"
                          value={medicine.name}
                          onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                        <Input
                          id={`dosage-${index}`}
                          placeholder="e.g., 500mg"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={medicine.quantity}
                          onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value))}
                          required
                        />
                      </div>
                      <div className="flex items-end">
                        {medicines.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMedicine(index)}
                            className="w-full"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Label htmlFor={`notes-${index}`}>Notes</Label>
                      <Input
                        id={`notes-${index}`}
                        placeholder="Any specific requirements for this medicine"
                        value={medicine.notes}
                        onChange={(e) => updateMedicine(index, 'notes', e.target.value)}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Location
              </Label>
              
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2"
                >
                  {isGettingLocation ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                </Button>
                
                {location.latitude && (
                  <Badge variant="secondary">
                    Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full address"
                    value={location.address}
                    onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={location.city}
                      onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={location.pincode}
                      onChange={(e) => setLocation(prev => ({ ...prev, pincode: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  placeholder="Nearby landmark for easy identification"
                  value={location.landmark}
                  onChange={(e) => setLocation(prev => ({ ...prev, landmark: e.target.value }))}
                />
              </div>
            </div>

            {/* Prescription Upload */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Prescription (Optional)
              </Label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  onChange={handlePrescriptionUpload}
                  className="hidden"
                  id="prescription-upload"
                />
                <label htmlFor="prescription-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {prescriptionFile ? (
                      <>
                        <Camera className="h-8 w-8 text-green-600" />
                        <p className="text-green-600 font-medium">{prescriptionFile.name}</p>
                        <p className="text-sm text-gray-500">Click to change</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-600">Click to upload prescription</p>
                        <p className="text-sm text-gray-400">Images (JPG, PNG, WebP) or PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                </label>
                
                {prescriptionFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setPrescriptionFile(null);
                      setPrescriptionRequired(false);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Estimated Budget (₹)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Optional"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value ? parseInt(e.target.value) : '')}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="special-requirements">Special Requirements</Label>
              <Textarea
                id="special-requirements"
                placeholder="Any specific brand preferences, delivery instructions, etc."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information for pharmacies"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    Creating Request...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Create Medicine Request
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineRequestForm;