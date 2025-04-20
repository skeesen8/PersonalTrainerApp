from sqlalchemy.orm import Session
import models, schemas
from datetime import datetime
import json
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
    return db.query(models.User).filter(models.User.is_admin == False).offset(skip).limit(limit).all()

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

def assign_user_to_admin(db: Session, admin_id: int, user_id: int):
    """Assign a user to an admin"""
    try:
        admin = db.query(models.User).filter(models.User.id == admin_id).first()
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        if not admin or not user:
            print(f"Admin or user not found: admin_id={admin_id}, user_id={user_id}")
            return None
        
        if not admin.is_admin:
            print(f"User {admin_id} is not an admin")
            return None
        
        # Check if the relationship already exists
        if user not in admin.assigned_users:
            admin.assigned_users.append(user)
            db.commit()
            print(f"Successfully assigned user {user_id} to admin {admin_id}")
        else:
            print(f"User {user_id} is already assigned to admin {admin_id}")
        
        return user
    except Exception as e:
        print(f"Error assigning user to admin: {str(e)}")
        db.rollback()
        raise

def get_workout_plans(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.WorkoutPlan).offset(skip).limit(limit).all()

def get_user_workout_plans(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.WorkoutPlan).filter(models.WorkoutPlan.user_id == user_id).offset(skip).limit(limit).all()

def create_workout_plan(db: Session, workout_plan: schemas.WorkoutPlanCreate):
    db_workout_plan = models.WorkoutPlan(
        title=workout_plan.title,
        description=workout_plan.description,
        exercises=json.dumps([exercise.dict() for exercise in workout_plan.exercises]),
        user_id=workout_plan.assigned_user_id,
        scheduled_date=workout_plan.date
    )
    db.add(db_workout_plan)
    db.commit()
    db.refresh(db_workout_plan)
    return db_workout_plan

def get_meal_plans(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.MealPlan).offset(skip).limit(limit).all()

def get_user_meal_plans(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.MealPlan).filter(models.MealPlan.user_id == user_id).offset(skip).limit(limit).all()

def create_meal_plan(db: Session, meal_plan: schemas.MealPlanCreate):
    try:
        db_meal_plan = models.MealPlan(
            title=meal_plan.title,
            description=meal_plan.description,
            meals=json.dumps([meal.dict() for meal in meal_plan.meals]),
            user_id=meal_plan.assigned_user_id,
            scheduled_date=meal_plan.date
        )
        db.add(db_meal_plan)
        db.commit()
        db.refresh(db_meal_plan)
        return db_meal_plan
    except Exception as e:
        db.rollback()
        print(f"Error creating meal plan: {str(e)}")
        raise

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user 