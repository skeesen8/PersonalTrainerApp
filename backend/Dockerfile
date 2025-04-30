# Use Python 3.9 slim image
FROM python:3.9.18-slim-bullseye

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV PYTHONPATH=/app

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
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && pip list \
    && python -c "import openai; print('OpenAI package version:', openai.__version__)"

# Create the application directory structure
RUN mkdir -p /app/app

# Copy the application code
COPY . /app/app/

# Create __init__.py files to make directories Python packages
RUN touch /app/app/__init__.py \
    && touch /app/app/models/__init__.py \
    && touch /app/app/schemas/__init__.py \
    && touch /app/app/crud/__init__.py

# Verify the file structure
RUN ls -la /app/app && \
    echo "Verifying main.py exists:" && ls -la /app/app/main.py && \
    echo "Verifying ai_service.py exists:" && ls -la /app/app/ai_service.py

# Create and set up the start script
RUN echo '#!/bin/bash\n\
echo "Starting FastAPI application..."\n\
echo "Using port: $PORT"\n\
echo "Python path: $PYTHONPATH"\n\
echo "Current directory: $(pwd)"\n\
echo "Contents of /app:"\n\
ls -la /app\n\
echo "Contents of /app/app:"\n\
ls -la /app/app\n\
cd /app/app\n\
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4 --log-level debug' > start.sh \
    && chmod +x start.sh

# Command to run the application
CMD ["./start.sh"] 