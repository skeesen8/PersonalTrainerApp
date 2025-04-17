import React, { useState } from 'react';
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
import api from '../api/axios';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    full_name: '',
    admin_code: '',
    is_admin: false,
  });
  const [error, setError] = useState('');
  const [openRegister, setOpenRegister] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Making login request...');
      const formData = new URLSearchParams();
      formData.append('username', loginData.email);
      formData.append('password', loginData.password);

      const response = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.access_token) {
        console.log('Login successful');
        onLogin(response.data.access_token);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
    }
  };

  const handleRegister = async () => {
    try {
      console.log('Making registration request...');
      const response = await api.post('/users/', {
        email: registerData.email,
        password: registerData.password,
        full_name: registerData.full_name,
        is_admin: registerData.is_admin,
        admin_code: registerData.admin_code || undefined
      });

      console.log('Registration successful');
      setOpenRegister(false);
      
      // Auto-login after registration
      setLoginData({
        email: registerData.email,
        password: registerData.password
      });
      const formData = new URLSearchParams();
      formData.append('username', registerData.email);
      formData.append('password', registerData.password);
      
      const loginResponse = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (loginResponse.data.access_token) {
        onLogin(loginResponse.data.access_token);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Failed to register. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            Personal Trainer App
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              autoComplete="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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

      <Dialog open={openRegister} onClose={() => setOpenRegister(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            value={registerData.full_name}
            onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Admin Code (optional)"
            type="password"
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
          <Button onClick={handleRegister} variant="contained" color="primary">
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;