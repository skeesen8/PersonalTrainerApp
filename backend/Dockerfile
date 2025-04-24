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
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && pip list \
    && python -c "import openai; print('OpenAI package version:', openai.__version__)"

# Copy the application code
COPY . .

# Verify the file structure
RUN ls -la /app && \
    echo "Verifying main.py exists:" && ls -la /app/main.py && \
    echo "Verifying ai_service.py exists:" && ls -la /app/ai_service.py

# Create and set up the start script
RUN echo '#!/bin/bash\n\
echo "Starting FastAPI application..."\n\
echo "Using port: $PORT"\n\
python -c "import sys; print(sys.path)" \n\
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4' > start.sh \
    && chmod +x start.sh

# Command to run the application
CMD ["./start.sh"] 