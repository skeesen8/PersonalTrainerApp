from sqlalchemy.orm import Session
import models, schemas
from passlib.context import CryptContext
from typing import List

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_workout_plans(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.WorkoutPlan).offset(skip).limit(limit).all()

def get_user_workout_plans(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.WorkoutPlan).filter(models.WorkoutPlan.user_id == user_id).offset(skip).limit(limit).all()

def create_workout_plan(db: Session, workout_plan: schemas.WorkoutPlanCreate):
    db_workout_plan = models.WorkoutPlan(**workout_plan.dict())
    db.add(db_workout_plan)
    db.commit()
    db.refresh(db_workout_plan)
    return db_workout_plan

def get_meal_plans(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.MealPlan).offset(skip).limit(limit).all()

def get_user_meal_plans(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.MealPlan).filter(models.MealPlan.user_id == user_id).offset(skip).limit(limit).all()

def create_meal_plan(db: Session, meal_plan: schemas.MealPlanCreate):
    db_meal_plan = models.MealPlan(**meal_plan.dict())
    db.add(db_meal_plan)
    db.commit()
    db.refresh(db_meal_plan)
    return db_meal_plan 