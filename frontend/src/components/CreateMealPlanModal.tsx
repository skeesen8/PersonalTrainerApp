import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Button from './Button';
import { Meal } from '../types/meal';
import { useAuth } from '../context/AuthContext';

interface CreateMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealPlanCreated: () => void;
}

interface User {
  id: number;
  email: string;
  full_name: string;
}

const initialMeal: Meal = {
  name: '',
  time: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  ingredients: ''
};

const initialFormData = {
  title: '',
  description: '',
  scheduled_date: new Date().toISOString(),
  meals: [{ ...initialMeal }],
  user_id: ''
};

const CreateMealPlanModal: React.FC<CreateMealPlanModalProps> = ({ isOpen, onClose, onMealPlanCreated }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const response = await api.get('/users/assigned');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.user_id) {
      setError('Please select a user to assign this meal plan to');
      return;
    }

    try {
      const submissionData = {
        ...formData,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        user_id: parseInt(formData.user_id)
      };

      await api.post('/meal-plans/', submissionData);
      onMealPlanCreated();
      setFormData(initialFormData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create meal plan');
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
        <h2 className="text-2xl font-bold text-white mb-4">Create New Meal Plan</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter meal plan title"
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
              placeholder="Enter meal plan description"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Schedule Date
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_date.slice(0, 16)}
              onChange={(e) => setFormData({ 
                ...formData, 
                scheduled_date: new Date(e.target.value).toISOString() 
              })}
              className="miami-input"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Meals</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  ...formData,
                  meals: [...formData.meals, { ...initialMeal }]
                })}
              >
                Add Meal
              </Button>
            </div>

            {formData.meals.map((meal, index) => (
              <div key={index} className="miami-card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-medium">Meal {index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newMeals = formData.meals.filter((_, i) => i !== index);
                        setFormData({ ...formData, meals: newMeals });
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Meal Name
                    </label>
                    <input
                      type="text"
                      value={meal.name}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index] = { ...meal, name: e.target.value };
                        setFormData({ ...formData, meals: newMeals });
                      }}
                      className="miami-input"
                      required
                      placeholder="Enter meal name"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={meal.time}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index] = { ...meal, time: e.target.value };
                        setFormData({ ...formData, meals: newMeals });
                      }}
                      className="miami-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Calories
                    </label>
                    <input
                      type="number"
                      value={meal.calories}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index] = { ...meal, calories: parseInt(e.target.value) || 0 };
                        setFormData({ ...formData, meals: newMeals });
                      }}
                      className="miami-input"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={meal.protein}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index] = { ...meal, protein: parseFloat(e.target.value) || 0 };
                        setFormData({ ...formData, meals: newMeals });
                      }}
                      className="miami-input"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={meal.carbs}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index] = { ...meal, carbs: parseFloat(e.target.value) || 0 };
                        setFormData({ ...formData, meals: newMeals });
                      }}
                      className="miami-input"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      value={meal.fats}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index] = { ...meal, fats: parseFloat(e.target.value) || 0 };
                        setFormData({ ...formData, meals: newMeals });
                      }}
                      className="miami-input"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Ingredients
                    </label>
                    <textarea
                      value={meal.ingredients}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index] = { ...meal, ingredients: e.target.value };
                        setFormData({ ...formData, meals: newMeals });
                      }}
                      className="miami-input min-h-[80px]"
                      required
                      placeholder="Enter ingredients"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(initialFormData);
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Meal Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMealPlanModal; 