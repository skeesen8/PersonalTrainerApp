# Use Python 3.9 slim image
FROM python:3.9.18-slim-bullseye

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV PYTHONPATH=/app:/usr/local/lib/python3.9/site-packages

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
    && pip install --no-cache-dir --force-reinstall openai==1.12.0 requests==2.31.0

# Copy the application code
COPY . .

# Create __init__.py files to make directories Python packages
RUN touch __init__.py \
    && touch models/__init__.py \
    && touch schemas/__init__.py \
    && touch crud/__init__.py

# Verify the file structure and Python path
RUN echo "Verifying openai package:" && \
    python -c "import openai; print('OpenAI package version:', openai.__version__); print('OpenAI package location:', openai.__file__)" && \
    echo "Python path:" && python -c "import sys; print('\n'.join(sys.path))" && \
    echo "Installed packages:" && pip list

# Create and set up the start script
RUN echo '#!/bin/bash\n\
echo "Starting FastAPI application..."\n\
echo "Using port: $PORT"\n\
echo "Python path: $PYTHONPATH"\n\
echo "Current directory: $(pwd)"\n\
echo "Contents of /app:"\n\
ls -la\n\
echo "Verifying openai package:"\n\
python -c "import openai; print(\"OpenAI package version:\", openai.__version__); print(\"OpenAI package location:\", openai.__file__)"\n\
echo "Installed packages:"\n\
pip list\n\
echo "Python path:"\n\
python -c "import sys; print('\n'.join(sys.path))"\n\
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4 --log-level debug' > start.sh \
    && chmod +x start.sh

# Command to run the application
CMD ["./start.sh"] 