import axios from "axios";

// API Configuration
const BASE_URL = "http://localhost:8080";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 second timeout
});

// Request Interceptor - Attach auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle common errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - session expired
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("adminLoggedIn");
      
      // Redirect to home if not already there
      if (window.location.hash !== "#/") {
        window.location.hash = "#/";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
