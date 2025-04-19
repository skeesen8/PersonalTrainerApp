import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'https://scintillating-harmony-production.up.railway.app';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // For token requests, ensure correct content type and remove trailing slash from baseURL
        if (config.url?.includes('/token')) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            // Remove trailing slash if present in baseURL
            if (config.baseURL?.endsWith('/')) {
                config.baseURL = config.baseURL.slice(0, -1);
            }
        }
        
        console.log('Request:', config);
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
        console.log('Response:', response);
        return response;
    },
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response error data:', error.response.data);
            console.error('Response error status:', error.response.status);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 