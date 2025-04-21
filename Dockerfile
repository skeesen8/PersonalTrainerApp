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

# Set the working directory to backend
WORKDIR /app/backend

# Create a shell script to start the application
RUN echo '#!/bin/bash\n\
echo "Starting FastAPI application..."\n\
PORT="${PORT:-8080}"\n\
echo "Using port: $PORT"\n\
exec uvicorn main:app --host 0.0.0.0 --port $PORT --log-level debug\
' > start.sh && chmod +x start.sh

# Expose the port (this is just documentation)
EXPOSE 8080

# Command to run the application
CMD ["./start.sh"] 