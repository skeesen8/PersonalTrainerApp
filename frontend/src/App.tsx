import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import WorkoutPlan from './components/WorkoutPlan';
import MealPlan from './components/MealPlan';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={
            token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } />
          <Route
            path="/dashboard"
            element={
              token ? <Dashboard /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/workout-plan"
            element={
              <PrivateRoute>
                <WorkoutPlan />
              </PrivateRoute>
            }
          />
          <Route
            path="/meal-plan"
            element={
              <PrivateRoute>
                <MealPlan />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              token ? <AdminDashboard /> : <Navigate to="/login" />
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
