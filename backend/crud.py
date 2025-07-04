from sqlalchemy.orm import Session, joinedload
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
    """Get a user by ID with relationships loaded"""
    return db.query(models.User).options(
        joinedload(models.User.assigned_users)
    ).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """Get a user by email with relationships loaded"""
    try:
        user = db.query(models.User).options(
            joinedload(models.User.assigned_users)
        ).filter(models.User.email == email).first()
        
        if user:
            print(f"Found user: id={user.id}, email={user.email}, is_admin={user.is_admin}")
        else:
            print(f"No user found with email: {email}")
        
        return user
    except Exception as e:
        print(f"Error in get_user_by_email: {str(e)}")
        raise

def get_users(db: Session, skip: int = 0, limit: int = 100, admin_id: int = None):
    """Get users with optional filtering by admin assignment"""
    query = db.query(models.User).filter(models.User.is_admin == False)
    
    if admin_id:
        admin = db.query(models.User).filter(models.User.id == admin_id).first()
        if admin and admin.is_admin:
            return admin.assigned_users[skip:skip + limit]
    
    return query.offset(skip).limit(limit).all()

def get_admin_users(db: Session, admin_id: int):
    """Get all users assigned to a specific admin"""
    try:
        # Get admin with assigned_users relationship loaded
        admin = db.query(models.User).options(
            joinedload(models.User.assigned_users)
        ).filter(
            models.User.id == admin_id,
            models.User.is_admin == True
        ).first()
        
        if not admin:
            print(f"Admin not found or user is not an admin: admin_id={admin_id}")
            return []
        
        # Return assigned users or empty list
        assigned_users = admin.assigned_users
        print(f"Found {len(assigned_users)} assigned users for admin {admin_id}")
        return assigned_users
    except Exception as e:
        print(f"Error in get_admin_users: {str(e)}")
        raise

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
        # Get admin with assigned_users relationship loaded
        admin = db.query(models.User).options(
            joinedload(models.User.assigned_users)
        ).filter(models.User.id == admin_id).first()
        
        # Get user
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
            db.refresh(admin)  # Refresh to get updated relationships
            print(f"Successfully assigned user {user_id} to admin {admin_id}")
        else:
            print(f"User {user_id} is already assigned to admin {admin_id}")
        
        return user
    except Exception as e:
        print(f"Error assigning user to admin: {str(e)}")
        db.rollback()
        raise

def get_workout_plans(db: Session, skip: int = 0, limit: int = 100):
    """Get all workout plans with deserialized exercises"""
    try:
        workout_plans = db.query(models.WorkoutPlan).offset(skip).limit(limit).all()
        # Deserialize exercises for each workout plan
        for workout_plan in workout_plans:
            if workout_plan.exercises:
                workout_plan.exercises = json.loads(workout_plan.exercises)
        return workout_plans
    except Exception as e:
        print(f"Error getting workout plans: {str(e)}")
        raise

def get_user_workout_plans(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get workout plans for a specific user with deserialized exercises"""
    try:
        workout_plans = db.query(models.WorkoutPlan).filter(
            models.WorkoutPlan.user_id == user_id
        ).offset(skip).limit(limit).all()
        
        # Deserialize exercises for each workout plan
        for workout_plan in workout_plans:
            if workout_plan.exercises:
                workout_plan.exercises = json.loads(workout_plan.exercises)
        return workout_plans
    except Exception as e:
        print(f"Error getting user workout plans: {str(e)}")
        raise

def create_workout_plan(db: Session, workout_plan: schemas.WorkoutPlanCreate):
    """Create a new workout plan"""
    try:
        # Create the workout plan model
        db_workout_plan = models.WorkoutPlan(
            title=workout_plan.title,
            description=workout_plan.description,
            exercises=workout_plan.serialize_exercises(),  # Serialize exercises to JSON string
            user_id=workout_plan.assigned_user_id,  # Use assigned_user_id directly
            scheduled_date=workout_plan.scheduled_date
        )
        
        # Add and commit to database
        db.add(db_workout_plan)
        db.commit()
        db.refresh(db_workout_plan)
        
        # Deserialize exercises before returning
        if db_workout_plan.exercises:
            db_workout_plan.exercises = json.loads(db_workout_plan.exercises)
        return db_workout_plan
    except Exception as e:
        print(f"Error creating workout plan: {str(e)}")
        db.rollback()
        raise e

def get_meal_plans(db: Session, skip: int = 0, limit: int = 100):
    """Get all meal plans with deserialized meals"""
    try:
        meal_plans = db.query(models.MealPlan).offset(skip).limit(limit).all()
        # Deserialize meals for each meal plan
        for meal_plan in meal_plans:
            if meal_plan.meals:
                meal_plan.meals = json.loads(meal_plan.meals)
        return meal_plans
    except Exception as e:
        print(f"Error getting meal plans: {str(e)}")
        raise

def get_user_meal_plans(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get meal plans for a specific user with deserialized meals"""
    try:
        meal_plans = db.query(models.MealPlan).filter(
            models.MealPlan.user_id == user_id
        ).offset(skip).limit(limit).all()
        
        # Deserialize meals for each meal plan
        for meal_plan in meal_plans:
            if meal_plan.meals:
                meal_plan.meals = json.loads(meal_plan.meals)
        return meal_plans
    except Exception as e:
        print(f"Error getting user meal plans: {str(e)}")
        raise

def create_meal_plan(db: Session, meal_plan: schemas.MealPlanCreate):
    """Create a new meal plan"""
    try:
        # Create the meal plan model
        db_meal_plan = models.MealPlan(
            title=meal_plan.title,
            description=meal_plan.description,
            scheduled_date=meal_plan.scheduled_date,
            meals=meal_plan.serialize_meals(),  # Use the serialize_meals method
            user_id=meal_plan.user_id
        )
        
        # Add and commit to database
        db.add(db_meal_plan)
        db.commit()
        db.refresh(db_meal_plan)
        return db_meal_plan
    except Exception as e:
        print(f"Error creating meal plan: {str(e)}")
        db.rollback()
        raise e

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user 