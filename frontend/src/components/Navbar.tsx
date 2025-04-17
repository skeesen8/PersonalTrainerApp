import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-indigo-600 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-white text-xl font-bold">
                                Personal Trainer
                            </Link>
                        </div>
                        {isAuthenticated && (
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    to="/dashboard"
                                    className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/workout-plan"
                                    className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Workout Plans
                                </Link>
                                <Link
                                    to="/meal-plan"
                                    className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Meal Plans
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    to="/login"
                                    className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-white text-indigo-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 