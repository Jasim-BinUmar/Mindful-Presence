/**
 * API Endpoints Configuration
 * 
 * This file contains all user-facing API endpoints organized by module.
 * Base URL: /api/v1
 * 
 *
 * Usage:
 * import { endpoints } from '../services/endpoints';
 * const url = endpoints.auth.login;
 */
// Export BASE_URL so it can be used in other files (like imageUtils.js)
// Production URL: https://api.dealsai.net/api/v1 (set in .env file)
// Falls back to local development URL if EXPO_PUBLIC_API_URL is not set

// export const BASE_URL =
//   process.env.EXPO_PUBLIC_API_URL ||
//   'https://api.dealsai.net/api/v1';

// // Get base server URL without /api/v1 suffix (for image/video URLs)
// export const getBaseServerUrl = () => {
//   const baseUrl = BASE_URL;
//   // Remove /api/v1 if present to get the base server URL
//   let url = baseUrl.replace(/\/api\/v1\/?$/, '');
//   return url;
// };

// Get the correct backend URL
// Priority: 1. Environment variable, 2. Fallback to configured IP
const getBackendUrl = () => {
  // First check for environment variable (highest priority)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Default fallback - IMPORTANT: Update this based on your setup:
  // - Android Emulator: Use 'http://10.0.2.2:3005/api/v1' (10.0.2.2 is the emulator's alias for host machine)
  // - iOS Simulator: Use 'http://localhost:3005/api/v1' or 'http://127.0.0.1:3005/api/v1'
  // - Physical Device (Expo Go): Use your machine's actual IP on the same WiFi network
  
  // For Physical Device using Expo Go (your current setup):
  // Make sure your phone and computer are on the SAME WiFi network
  // Updated to match your actual machine IP: 192.168.1.3
  const defaultUrl = 'http://192.168.1.3:3005/api/v1';
  
  // If using Android Emulator, change to:
  // const defaultUrl = 'http://10.0.2.2:3005/api/v1';
  
  // If using iOS Simulator, change to:
  // const defaultUrl = 'http://localhost:3005/api/v1';

  return defaultUrl;
};

export const BASE_URL = getBackendUrl();

export const getBaseServerUrl = () => BASE_URL;



/**
 * API Endpoints organized by module
 */
export const endpoints = {
  // ==================== AUTHENTICATION ====================
  auth: {
    register: `${BASE_URL}/auth/register`, // Sends OTP (backward compatible)
    registerVerifyOtp: `${BASE_URL}/auth/register/verify-otp`, // Verifies OTP and creates user
    registerResendOtp: `${BASE_URL}/auth/register/resend-otp`, // Resends OTP
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

    // Favorites
    getFavorites: `${BASE_URL}/user/favorites`,
    getFavoriteIds: `${BASE_URL}/user/favorites/ids`,
    toggleFavorite: (courseId) => `${BASE_URL}/user/favorites/${courseId}`,

    // Settings
    getSettings: `${BASE_URL}/user/settings`,
    updateSettings: `${BASE_URL}/user/settings`,
  },

  // ==================== COURSES ====================
  courses: {
    // Public Course Routes
    getAllCourses: `${BASE_URL}/courses`,
    searchCourses: `${BASE_URL}/courses/search`,
    getFeaturedCourses: `${BASE_URL}/courses/featured`,
    getCourse: (id) => `${BASE_URL}/courses/${id}`,
    getCourseStructure: (courseId) => `${BASE_URL}/courses/${courseId}/structure`,
    getCourseStructurePreview: (courseId) => `${BASE_URL}/courses/${courseId}/structure/preview`,
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
    getCourseProgress: (courseId) => `${BASE_URL}/user/courses/${courseId}/progress`,
    updateLessonProgress: (lessonId) => `${BASE_URL}/user/lessons/${lessonId}/progress`,
    getLastViewed: (courseId) => `${BASE_URL}/user/courses/${courseId}/last-viewed`,

    // Certificates
    getUserCertificates: `${BASE_URL}/user/certificates`,
    generateCertificate: (courseId) => `${BASE_URL}/user/courses/${courseId}/certificate`,
  },

  // ==================== QUIZZES ====================
  quizzes: {
    // Public
    getQuiz: (quizContentId) => `${BASE_URL}/quizzes/${quizContentId}`,

    // User Quiz Routes (Authenticated)
    submitFullQuiz: (quizId) => `${BASE_URL}/quizzes/${quizId}/submit-full`,
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

  // ==================== PAYMENTS ====================
  payments: {
    createPaymentIntent: `${BASE_URL}/payments/create-payment-intent`,
    confirmPayment: `${BASE_URL}/payments/confirm-payment`,
    getPaymentHistory: `${BASE_URL}/payments/history`,
  },

  // ==================== APPOINTMENTS & DOCTORS ====================
  appointments: {
    // Doctors
    getAllDoctors: `${BASE_URL}/user/doctors`,
    getDoctorById: (doctorId) => `${BASE_URL}/user/doctors/${doctorId}`,
    getDoctorWithSchedule: (doctorId) => `${BASE_URL}/user/doctors/${doctorId}/schedule`,

    // Available Doctors & Slots
    getAvailableDoctors: `${BASE_URL}/user/appointments/available-doctors`,
    getWeekView: (doctorId) => `${BASE_URL}/user/appointments/week-view/${doctorId}`,
    getTimeSlots: (doctorId) => `${BASE_URL}/user/appointments/time-slots/${doctorId}`,

    // Appointments
    bookAppointment: `${BASE_URL}/user/appointments`,
    getUserAppointments: `${BASE_URL}/user/appointments`,
    getAppointmentById: (appointmentId) => `${BASE_URL}/user/appointments/${appointmentId}`,
    getAppointmentHistory: `${BASE_URL}/user/appointments/history`,
    getUpcomingAppointments: `${BASE_URL}/user/appointments/upcoming`,
    cancelAppointment: (appointmentId) => `${BASE_URL}/user/appointments/${appointmentId}/cancel`,
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

