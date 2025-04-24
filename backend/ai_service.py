from openai import OpenAI
from datetime import datetime
import json
import os
from typing import List, Dict, Any
from schemas import AIMealPlanRequest, AIMealPlanResponse, MealPlanCreate, Meal
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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