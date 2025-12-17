/**
 * API Endpoints Configuration
 * 
 * This file contains all user-facing API endpoints organized by module.
 * Base URL: /api/v1
 * 
 * Usage:
 * import { endpoints } from '../services/endpoints';
 * const url = endpoints.auth.login;
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.3:3005/api/v1';


/**
 * API Endpoints organized by module
 */
export const endpoints = {
  // ==================== AUTHENTICATION ====================
  auth: {
    register: `${BASE_URL}/auth/register`,
    login: `${BASE_URL}/auth/login`,
    refreshToken: `${BASE_URL}/auth/refresh-token`,
    logout: `${BASE_URL}/auth/logout`,
  },

  // ==================== USER PROFILE & SETTINGS ====================
  user: {
    // Profile
    getProfile: `${BASE_URL}/user/profile`,
    updateProfile: `${BASE_URL}/user/profile`,
    changePassword: `${BASE_URL}/user/password`,
    
    // Psychological Profile
    getPsychologicalProfile: `${BASE_URL}/user/psychological-profile`,
    getProfileInsights: `${BASE_URL}/user/profile/insights`,
    regenerateProfile: `${BASE_URL}/user/profile/regenerate`,
    getProfileHistory: `${BASE_URL}/user/profile/history`,
    
    // Dashboard
    getDashboard: `${BASE_URL}/user/dashboard`,
    getDashboardStats: `${BASE_URL}/user/dashboard/stats`,
    getDashboardActivity: `${BASE_URL}/user/dashboard/activity`,
  },

  // ==================== COURSES ====================
  courses: {
    // Public Course Routes
    getAllCourses: `${BASE_URL}/courses`,
    searchCourses: `${BASE_URL}/courses/search`,
    getFeaturedCourses: `${BASE_URL}/courses/featured`,
    getCourse: (id) => `${BASE_URL}/courses/${id}`,
    getCoursesByCategory: (category) => `${BASE_URL}/courses/category/${category}`,
    getCourseWithEnrollment: (id) => `${BASE_URL}/courses/${id}/enrollment`,
    getRecommendedCourses: (id) => `${BASE_URL}/courses/${id}/recommendations`,
    getCourseStats: (id) => `${BASE_URL}/courses/${id}/stats`,
    getCoursePreview: (courseId) => `${BASE_URL}/courses/${courseId}/preview`,
    
    // User Course Routes (Authenticated)
    getUserCourses: `${BASE_URL}/user/courses`,
    searchUserCourses: `${BASE_URL}/user/courses/search`,
    getUserCourse: (courseId) => `${BASE_URL}/user/courses/${courseId}`,
    enrollInCourse: (courseId) => `${BASE_URL}/user/courses/${courseId}/enroll`,
    unenrollFromCourse: (courseId) => `${BASE_URL}/user/courses/${courseId}/unenroll`,
    
    // Lessons
    getLesson: (id) => `${BASE_URL}/lessons/${id}`,
    getLessonsByCourse: (courseId) => `${BASE_URL}/courses/${courseId}/lessons`,
    
    // Content Blocks
    getBlocksByLesson: (lessonId) => `${BASE_URL}/lessons/${lessonId}/blocks`,
    getBlock: (id) => `${BASE_URL}/content/blocks/${id}`,
    renderBlock: (id) => `${BASE_URL}/content/blocks/${id}/render`,
    renderLesson: (lessonId) => `${BASE_URL}/lessons/${lessonId}/render`,
    
    // User Progress
    getUserProgress: `${BASE_URL}/user/progress`,
    
    // Certificates
    getUserCertificates: `${BASE_URL}/user/certificates`,
    generateCertificate: (courseId) => `${BASE_URL}/user/courses/${courseId}/certificate`,
  },

  // ==================== QUIZZES ====================
  quizzes: {
    // Public
    getQuiz: (quizContentId) => `${BASE_URL}/quizzes/${quizContentId}`,
    
    // User Quiz Routes (Authenticated)
    submitQuizAttempt: (quizContentId) => `${BASE_URL}/user/quizzes/${quizContentId}/submit`,
    getUserAttempts: (quizContentId) => `${BASE_URL}/user/quizzes/${quizContentId}/attempts`,
    getAttempt: (quizContentId, attemptNumber) => 
      `${BASE_URL}/user/quizzes/${quizContentId}/attempts/${attemptNumber}`,
    getLatestAttempt: (quizContentId) => 
      `${BASE_URL}/user/quizzes/${quizContentId}/latest-attempt`,
    getBestScore: (quizContentId) => 
      `${BASE_URL}/user/quizzes/${quizContentId}/best-score`,
    getAttemptSummary: (quizContentId) => 
      `${BASE_URL}/user/quizzes/${quizContentId}/summary`,
    canAttemptQuiz: (quizContentId) => 
      `${BASE_URL}/user/quizzes/${quizContentId}/can-attempt`,
    getCourseQuizPerformance: (courseId) => 
      `${BASE_URL}/user/courses/${courseId}/quiz-performance`,
    getLessonQuizPerformance: (lessonId) => 
      `${BASE_URL}/user/lessons/${lessonId}/quiz-performance`,
  },

  // ==================== ASSESSMENTS ====================
  assessments: {
    // Public Tags
    getAllTags: `${BASE_URL}/tags`,
    getTag: (id) => `${BASE_URL}/tags/${id}`,
    getTagsByCategory: (category) => `${BASE_URL}/tags/category/${category}`,
    
    // User Assessment Routes (Authenticated)
    getUserAssessments: `${BASE_URL}/user/assessments`,
    getAssessment: (id) => `${BASE_URL}/user/assessments/${id}`,
    submitAssessment: (id) => `${BASE_URL}/user/assessments/${id}/submit`,
    getResponseHistory: `${BASE_URL}/user/assessment-responses`,
    updateResponse: (assessmentId) => 
      `${BASE_URL}/user/assessments/${assessmentId}/response`,
    
    // User Profile from Assessments
    getUserProfile: `${BASE_URL}/user/profile`,
    getProfileInsights: `${BASE_URL}/user/profile/insights`,
    regenerateProfile: `${BASE_URL}/user/profile/regenerate`,
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    getUserNotifications: `${BASE_URL}/user/notifications`,
    getUnreadCount: `${BASE_URL}/user/notifications/unread/count`,
    markAsRead: (id) => `${BASE_URL}/user/notifications/${id}/read`,
    markAllAsRead: `${BASE_URL}/user/notifications/read-all`,
    deleteNotification: (id) => `${BASE_URL}/user/notifications/${id}`,
    deleteAllRead: `${BASE_URL}/user/notifications/read`,
  },

  // ==================== RECOMMENDATIONS ====================
  recommendations: {
    getUserRecommendations: `${BASE_URL}/user/recommendations`,
    markAsViewed: (courseId) => 
      `${BASE_URL}/user/recommendations/${courseId}/view`,
    dismissRecommendation: (courseId) => 
      `${BASE_URL}/user/recommendations/${courseId}/dismiss`,
  },

  // ==================== TAGS ====================
  tags: {
    getAllTags: `${BASE_URL}/tags`,
    getTag: (id) => `${BASE_URL}/tags/${id}`,
    getTagsByCategory: (category) => `${BASE_URL}/tags/category/${category}`,
    getCourseTags: (courseId) => `${BASE_URL}/courses/${courseId}/tags`,
    getCoursesByTag: (tagId) => `${BASE_URL}/tags/${tagId}/courses`,
  },
};

/**
 * Helper function to build query string
 * @param {Object} params - Query parameters
 * @returns {string} - Formatted query string
 */
export const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return '';
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  
  return `?${queryParams.toString()}`;
};

/**
 * Helper function to get full URL with query params
 * @param {string} endpoint - Base endpoint URL
 * @param {Object} queryParams - Query parameters
 * @returns {string} - Full URL with query string
 */
export const getEndpointWithQuery = (endpoint, queryParams = {}) => {
  const queryString = buildQueryString(queryParams);
  return `${endpoint}${queryString}`;
};

export default endpoints;

