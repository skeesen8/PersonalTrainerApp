import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Button from './Button';

interface CreateWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutCreated: () => void;
}

interface User {
  id: number;
  email: string;
  full_name: string;
}

const CreateWorkoutModal: React.FC<CreateWorkoutModalProps> = ({ isOpen, onClose, onWorkoutCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    exercises: [{ name: '', sets: '', reps: '', weight: '' }],
    assigned_user_id: ''
  });
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const response = await api.get('/users/');
        setAssignedUsers(response.data.filter((user: User) => user.id !== 1));
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to fetch users');
      }
    };

    if (isOpen) {
      fetchAssignedUsers();
    }
  }, [isOpen]);

  const handleExerciseChange = (index: number, field: string, value: string) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setFormData({ ...formData, exercises: newExercises });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: '', reps: '', weight: '' }]
    });
  };

  const removeExercise = (index: number) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: newExercises });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/workout-plans/', formData);
      onWorkoutCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create workout plan');
    }
  };

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
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="miami-input"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Assign to User
            </label>
            <select
              value={formData.assigned_user_id}
              onChange={(e) => setFormData({ ...formData, assigned_user_id: e.target.value })}
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