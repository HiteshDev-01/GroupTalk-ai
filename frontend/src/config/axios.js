import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Ensure VITE_API_URL is properly set in your .env file
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Fetch token dynamically
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle errors during request setup
    return Promise.reject(error);
  }
);

export default axiosInstance;
