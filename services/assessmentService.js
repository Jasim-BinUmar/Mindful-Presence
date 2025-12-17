/**
 * Assessment Service
 * Handles assessment flow, response management, and course recommendations
 */

import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ASSESSMENT_RESPONSES: 'assessmentResponses',
  CURRENT_ASSESSMENT_ID: 'currentAssessmentId',
  ASSESSMENT_PROGRESS: 'assessmentProgress',
};

/**
 * Assessment Service
 */
export const assessmentService = {
  /**
   * Get all available assessments for the user
   */
  getAssessments: async () => {
    try {
      const response = await api.assessments.getUserAssessments();
      return response;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  },

  /**
   * Get a specific assessment by ID
   */
  getAssessmentById: async (assessmentId) => {
    try {
      const response = await api.assessments.getById(assessmentId);
      return response;
    } catch (error) {
      console.error('Error fetching assessment:', error);
      throw error;
    }
  },

  /**
   * Save assessment response locally (for multi-step assessments)
   */
  saveResponseLocally: async (assessmentId, questionIndex, answer) => {
    try {
      const key = `${STORAGE_KEYS.ASSESSMENT_RESPONSES}_${assessmentId}`;
      const existingResponses = await AsyncStorage.getItem(key);
      const responses = existingResponses ? JSON.parse(existingResponses) : {};
      
      responses[questionIndex] = answer;
      
      await AsyncStorage.setItem(key, JSON.stringify(responses));
      return responses;
    } catch (error) {
      console.error('Error saving response locally:', error);
      throw error;
    }
  },

  /**
   * Get locally saved responses for an assessment
   */
  getLocalResponses: async (assessmentId) => {
    try {
      const key = `${STORAGE_KEYS.ASSESSMENT_RESPONSES}_${assessmentId}`;
      const responses = await AsyncStorage.getItem(key);
      return responses ? JSON.parse(responses) : {};
    } catch (error) {
      console.error('Error getting local responses:', error);
      return {};
    }
  },

  /**
   * Clear local responses for an assessment
   */
  clearLocalResponses: async (assessmentId) => {
    try {
      const key = `${STORAGE_KEYS.ASSESSMENT_RESPONSES}_${assessmentId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing local responses:', error);
    }
  },

  /**
   * Submit assessment responses to the backend
   * @param {string} assessmentId - The assessment ID
   * @param {Object} responseData - Response data in format { answerValue, answerLabel? } for single answer
   *                                or { answers: [{ answerValue, answerLabel? }, ...] } for multiple
   */
  submitAssessment: async (assessmentId, responseData) => {
    try {
      // Backend expects the response data directly, not wrapped in { responses }
      const response = await api.assessments.submit(assessmentId, responseData);
      
      // Clear local responses after successful submission
      if (response.success) {
        await assessmentService.clearLocalResponses(assessmentId);
      }
      
      return response;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  },

  /**
   * Get assessment response history
   */
  getResponseHistory: async () => {
    try {
      const response = await api.assessments.getResponseHistory();
      return response;
    } catch (error) {
      console.error('Error fetching response history:', error);
      throw error;
    }
  },

  /**
   * Save current assessment progress
   */
  saveProgress: async (assessmentId, currentQuestion, totalQuestions) => {
    try {
      const progress = {
        assessmentId,
        currentQuestion,
        totalQuestions,
        percentage: Math.round((currentQuestion / totalQuestions) * 100),
        lastUpdated: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.ASSESSMENT_PROGRESS}_${assessmentId}`,
        JSON.stringify(progress)
      );
      
      return progress;
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  },

  /**
   * Get assessment progress
   */
  getProgress: async (assessmentId) => {
    try {
      const progress = await AsyncStorage.getItem(
        `${STORAGE_KEYS.ASSESSMENT_PROGRESS}_${assessmentId}`
      );
      return progress ? JSON.parse(progress) : null;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  },

  /**
   * Clear assessment progress
   */
  clearProgress: async (assessmentId) => {
    try {
      await AsyncStorage.removeItem(
        `${STORAGE_KEYS.ASSESSMENT_PROGRESS}_${assessmentId}`
      );
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  },

  /**
   * Get recommended courses based on assessment results
   */
  getRecommendedCourses: async () => {
    try {
      const response = await api.recommendations.getUserRecommendations();
      return response;
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      throw error;
    }
  },

  /**
   * Get user's psychological profile (generated from assessments)
   */
  getUserProfile: async () => {
    try {
      const response = await api.user.getPsychologicalProfile();
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Regenerate user profile based on latest assessment responses
   */
  regenerateProfile: async () => {
    try {
      const response = await api.user.regenerateProfile();
      return response;
    } catch (error) {
      console.error('Error regenerating profile:', error);
      throw error;
    }
  },
};

export default assessmentService;

