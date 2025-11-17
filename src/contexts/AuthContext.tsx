import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api, { authAPI } from '../services/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  // Add other user properties as needed
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token) {
        // Set token on both axios instances before making request
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          // Verify token and get user data
          const response = await authAPI.getCurrentUser();
          setUser(response.data.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          // Try to refresh token
          if (refreshToken) {
            try {
              await refreshAccessToken();
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password, role: 'student' }); // Default role, adjust as needed

      const { token, ...userData } = response.data.data;

      localStorage.setItem('accessToken', token);
      // Note: Backend doesn't return refreshToken yet

      // Set token on both axios instances
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData as User);
      setIsAuthenticated(true);

      // Store user name in localStorage for dashboard display
      if ((userData as User).firstName && (userData as User).lastName) {
        localStorage.setItem('userName', `${(userData as User).firstName} ${(userData as User).lastName}`);
      }

      return { success: true, user: userData as User };
    } catch (error: any) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);

      const { token, ...newUser } = response.data.data;

      localStorage.setItem('accessToken', token);
      // Note: Backend doesn't return refreshToken yet

      // Set token on both axios instances
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(newUser);
      setIsAuthenticated(true);

      // Store user name in localStorage for dashboard display
      if (newUser.firstName && newUser.lastName) {
        localStorage.setItem('userName', `${newUser.firstName} ${newUser.lastName}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: (error as any).response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Clear axios authorization headers
    delete axios.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];

    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authAPI.refreshToken({ refreshToken });

      const { token: accessToken, user: userData } = response.data.data;

      localStorage.setItem('accessToken', accessToken);

      // Set token on both axios instances
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      setUser(userData as User);
      setIsAuthenticated(true);

      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Axios interceptor to handle token refresh on 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Only attempt refresh if we actually have a refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            // No refresh token -> ensure logout and reject without throwing from refresh
            logout();
            return Promise.reject(new Error('No refresh token available'));
          }

          try {
            await refreshAccessToken();
            // Retry the original request with new token
            originalRequest.headers['Authorization'] = axios.defaults.headers.common['Authorization'];
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
