import endpoints from './endpoints';

const apiService = {
  get: async (url, options = {}) => {
    const response = await fetch(url, { method: 'GET', ...options });
    return response.json();
  },
  post: async (url, data, options = {}) => {
    try {
      console.log("Inside apiService URL is:", url);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        ...options,
      });
  
      console.log("Response in apiService:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return response.json();
    } catch (error) {
      console.error("Error in API Service POST:", error.message);
      throw error; // Rethrow the error to handle it further up
    }
  },
};

export default apiService;
