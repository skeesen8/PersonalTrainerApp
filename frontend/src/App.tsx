import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import WorkoutPlan from './components/WorkoutPlan';
import MealPlan from './components/MealPlan';
import AdminDashboard from './components/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route component
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? element : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
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
                element={<ProtectedRoute element={<AdminDashboard />} />}
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
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
