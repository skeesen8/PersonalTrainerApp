from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        orm_mode = True

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

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None 