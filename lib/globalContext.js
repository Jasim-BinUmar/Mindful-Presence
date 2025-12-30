import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GlobalContext = createContext();

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const isAuth = await api.auth.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        // Try to fetch fresh profile from backend
        try {
          const profileResponse = await api.user.getProfile();
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
            // Also update AsyncStorage with fresh data
            await AsyncStorage.setItem('userData', JSON.stringify(profileResponse.data));
          } else {
            // Fallback to stored user data
            const userData = await api.auth.getCurrentUser();
            setUser(userData);
          }
        } catch (profileError) {
          console.error('Error fetching profile from backend:', profileError);
          // Fallback to stored user data if profile fetch fails
          const userData = await api.auth.getCurrentUser();
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.auth.login(credentials);
      
      // Check if login was successful (multiple possible response structures)
      const isSuccess = response.success || response.accessToken || (response.status === 200);
      
      if (isSuccess) {
        // Set user data from various possible response structures
        const userData = response.data || response.user || response;
        if (userData) {
          setUser(userData);
        }
        setIsAuthenticated(true);
        
        // Re-check auth to ensure token is properly stored
        await checkAuth();
      }
      
      return response;
    } catch (error) {
      console.error('Login error in globalContext:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.auth.register(userData);
      
      // Check if registration was successful (multiple possible response structures)
      const isSuccess = response.success || response.accessToken || (response.status === 201 || response.status === 200);
      
      if (isSuccess) {
        // Set user data from various possible response structures
        const userData = response.data || response.user || response;
        if (userData) {
          setUser(userData);
        }
        setIsAuthenticated(true);
        
        // Re-check auth to ensure token is properly stored
        await checkAuth();
      }
      
      return response;
    } catch (error) {
      console.error('Registration error in globalContext:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
    setAssessments([]);
    setCourses([]);
  };

  const fetchUserAssessments = async () => {
    try {
      const response = await api.assessments.getUserAssessments();
      if (response.success) {
        setAssessments(response.data);
      }
      return response;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  };

  const fetchUserCourses = async () => {
    try {
      const response = await api.courses.getUserCourses();
      if (response.success) {
        setCourses(response.data);
      }
      return response;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    assessments,
    courses,
    login,
    register,
    logout,
    checkAuth,
    fetchUserAssessments,
    fetchUserCourses,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

// Legacy support for content ID
let contentId;
export const getContentId = () => contentId;
export const setContent = (id) => { contentId = id; };