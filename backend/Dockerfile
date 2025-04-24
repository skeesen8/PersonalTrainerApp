# Use Python 3.9 slim image
FROM python:3.9.18-slim-bullseye

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        gcc \
        postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . /app/

# Create and set up the start script
RUN echo '#!/bin/bash\n\
echo "Starting FastAPI application..."\n\
echo "Using port: $PORT"\n\
cd /app\n\
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4' > /app/start.sh \
    && chmod +x /app/start.sh

# Command to run the application
CMD ["/app/start.sh"] 