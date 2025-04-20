import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

interface User {
  full_name: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}') as User;

  const handleClick = (route: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(route);
  };

  return (
    <div className="min-h-screen gradient-background">
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user.full_name}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your personal fitness journey starts here
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: 6,
                },
                width: '100%',
                borderRadius: 2,
              }}
              onClick={() => navigate('/workout-plan')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FitnessCenterIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Today's Workout Plan
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                View your personalized workout routine for today. Track your progress and stay motivated!
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2, alignSelf: 'flex-start' }}
                onClick={handleClick('/workout-plan')}
              >
                View Workout Plan
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: 6,
                },
                width: '100%',
                borderRadius: 2,
              }}
              onClick={() => navigate('/meal-plan')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RestaurantIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Today's Meal Plan
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                Check out your nutrition plan for today. Stay on track with your diet goals!
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2, alignSelf: 'flex-start' }}
                onClick={handleClick('/meal-plan')}
              >
                View Meal Plan
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard; 