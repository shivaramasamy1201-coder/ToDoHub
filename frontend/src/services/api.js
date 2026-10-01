/**
 * API Service Client Placeholder
 * Prepared for REST API integration with backend
 */
const BASE_URL = 'http://localhost:5000/api';

export const checkHealth = async () => {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return await res.json();
  } catch (error) {
    console.error('API connection error:', error);
    return { success: false, message: 'Failed to connect to backend API' };
  }
};
