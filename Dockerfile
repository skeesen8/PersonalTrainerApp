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
ENV PYTHONUNBUFFERED=1

# Make sure the DATABASE_URL is available at runtime
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Set the working directory to backend
WORKDIR /app/backend

# Create a shell script to start the application
RUN echo '#!/bin/bash\nuvicorn main:app --host 0.0.0.0 --port "${PORT:-8080}"' > start.sh && \
    chmod +x start.sh

# Command to run the application
CMD ["./start.sh"] 