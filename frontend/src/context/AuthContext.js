import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000/api';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('/token/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login/', {
        username,
        password
      });
      
      const { user: userData, tokens } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      // Enhanced error handling
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors[0]);
        } else if (errorData.username) {
          throw new Error('Invalid username or password');
        } else if (errorData.password) {
          throw new Error('Invalid username or password');
        }
      } else if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 403) {
        throw new Error('Account is locked. Please contact support.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else if (error.response?.status === 0) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        throw new Error(error.response?.data?.error || 'Login failed. Please try again.');
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register/', userData);
      
      const { user: newUser, tokens } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      return newUser;
    } catch (error) {
      // Enhanced error handling for registration
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle field-specific errors
        if (errorData.username) {
          throw new Error(`Username: ${errorData.username[0]}`);
        } else if (errorData.email) {
          throw new Error(`Email: ${errorData.email[0]}`);
        } else if (errorData.password) {
          throw new Error(`Password: ${errorData.password[0]}`);
        } else if (errorData.first_name) {
          throw new Error(`First name: ${errorData.first_name[0]}`);
        } else if (errorData.last_name) {
          throw new Error(`Last name: ${errorData.last_name[0]}`);
        } else if (errorData.role) {
          throw new Error(`Role: ${errorData.role[0]}`);
        } else if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors[0]);
        }
      } else if (error.response?.status === 409) {
        throw new Error('Username or email already exists');
      } else if (error.response?.status === 0) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        throw new Error(error.response?.data?.error || 'Registration failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axios.post('/auth/logout/', {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/auth/profile/', userData);
      const updatedUser = response.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Profile update failed');
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await axios.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      });
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Password change failed');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      updateProfile, 
      changePassword,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 