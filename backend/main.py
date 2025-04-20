from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud
from database import engine, SessionLocal
from datetime import timedelta
from auth import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from dependencies import get_db
import logging
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Personal Trainer API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Get allowed origins from environment or use defaults
allowed_origins = [
    "http://localhost:3000",
    "https://personal-trainer-app-topaz.vercel.app"
]

# Add CORS middleware with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

logger.info("Starting application with configuration:")
logger.info(f"Current working directory: {os.getcwd()}")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    origin = request.headers.get("origin")
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Request headers: {dict(request.headers)}")
    logger.info(f"Request origin: {origin}")
    
    response = await call_next(request)
    
    # Add CORS headers for non-OPTIONS requests
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    logger.info(f"Response status: {response.status_code}")
    logger.info(f"Response headers: {dict(response.headers)}")
    return response

@app.get("/")
async def root():
    return {"message": "Personal Trainer API is running"}

@app.get("/_health")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "healthy"}

@app.options("/token")
async def token_preflight(request: Request):
    origin = request.headers.get("origin")
    if origin in allowed_origins:
        return PlainTextResponse(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    logger.warning(f"Rejected CORS preflight request from origin: {origin}")
    return PlainTextResponse(status_code=400)

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
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    with get_db() as db:
        user = crud.authenticate_user(db, form_data.username, form_data.password)
        if user is None:
            logger.warning(f"Authentication failed for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        logger.info(f"Login successful for user: {form_data.username}")
        return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/users/", response_model=schemas.User)
async def create_user(user: schemas.UserCreate):
    logger.info(f"Creating new user with email: {user.email}")
    with get_db() as db:
        db_user = crud.get_user_by_email(db, email=user.email)
        if db_user:
            logger.warning(f"Email already registered: {user.email}")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check admin code if user is requesting admin privileges
        if user.is_admin:
            ADMIN_CODE = "admin123"  # In production, use environment variable
            if not user.admin_code or user.admin_code != ADMIN_CODE:
                logger.warning(f"Invalid admin code attempt for user: {user.email}")
                raise HTTPException(
                    status_code=403,
                    detail="Invalid admin code"
                )
        
        created_user = crud.create_user(db=db, user=user)
        logger.info(f"Successfully created user: {user.email}")
        return created_user

@app.get("/users/", response_model=List[schemas.User])
def read_users(current_user: models.User = Depends(get_current_user)):
    """Get all users (for admins) or assigned users (for regular users)"""
    with get_db() as db:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to view users")
        return crud.get_users(db)

@app.post("/users/assign/{user_id}", response_model=schemas.User)
def assign_user_to_admin(
    user_id: int,
    current_user: models.User = Depends(get_current_user)
):
    """Assign a user to an admin"""
    with get_db() as db:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to assign users")
        return crud.assign_user_to_admin(db, admin_id=current_user.id, user_id=user_id)

@app.post("/workout-plans/", response_model=schemas.WorkoutPlan)
def create_workout_plan(
    workout_plan: schemas.WorkoutPlanCreate,
    current_user: models.User = Depends(get_current_user)
):
    """Create a workout plan"""
    with get_db() as db:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to create workout plans")
        
        # Verify the assigned user belongs to this admin
        assigned_user = crud.get_user(db, workout_plan.assigned_user_id)
        if not assigned_user or assigned_user.id not in [u.id for u in current_user.assigned_users]:
            raise HTTPException(status_code=403, detail="Not authorized to create plans for this user")
        
        return crud.create_workout_plan(db=db, workout_plan=workout_plan)

@app.post("/meal-plans/", response_model=schemas.MealPlan)
def create_meal_plan(
    meal_plan: schemas.MealPlanCreate,
    current_user: models.User = Depends(get_current_user)
):
    """Create a meal plan"""
    with get_db() as db:
        if not current_user.is_admin:
            logger.warning(f"Non-admin user {current_user.id} attempted to create meal plan")
            raise HTTPException(status_code=403, detail="Not authorized to create meal plans")
        
        # Get the assigned user
        assigned_user = crud.get_user(db, meal_plan.assigned_user_id)
        if not assigned_user:
            logger.warning(f"Assigned user {meal_plan.assigned_user_id} not found")
            raise HTTPException(status_code=404, detail="Assigned user not found")
        
        # First, ensure the admin-user relationship exists
        if assigned_user not in current_user.assigned_users:
            logger.info(f"Creating admin-user relationship: admin={current_user.id}, user={assigned_user.id}")
            crud.assign_user_to_admin(db, admin_id=current_user.id, user_id=assigned_user.id)
        
        # Now create the meal plan
        try:
            return crud.create_meal_plan(db=db, meal_plan=meal_plan)
        except Exception as e:
            logger.error(f"Error creating meal plan: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/workout-plans/user", response_model=List[schemas.WorkoutPlan])
def read_user_workout_plans(
    current_user: models.User = Depends(get_current_user)
):
    """Get workout plans for the current user"""
    with get_db() as db:
        return crud.get_user_workout_plans(db, user_id=current_user.id)

@app.get("/meal-plans/user", response_model=List[schemas.MealPlan])
def read_user_meal_plans(
    current_user: models.User = Depends(get_current_user)
):
    """Get meal plans for the current user"""
    with get_db() as db:
        return crud.get_user_meal_plans(db, user_id=current_user.id)

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

@app.get("/users/assigned", response_model=List[schemas.User])
def read_assigned_users(current_user: models.User = Depends(get_current_user)):
    """Get users assigned to the current admin"""
    with get_db() as db:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to view users")
        return current_user.assigned_users 