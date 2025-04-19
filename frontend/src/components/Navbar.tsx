import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-white text-2xl font-bold tracking-wider">
                            FitFlow
                        </Link>
                    </div>
                    
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/workout-plans"
                                        className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Workout Plans
                                    </Link>
                                    <Link
                                        to="/meal-plans"
                                        className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Meal Plans
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md text-sm font-medium transition-colors ml-4"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            type="button"
                            className="text-white hover:bg-white/10 p-2 rounded-md"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden" id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/workout-plans"
                                className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Workout Plans
                            </Link>
                            <Link
                                to="/meal-plans"
                                className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Meal Plans
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 