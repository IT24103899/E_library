/**
 * API Fetch Service
 * Centralized fetch utility that uses the correct API URL based on environment
 */

import { API_BASE_URL } from './ApiConfig';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }
  return response.json().catch(() => null);
};

export const apiService = {
  /**
   * Make a GET request
   */
  get: async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    return handleResponse(response);
  },

  /**
   * Make a POST request
   */
  post: async (endpoint, data = null, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return handleResponse(response);
  },

  /**
   * Make a DELETE request
   */
  delete: async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    return handleResponse(response);
  },

  /**
   * Get the current API base URL (useful for debugging)
   */
  getBaseUrl: () => API_BASE_URL,
};

export default apiService;
