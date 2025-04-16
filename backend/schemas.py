from typing import Optional
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

# Workout plan schemas
class WorkoutPlanBase(BaseModel):
    title: str
    description: Optional[str] = None
    exercises: str
    scheduled_date: datetime

class WorkoutPlanCreate(WorkoutPlanBase):
    user_id: int

class WorkoutPlan(WorkoutPlanBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Meal plan schemas
class MealPlanBase(BaseModel):
    title: str
    description: Optional[str] = None
    meals: str
    scheduled_date: datetime

class MealPlanCreate(MealPlanBase):
    user_id: int

class MealPlan(MealPlanBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True 