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
        
        // For token requests, ensure correct content type and remove Authorization header
        if (config.url?.includes('/token')) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            delete config.headers['Authorization'];
            // Ensure credentials are included for token requests
            config.withCredentials = true;
            
            // Convert data to URLSearchParams format for token requests
            if (config.data && typeof config.data === 'string') {
                config.data = config.data; // Already in correct format
            } else if (config.data && typeof config.data === 'object') {
                const params = new URLSearchParams();
                Object.entries(config.data).forEach(([key, value]) => {
                    params.append(key, String(value));
                });
                config.data = params.toString();
            }
        } else if (token) {
            // For all other requests, add the Authorization header if we have a token
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Remove trailing slash if present in baseURL
        if (config.baseURL?.endsWith('/')) {
            config.baseURL = config.baseURL.slice(0, -1);
        }
        
        // Log request details for debugging
        console.log('Request config:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data,
            withCredentials: config.withCredentials
        });
        
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
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response error data:', error.response.data);
            console.error('Response error status:', error.response.status);
            console.error('Response error headers:', error.response.headers);
            
            // If we get a 401 Unauthorized error, redirect to login
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            // Log additional details about the request
            console.error('Request details:', {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                data: error.config?.data,
                baseURL: error.config?.baseURL
            });
        } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 