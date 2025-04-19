import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'https://scintillating-harmony-production.up.railway.app' || 'http://localhost:8000';

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
        // For token requests, ensure correct content type
        if (config.url?.includes('/token')) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        
        // Get nonce from meta tag if available
        const nonceMeta = document.querySelector('meta[name="csp-nonce"]');
        if (nonceMeta) {
            config.headers['X-Nonce'] = nonceMeta.getAttribute('content');
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
        // Store nonce from response headers if available
        const nonce = response.headers['x-nonce'];
        if (nonce) {
            const meta = document.querySelector('meta[name="csp-nonce"]') || 
                        document.createElement('meta');
            meta.setAttribute('name', 'csp-nonce');
            meta.setAttribute('content', nonce);
            if (!meta.parentNode) {
                document.head.appendChild(meta);
            }
        }
        
        console.log('Response:', response);
        return response;
    },
    (error) => {
        console.error('Response error:', error);
        return Promise.reject(error);
    }
);

export default axiosInstance; 