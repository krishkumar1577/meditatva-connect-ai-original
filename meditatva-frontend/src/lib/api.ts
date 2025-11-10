// Shared API configuration and utility functions

// API base URL configuration
export const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname.includes('app.github.dev') 
  ? `https://effective-yodel-9prqww454rjhxx5r-5000.app.github.dev/api`
  : 'http://localhost:5000/api';

// Generic API call function with authentication
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = localStorage.getItem('accessToken');
  const isDemoToken = accessToken && (accessToken.includes('demo-') || accessToken === 'demo-patient-token' || accessToken === 'demo-pharmacy-token');

  // For demo tokens, return mock data for specific endpoints
  if (isDemoToken) {
    return handleDemoModeRequests(endpoint, options, accessToken);
  }

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Handle demo mode requests with mock data
const handleDemoModeRequests = async (endpoint: string, options: RequestInit, token: string | null) => {
  const isPharmacy = token?.includes('pharmacy');
  
  console.log(`🎭 Demo mode: ${endpoint} (${isPharmacy ? 'Pharmacy' : 'Patient'})`);

  // Mock responses for different endpoints
  switch (endpoint) {
    case '/medicine-requests/nearby':
      if (!isPharmacy) {
        throw new Error('Unauthorized: Only pharmacy users can access nearby requests');
      }
      return {
        status: 'success',
        data: {
          requests: [
            {
              id: 'demo-req-001',
              patientId: 'demo-patient-001',
              patientName: 'John Doe',
              patientPhone: '+91-98765-43210',
              medicines: [
                {
                  name: 'Paracetamol 500mg',
                  dosage: '500mg',
                  quantity: 2,
                  notes: 'Take twice daily after meals'
                },
                {
                  name: 'Cetirizine 10mg',
                  dosage: '10mg',
                  quantity: 1,
                  notes: 'Take once daily at bedtime'
                }
              ],
              urgency: 'normal',
              location: {
                latitude: 30.7704,
                longitude: 76.5704,
                address: '123 Demo Street, Chandigarh',
                coordinates: [76.5704, 30.7704],
                distance: '2.3 km'
              },
              requestTime: new Date(Date.now() - 1800000).toISOString(),
              status: 'open',
              notes: 'Please check if generic alternatives are available',
              specialRequirements: 'None',
              estimatedBudget: 150,
              prescription: {
                required: true,
                fileUrl: 'https://via.placeholder.com/400x600/f0f0f0/333?text=Demo+Prescription'
              },
              createdAt: new Date(Date.now() - 1800000).toISOString(),
              distance: 2.3
            },
            {
              id: 'demo-req-002',
              patientId: 'demo-patient-002',
              patientName: 'Sarah Smith',
              patientPhone: '+91-98765-43211',
              medicines: [
                {
                  name: 'Insulin injection',
                  dosage: '100 units/mL',
                  quantity: 1,
                  notes: 'Refrigerate after opening'
                },
                {
                  name: 'Blood glucose strips',
                  dosage: '50 strips',
                  quantity: 1,
                  notes: 'Check expiry date'
                }
              ],
              urgency: 'urgent',
              location: {
                latitude: 30.7804,
                longitude: 76.5804,
                address: '456 Demo Avenue, Chandigarh',
                coordinates: [76.5804, 30.7804],
                distance: '1.8 km'
              },
              requestTime: new Date(Date.now() - 900000).toISOString(),
              status: 'open',
              notes: 'Urgent - diabetic patient',
              specialRequirements: 'Temperature-controlled storage required',
              estimatedBudget: 800,
              prescription: {
                required: true,
                fileUrl: 'https://via.placeholder.com/400x600/f0f0f0/333?text=Demo+Prescription+2'
              },
              createdAt: new Date(Date.now() - 900000).toISOString(),
              distance: 1.8
            }
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRequests: 2,
            limit: 10
          }
        }
      };

    case '/auth/me':
      return {
        status: 'success',
        data: {
          user: {
            id: isPharmacy ? 'demo-pharmacy-001' : 'demo-patient-001',
            email: isPharmacy ? 'pharmacy@demo.com' : 'patient@demo.com',
            firstName: 'Demo',
            lastName: isPharmacy ? 'Pharmacy' : 'Patient',
            fullName: isPharmacy ? 'Demo Pharmacy' : 'Demo Patient',
            role: isPharmacy ? 'pharmacy' : 'patient',
            isEmailVerified: true,
            isDemoUser: true
          }
        }
      };

    default:
      // For unknown endpoints in demo mode, return a generic success response
      return {
        status: 'success',
        data: {},
        message: `Demo mode: ${endpoint} endpoint simulated`
      };
  }
};

// Specific API functions for different endpoints

export const medicineRequestsAPI = {
  // Get nearby medicine requests (for pharmacy)
  getNearbyRequests: () => apiCall('/medicine-requests/nearby'),
  
  // Get specific request by ID
  getRequest: (requestId: string) => apiCall(`/medicine-requests/${requestId}`),
  
  // Respond to a medicine request (for pharmacy)
  respondToRequest: (requestId: string, response: any) => 
    apiCall(`/medicine-requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify(response),
    }),
  
  // Update request status
  updateRequestStatus: (requestId: string, status: string) =>
    apiCall(`/medicine-requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const authAPI = {
  // Get current user profile
  getProfile: () => apiCall('/auth/me'),
  
  // Update profile
  updateProfile: (profileData: any) => 
    apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  
  // Refresh token
  refreshToken: (refreshToken: string) =>
    apiCall('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

export default apiCall;