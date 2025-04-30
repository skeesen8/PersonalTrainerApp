#!/bin/bash
echo "Starting FastAPI application..."
echo "Using port: $PORT"
echo "Python path: $PYTHONPATH"
echo "Current directory: $(pwd)"
echo "Contents of /app/backend:"
ls -la /app/backend

# Verify and install openai package if missing
echo "Verifying openai package..."
if ! python -c "import openai" 2>/dev/null; then
    echo "OpenAI package not found, installing..."
    pip install --no-cache-dir openai==1.12.0
    echo "OpenAI package installed"
else
    echo "OpenAI package found"
    python -c "import openai; print('OpenAI package version:', openai.__version__); print('OpenAI package location:', openai.__file__)"
fi

echo "Installed packages:"
pip list

cd /app/backend
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4 --log-level debug 