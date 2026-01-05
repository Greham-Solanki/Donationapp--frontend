// src/utils/api.js
import axios from 'axios';

// Get API URL from environment variable or fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('🔗 API URL:', API_URL); // Debug log

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased to 30 seconds for image uploads
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle responses globally
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error`);
    return Promise.reject(error);
  }
);

// Handle API responses
const handleResponse = (response) => response.data;

// Handle API errors with better messages
const handleError = (error) => {
  console.error('API call error:', error);

  // Check if the error has a response (from the server)
  if (error.response) {
    const { status, data } = error.response;
    
    // Use server error message if available
    const serverMessage = data?.msg || data?.message || data?.error;
    
    switch (status) {
      case 400:
        throw new Error(serverMessage || 'Bad Request: Please check your input.');
      case 401:
        // Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error(serverMessage || 'Unauthorized: Please log in again.');
      case 403:
        throw new Error(serverMessage || 'Forbidden: You do not have permission.');
      case 404:
        throw new Error(serverMessage || 'Not Found: The resource you requested does not exist.');
      case 500:
        throw new Error(serverMessage || 'Server Error: Please try again later.');
      default:
        throw new Error(serverMessage || 'An unexpected error occurred. Please try again later.');
    }
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('Network Error: Cannot reach the server. Please check your connection and make sure the backend is running.');
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred.');
  }
};

// GET request
export const apiGet = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// POST request
export const apiPost = async (url, data, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// PUT request
export const apiPut = async (url, data, config = {}) => {
  try {
    const response = await apiClient.put(url, data, config);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// PATCH request
export const apiPatch = async (url, data, config = {}) => {
  try {
    const response = await apiClient.patch(url, data, config);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// DELETE request
export const apiDelete = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// Special function for file uploads (multipart/form-data)
export const apiPostFormData = async (url, formData) => {
  try {
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// Export the axios instance for custom configurations
export default apiClient;