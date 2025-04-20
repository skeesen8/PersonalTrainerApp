import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { FiMenu } from 'react-icons/fi';

interface NavLinkProps {
    to: string;
    children: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    onMouseEnter: (element: HTMLAnchorElement) => void;
    onMouseLeave: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ 
    to, 
    children, 
    isActive,
    onClick,
    onMouseEnter,
    onMouseLeave 
}) => {
    const linkRef = useRef<HTMLAnchorElement>(null);

    return (
        <Link
            ref={linkRef}
            to={to}
            className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 no-underline
                ${isActive 
                    ? 'text-white' 
                    : 'text-white/70 hover:text-white'
                }`}
            onClick={onClick}
            onMouseEnter={() => linkRef.current && onMouseEnter(linkRef.current)}
            onMouseLeave={onMouseLeave}
            style={{ textDecoration: 'none' }}
        >
            {children}
        </Link>
    );
};

const NavigationMarker: React.FC<{
    x: number;
    width: number;
    height: number;
}> = ({ x, width, height }) => (
    <div
        className="absolute bottom-0 transition-all duration-300 ease-in-out pointer-events-none bg-white rounded-t-md"
        style={{
            left: `${x}px`,
            width: `${width}px`,
            height: `${height}px`,
            opacity: width === 0 ? 0 : 1,
        }}
    />
);

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.pathname);
    const [markerStyle, setMarkerStyle] = useState({ x: 0, width: 0, height: 2 });
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const updateMarkerPosition = (element: HTMLElement | null) => {
        if (element) {
            const rect = element.getBoundingClientRect();
            const navRect = element.parentElement?.getBoundingClientRect();
            if (navRect) {
                setMarkerStyle({
                    x: rect.left - navRect.left,
                    width: rect.width,
                    height: hoveredTab ? 3 : 2
                });
            }
        }
    };

    useEffect(() => {
        setActiveTab(location.pathname);
        const activeElement = document.querySelector(`a[href="${location.pathname}"]`);
        updateMarkerPosition(activeElement as HTMLElement);
    }, [location]);

    const handleTabClick = (path: string) => {
        setActiveTab(path);
        setHoveredTab(null);
    };

    const handleTabHover = (path: string, element: HTMLAnchorElement) => {
        setHoveredTab(path);
        updateMarkerPosition(element);
    };

    const handleTabLeave = () => {
        setHoveredTab(null);
        const activeElement = document.querySelector(`a[href="${activeTab}"]`);
        updateMarkerPosition(activeElement as HTMLElement);
    };

    return (
        <nav className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="text-white text-2xl font-bold tracking-wider mr-8">
                            FitFlow
                        </Link>
                        <div className="hidden md:flex relative space-x-1">
                            {isAuthenticated && (
                                <>
                                    <NavLink
                                        to="/dashboard"
                                        isActive={activeTab === '/dashboard'}
                                        onClick={() => handleTabClick('/dashboard')}
                                        onMouseEnter={(el) => handleTabHover('/dashboard', el)}
                                        onMouseLeave={handleTabLeave}
                                    >
                                        Dashboard
                                    </NavLink>
                                    <NavLink
                                        to="/workout-plan"
                                        isActive={activeTab === '/workout-plan'}
                                        onClick={() => handleTabClick('/workout-plan')}
                                        onMouseEnter={(el) => handleTabHover('/workout-plan', el)}
                                        onMouseLeave={handleTabLeave}
                                    >
                                        Workout Plans
                                    </NavLink>
                                    <NavLink
                                        to="/meal-plan"
                                        isActive={activeTab === '/meal-plan'}
                                        onClick={() => handleTabClick('/meal-plan')}
                                        onMouseEnter={(el) => handleTabHover('/meal-plan', el)}
                                        onMouseLeave={handleTabLeave}
                                    >
                                        Meal Plans
                                    </NavLink>
                                    {user?.is_admin && (
                                        <NavLink
                                            to="/admin"
                                            isActive={activeTab === '/admin'}
                                            onClick={() => handleTabClick('/admin')}
                                            onMouseEnter={(el) => handleTabHover('/admin', el)}
                                            onMouseLeave={handleTabLeave}
                                        >
                                            Admin Dashboard
                                        </NavLink>
                                    )}
                                    <NavigationMarker {...markerStyle} />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleLogout}
                                className="text-[#00f0ff] hover:text-purple-600 border-[#00f0ff] hover:bg-white transition-colors"
                            >
                                Logout
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/login')}
                                    className="text-white border-white hover:bg-white/10"
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate('/register')}
                                    className="bg-white text-purple-600 hover:bg-purple-50"
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-white border-white hover:bg-white/10"
                            onClick={() => {}} // Add mobile menu toggle handler
                        >
                            <span className="sr-only">Open menu</span>
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
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile menu - We'll implement this in the next iteration */}
            <div className="md:hidden">
                {/* Mobile menu content */}
            </div>
        </nav>
    );
};

export default Navbar; 