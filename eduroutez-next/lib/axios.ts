import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authentication header if token exists
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['x-access-token'] = accessToken;
    }
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      config.headers['x-refresh-token'] = refreshToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle response errors globally
    if (error.response?.status === 401) {
      // redirect to login page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
