from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Table
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# Association table for admin-user relationships
admin_user_association = Table(
    'admin_users',
    Base.metadata,
    Column('admin_id', Integer, ForeignKey('users.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    workout_plans = relationship("WorkoutPlan", back_populates="user")
    meal_plans = relationship("MealPlan", back_populates="user")
    
    # Admin-user relationships
    assigned_users = relationship(
        "User",
        secondary=admin_user_association,
        primaryjoin=id==admin_user_association.c.admin_id,
        secondaryjoin=id==admin_user_association.c.user_id,
        backref="assigned_to_admin"
    )

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    exercises = Column(Text)  # JSON string of exercises
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    scheduled_date = Column(DateTime)
    
    user = relationship("User", back_populates="workout_plans")

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    meals = Column(Text)  # JSON string of meals
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    scheduled_date = Column(DateTime)
    
    user = relationship("User", back_populates="meal_plans") 