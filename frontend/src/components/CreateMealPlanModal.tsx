import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Button from './Button';

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

const CreateMealPlanModal: React.FC<CreateMealPlanModalProps> = ({ isOpen, onClose, onMealPlanCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meals: [{
      name: '',
      time: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      ingredients: ''
    }],
    assigned_user_id: ''
  });
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const response = await api.get('/users/assigned');
        setAssignedUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch assigned users:', err);
      }
    };

    if (isOpen) {
      fetchAssignedUsers();
    }
  }, [isOpen]);

  const handleMealChange = (index: number, field: string, value: string) => {
    const newMeals = [...formData.meals];
    newMeals[index] = { ...newMeals[index], [field]: value };
    setFormData({ ...formData, meals: newMeals });
  };

  const addMeal = () => {
    setFormData({
      ...formData,
      meals: [...formData.meals, {
        name: '',
        time: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        ingredients: ''
      }]
    });
  };

  const removeMeal = (index: number) => {
    const newMeals = formData.meals.filter((_, i) => i !== index);
    setFormData({ ...formData, meals: newMeals });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/meal-plans/', formData);
      onMealPlanCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create meal plan');
    }
  };

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
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Meals</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addMeal}
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
                      onClick={() => removeMeal(index)}
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
                      onChange={(e) => handleMealChange(index, 'name', e.target.value)}
                      className="miami-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={meal.time}
                      onChange={(e) => handleMealChange(index, 'time', e.target.value)}
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
                      onChange={(e) => handleMealChange(index, 'calories', e.target.value)}
                      className="miami-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={meal.protein}
                      onChange={(e) => handleMealChange(index, 'protein', e.target.value)}
                      className="miami-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={meal.carbs}
                      onChange={(e) => handleMealChange(index, 'carbs', e.target.value)}
                      className="miami-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      value={meal.fats}
                      onChange={(e) => handleMealChange(index, 'fats', e.target.value)}
                      className="miami-input"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-white/80 text-sm font-medium mb-1">
                      Ingredients
                    </label>
                    <textarea
                      value={meal.ingredients}
                      onChange={(e) => handleMealChange(index, 'ingredients', e.target.value)}
                      className="miami-input min-h-[80px]"
                      placeholder="Enter ingredients, one per line"
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
              Create Meal Plan
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

export default CreateMealPlanModal; 