from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    is_admin: bool = False
    admin_code: Optional[str] = None

class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        orm_mode = True

class UserWithAssignments(User):
    assigned_users: List[User] = []

    class Config:
        orm_mode = True

# Exercise schema
class Exercise(BaseModel):
    name: str
    sets: int
    reps: int
    weight: float

# Meal schema
class Meal(BaseModel):
    name: str
    time: str
    calories: int
    protein: float
    carbs: float
    fats: float
    ingredients: str

# Workout plan schemas
class WorkoutPlanBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    exercises: List[Exercise]
    assigned_user_id: int

class WorkoutPlanCreate(WorkoutPlanBase):
    pass

class WorkoutPlan(WorkoutPlanBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Meal plan schemas
class MealPlanBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    meals: List[Meal]
    assigned_user_id: int

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "Sample Meal Plan",
                    "description": "A balanced meal plan for the day",
                    "date": "2025-04-20T18:07:48.990Z",
                    "meals": [
                        {
                            "name": "Breakfast",
                            "time": "08:00",
                            "calories": 500,
                            "protein": 25,
                            "carbs": 60,
                            "fats": 20,
                            "ingredients": "Oatmeal, banana, almonds, protein powder"
                        }
                    ],
                    "assigned_user_id": 5
                }
            ]
        }
    }

class MealPlanCreate(MealPlanBase):
    pass

class MealPlan(MealPlanBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True 