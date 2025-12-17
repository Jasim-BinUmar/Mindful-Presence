/**
 * API Service
 * 
 * Centralized API client for making HTTP requests to the backend.
 * Handles authentication, error handling, and response formatting.
 */

import { endpoints, getEndpointWithQuery } from './endpoints';

// Note: Install @react-native-async-storage/async-storage if not already installed
// npm install @react-native-async-storage/async-storage
// For Expo: npx expo install @react-native-async-storage/async-storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};

/**
 * Get stored access token
 */
const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get stored refresh token
 */
const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Store tokens
 */
const storeTokens = async (accessToken, refreshToken) => {
  try {
    if (!accessToken) {
      console.warn('Attempting to store null/undefined access token');
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    console.log('Access token stored successfully');
    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      console.log('Refresh token stored successfully');
    }
    // Verify token was stored
    const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (storedToken !== accessToken) {
      console.error('Token storage verification failed!');
    }
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

/**
 * Clear stored tokens
 */
const clearTokens = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async () => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(endpoints.auth.refreshToken, {
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

    if (data.success && data.accessToken) {
      await storeTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    }

    throw new Error('Invalid token refresh response');
  } catch (error) {
    console.error('Error refreshing token:', error);
    await clearTokens();
    throw error;
  }
};

/**
 * Make API request with automatic token refresh
 */
const apiRequest = async (url, options = {}) => {
  const accessToken = await getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
    console.log('API Request with token:', url);
  } else {
    console.warn('API Request without token:', url);
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, try to refresh token and retry
  if (response.status === 401 && accessToken) {
    try {
      const newAccessToken = await refreshAccessToken();
      headers.Authorization = `Bearer ${newAccessToken}`;
      
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      // Refresh failed, clear tokens and throw error
      await clearTokens();
      throw new Error('Session expired. Please login again.');
    }
  }

  // Handle 304 Not Modified - retry with cache-busting
  if (response.status === 304) {
    console.log('Response 304 (Not Modified) for:', url, '- Retrying with cache-busting');
    // Add timestamp to force fresh request
    const separator = url.includes('?') ? '&' : '?';
    const cacheBustUrl = `${url}${separator}_t=${Date.now()}`;
    
    // Retry with cache-busting parameter
    response = await fetch(cacheBustUrl, {
      ...options,
      headers: {
        ...headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  let data;
  try {
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.error('Response text:', text.substring(0, 500)); // Log first 500 chars
        data = { message: 'Invalid JSON response', rawText: text.substring(0, 200) };
      }
    } else {
      data = {};
    }
  } catch (readError) {
    console.error('Error reading response:', readError);
    data = {};
  }

  if (!response.ok) {
    const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    console.error('API Request failed:', {
      url,
      status: response.status,
      statusText: response.statusText,
      error: errorMessage,
      data
    });
    throw error;
  }

  return data;
};

/**
 * API Service Methods
 */
export const api = {
  // ==================== AUTHENTICATION ====================
  auth: {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     */
    register: async (userData) => {
      // Register endpoint doesn't require auth, so make direct request
      const registerResponse = await fetch(endpoints.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await registerResponse.json().catch(() => ({}));

      if (!registerResponse.ok) {
        const error = new Error(data.message || `HTTP error! status: ${registerResponse.status}`);
        error.status = registerResponse.status;
        error.data = data;
        throw error;
      }

      // Store tokens if present in response
      if (data.success && data.accessToken) {
        console.log('Storing access token after registration');
        await storeTokens(data.accessToken, data.refreshToken);
        if (data.data) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data));
        }
      } else if (data.accessToken) {
        // Handle case where response structure might be different
        console.log('Storing access token (alternative structure)');
        await storeTokens(data.accessToken, data.refreshToken);
        if (data.user || data.data) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user || data.data));
        }
      }

      return data;
    },

    /**
     * Login user
     * @param {Object} credentials - { email, password }
     */
    login: async (credentials) => {
      // Login endpoint doesn't require auth, so make direct request
      const loginResponse = await fetch(endpoints.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await loginResponse.json().catch(() => ({}));

      if (!loginResponse.ok) {
        const error = new Error(data.message || `HTTP error! status: ${loginResponse.status}`);
        error.status = loginResponse.status;
        error.data = data;
        throw error;
      }

      // Store tokens if present in response
      if (data.success && data.accessToken) {
        console.log('Storing access token after login');
        await storeTokens(data.accessToken, data.refreshToken);
        if (data.data) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data));
        }
      } else if (data.accessToken) {
        // Handle case where response structure might be different
        console.log('Storing access token (alternative structure)');
        await storeTokens(data.accessToken, data.refreshToken);
        if (data.user || data.data) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user || data.data));
        }
      }

      return data;
    },

    /**
     * Logout user
     */
    logout: async () => {
      try {
        await apiRequest(endpoints.auth.logout, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        await clearTokens();
      }
    },

    /**
     * Get current user data from storage
     */
    getCurrentUser: async () => {
      try {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: async () => {
      const token = await getAccessToken();
      return !!token;
    },
  },

  // ==================== USER PROFILE ====================
  user: {
    /**
     * Get user profile
     */
    getProfile: async () => {
      return await apiRequest(endpoints.user.getProfile);
    },

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     */
    updateProfile: async (profileData) => {
      return await apiRequest(endpoints.user.updateProfile, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },

    /**
     * Change password
     * @param {Object} passwordData - { currentPassword, newPassword }
     */
    changePassword: async (passwordData) => {
      return await apiRequest(endpoints.user.changePassword, {
        method: 'PATCH',
        body: JSON.stringify(passwordData),
      });
    },

    /**
     * Get psychological profile
     */
    getPsychologicalProfile: async () => {
      return await apiRequest(endpoints.user.getPsychologicalProfile);
    },

    /**
     * Get profile insights
     * @param {Object} queryParams - Query parameters
     */
    getProfileInsights: async (queryParams = {}) => {
      const url = getEndpointWithQuery(endpoints.user.getProfileInsights, queryParams);
      return await apiRequest(url);
    },

    /**
     * Regenerate profile
     * @param {Object} options - Regeneration options
     */
    regenerateProfile: async (options = {}) => {
      return await apiRequest(endpoints.user.regenerateProfile, {
        method: 'POST',
        body: JSON.stringify(options),
      });
    },

    /**
     * Get profile history
     * @param {Object} queryParams - Query parameters
     */
    getProfileHistory: async (queryParams = {}) => {
      const url = getEndpointWithQuery(endpoints.user.getProfileHistory, queryParams);
      return await apiRequest(url);
    },

    /**
     * Get user dashboard
     */
    getDashboard: async () => {
      return await apiRequest(endpoints.user.getDashboard);
    },

    /**
     * Get dashboard statistics
     */
    getDashboardStats: async () => {
      return await apiRequest(endpoints.user.getDashboardStats);
    },

    /**
     * Get dashboard activity
     */
    getDashboardActivity: async () => {
      return await apiRequest(endpoints.user.getDashboardActivity);
    },
  },

  // ==================== COURSES ====================
  courses: {
    /**
     * Get all courses
     * @param {Object} queryParams - Query parameters (page, limit, etc.)
     */
    getAll: async (queryParams = {}) => {
      const url = getEndpointWithQuery(endpoints.courses.getAllCourses, queryParams);
      return await apiRequest(url);
    },

    /**
     * Search courses
     * @param {Object} queryParams - Search parameters
     */
    search: async (queryParams = {}) => {
      const url = getEndpointWithQuery(endpoints.courses.searchCourses, queryParams);
      return await apiRequest(url);
    },

    /**
     * Get featured courses
     */
    getFeatured: async () => {
      return await apiRequest(endpoints.courses.getFeaturedCourses);
    },

    /**
     * Get course by ID
     * @param {string} courseId - Course ID
     * @param {Object} params - Query parameters (includeDetails)
     */
    getById: async (courseId, params = {}) => {
      const url = getEndpointWithQuery(endpoints.courses.getCourse(courseId), params);
      return await apiRequest(url, { cacheBust: true });
    },

    /**
     * Get course by ID (alias for getById)
     * @param {string} courseId - Course ID
     * @param {Object} params - Query parameters (includeDetails)
     */
    getCourse: async (courseId, params = {}) => {
      const url = getEndpointWithQuery(endpoints.courses.getCourse(courseId), params);
      return await apiRequest(url, { cacheBust: true });
    },

    /**
     * Get course with enrollment info
     * @param {string} courseId - Course ID
     */
    getCourseWithEnrollment: async (courseId) => {
      return apiRequest(endpoints.courses.getCourseWithEnrollment(courseId), { cacheBust: true });
    },

    /**
     * Get lessons by course
     * @param {string} courseId - Course ID
     * @param {Object} params - Query parameters (includeBlocks)
     */
    getLessonsByCourse: async (courseId, params = {}) => {
      const url = getEndpointWithQuery(endpoints.courses.getLessonsByCourse(courseId), params);
      return apiRequest(url, { cacheBust: true });
    },

    /**
     * Get lesson by ID
     * @param {string} lessonId - Lesson ID
     * @param {Object} params - Query parameters (includeBlocks, includeContent)
     */
    getLesson: async (lessonId, params = {}) => {
      const url = getEndpointWithQuery(endpoints.courses.getLesson(lessonId), params);
      return apiRequest(url, { cacheBust: true });
    },

    /**
     * Get content blocks by lesson
     * @param {string} lessonId - Lesson ID
     */
    getBlocksByLesson: async (lessonId) => {
      return apiRequest(endpoints.courses.getBlocksByLesson(lessonId), { cacheBust: true });
    },

    /**
     * Get content block by ID
     * @param {string} blockId - Block ID
     */
    getBlock: async (blockId) => {
      return apiRequest(endpoints.courses.getBlock(blockId), { cacheBust: true });
    },

    /**
     * Enroll in course
     * @param {string} courseId - Course ID
     */
    enrollInCourse: async (courseId) => {
      return apiRequest(endpoints.courses.enrollInCourse(courseId), {
        method: 'POST',
      });
    },

    /**
     * Unenroll from course
     * @param {string} courseId - Course ID
     */
    unenrollFromCourse: async (courseId) => {
      return apiRequest(endpoints.courses.unenrollFromCourse(courseId), {
        method: 'DELETE',
      });
    },

    /**
     * Get courses by category
     * @param {string} category - Category name
     */
    getByCategory: async (category) => {
      return await apiRequest(endpoints.courses.getCoursesByCategory(category));
    },

    /**
     * Get user courses
     * @param {Object} queryParams - Query parameters
     */
    getUserCourses: async (queryParams = {}) => {
      const url = getEndpointWithQuery(endpoints.courses.getUserCourses, queryParams);
      return await apiRequest(url);
    },

    /**
     * Enroll in course
     * @param {string} courseId - Course ID
     */
    enroll: async (courseId) => {
      return await apiRequest(endpoints.courses.enrollInCourse(courseId), {
        method: 'POST',
      });
    },

    /**
     * Unenroll from course
     * @param {string} courseId - Course ID
     */
    unenroll: async (courseId) => {
      return await apiRequest(endpoints.courses.unenrollFromCourse(courseId), {
        method: 'DELETE',
      });
    },

    /**
     * Get user progress
     */
    getUserProgress: async () => {
      return await apiRequest(endpoints.courses.getUserProgress);
    },
  },

  // ==================== QUIZZES ====================
  quizzes: {
    /**
     * Get quiz by content ID
     * @param {string} quizContentId - Quiz content ID
     * @param {Object} params - Query parameters (includeAnswers)
     */
    getQuiz: async (quizContentId, params = {}) => {
      const url = getEndpointWithQuery(endpoints.quizzes.getQuiz(quizContentId), params);
      return apiRequest(url, { cacheBust: true });
    },

    /**
     * Submit quiz attempt
     * @param {string} quizContentId - Quiz content ID
     * @param {Object} attemptData - { answers, timeTaken }
     */
    submitQuizAttempt: async (quizContentId, attemptData) => {
      return apiRequest(endpoints.quizzes.submitQuizAttempt(quizContentId), {
        method: 'POST',
        body: JSON.stringify(attemptData),
      });
    },

    /**
     * Get user quiz attempts
     * @param {string} quizContentId - Quiz content ID
     */
    getUserAttempts: async (quizContentId) => {
      return apiRequest(endpoints.quizzes.getUserAttempts(quizContentId), { cacheBust: true });
    },

    /**
     * Get specific quiz attempt
     * @param {string} quizContentId - Quiz content ID
     * @param {number} attemptNumber - Attempt number
     */
    getAttempt: async (quizContentId, attemptNumber) => {
      return apiRequest(endpoints.quizzes.getAttempt(quizContentId, attemptNumber), { cacheBust: true });
    },

    /**
     * Get latest quiz attempt
     * @param {string} quizContentId - Quiz content ID
     */
    getLatestAttempt: async (quizContentId) => {
      return apiRequest(endpoints.quizzes.getLatestAttempt(quizContentId), { cacheBust: true });
    },

    /**
     * Get best quiz score
     * @param {string} quizContentId - Quiz content ID
     */
    getBestScore: async (quizContentId) => {
      return apiRequest(endpoints.quizzes.getBestScore(quizContentId), { cacheBust: true });
    },

    /**
     * Get quiz attempt summary
     * @param {string} quizContentId - Quiz content ID
     */
    getAttemptSummary: async (quizContentId) => {
      return apiRequest(endpoints.quizzes.getAttemptSummary(quizContentId), { cacheBust: true });
    },

    /**
     * Check if user can attempt quiz
     * @param {string} quizContentId - Quiz content ID
     */
    canAttemptQuiz: async (quizContentId) => {
      return apiRequest(endpoints.quizzes.canAttemptQuiz(quizContentId), { cacheBust: true });
    },
  },

  // ==================== ASSESSMENTS ====================
  assessments: {
    /**
     * Get user assessments
     */
    getUserAssessments: async () => {
      return await apiRequest(endpoints.assessments.getUserAssessments);
    },

    /**
     * Get assessment by ID
     * @param {string} assessmentId - Assessment ID
     */
    getById: async (assessmentId) => {
      return await apiRequest(endpoints.assessments.getAssessment(assessmentId));
    },

    /**
     * Submit assessment response
     * @param {string} assessmentId - Assessment ID
     * @param {Object} responses - Assessment responses
     */
    submit: async (assessmentId, responses) => {
      console.log('API: Submitting assessment:', assessmentId, 'with response:', responses);
      const result = await apiRequest(endpoints.assessments.submitAssessment(assessmentId), {
        method: 'POST',
        body: JSON.stringify(responses),
      });
      console.log('API: Assessment submission result:', result);
      return result;
    },

    /**
     * Get response history
     */
    getResponseHistory: async () => {
      return await apiRequest(endpoints.assessments.getResponseHistory);
    },
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    /**
     * Get user notifications
     * @param {Object} queryParams - Query parameters (page, limit, isRead, type, priority)
     */
    getUserNotifications: async (queryParams = {}) => {
      const url = getEndpointWithQuery(endpoints.notifications.getUserNotifications, queryParams);
      return await apiRequest(url);
    },

    /**
     * Get unread notification count
     */
    getUnreadCount: async () => {
      return await apiRequest(endpoints.notifications.getUnreadCount);
    },

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     */
    markAsRead: async (notificationId) => {
      return await apiRequest(endpoints.notifications.markAsRead(notificationId), {
        method: 'PUT',
      });
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async () => {
      return await apiRequest(endpoints.notifications.markAllAsRead, {
        method: 'PUT',
      });
    },

    /**
     * Delete notification
     * @param {string} notificationId - Notification ID
     */
    delete: async (notificationId) => {
      return await apiRequest(endpoints.notifications.deleteNotification(notificationId), {
        method: 'DELETE',
      });
    },
  },

  // ==================== RECOMMENDATIONS ====================
  recommendations: {
    /**
     * Get user recommendations
     * @param {Object} queryParams - Query parameters (page, limit, status)
     */
    getUserRecommendations: async (queryParams = {}) => {
      const url = getEndpointWithQuery(endpoints.recommendations.getUserRecommendations, queryParams);
      return await apiRequest(url);
    },

    /**
     * Mark recommendation as viewed
     * @param {string} courseId - Course ID
     */
    markAsViewed: async (courseId) => {
      return await apiRequest(endpoints.recommendations.markAsViewed(courseId), {
        method: 'POST',
      });
    },

    /**
     * Dismiss recommendation
     * @param {string} courseId - Course ID
     */
    dismiss: async (courseId) => {
      return await apiRequest(endpoints.recommendations.dismissRecommendation(courseId), {
        method: 'POST',
      });
    },
  },
};

export default api;

