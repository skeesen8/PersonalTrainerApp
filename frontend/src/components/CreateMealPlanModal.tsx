import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Button from './Button';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Meal } from '../types/meal';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface CreateMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealPlanCreated: (mealPlan: any) => void;
}

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface MealPlanFormData {
  title: string;
  description: string;
  scheduled_date: Date;
  meals: Meal[];
  user_id: string;
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
  scheduled_date: new Date(),
  meals: [{ ...initialMeal }],
  user_id: ''
};

const CreateMealPlanModal: React.FC<CreateMealPlanModalProps> = ({ isOpen, onClose, onMealPlanCreated }) => {
  const [formData, setFormData] = useState<MealPlanFormData>(initialFormData);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const response = await api.get('/users/assigned');
        setAssignedUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch assigned users:', err);
        setError('Failed to fetch assigned users');
      }
    };

    if (isOpen) {
      fetchAssignedUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/users/current');
        setCurrentUser(response.data);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
        setError('Failed to fetch current user');
      }
    };

    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  const handleMealChange = (index: number, field: keyof Meal, value: string) => {
    const updatedMeals = [...formData.meals];
    updatedMeals[index] = {
        ...updatedMeals[index],
        [field]: value
    };
    setFormData({
        ...formData,
        meals: updatedMeals
    });
  };

  const handleAddMeal = () => {
    setFormData({
        ...formData,
        meals: [...formData.meals, {
            ...initialMeal
        }]
    });
  };

  const handleRemoveMeal = (index: number) => {
    const updatedMeals = formData.meals.filter((_, i) => i !== index);
    setFormData({
        ...formData,
        meals: updatedMeals
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const response = await api.post('/meal-plans/', {
            ...formData,
            scheduled_date: formData.scheduled_date.toISOString()
        });
        onMealPlanCreated(response.data);
        setFormData(initialFormData);
        onClose();
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An error occurred while creating the meal plan');
        }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setFormData(initialFormData);
        setError(null);
        onClose();
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-xl bg-gray-900 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold">
              Create New Meal Plan
            </Dialog.Title>
            <button
              onClick={() => {
                setFormData(initialFormData);
                setError(null);
                onClose();
              }}
              className="text-gray-400 hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-700 rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 rounded-md p-2 h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Calendar
                  onChange={(value) => setFormData({ ...formData, scheduled_date: value as Date })}
                  value={formData.scheduled_date}
                  className="w-full bg-gray-700 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Assigned User ID (Optional)</label>
                <input
                  type="text"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full bg-gray-700 rounded-md p-2"
                  placeholder="Leave empty to assign to yourself"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Meals</h3>
                  <button
                    type="button"
                    onClick={handleAddMeal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium"
                  >
                    Add Meal
                  </button>
                </div>

                {formData.meals.map((meal, index) => (
                  <div key={index} className="mb-6 p-4 bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Meal {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveMeal(index)}
                        className="text-red-400 hover:text-red-300"
                        disabled={formData.meals.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) => handleMealChange(index, 'name', e.target.value)}
                          className="w-full bg-gray-700 rounded-md p-2"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Time</label>
                        <input
                          type="time"
                          value={meal.time}
                          onChange={(e) => handleMealChange(index, 'time', e.target.value)}
                          className="w-full bg-gray-700 rounded-md p-2"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Calories</label>
                        <input
                          type="number"
                          value={meal.calories}
                          onChange={(e) => handleMealChange(index, 'calories', e.target.value)}
                          className="w-full bg-gray-700 rounded-md p-2"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Protein (g)</label>
                        <input
                          type="number"
                          value={meal.protein}
                          onChange={(e) => handleMealChange(index, 'protein', e.target.value)}
                          className="w-full bg-gray-700 rounded-md p-2"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          value={meal.carbs}
                          onChange={(e) => handleMealChange(index, 'carbs', e.target.value)}
                          className="w-full bg-gray-700 rounded-md p-2"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Fats (g)</label>
                        <input
                          type="number"
                          value={meal.fats}
                          onChange={(e) => handleMealChange(index, 'fats', e.target.value)}
                          className="w-full bg-gray-700 rounded-md p-2"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Ingredients</label>
                        <textarea
                          value={meal.ingredients}
                          onChange={(e) => handleMealChange(index, 'ingredients', e.target.value)}
                          className="w-full bg-gray-700 rounded-md p-2 h-24"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData(initialFormData);
                  setError(null);
                  onClose();
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Meal Plan'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateMealPlanModal; 