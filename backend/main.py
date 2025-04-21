from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
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
import json

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
    "https://personal-trainer-app-topaz.vercel.app",
    "https://scintillating-harmony-production.up.railway.app",
    "http://scintillating-harmony-production.up.railway.app"
]

# Add CORS middleware with more permissive settings for preflight requests
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
    
    # Handle preflight requests
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Max-Age"] = "3600"
        return response
    
    response = await call_next(request)
    
    # Add CORS headers for all responses
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
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    logger.info(f"Login attempt for user: {form_data.username}")
    try:
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
        
        # Create response with proper headers
        response = JSONResponse(
            content={"access_token": access_token, "token_type": "bearer"}
        )
        
        # Add CORS headers
        origin = request.headers.get("origin")
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/users/", response_model=schemas.User)
async def create_user(
    user: schemas.UserCreate,
    current_user: models.User = Depends(get_current_user)
):
    """Create a new user and automatically assign them to the admin if created by an admin"""
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
        
        # If the current user is an admin and the created user is not an admin,
        # automatically assign the new user to the admin
        if current_user.is_admin and not created_user.is_admin:
            logger.info(f"Automatically assigning user {created_user.id} to admin {current_user.id}")
            crud.assign_user_to_admin(db, admin_id=current_user.id, user_id=created_user.id)
            db.refresh(created_user)  # Refresh to get updated relationships
        
        logger.info(f"Successfully created user: {user.email}")
        return created_user

@app.get("/users/", response_model=List[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user)
):
    """Get all users (for admins) or assigned users (for regular users)"""
    with get_db() as db:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to view users")
        return crud.get_users(db, skip=skip, limit=limit, admin_id=current_user.id)

@app.post("/users/assign/{user_id}", response_model=schemas.User)
def assign_user_to_admin(
    user_id: int,
    current_user: models.User = Depends(get_current_user)
):
    """Assign a user to an admin"""
    logger.info(f"Attempting to assign user {user_id} to admin {current_user.id}")
    with get_db() as db:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to assign users")
        
        # Check if user exists
        user = crud.get_user(db, user_id=user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user is already assigned to this admin
        admin = crud.get_user(db, user_id=current_user.id)
        if user in admin.assigned_users:
            logger.info(f"User {user_id} is already assigned to admin {current_user.id}")
            return user
        
        result = crud.assign_user_to_admin(db, admin_id=current_user.id, user_id=user_id)
        if not result:
            raise HTTPException(status_code=400, detail="Failed to assign user")
        
        logger.info(f"Successfully assigned user {user_id} to admin {current_user.id}")
        return result

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
async def create_meal_plan(
    meal_plan: schemas.MealPlanCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Log the incoming request data
        logger.info(f"Creating meal plan for user {meal_plan.assigned_user_id}")
        
        # If no assigned_user_id is provided, create meal plan for self
        if not meal_plan.assigned_user_id:
            meal_plan.assigned_user_id = current_user.id
            logger.info(f"No assigned user provided, using current user: {current_user.id}")
        
        # Check if assigned user exists and current user has permission
        if meal_plan.assigned_user_id != current_user.id:
            if not current_user.is_admin:
                logger.warning(f"Non-admin user {current_user.id} attempted to create meal plan for user {meal_plan.assigned_user_id}")
                raise HTTPException(
                    status_code=403,
                    detail="Only admins can create meal plans for other users"
                )
            
            try:
                assigned_user = crud.get_user(db, meal_plan.assigned_user_id)
                if not assigned_user:
                    logger.warning(f"Assigned user {meal_plan.assigned_user_id} not found")
                    raise HTTPException(
                        status_code=404,
                        detail="Assigned user not found"
                    )
                
                # Query current user again to ensure relationships are up to date
                current_user_fresh = crud.get_user(db, current_user.id)
                if not current_user_fresh:
                    logger.error("Could not refresh current user data")
                    raise HTTPException(
                        status_code=500,
                        detail="Error accessing user data"
                    )
                
                if assigned_user.id not in [u.id for u in current_user_fresh.assigned_users]:
                    logger.warning(f"User {current_user.id} attempted to create meal plan for non-assigned user {meal_plan.assigned_user_id}")
                    raise HTTPException(
                        status_code=403,
                        detail="You can only create meal plans for your assigned users"
                    )
            except HTTPException as he:
                raise he
            except Exception as e:
                logger.error(f"Error checking user relationships: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail="Error verifying user relationships"
                )
        
        # Create the meal plan
        try:
            db_meal_plan = crud.create_meal_plan(db, meal_plan)
            logger.info(f"Successfully created meal plan with ID: {db_meal_plan.id}")
            return db_meal_plan
            
        except Exception as e:
            logger.error(f"Error in crud.create_meal_plan: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error creating meal plan in database"
            )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error creating meal plan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while creating the meal plan"
        )

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
    """Get all users assigned to the current admin"""
    with get_db() as db:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to view assigned users")
        return crud.get_admin_users(db, admin_id=current_user.id) 