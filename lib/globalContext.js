import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
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
  const [showRecommendations, setShowRecommendationsState] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await api.user.getSettings();
      if (response.success && response.data) {
        const settings = response.data.settings || response.data;
        const recommendation = settings?.recommendation;
        if (typeof recommendation === 'boolean') {
          setShowRecommendationsState(recommendation);
        }
      }
    } catch (error) {
    }
  };

  const setShowRecommendations = async (value) => {
    setShowRecommendationsState(value);
    try {
      await api.user.updateSettings({ recommendation: value });
    } catch (error) {
      setShowRecommendationsState(!value);
    }
  };

  useEffect(() => {
    api.setSessionExpiredHandler(() => {
      setIsAuthenticated(false);
      setUser(null);
      router.replace('/(auth)/userAuthScreen');
    });
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const isAuth = await api.auth.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        try {
          const profileResponse = await api.user.getProfile();
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
            await AsyncStorage.setItem('userData', JSON.stringify(profileResponse.data));
          } else {
            const userData = await api.auth.getCurrentUser();
            setUser(userData);
          }
          await fetchUserSettings();
        } catch (profileError) {
          console.error('Error fetching profile from backend:', profileError);
          if (profileError?.message?.includes('Session expired')) {
            setIsAuthenticated(false);
            setUser(null);
          } else {
            const userData = await api.auth.getCurrentUser();
            setUser(userData);
            await fetchUserSettings();
          }
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
    showRecommendations,
    setShowRecommendations,
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