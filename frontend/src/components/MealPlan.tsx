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

interface Meal {
  name: string;
  time: string;
  ingredients: string[];
  calories: number;
}

interface IMealPlan {
  id: number;
  title: string;
  description: string;
  meals: string;
  scheduled_date: string;
}

const MealPlan: React.FC = () => {
  const [mealPlan, setMealPlan] = useState<IMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/meal-plans/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.length > 0) {
          setMealPlan(response.data[0]);
        }
      } catch (err) {
        setError('Failed to fetch meal plan');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
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

  if (!mealPlan) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md">
          <Typography variant="h6" sx={{ mt: 4 }}>
            No meal plan available for today
          </Typography>
        </Container>
      </>
    );
  }

  const meals: Meal[] = JSON.parse(mealPlan.meals);

  return (
    <>
      <Navbar />
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {mealPlan.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            {mealPlan.description}
          </Typography>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Today's Meals
          </Typography>
          <List>
            {meals.map((meal, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={`${meal.name} (${meal.time})`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {meal.ingredients.join(', ')}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          {meal.calories} calories
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < meals.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Container>
    </>
  );
};

export default MealPlan; 