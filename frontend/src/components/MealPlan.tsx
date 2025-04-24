import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Calendar from 'react-calendar';
import '../styles/calendar.css';

interface Meal {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string;
}

interface MealPlan {
  id: number;
  title: string;
  description: string;
  scheduled_date: string;
  meals: Meal[];
  user_id: number;
  created_at?: string;
}

const MealPlan: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const response = await api.get('/meal-plans/user');
        console.log('Fetched meal plans:', response.data);
        setMealPlans(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching meal plans:', err);
        setError('Failed to fetch meal plans');
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, []);

  const getMealPlansForDate = (date: Date) => {
    if (!mealPlans) return [];
    
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    return mealPlans.filter((plan) => {
      const planDate = new Date(plan.scheduled_date);
      planDate.setUTCHours(0, 0, 0, 0);
      
      console.log('Comparing dates:', {
        original: plan.scheduled_date,
        planDateUTC: planDate.toISOString(),
        selectedDateUTC: startOfDay.toISOString(),
        matches: planDate.getTime() === startOfDay.getTime()
      });

      return planDate.getTime() === startOfDay.getTime();
    });
  };

  const tileContent = ({ date }: { date: Date }) => {
    const plans = getMealPlansForDate(date);
    if (plans.length > 0) {
    return (
        <div className="text-[#00f0ff] text-xs mt-1">
          {plans.length} meal plan{plans.length > 1 ? 's' : ''}
        </div>
      );
    }
    return null;
  };

  const selectedMealPlans = getMealPlansForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="miami-card p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Your Meal Plan</h1>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

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
                Meals for {selectedDate.toLocaleDateString()}
              </h2>

              {loading ? (
                <div className="text-white/60">Loading meal plans...</div>
              ) : selectedMealPlans.length > 0 ? (
                <div className="space-y-4">
                  {selectedMealPlans.map((plan) => (
                    <div key={plan.id} className="miami-card p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {plan.title}
                      </h3>
                      <p className="text-white/60 mb-4">{plan.description}</p>
                      
                      <div className="space-y-4">
                        {plan.meals.map((meal, index) => (
                          <div key={index} className="bg-black/20 p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-[#00f0ff] font-medium">
                                {meal.name}
                              </h4>
                              <span className="text-white/60">
                                {meal.time}
                              </span>
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
                              <h5 className="text-white/60 text-sm mb-2">Ingredients:</h5>
                              <p className="text-white/80 whitespace-pre-line">
                                {meal.ingredients}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="miami-card p-6">
                  <p className="text-white/60">No meals scheduled for this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlan; 