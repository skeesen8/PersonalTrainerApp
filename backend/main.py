from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud
from database import engine, SessionLocal
from datetime import timedelta
from auth import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from dependencies import get_db
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Personal Trainer API")

# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000,https://personal-trainer-e0oxgs06w-skeesen8s-projects.vercel.app"
).split(",")

logger.info(f"Configured CORS with allowed origins: {ALLOWED_ORIGINS}")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up FastAPI application")
    try:
        # Test database connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        logger.info("Successfully connected to the database")
        
        # Create database tables
        models.Base.metadata.create_all(bind=engine)
        logger.info("Successfully created database tables")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    with get_db() as db:
        user = crud.authenticate_user(db, form_data.username, form_data.password)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate):
    with get_db() as db:
        db_user = crud.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check admin code if user is requesting admin privileges
        if user.is_admin:
            ADMIN_CODE = "admin123"  # In production, use environment variable
            if not user.admin_code or user.admin_code != ADMIN_CODE:
                raise HTTPException(
                    status_code=403,
                    detail="Invalid admin code"
                )
        
        return crud.create_user(db=db, user=user)

@app.get("/workout-plans/", response_model=List[schemas.WorkoutPlan])
def read_workout_plans(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user)
):
    with get_db() as db:
        if current_user.is_admin:
            workout_plans = crud.get_workout_plans(db, skip=skip, limit=limit)
        else:
            workout_plans = crud.get_user_workout_plans(db, user_id=current_user.id, skip=skip, limit=limit)
        return workout_plans

@app.post("/workout-plans/", response_model=schemas.WorkoutPlan)
def create_workout_plan(
    workout_plan: schemas.WorkoutPlanCreate,
    current_user: models.User = Depends(get_current_user)
):
    with get_db() as db:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to create workout plans")
        return crud.create_workout_plan(db=db, workout_plan=workout_plan)

@app.get("/meal-plans/", response_model=List[schemas.MealPlan])
def read_meal_plans(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user)
):
    with get_db() as db:
        if current_user.is_admin:
            meal_plans = crud.get_meal_plans(db, skip=skip, limit=limit)
        else:
            meal_plans = crud.get_user_meal_plans(db, user_id=current_user.id, skip=skip, limit=limit)
        return meal_plans

@app.post("/meal-plans/", response_model=schemas.MealPlan)
def create_meal_plan(
    meal_plan: schemas.MealPlanCreate,
    current_user: models.User = Depends(get_current_user)
):
    with get_db() as db:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to create meal plans")
        return crud.create_meal_plan(db=db, meal_plan=meal_plan)

@app.get("/users/", response_model=List[schemas.User])
def read_users(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view all users")
    with get_db() as db:
        return crud.get_users(db) 