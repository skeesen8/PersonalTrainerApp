import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL?.trim() || 'http://localhost:8000';

// Configure axios defaults
axios.defaults.withCredentials = true;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openRegister, setOpenRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    full_name: '',
    admin_code: '',
    is_admin: false,
  });
  const [registerError, setRegisterError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('API URL:', API_URL);
    console.log('Current origin:', window.location.origin);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Making login request to:', `${API_URL}/token`);
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/token`, 
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true
        }
      );
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.access_token);
      
      console.log('Fetching user data...');
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: { 
          Authorization: `Bearer ${response.data.access_token}`,
        },
        withCredentials: true
      });
      console.log('User data:', userResponse.data);
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      if (userResponse.data.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        url: err.config?.url
      });
      if (err.response?.status === 400) {
        setError('Invalid email or password');
      } else if (err.response?.status === 401) {
        setError('Unauthorized. Please check your credentials.');
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please try again later.');
      } else {
        setError(err.response?.data?.detail || 'An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleRegister = async () => {
    setRegisterError('');
    try {
      console.log('Making registration request to:', `${API_URL}/users/`);
      const registerResponse = await axios.post(`${API_URL}/users/`, {
        email: registerData.email,
        password: registerData.password,
        full_name: registerData.full_name,
        is_admin: registerData.is_admin,
        admin_code: registerData.admin_code,
      }, {
        withCredentials: true
      });
      console.log('Registration successful:', registerResponse.data);

      // Log in automatically after registration
      const formData = new URLSearchParams();
      formData.append('username', registerData.email);
      formData.append('password', registerData.password);

      const response = await axios.post(`${API_URL}/token`, 
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true
        }
      );
      
      localStorage.setItem('token', response.data.access_token);
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: { 
          Authorization: `Bearer ${response.data.access_token}`,
        },
        withCredentials: true
      });
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      setOpenRegister(false);
      navigate(userResponse.data.is_admin ? '/admin' : '/dashboard');
    } catch (err: any) {
      console.error('Registration error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        url: err.config?.url
      });
      if (err.response?.status === 400) {
        setRegisterError('Email already registered or invalid input');
      } else if (err.response?.status === 403) {
        setRegisterError('Invalid admin code');
      } else if (err.message === 'Network Error') {
        setRegisterError('Unable to connect to the server. Please try again later.');
      } else {
        setRegisterError(err.response?.data?.detail || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Personal Trainer App
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenRegister(true)}
            >
              Create New Account
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog open={openRegister} onClose={() => setOpenRegister(false)}>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          {registerError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registerError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            type="text"
            fullWidth
            value={registerData.full_name}
            onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Admin Code (optional)"
            type="password"
            fullWidth
            value={registerData.admin_code}
            onChange={(e) => setRegisterData({ ...registerData, admin_code: e.target.value })}
          />
          {registerData.admin_code && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={registerData.is_admin}
                  onChange={(e) => setRegisterData({ ...registerData, is_admin: e.target.checked })}
                />
              }
              label="Register as Admin"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRegister(false)}>Cancel</Button>
          <Button onClick={handleRegister} variant="contained">
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;