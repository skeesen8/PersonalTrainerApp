import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: string;
}

interface WorkoutPlan {
  title: string;
  description: string;
  exercises: string;
  scheduled_date: string;
}

interface MealPlan {
  title: string;
  description: string;
  meals: string;
  scheduled_date: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openWorkoutDialog, setOpenWorkoutDialog] = useState(false);
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan>({
    title: '',
    description: '',
    exercises: '',
    scheduled_date: new Date().toISOString().split('T')[0],
  });
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    title: '',
    description: '',
    meals: '',
    scheduled_date: new Date().toISOString().split('T')[0],
  });
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', sets: 0, reps: 0, rest: '' }
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
    // Update the exercises JSON string in workoutPlan
    setWorkoutPlan({
      ...workoutPlan,
      exercises: JSON.stringify(newExercises)
    });
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 0, reps: 0, rest: '' }]);
  };

  const removeExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
    setWorkoutPlan({
      ...workoutPlan,
      exercises: JSON.stringify(newExercises)
    });
  };

  const handleWorkoutSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      // Format the date to include time
      const formattedDate = new Date(workoutPlan.scheduled_date)
        .toISOString()
        .slice(0, 19).replace('T', ' ');
      
      await axios.post(
        'http://localhost:8000/workout-plans/',
        {
          ...workoutPlan,
          scheduled_date: formattedDate,
          user_id: selectedUser?.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOpenWorkoutDialog(false);
      // Reset form
      setWorkoutPlan({
        title: '',
        description: '',
        exercises: '',
        scheduled_date: new Date().toISOString().split('T')[0],
      });
      setExercises([{ name: '', sets: 0, reps: 0, rest: '' }]);
    } catch (error) {
      console.error('Error creating workout plan:', error);
    }
  };

  const handleMealSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/meal-plans/',
        {
          ...mealPlan,
          user_id: selectedUser?.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOpenMealDialog(false);
      // Reset form
      setMealPlan({
        title: '',
        description: '',
        meals: '',
        scheduled_date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error creating meal plan:', error);
    }
  };

  return (
    <>
      <Navbar isAdmin={true} />
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Users
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Grid container spacing={1}>
                          <Grid item>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenWorkoutDialog(true);
                              }}
                            >
                              Update Workout
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenMealDialog(true);
                              }}
                            >
                              Update Meal Plan
                            </Button>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Workout Plan Dialog */}
        <Dialog open={openWorkoutDialog} onClose={() => setOpenWorkoutDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Update Workout Plan for {selectedUser?.full_name}</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              label="Title"
              fullWidth
              value={workoutPlan.title}
              onChange={(e) => setWorkoutPlan({ ...workoutPlan, title: e.target.value })}
            />
            <TextField
              margin="normal"
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={workoutPlan.description}
              onChange={(e) => setWorkoutPlan({ ...workoutPlan, description: e.target.value })}
            />
            
            {/* Structured Exercise Form */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Exercises
              </Typography>
              {exercises.map((exercise, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Exercise Name"
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Sets"
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Reps"
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Rest (e.g., 60s)"
                        value={exercise.rest}
                        onChange={(e) => handleExerciseChange(index, 'rest', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeExercise(index)}
                    >
                      Remove Exercise
                    </Button>
                  </Box>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={addExercise}
                sx={{ mt: 1 }}
              >
                Add Exercise
              </Button>
            </Box>

            <TextField
              margin="normal"
              label="Scheduled Date"
              type="datetime-local"
              fullWidth
              value={workoutPlan.scheduled_date}
              onChange={(e) => setWorkoutPlan({ ...workoutPlan, scheduled_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenWorkoutDialog(false)}>Cancel</Button>
            <Button onClick={handleWorkoutSubmit} variant="contained">
              Save Workout Plan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Meal Plan Dialog */}
        <Dialog open={openMealDialog} onClose={() => setOpenMealDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Update Meal Plan for {selectedUser?.full_name}</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              label="Title"
              fullWidth
              value={mealPlan.title}
              onChange={(e) => setMealPlan({ ...mealPlan, title: e.target.value })}
            />
            <TextField
              margin="normal"
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={mealPlan.description}
              onChange={(e) => setMealPlan({ ...mealPlan, description: e.target.value })}
            />
            <TextField
              margin="normal"
              label="Meals (JSON format)"
              fullWidth
              multiline
              rows={4}
              value={mealPlan.meals}
              onChange={(e) => setMealPlan({ ...mealPlan, meals: e.target.value })}
            />
            <TextField
              margin="normal"
              label="Scheduled Date"
              type="date"
              fullWidth
              value={mealPlan.scheduled_date}
              onChange={(e) => setMealPlan({ ...mealPlan, scheduled_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenMealDialog(false)}>Cancel</Button>
            <Button onClick={handleMealSubmit} variant="contained">
              Save Meal Plan
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminDashboard; 