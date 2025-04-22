export interface Meal {
    name: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string;
}

export interface MealPlan {
    id?: number;
    title: string;
    description: string;
    scheduled_date: string | Date;
    meals: Meal[];
    user_id: number;
    created_at?: string | Date;
} 