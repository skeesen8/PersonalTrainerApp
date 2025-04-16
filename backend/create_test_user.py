from database import SessionLocal
import crud
import schemas

def create_test_user():
    db = SessionLocal()
    try:
        # Create test user
        user_data = schemas.UserCreate(
            email="test@example.com",
            password="test123",
            full_name="Test User",
            is_admin=False
        )
        
        # Check if user already exists
        existing_user = crud.get_user_by_email(db, email=user_data.email)
        if existing_user:
            print("Test user already exists")
            return
        
        # Create new user
        user = crud.create_user(db=db, user=user_data)
        print(f"Created test user with email: {user.email}")
    
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user() 