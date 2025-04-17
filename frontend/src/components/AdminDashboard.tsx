import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminDashboard: React.FC = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the admin dashboard!
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 