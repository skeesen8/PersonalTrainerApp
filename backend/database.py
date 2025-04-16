from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Get the DATABASE_URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
DATABASE_PUBLIC_URL = os.getenv("DATABASE_PUBLIC_URL")

# Log environment variables for debugging
logger.info(f"Environment variables present: {list(os.environ.keys())}")
logger.info(f"DATABASE_URL present: {bool(DATABASE_URL)}")
logger.info(f"DATABASE_PUBLIC_URL present: {bool(DATABASE_PUBLIC_URL)}")

# Choose the appropriate database URL
if DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
elif DATABASE_PUBLIC_URL:
    SQLALCHEMY_DATABASE_URL = DATABASE_PUBLIC_URL
else:
    logger.warning("No database URL found, falling back to SQLite")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# Log the type of database being used (but not the full URL for security)
logger.info(f"Database type: {'PostgreSQL' if 'postgres' in SQLALCHEMY_DATABASE_URL else 'SQLite'}")

# Modify the URL if it's a PostgreSQL URL (they use postgres://, but SQLAlchemy needs postgresql://)
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    logger.info("Modified postgres:// to postgresql:// in database URL")

# Create engine with connection pool settings
try:
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        logger.warning("Using SQLite database - this should only happen in development!")
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL, 
            connect_args={"check_same_thread": False}
        )
    else:
        logger.info("Using PostgreSQL database")
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
            pool_recycle=1800
        )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Error creating database engine: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        # Test the connection
        db.execute("SELECT 1")
        yield db
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise
    finally:
        db.close() 