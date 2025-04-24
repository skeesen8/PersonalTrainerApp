import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Value } from 'react-calendar/dist/cjs/shared/types';
import AIMealPlanModal from './AIMealPlanModal';

interface Meal {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
}

interface MealPlanType {
  id: number;
  title: string;
  description: string;
  scheduled_date: string;
  meals: Meal[];
  user_id: number;
}

const MealPlan: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/meal-plans/user');
      setMealPlans(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch meal plans');
      console.error('Error fetching meal plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const getMealPlansForDate = (date: Date) => {
    if (!mealPlans) return [];
    
    return mealPlans.filter((plan) => {
      const planDate = new Date(plan.scheduled_date);
      
      const planDateUTC = new Date(Date.UTC(
        planDate.getUTCFullYear(),
        planDate.getUTCMonth(),
        planDate.getUTCDate()
      ));
      
      const compareDateUTC = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      ));
      
      console.log('Comparing dates:', {
        planOriginal: plan.scheduled_date,
        planDateUTC: planDateUTC.toISOString(),
        compareDateUTC: compareDateUTC.toISOString(),
        isMatch: planDateUTC.getTime() === compareDateUTC.getTime()
      });
      
      return planDateUTC.getTime() === compareDateUTC.getTime();
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

          <div className="flex flex-col md:flex-row gap-6 p-6">
            <div className="w-full md:w-auto">
              <div className="miami-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">Meal Plans</h2>
                  {user?.is_admin && (
                    <button
                      onClick={() => setIsAIModalOpen(true)}
                      className="miami-button-primary"
                    >
                      Generate AI Meal Plan
                    </button>
                  )}
                </div>
                <Calendar
                  value={selectedDate}
                  onChange={(value: Value) => {
                    if (value instanceof Date) {
                      setSelectedDate(value);
                    }
                  }}
                  className="miami-calendar"
                  tileClassName={({ date }) => 
                    getMealPlansForDate(date).length > 0 ? "has-meal-plan" : ""
                  }
                  tileContent={({ date }) => {
                    const plans = getMealPlansForDate(date);
                    return plans.length > 0 ? (
                      <div className="meal-plan-indicator">{plans.length}</div>
                    ) : null;
                  }}
                />
              </div>
            </div>

            <div className="flex-1">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <div className="miami-card p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Meals for {selectedDate.toLocaleDateString()}
                  </h3>
                  {getMealPlansForDate(selectedDate).map((plan) => (
                    <div key={plan.id} className="mb-6">
                      <h4 className="text-lg font-medium mb-2">{plan.title}</h4>
                      <p className="text-gray-300 mb-4">{plan.description}</p>
                      <div className="space-y-4">
                        {plan.meals.map((meal: Meal, index: number) => (
                          <div key={index} className="miami-card-secondary p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="text-[#00f0ff] font-medium">
                                {meal.name}
                              </h5>
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
                                {meal.ingredients.join('\n')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AIMealPlanModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onMealPlanCreated={fetchMealPlans}
      />
    </div>
  );
};

export default MealPlan; 