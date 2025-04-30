import sys
import os
from datetime import datetime
import json
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add site-packages to Python path
site_packages = '/usr/local/lib/python3.9/site-packages'
if site_packages not in sys.path:
    sys.path.append(site_packages)

# Try to import required modules
try:
    from openai import OpenAI
    logger.info("Successfully imported OpenAI package")
except ImportError:
    logger.error("OpenAI package not found, attempting to install...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openai==1.12.0"])
    from openai import OpenAI

try:
    from schemas import AIMealPlanRequest, AIMealPlanResponse, MealPlanCreate, Meal
    logger.info("Successfully imported schemas")
except ImportError as e:
    logger.error(f"Failed to import schemas: {e}")
    raise

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize OpenAI client with error handling
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.error("OPENAI_API_KEY is not set in environment variables")
        raise ValueError("OPENAI_API_KEY environment variable is required")
    
    logger.info("Initializing OpenAI client...")
    client = OpenAI(
        api_key=api_key
    )
    logger.info("Successfully initialized OpenAI client")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    raise

def generate_meal_plan(request: AIMealPlanRequest) -> AIMealPlanResponse:
    """Generate a meal plan using OpenAI's API with function calling"""
    
    # Define the function schema for structured output
    functions = [
        {
            "name": "create_meal_plan",
            "description": "Create a structured meal plan based on user requirements",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "A descriptive title for the meal plan"
                    },
                    "description": {
                        "type": "string",
                        "description": "Detailed description of the meal plan and its goals"
                    },
                    "meals": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "time": {"type": "string"},
                                "calories": {"type": "integer"},
                                "protein": {"type": "number"},
                                "carbs": {"type": "number"},
                                "fats": {"type": "number"},
                                "ingredients": {"type": "string"}
                            },
                            "required": ["name", "time", "calories", "protein", "carbs", "fats", "ingredients"]
                        }
                    },
                    "reasoning": {
                        "type": "string",
                        "description": "Explanation of why these meals were chosen"
                    }
                },
                "required": ["title", "description", "meals", "reasoning"]
            }
        }
    ]

    # Create the prompt with all available information
    prompt = f"""Create a detailed meal plan based on the following requirements:

Main request: {request.prompt}

Additional specifications:
- Meals per day: {request.meals_per_day}
- Dietary preferences: {request.dietary_preferences or 'None specified'}
- Daily targets (if specified):
  * Calories: {request.calories_target or 'Not specified'}
  * Protein: {request.protein_target or 'Not specified'}g
  * Carbs: {request.carbs_target or 'Not specified'}g
  * Fats: {request.fats_target or 'Not specified'}g

Please create a detailed meal plan that:
1. Meets the specified nutritional targets
2. Respects any dietary preferences
3. Provides realistic and practical meals
4. Includes specific ingredients for each meal
5. Distributes nutrients appropriately across meals
"""

    # Call OpenAI API
    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {"role": "system", "content": "You are a professional nutritionist and meal planning expert."},
            {"role": "user", "content": prompt}
        ],
        functions=functions,
        function_call={"name": "create_meal_plan"}
    )

    # Parse the response
    result = json.loads(response.choices[0].message.function_call.arguments)
    
    # Create the meal plan object
    meal_plan = MealPlanCreate(
        title=result["title"],
        description=result["description"],
        scheduled_date=request.scheduled_date,
        meals=[Meal(**meal) for meal in result["meals"]],
        user_id=request.user_id
    )

    # Return the response with the meal plan and reasoning
    return AIMealPlanResponse(
        meal_plan=meal_plan,
        reasoning=result["reasoning"]
    ) 