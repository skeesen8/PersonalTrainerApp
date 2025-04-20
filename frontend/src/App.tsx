import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import WorkoutPlan from './components/WorkoutPlan';
import MealPlan from './components/MealPlan';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/theme.css';

// Protected Route component for regular users
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? element : <Navigate to="/login" />;
};

// Protected Route component for admin users
const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!isAdmin) return <Navigate to="/dashboard" />;
    return element;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
            {isAuthenticated && <Navbar />}
            <main>
                <Routes>
                    <Route 
                        path="/login" 
                        element={isAuthenticated ? 
                            <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> 
                            : <Login />
                        } 
                    />
                    <Route 
                        path="/register" 
                        element={isAuthenticated ? 
                            <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> 
                            : <Register />
                        } 
                    />
                    <Route
                        path="/dashboard"
                        element={<ProtectedRoute element={<Dashboard />} />}
                    />
                    <Route
                        path="/workout-plan"
                        element={<ProtectedRoute element={<WorkoutPlan />} />}
                    />
                    <Route
                        path="/meal-plan"
                        element={<ProtectedRoute element={<MealPlan />} />}
                    />
                    <Route
                        path="/admin"
                        element={<AdminRoute element={<AdminDashboard />} />}
                    />
                    <Route 
                        path="/" 
                        element={<Navigate to={isAuthenticated ? 
                            (isAdmin ? "/admin" : "/dashboard") 
                            : "/login"} 
                        />} 
                    />
                </Routes>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;
