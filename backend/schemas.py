from typing import Optional, List
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
import json

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
    scheduled_date: datetime
    exercises: List[Exercise]
    assigned_user_id: int

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class WorkoutPlanCreate(WorkoutPlanBase):
    """Schema for creating a new workout plan"""
    @validator('exercises', pre=True)
    def validate_exercises(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    def serialize_exercises(self):
        """Serialize exercises to JSON string for database storage"""
        return json.dumps([exercise.dict() for exercise in self.exercises])

class WorkoutPlan(WorkoutPlanBase):
    id: int
    created_at: datetime

    @validator('exercises', pre=True)
    def validate_exercises(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Meal plan schemas
class MealPlanBase(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_date: datetime
    meals: List[Meal]
    user_id: int

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class MealPlanCreate(MealPlanBase):
    """Schema for creating a new meal plan"""
    @validator('meals', pre=True)
    def validate_meals(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    def serialize_meals(self):
        """Serialize meals to JSON string for database storage"""
        return json.dumps([meal.dict() for meal in self.meals])

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Sample Meal Plan",
                "description": "A balanced meal plan for the day",
                "scheduled_date": "2025-04-20T18:07:48.990Z",
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
                "user_id": 5
            }
        }

class MealPlan(MealPlanBase):
    id: int
    created_at: datetime

    @validator('meals', pre=True)
    def validate_meals(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 