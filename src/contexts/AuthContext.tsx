import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api, { authAPI } from '../services/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  subjects?: string[];
  classesTaught?: string[] | { class: string; stream: string }[];
  streamsTaught?: string[];
  // Add other user properties as needed
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; user?: User; message?: string }>;
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
      const rawToken = localStorage.getItem('accessToken');
      const rawRefresh = localStorage.getItem('refreshToken');

      const token = rawToken && rawToken !== 'undefined' && rawToken !== 'null' ? rawToken : null;
      const refreshToken = rawRefresh && rawRefresh !== 'undefined' && rawRefresh !== 'null' ? rawRefresh : null;

      if (rawToken === 'undefined' || rawToken === 'null') {
        localStorage.removeItem('accessToken');
      }
      if (rawRefresh === 'undefined' || rawRefresh === 'null') {
        localStorage.removeItem('refreshToken');
      }

      if (token) {
        // Set token on both axios instances before making request
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          // Verify token and get user data
          const response = await authAPI.getCurrentUser();
          setUser(response.data as unknown as User);
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
      } else if (refreshToken) {
        try {
          await refreshAccessToken();
        } catch (refreshError) {
          console.error('Token recovery failed:', refreshError);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });

      const { token, refreshToken, ...userData } = response.data as any;

      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

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

      const payload = (response.data?.data || response.data) as any;
      const { token, refreshToken, ...newUser } = payload;

      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Set token on both axios instances
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(newUser as User);
      setIsAuthenticated(true);

      // Store user name in localStorage for dashboard display
      if ((newUser as User).firstName && (newUser as User).lastName) {
        localStorage.setItem('userName', `${(newUser as User).firstName} ${(newUser as User).lastName}`);
      }

      return { success: true, user: newUser as User };
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
      const response = await authAPI.refreshToken(refreshToken);

      const { token, accessToken: returnedAccessToken, user: userData } = response.data as any;
      const accessToken = returnedAccessToken || token;

      if (!accessToken || accessToken === 'undefined') {
        throw new Error('Invalid access token received from refresh');
      }

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
