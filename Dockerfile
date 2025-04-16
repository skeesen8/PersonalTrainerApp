FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the backend code
COPY backend/ backend/

# Set environment variables
ENV PORT=8000

# Command to run the application
CMD cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT 