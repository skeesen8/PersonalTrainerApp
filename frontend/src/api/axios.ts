import axios, { AxiosRequestHeaders, AxiosHeaders } from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'https://scintillating-harmony-production.up.railway.app';

// Enhanced debug utility functions
const debugLog = {
    request: (config: any) => {
        console.group('🌐 API Request');
        console.log('URL:', `${config.baseURL}${config.url}`);
        console.log('Method:', config.method?.toUpperCase());
        console.log('Headers:', JSON.stringify(config.headers, null, 2));
        if (config.data) {
            console.log('Data:', config.data);
        }
        // Log CORS-specific information
        console.group('CORS Details');
        console.log('Origin:', window.location.origin);
        console.log('Credentials Mode:', config.withCredentials ? 'include' : 'same-origin');
        console.log('Content-Type:', config.headers?.['content-type']);
        console.groupEnd();
        console.groupEnd();
    },
    response: (response: any) => {
        console.group('✅ API Response');
        console.log('Status:', response.status);
        console.log('Headers:', JSON.stringify(response.headers, null, 2));
        console.log('Data:', response.data);
        // Log CORS-related response headers
        console.group('CORS Headers');
        console.log('Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
        console.log('Access-Control-Allow-Credentials:', response.headers['access-control-allow-credentials']);
        console.log('Access-Control-Allow-Headers:', response.headers['access-control-allow-headers']);
        console.log('Access-Control-Allow-Methods:', response.headers['access-control-allow-methods']);
        console.groupEnd();
        console.groupEnd();
    },
    error: (error: any) => {
        console.group('❌ API Error');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.log('Data:', error.response.data);
            // Log CORS-related error information
            if (error.response.status === 0) {
                console.group('🚫 CORS Error Details');
                console.log('Origin:', window.location.origin);
                console.log('Target URL:', error.config.url);
                console.log('Request Headers:', JSON.stringify(error.config.headers, null, 2));
                console.log('Error Message:', error.message);
                console.groupEnd();
            }
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
    withCredentials: false,
    headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
    }
});

// Request interceptor with enhanced debugging
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        // Create new headers instance
        const headers = new AxiosHeaders();
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', config.url?.includes('/token') 
            ? 'application/x-www-form-urlencoded'
            : 'application/json');

        // Add authorization header if token exists and not a token or register request
        if (token && !config.url?.includes('/token') && !config.url?.includes('/register')) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        
        config.headers = headers;
        
        // Debug logging
        debugLog.request(config);
        
        return config;
    },
    (error) => {
        debugLog.error(error);
        return Promise.reject(error);
    }
);

// Response interceptor with enhanced debugging
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