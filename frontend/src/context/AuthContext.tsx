import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    isAuthenticated: boolean;
    logout: () => void;
    login: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });

    const isAuthenticated = !!token;

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const login = async (username: string, password: string) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/token', formData.toString());
            
            if (response.data.access_token) {
                setToken(response.data.access_token);
            } else {
                throw new Error('No access token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, setToken, isAuthenticated, logout, login }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 