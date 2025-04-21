import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'https://scintillating-harmony-production.up.railway.app';

// Debug utility functions
const debugLog = {
    request: (config: any) => {
        console.group('🌐 API Request');
        console.log('URL:', `${config.baseURL}${config.url}`);
        console.log('Method:', config.method?.toUpperCase());
        console.log('Headers:', config.headers);
        if (config.data) {
            console.log('Data:', config.data);
        }
        console.groupEnd();
    },
    response: (response: any) => {
        console.group('✅ API Response');
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Data:', response.data);
        console.groupEnd();
    },
    error: (error: any) => {
        console.group('❌ API Error');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Headers:', error.response.headers);
            console.log('Data:', error.response.data);
        } else if (error.request) {
            console.log('No response received');
            console.log('Request:', error.request);
        } else {
            console.log('Error:', error.message);
        }
        console.log('Config:', error.config);
        console.groupEnd();
    }
};

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
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
        }
        
        // Debug logging
        debugLog.request(config);
        
        return config;
    },
    (error) => {
        debugLog.error(error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        debugLog.response(response);
        return response;
    },
    (error) => {
        debugLog.error(error);
        
        if (error.response?.status === 401) {
            console.warn('🔒 Authentication token expired or invalid');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance; 