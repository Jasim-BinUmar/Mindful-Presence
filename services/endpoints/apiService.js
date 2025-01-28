import endpoints from './endpoints';

const apiService = {
  get: async (url, options = {}) => {
    const response = await fetch(url, { method: 'GET', ...options });
    return response.json();
  },
  post: async (url, data, options = {}) => {
    try {
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        ...options,
      });
  
     
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return response.json();
    } catch (error) {
      
      throw error; // Rethrow the error to handle it further up
    }
  },
};

export default apiService;
