#!/bin/bash
echo "Starting FastAPI application..."
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level debug 