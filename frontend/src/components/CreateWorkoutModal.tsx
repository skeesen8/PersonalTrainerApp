import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from './Button';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface CreateWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutCreated: () => void;
}

const initialExercise: Exercise = {
  name: '',
  sets: 0,
  reps: 0,
  weight: 0
};

const initialFormData = {
  title: '',
  description: '',
  scheduled_date: new Date().toISOString(),
  exercises: [{ ...initialExercise }],
  user_id: ''
};

const CreateWorkoutModal: React.FC<CreateWorkoutModalProps> = ({ isOpen, onClose, onWorkoutCreated }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const response = await api.get('/users/assigned');
        console.log('Fetched assigned users:', response.data);
        setAssignedUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to fetch users');
      }
    };

    if (isOpen && user?.is_admin) {
      fetchAssignedUsers();
    }
  }, [isOpen, user]);

  const handleExerciseChange = (index: number, field: string, value: string | number) => {
    const newExercises = [...formData.exercises];
    let parsedValue = value;
    
    if (field !== 'name') {
      parsedValue = Math.max(0, Math.min(Number(value), field === 'weight' ? 2000 : field === 'sets' ? 100 : 1000));
    }
    
    newExercises[index] = { 
      ...newExercises[index], 
      [field]: parsedValue
    };
    setFormData({ ...formData, exercises: newExercises });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { ...initialExercise }]
    });
  };

  const removeExercise = (index: number) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: newExercises });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.user_id) {
      setError('Please select a user to assign this workout plan to');
      return;
    }

    // Validate exercises
    for (const exercise of formData.exercises) {
      if (!exercise.name.trim()) {
        setError('Exercise name cannot be empty');
        return;
      }
      if (exercise.sets <= 0 || exercise.sets > 100) {
        setError('Sets must be between 1 and 100');
        return;
      }
      if (exercise.reps <= 0 || exercise.reps > 1000) {
        setError('Reps must be between 1 and 1000');
        return;
      }
      if (exercise.weight < 0 || exercise.weight > 2000) {
        setError('Weight must be between 0 and 2000 lbs');
        return;
      }
    }

    try {
      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        user_id: parseInt(formData.user_id),
        exercises: formData.exercises.map(exercise => ({
          name: exercise.name.trim(),
          sets: Number(exercise.sets),
          reps: Number(exercise.reps),
          weight: Number(exercise.weight)
        }))
      };

      console.log('Submitting workout plan:', submissionData);
      await api.post('/workout-plans/', submissionData);
      onWorkoutCreated();
      setFormData(initialFormData);
      onClose();
    } catch (err: any) {
      console.error('Error creating workout plan:', err);
      if (err.response?.data?.detail) {
        setError(Array.isArray(err.response.data.detail) 
          ? err.response.data.detail[0].msg 
          : err.response.data.detail);
      } else {
        setError('Failed to create workout plan');
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="miami-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Create New Workout Plan</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="miami-input"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="miami-input min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Schedule Date
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_date.slice(0, 16)}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="miami-input"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Assign to User
            </label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="miami-input"
              required
            >
              <option value="">Select a user</option>
              {assignedUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Exercises</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addExercise}
              >
                Add Exercise
              </Button>
            </div>

            {formData.exercises.map((exercise, index) => (
              <div key={index} className="miami-card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-medium">Exercise {index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Exercise Name
                    </label>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      className="miami-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                      min="1"
                      step="1"
                      className="miami-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                      min="1"
                      step="1"
                      className="miami-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                      min="0"
                      step="0.5"
                      className="miami-input"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              type="submit"
              variant="primary"
              fullWidth
            >
              Create Workout Plan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkoutModal; 