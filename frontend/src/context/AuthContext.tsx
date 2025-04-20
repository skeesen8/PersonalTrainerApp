import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface User {
    email: string;
    full_name: string;
    is_admin: boolean;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    setToken: (token: string | null) => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    logout: () => void;
    login: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const isAuthenticated = !!token;
    const isAdmin = user?.is_admin || false;

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const fetchUserData = async () => {
        if (!token) return;
        try {
            const response = await api.get('/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            console.error('Error fetching user data:', error);
            logout();
        }
    };

    const login = async (username: string, password: string) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/token', formData.toString());
            
            if (response.data.access_token) {
                setToken(response.data.access_token);
                // After getting the token, fetch user data
                await fetchUserData();
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
            fetchUserData();
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, user, setToken, isAuthenticated, isAdmin, logout, login }}>
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