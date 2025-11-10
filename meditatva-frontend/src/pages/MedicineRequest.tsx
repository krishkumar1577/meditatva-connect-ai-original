import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MedicineRequestForm from '@/components/MedicineRequestForm';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, Pill, MapPin, Clock, 
  CheckCircle, AlertTriangle, Info, 
  Phone, Heart 
} from 'lucide-react';

const MedicineRequest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [showForm, setShowForm] = useState(true);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    // Load recent requests from localStorage or API
    const loadRecentRequests = () => {
      const stored = localStorage.getItem('recentMedicineRequests');
      if (stored) {
        try {
          const requests = JSON.parse(stored);
          setRecentRequests(requests.slice(0, 3)); // Show last 3 requests
        } catch (error) {
          console.error('Error loading recent requests:', error);
        }
      }
    };

    loadRecentRequests();
  }, []);

  const handleRequestSuccess = () => {
    setShowForm(false);
    toast.success('Medicine request created successfully!', {
      description: 'Nearby pharmacies have been notified. You can track responses in your dashboard.',
      action: {
        label: 'View Requests',
        onClick: () => navigate('/patient/requests')
      }
    });

    // Redirect to patient requests after a short delay
    setTimeout(() => {
      navigate('/patient/requests');
    }, 2000);
  };

  const handleBackToDashboard = () => {
    navigate('/patient/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Request Medicines
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Find and request medicines from nearby pharmacies
              </p>
            </div>
          </div>
          {user && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Welcome, {user.firstName || user.fullName}
            </Badge>
          )}
        </motion.div>

        {/* Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Location Based
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Find nearby pharmacies
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Real-time Updates
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Instant notifications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-100">
                    Easy Process
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Simple request flow
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        {showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MedicineRequestForm onSuccess={handleRequestSuccess} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <Card className="p-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Request Submitted Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your medicine request has been sent to nearby pharmacies. 
                  You'll receive notifications when pharmacies respond.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Info className="h-4 w-4" />
                  <span>Redirecting to your requests page...</span>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/patient/requests')}
                    className="flex items-center gap-2"
                  >
                    <Pill className="h-4 w-4" />
                    View My Requests
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(true)}
                  >
                    Make Another Request
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent Requests Sidebar */}
        {recentRequests.length > 0 && showForm && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Recent Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRequests.map((request, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">
                          {request.medicines?.map((m: any) => m.name).join(', ') || 'Medicine Request'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {request.date || 'Recently requested'}
                        </p>
                      </div>
                      <Badge 
                        variant={request.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {request.status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    Emergency Medicine Need?
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    For urgent medical requirements, please call our emergency helpline
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MedicineRequest;