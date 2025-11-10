import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  isEmailVerified: boolean;
  profileImage?: {
    url: string;
    public_id: string;
  };
  preferences?: any;
  stats?: any;
  subscription?: any;
  lastLogin?: string;
  createdAt?: string;
  isDemoUser?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  demoLogin: (role: 'patient' | 'pharmacy') => Promise<boolean>;
  updateProfile: (data: any) => Promise<boolean>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: { accessToken: string; refreshToken: string } } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.tokens.accessToken,
        refreshToken: action.payload.tokens.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

// API configuration - use correct Codespaces URL
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname.includes('app.github.dev') 
  ? `https://effective-yodel-9prqww454rjhxx5r-5000.app.github.dev/api`
  : 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // API helper function
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(state.accessToken && { Authorization: `Bearer ${state.accessToken}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  };

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (!storedToken) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        // Try to get current user with stored token
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: result.data.user,
              tokens: {
                accessToken: storedToken,
                refreshToken: storedRefreshToken || '',
              },
            },
          });
        } else {
          // Token is invalid, try to refresh
          if (storedRefreshToken) {
            await refreshAccessToken();
          } else {
            localStorage.clear();
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.clear();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Store tokens in localStorage whenever they change
  useEffect(() => {
    if (state.accessToken && state.refreshToken) {
      localStorage.setItem('accessToken', state.accessToken);
      localStorage.setItem('refreshToken', state.refreshToken);
      localStorage.setItem('user', JSON.stringify(state.user));
      // Set flags that dashboard components expect
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', state.user?.role || 'user');
    }
  }, [state.accessToken, state.refreshToken, state.user]);

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh token');
      }

      // Update tokens
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);

      // Get updated user info
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.data.tokens.accessToken}`,
        },
      });

      const userResult = await userResponse.json();

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userResult.data.user,
          tokens: data.data.tokens,
        },
      });

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.clear();
      dispatch({ type: 'LOGOUT' });
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    // Check for hardcoded demo credentials first
    const demoCredentials = {
      'patient@demo.com': {
        password: 'demo123',
        user: {
          id: 'demo-patient-001',
          email: 'patient@demo.com',
          firstName: 'Demo',
          lastName: 'Patient',
          fullName: 'Demo Patient',
          role: 'patient',
          isEmailVerified: true,
          preferences: {},
          stats: {},
          subscription: null
        },
        tokens: {
          accessToken: 'demo-patient-token',
          refreshToken: 'demo-patient-refresh'
        }
      },
      'pharmacy@demo.com': {
        password: 'demo123',
        user: {
          id: 'demo-pharmacy-001',
          email: 'pharmacy@demo.com',
          firstName: 'Demo',
          lastName: 'Pharmacy',
          fullName: 'Demo Pharmacy',
          role: 'pharmacy',
          isEmailVerified: true,
          preferences: {},
          stats: {},
          subscription: null,
          pharmacyDetails: {
            name: 'Demo Pharmacy',
            license: 'PH-DEMO-001',
            address: '123 Demo Street, Demo City',
            phone: '+1-555-0123',
            location: {
              type: 'Point',
              coordinates: [76.5704, 30.7704] // Chandigarh coordinates
            }
          }
        },
        tokens: {
          accessToken: 'demo-pharmacy-token',
          refreshToken: 'demo-pharmacy-refresh'
        }
      }
    };

    // Check if using demo credentials
    const demoAccount = demoCredentials[email as keyof typeof demoCredentials];
    if (demoAccount && demoAccount.password === password) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: demoAccount.user,
          tokens: demoAccount.tokens,
        },
      });

      toast.success(`Welcome back, ${demoAccount.user.firstName}! (Demo Mode)`);
      return true;
    }

    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: data.data.user,
          tokens: data.data.tokens,
        },
      });

      toast.success(`Welcome back, ${data.data.user.firstName}!`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: data.data.user,
          tokens: data.data.tokens,
        },
      });

      toast.success(`Welcome to MediTatva, ${data.data.user.firstName}!`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const demoLogin = async (role: 'patient' | 'pharmacy'): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const data = await apiCall('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: data.data.user,
          tokens: data.data.tokens,
        },
      });

      toast.success(`Demo login successful as ${role}!`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Demo login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to invalidate refresh token
      if (state.accessToken) {
        await apiCall('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear all authentication data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData: any): Promise<boolean> => {
    try {
      const data = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      dispatch({ type: 'UPDATE_USER', payload: data.data.user });
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    demoLogin,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;