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

class MealPlanCreate(MealPlanBase):
    pass

class MealPlan(MealPlanBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True 