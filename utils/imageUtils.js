/**
 * Image and Video URL Utilities
 * 
 * Handles normalization of image/video URLs from the backend uploads folder.
 * Ensures URLs are properly formatted for display in the frontend.
 * Uses BASE_URL from endpoints.js to ensure consistency.
 */

import { getBaseServerUrl } from '../services/endpoints';

/**
 * Get the base API URL without the /api/v1 suffix
 * Uses BASE_URL from endpoints.js dynamically
 * @returns {string} Base URL (e.g., http://192.168.1.10:3005)
 */
const getBaseUrl = () => {
  let url = getBaseServerUrl();

  // Replace localhost with the actual IP if needed
  // This handles cases where the backend might return localhost URLs
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Extract IP from the base URL if available
    const ipMatch = url.match(/(\d+\.\d+\.\d+\.\d+:\d+)/);
    if (ipMatch) {
      url = url.replace(/localhost:\d+|127\.0\.0\.1:\d+/, ipMatch[1]);
    }
  }

  return url;
};

/**
 * Normalize an image or video URL
 * Handles:
 * - Relative paths (e.g., /uploads/images/file.jpg or uploads/images/file.jpg)
 * - Absolute URLs (e.g., http://example.com/image.jpg)
 * - Already normalized URLs
 * 
 * @param {string|null|undefined} url - The URL to normalize
 * @returns {string|null} Normalized URL or null if invalid
 */
export const normalizeMediaUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Trim whitespace
  url = url.trim();

  // Filter out placeholder/example URLs
  if (url.includes('example.com') || url.includes('placeholder')) {
    return null;
  }

  // If already an absolute URL (http:// or https://), check for localhost
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Replace localhost/127.0.0.1 with actual server IP
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      const baseUrl = getBaseUrl();
      // Extract the path from the URL
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      // Replace localhost with base URL
      return `${baseUrl}${path}`;
    }
    return url;
  }

  // If it's a data URL, return as is
  if (url.startsWith('data:')) {
    return url;
  }

  // Get base URL
  const baseUrl = getBaseUrl();

  // Handle different URL formats
  let path = url;

  // If it starts with /uploads/, remove the leading slash
  if (path.startsWith('/uploads/')) {
    path = path.substring(1); // Remove leading /
  }
  // If it starts with uploads/ (no leading slash), keep as is
  else if (path.startsWith('uploads/')) {
    // Already correct format
  }
  // If it's just a filename or path without uploads prefix, add it
  else {
    // Remove leading slash if present
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    // Add uploads prefix
    path = `uploads/${path}`;
  }

  // Normalize path separators (handle both / and \)
  path = path.replace(/\\/g, '/');

  // Construct full URL
  const normalizedUrl = `${baseUrl}/${path}`;

  // Debug logging (can be removed in production)
  if (__DEV__) {
    console.log('🖼️ Image URL normalization:', {
      original: url,
      normalized: normalizedUrl,
      baseUrl: baseUrl,
      path: path
    });
  }

  return normalizedUrl;
};

/**
 * Normalize multiple URLs (for arrays of images/videos)
 * @param {Array<string>} urls - Array of URLs to normalize
 * @returns {Array<string|null>} Array of normalized URLs
 */
export const normalizeMediaUrls = (urls) => {
  if (!Array.isArray(urls)) {
    return [];
  }
  return urls.map(url => normalizeMediaUrl(url));
};

/**
 * Check if a URL is valid for display
 * @param {string|null|undefined} url - The URL to check
 * @returns {boolean} True if URL is valid
 */
export const isValidMediaUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return url.trim().length > 0;
};

/**
 * Get fallback image source
 * @param {string|null|undefined} url - The URL to normalize
 * @param {any} fallbackImage - Fallback image (imported image object)
 * @returns {object} Image source object for React Native Image component
 */
export const getImageSource = (url, fallbackImage = null) => {
  const normalizedUrl = normalizeMediaUrl(url);

  if (normalizedUrl) {
    return { uri: normalizedUrl };
  }

  // Return fallback image if provided, otherwise return null
  // Components should handle null by using their own fallback
  return fallbackImage;
};

/**
 * Get video source for expo-av Video component
 * @param {string|null|undefined} url - The video URL to normalize
 * @returns {object|null} Video source object or null
 */
export const getVideoSource = (url) => {
  const normalizedUrl = normalizeMediaUrl(url);

  if (normalizedUrl) {
    return { uri: normalizedUrl };
  }

  return null;
};

/**
 * Extract YouTube ID from a URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} The YouTube video ID or null
 */
export const getYoutubeId = (url) => {
  if (!url || typeof url !== 'string') return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};
