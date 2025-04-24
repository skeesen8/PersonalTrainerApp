from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.exceptions import RequestValidationError
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
from cors_config import setup_cors
import traceback

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
    "https://scintillating-harmony-production.up.railway.app"
]

# Use the CORS configuration from cors_config.py
setup_cors(app, allowed_origins)

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
        if origin in allowed_origins:
            response = Response(status_code=200)
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "POST, GET, DELETE, PUT, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response
        return Response(status_code=400)
    
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

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full error
    logging.error(f"Unhandled exception: {str(exc)}")
    logging.error(traceback.format_exc())
    
    # Get origin from request
    origin = request.headers.get("origin")
    
    # Create response with CORS headers
    response = JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred"},
    )
    
    if origin and origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # Log the error
    logging.error(f"HTTP exception: {exc.detail}")
    
    # Get origin from request
    origin = request.headers.get("origin")
    
    # Create response with CORS headers
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
    
    if origin and origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        
    # Add any additional headers from the original exception
    if exc.headers:
        response.headers.update(exc.headers)
    
    return response

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

@app.post("/token")
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        logging.info(f"Login attempt for user: {form_data.username}")
        
        user = crud.authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        # Get origin from request
        origin = request.headers.get("origin")
        
        # Create response with token
        response = JSONResponse(
            content={"access_token": access_token, "token_type": "bearer"}
        )
        
        # Add CORS headers if origin is allowed
        if origin and origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        
        logging.info(f"Login successful for user: {form_data.username}")
        return response
        
    except HTTPException as he:
        # Re-raise HTTP exceptions to be handled by the exception handler
        raise
    except Exception as e:
        # Log the error and re-raise as HTTP exception
        logging.error(f"Login error for user {form_data.username}: {str(e)}")
        logging.error(traceback.format_exc())
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
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a workout plan"""
    try:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to create workout plans")
        
        # Verify the assigned user exists
        assigned_user = crud.get_user(db, workout_plan.assigned_user_id)
        if not assigned_user:
            raise HTTPException(status_code=404, detail="Assigned user not found")
        
        # If admin has assigned users, verify this user is one of them
        if current_user.assigned_users and assigned_user.id not in [u.id for u in current_user.assigned_users]:
            raise HTTPException(status_code=403, detail="Not authorized to create plans for this user")
        
        # Create a dict of the workout plan data
        workout_plan_data = workout_plan.dict()
        
        # Map assigned_user_id to user_id for the database model
        workout_plan_data['user_id'] = workout_plan_data.pop('assigned_user_id')
        
        # Serialize the exercises list to a JSON string
        try:
            workout_plan_data['exercises'] = workout_plan.serialize_exercises()
        except Exception as e:
            logger.error(f"Error serializing exercises: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to serialize exercises: {str(e)}"
            )
        
        # Create the workout plan
        try:
            created_plan = crud.create_workout_plan(db=db, workout_plan=schemas.WorkoutPlanCreate(**workout_plan_data))
            logger.info(f"Successfully created workout plan for user {assigned_user.id}")
            return created_plan
        except Exception as e:
            logger.error(f"Error creating workout plan: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create workout plan: {str(e)}"
            )
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error creating workout plan: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the workout plan"
        )

@app.post("/meal-plans/", response_model=schemas.MealPlan)
async def create_meal_plan(
    meal_plan: schemas.MealPlanCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Received meal plan data: {meal_plan.dict()}")
        
        if not meal_plan.user_id:
            meal_plan.user_id = current_user.id
            logger.info(f"Set user_id to current user: {current_user.id}")
        
        if meal_plan.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create meal plans for yourself unless you are an admin"
            )
            
        # Create a dict of the meal plan data
        meal_plan_data = meal_plan.dict()
        logger.info(f"Meal plan data before serialization: {meal_plan_data}")
        
        # Serialize the meals list to a JSON string
        try:
            meal_plan_data['meals'] = meal_plan.serialize_meals()
            logger.info(f"Successfully serialized meals: {meal_plan_data['meals']}")
        except Exception as e:
            logger.error(f"Error serializing meals: {str(e)}")
            raise ValueError(f"Failed to serialize meals: {str(e)}")
            
        logger.info(f"Creating meal plan with data: {meal_plan_data}")
        created_meal_plan = crud.create_meal_plan(db=db, meal_plan=schemas.MealPlanCreate(**meal_plan_data))
        logger.info(f"Successfully created meal plan: {created_meal_plan}")
        
        return created_meal_plan
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error creating meal plan: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get meal plans for the current user"""
    try:
        logger.info(f"Fetching meal plans for user {current_user.id}")
        meal_plans = crud.get_user_meal_plans(db, user_id=current_user.id)
        logger.info(f"Found {len(meal_plans)} meal plans")
        
        # Validate each meal plan before returning
        validated_meal_plans = []
        for meal_plan in meal_plans:
            try:
                # Convert to dict and validate through schema
                meal_plan_dict = {
                    "id": meal_plan.id,
                    "title": meal_plan.title,
                    "description": meal_plan.description,
                    "scheduled_date": meal_plan.scheduled_date,
                    "meals": meal_plan.meals,  # Already deserialized in crud function
                    "user_id": meal_plan.user_id,
                    "created_at": meal_plan.created_at
                }
                validated_meal_plan = schemas.MealPlan(**meal_plan_dict)
                validated_meal_plans.append(validated_meal_plan)
            except Exception as e:
                logger.error(f"Error validating meal plan {meal_plan.id}: {str(e)}")
                continue
        
        return validated_meal_plans
        
    except Exception as e:
        logger.error(f"Error fetching meal plans: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching meal plans: {str(e)}"
        )

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
def read_assigned_users(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users assigned to the current admin"""
    try:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to view assigned users")
        
        users = crud.get_admin_users(db, admin_id=current_user.id)
        if users is None:
            return []
        return users
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching assigned users: {str(e)}"
        ) 