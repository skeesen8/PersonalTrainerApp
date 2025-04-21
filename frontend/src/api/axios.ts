import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'https://scintillating-harmony-production.up.railway.app';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        // Ensure headers object exists
        config.headers = config.headers || {};
        
        // For token requests, ensure correct content type and remove Authorization header
        if (config.url?.includes('/token')) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            delete config.headers['Authorization'];
        } else if (token) {
            // For all other requests, add the Authorization header if we have a token
            config.headers['Authorization'] = `Bearer ${token}`;
            // Ensure content type is set for non-form requests
            config.headers['Content-Type'] = 'application/json';
        }
        
        // Log request details for debugging
        console.log('Request config:', config);
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('Response error data:', error.response.data);
            console.error('Response error status:', error.response.status);
            console.error('Response error headers:', error.response.headers);
            
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            
            // Handle CORS errors
            if (error.response.status === 0 && error.message.includes('CORS')) {
                console.error('CORS Error:', error);
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 