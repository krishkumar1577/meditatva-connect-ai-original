import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import PremiumPatientDashboard from "./pages/PremiumPatientDashboard";
import MedicineRequest from "./pages/MedicineRequest";
import PatientRequests from "./pages/PatientRequests";
import PharmacyMedicineRequests from "./pages/PharmacyMedicineRequests";
import NotFound from "./pages/NotFound";

// Lazy load pharmacy dashboard components for better performance
const DashboardLayout = lazy(() => import("./pages/pharmacy-tabs/DashboardLayoutNew").then(m => ({ default: m.DashboardLayout })));
const AnalyticsTab = lazy(() => import("./pages/pharmacy-tabs/AnalyticsTab").then(m => ({ default: m.AnalyticsTab })));
const InventoryTab = lazy(() => import("./pages/pharmacy-tabs/InventoryTab").then(m => ({ default: m.InventoryTab })));
const ChatTab = lazy(() => import("./pages/pharmacy-tabs/ChatTab").then(m => ({ default: m.ChatTab })));
const AIInsightsTab = lazy(() => import("./pages/pharmacy-tabs/AIInsightsTab").then(m => ({ default: m.AIInsightsTab })));
const BillingTab = lazy(() => import("./pages/pharmacy-tabs/BillingTab").then(m => ({ default: m.BillingTab })));
const NearbyMedicalStoresPage = lazy(() => import("./pages/NearbyMedicalStoresPage").then(m => ({ default: m.NearbyMedicalStoresPage })));

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#E8F4F8] via-[#F7F9FC] to-[#FFFFFF]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B6CA8] mx-auto mb-4"></div>
      <p className="text-[#1B6CA8] font-semibold text-lg">Loading MediTatva...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="meditatva-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/patient/dashboard" 
                  element={
                    <ProtectedRoute requiredRole={["patient", "admin"]}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/patient/modern" 
                  element={
                    <ProtectedRoute requiredRole={["patient", "admin"]}>
                      <PremiumPatientDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/patient/request-medicine" 
                  element={
                    <ProtectedRoute requiredRole={["patient", "admin"]}>
                      <MedicineRequest />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/patient/requests" 
                  element={
                    <ProtectedRoute requiredRole={["patient", "admin"]}>
                      <PatientRequests />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Pharmacy Dashboard with Nested Routes */}
                <Route 
                  path="/pharmacy/dashboard" 
                  element={
                    <ProtectedRoute requiredRole={["pharmacy", "admin"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="nearby-stores" element={<NearbyMedicalStoresPage />} />
                  <Route path="medicine-requests" element={<PharmacyMedicineRequests />} />
                  <Route path="billing" element={<BillingTab />} />
                  <Route path="inventory" element={<InventoryTab />} />
                  <Route path="analytics" element={<AnalyticsTab />} />
                  <Route path="chat" element={<ChatTab />} />
                  <Route path="ai" element={<AIInsightsTab />} />
                </Route>
                
                {/* Catch-all for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;
