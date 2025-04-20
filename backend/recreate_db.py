from sqlalchemy import create_engine
from models import Base
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get database URL from environment
database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise ValueError("DATABASE_URL environment variable not set")

# Create engine
engine = create_engine(database_url)

def recreate_tables():
    print("Dropping all tables...")
    Base.metadata.drop_all(engine)
    print("Creating all tables...")
    Base.metadata.create_all(engine)
    print("Tables recreated successfully!")

if __name__ == "__main__":
    recreate_tables() 