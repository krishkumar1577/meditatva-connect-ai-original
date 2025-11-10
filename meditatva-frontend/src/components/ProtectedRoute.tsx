import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = [], 
  requireAuth = true 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#E8F4F8] via-[#F7F9FC] to-[#FFFFFF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B6CA8] mx-auto mb-4"></div>
          <p className="text-[#1B6CA8] font-semibold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Check role permissions
  if (requiredRole.length > 0 && user && !requiredRole.includes(user.role)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#E8F4F8] via-[#F7F9FC] to-[#FFFFFF]">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required role: {requiredRole.join(' or ')} | Your role: {user.role}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};