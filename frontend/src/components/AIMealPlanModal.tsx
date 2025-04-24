import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface AIMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealPlanCreated: () => void;
}

const initialFormData = {
  user_id: '',
  prompt: '',
  dietary_preferences: '',
  calories_target: '',
  protein_target: '',
  carbs_target: '',
  fats_target: '',
  meals_per_day: '3',
  scheduled_date: new Date().toISOString().slice(0, 16)
};

const AIMealPlanModal: React.FC<AIMealPlanModalProps> = ({ isOpen, onClose, onMealPlanCreated }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
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
    setLoading(true);
    setAiResponse(null);

    if (!formData.user_id) {
      setError('Please select a user');
      setLoading(false);
      return;
    }

    try {
      const submissionData = {
        ...formData,
        user_id: parseInt(formData.user_id),
        calories_target: formData.calories_target ? parseInt(formData.calories_target) : null,
        protein_target: formData.protein_target ? parseInt(formData.protein_target) : null,
        carbs_target: formData.carbs_target ? parseInt(formData.carbs_target) : null,
        fats_target: formData.fats_target ? parseInt(formData.fats_target) : null,
        meals_per_day: parseInt(formData.meals_per_day)
      };

      // First, generate the meal plan
      const response = await api.post('/meal-plans/ai-generate/', submissionData);
      setAiResponse(response.data);

    } catch (err: any) {
      console.error('Error generating meal plan:', err);
      setError(err.response?.data?.detail || 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!aiResponse) return;

    try {
      setLoading(true);
      await api.post('/meal-plans/ai-generate-and-save/', {
        ...formData,
        user_id: parseInt(formData.user_id)
      });
      onMealPlanCreated();
      setFormData(initialFormData);
      setAiResponse(null);
      onClose();
    } catch (err: any) {
      console.error('Error saving meal plan:', err);
      setError(err.response?.data?.detail || 'Failed to save meal plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setError('');
      setAiResponse(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="miami-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Generate AI Meal Plan</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Assign To User
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
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Prompt
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              className="miami-input min-h-[100px]"
              placeholder="E.g., Create a high-protein meal plan for muscle gain"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Dietary Preferences
            </label>
            <input
              type="text"
              value={formData.dietary_preferences}
              onChange={(e) => setFormData({ ...formData, dietary_preferences: e.target.value })}
              className="miami-input"
              placeholder="E.g., vegetarian, no dairy, gluten-free"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Calories Target
              </label>
              <input
                type="number"
                value={formData.calories_target}
                onChange={(e) => setFormData({ ...formData, calories_target: e.target.value })}
                className="miami-input"
                placeholder="Daily calories"
                min="0"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Protein Target (g)
              </label>
              <input
                type="number"
                value={formData.protein_target}
                onChange={(e) => setFormData({ ...formData, protein_target: e.target.value })}
                className="miami-input"
                placeholder="Daily protein"
                min="0"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Carbs Target (g)
              </label>
              <input
                type="number"
                value={formData.carbs_target}
                onChange={(e) => setFormData({ ...formData, carbs_target: e.target.value })}
                className="miami-input"
                placeholder="Daily carbs"
                min="0"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Fats Target (g)
              </label>
              <input
                type="number"
                value={formData.fats_target}
                onChange={(e) => setFormData({ ...formData, fats_target: e.target.value })}
                className="miami-input"
                placeholder="Daily fats"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Meals Per Day
              </label>
              <input
                type="number"
                value={formData.meals_per_day}
                onChange={(e) => setFormData({ ...formData, meals_per_day: e.target.value })}
                className="miami-input"
                min="1"
                max="6"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Schedule Date
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="miami-input"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              className="flex-1 miami-button-primary"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Meal Plan'}
            </button>
            <button
              type="button"
              className="flex-1 miami-button-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        {aiResponse && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-white">Generated Meal Plan</h3>
            
            <div className="miami-card p-4">
              <h4 className="text-lg font-medium text-white mb-2">{aiResponse.meal_plan.title}</h4>
              <p className="text-white/60 mb-4">{aiResponse.meal_plan.description}</p>
              
              <div className="space-y-4">
                {aiResponse.meal_plan.meals.map((meal: any, index: number) => (
                  <div key={index} className="bg-black/20 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-[#00f0ff] font-medium">{meal.name}</h5>
                      <span className="text-white/60">{meal.time}</span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-white/80 mb-3">
                      <div>
                        <span className="text-white/60">Calories:</span>
                        <br />{meal.calories}
                      </div>
                      <div>
                        <span className="text-white/60">Protein:</span>
                        <br />{meal.protein}g
                      </div>
                      <div>
                        <span className="text-white/60">Carbs:</span>
                        <br />{meal.carbs}g
                      </div>
                      <div>
                        <span className="text-white/60">Fats:</span>
                        <br />{meal.fats}g
                      </div>
                    </div>
                    
                    <div>
                      <h6 className="text-white/60 text-sm mb-1">Ingredients:</h6>
                      <p className="text-white/80">{meal.ingredients}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <h5 className="text-white/60 text-sm mb-2">AI Reasoning:</h5>
                <p className="text-white/80">{aiResponse.reasoning}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="flex-1 miami-button-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Meal Plan'}
              </button>
              <button
                onClick={() => setAiResponse(null)}
                className="flex-1 miami-button-outline"
                disabled={loading}
              >
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMealPlanModal; 