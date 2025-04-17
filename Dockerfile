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
ENV PORT=8080

# Make sure the DATABASE_URL is available at runtime
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Set the working directory to backend
WORKDIR /app/backend

# Create a health check file
RUN echo "OK" > health.txt

# Expose the port
EXPOSE 8080

# Create a shell script to start the application
RUN echo '#!/bin/bash\n\
echo "Starting FastAPI application..."\n\
echo "Port: $PORT"\n\
echo "Database URL: ${DATABASE_URL}"\n\
echo "Allowed Origins: ${ALLOWED_ORIGINS}"\n\
uvicorn main:app --host 0.0.0.0 --port "${PORT:-8080}" --log-level debug\
' > start.sh && chmod +x start.sh

# Command to run the application
CMD ["./start.sh"] 