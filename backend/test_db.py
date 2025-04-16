from database import engine, Base
from models import User, WorkoutPlan, MealPlan
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database_connection():
    try:
        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Successfully created all tables!")
        
        # Test the connection by executing a simple query
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            logger.info("Successfully connected to the database!")
            
        return True
    except Exception as e:
        logger.error(f"Error connecting to database: {str(e)}")
        return False

if __name__ == "__main__":
    test_database_connection() 