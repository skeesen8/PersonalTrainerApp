import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        admin_code: '',
        is_admin: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Clear any existing Authorization header before registration
            delete api.defaults.headers.common['Authorization'];

            // Register the user
            await api.post('/users/', {
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                admin_code: formData.admin_code || undefined,
                is_admin: formData.is_admin
            });

            // Login after successful registration
            try {
                await login(formData.email, formData.password);
                navigate('/dashboard');
            } catch (loginErr: any) {
                console.error('Login error after registration:', loginErr);
                setError('Registration successful but login failed. Please try logging in manually.');
                navigate('/login');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.detail || 'Failed to register. Please try again.';
            setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] px-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 miami-gradient bg-clip-text text-transparent">
                        FitFlow
                    </h1>
                    <p className="text-white/60">Create your fitness account</p>
                </div>

                {/* Registration Card */}
                <div className="miami-card p-8 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-white/80 mb-2">
                                Full Name
                            </label>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                required
                                className="miami-input"
                                placeholder="Enter your full name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="miami-input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="miami-input"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="admin_code" className="block text-sm font-medium text-white/80 mb-2">
                                Admin Code (Optional)
                            </label>
                            <input
                                id="admin_code"
                                name="admin_code"
                                type="password"
                                className="miami-input"
                                placeholder="Enter admin code if you have one"
                                value={formData.admin_code}
                                onChange={(e) => setFormData({ ...formData, admin_code: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="is_admin"
                                name="is_admin"
                                type="checkbox"
                                className="h-4 w-4 rounded border-white/20 bg-white/10 checked:bg-[#00f0ff]"
                                checked={formData.is_admin}
                                onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                                disabled={isLoading}
                            />
                            <label htmlFor="is_admin" className="ml-2 block text-sm text-white/80">
                                Register as Admin
                            </label>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            className="mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-white/60 hover:text-white text-sm transition-colors"
                                disabled={isLoading}
                            >
                                Already have an account? Sign in
                            </button>
                        </div>
                    </form>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00f0ff] rounded-full filter blur-[128px] opacity-20"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#ff69b4] rounded-full filter blur-[128px] opacity-20"></div>
            </div>
        </div>
    );
};

export default Register; 