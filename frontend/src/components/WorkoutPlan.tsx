import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Calendar from 'react-calendar';
import '../styles/calendar.css';
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
import Navbar from './Navbar';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: string;
}

interface WorkoutPlan {
  id: number;
  title: string;
  description: string;
  date: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
}

const WorkoutPlan: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        const response = await api.get('/workout-plans/user');
        setWorkoutPlans(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch workout plans');
        setLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, []);

  const getWorkoutsForDate = (date: Date) => {
    return workoutPlans.filter(plan => {
      const planDate = new Date(plan.date);
      return planDate.toDateString() === date.toDateString();
    });
  };

  const tileContent = ({ date }: { date: Date }) => {
    const workouts = getWorkoutsForDate(date);
    if (workouts.length > 0) {
      return (
        <div className="text-[#00f0ff] text-xs mt-1">
          {workouts.length} workout{workouts.length > 1 ? 's' : ''}
        </div>
      );
    }
    return null;
  };

  const selectedWorkouts = getWorkoutsForDate(selectedDate);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="miami-card p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Your Workout Plan</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Calendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
                tileContent={tileContent}
                className="miami-calendar w-full rounded-xl border-none bg-[#2a2a4e] text-white"
              />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Workouts for {selectedDate.toLocaleDateString()}
              </h2>

              {loading ? (
                <div className="text-white/60">Loading workouts...</div>
              ) : selectedWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {selectedWorkouts.map((workout) => (
                    <div key={workout.id} className="miami-card p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {workout.title}
                      </h3>
                      <p className="text-white/60 mb-4">{workout.description}</p>
                      
                      <div className="space-y-3">
                        {workout.exercises.map((exercise, index) => (
                          <div key={index} className="bg-black/20 p-4 rounded-xl">
                            <h4 className="text-[#00f0ff] font-medium mb-2">
                              {exercise.name}
                            </h4>
                            <div className="grid grid-cols-3 gap-4 text-white/80">
                              <div>
                                <span className="text-white/60">Sets:</span> {exercise.sets}
                              </div>
                              <div>
                                <span className="text-white/60">Reps:</span> {exercise.reps}
                              </div>
                              <div>
                                <span className="text-white/60">Weight:</span> {exercise.weight}lbs
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="miami-card p-6">
                  <p className="text-white/60">No workouts scheduled for this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlan; 