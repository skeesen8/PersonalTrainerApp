import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import Navbar from './Navbar';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: string;
}

interface IWorkoutPlan {
  id: number;
  title: string;
  description: string;
  exercises: string;
  scheduled_date: string;
}

const WorkoutPlan: React.FC = () => {
  const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/workout-plans/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.length > 0) {
          setWorkoutPlan(response.data[0]);
        }
      } catch (err) {
        setError('Failed to fetch workout plan');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md">
          <Typography color="error" variant="h6" sx={{ mt: 4 }}>
            {error}
          </Typography>
        </Container>
      </>
    );
  }

  if (!workoutPlan) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md">
          <Typography variant="h6" sx={{ mt: 4 }}>
            No workout plan available for today
          </Typography>
        </Container>
      </>
    );
  }

  const exercises: Exercise[] = JSON.parse(workoutPlan.exercises);

  return (
    <>
      <Navbar />
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {workoutPlan.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            {workoutPlan.description}
          </Typography>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Today's Exercises
          </Typography>
          <List>
            {exercises.map((exercise, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={exercise.name}
                    secondary={`${exercise.sets} sets × ${exercise.reps} reps (Rest: ${exercise.rest})`}
                  />
                </ListItem>
                {index < exercises.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Container>
    </>
  );
};

export default WorkoutPlan; 