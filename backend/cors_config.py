from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from typing import List

def setup_cors(app: FastAPI, allowed_origins: List[str]) -> None:
    """
    Configure CORS for the FastAPI application
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin",
            "X-Requested-With",
        ],
        expose_headers=["*"],
        max_age=3600,
    )

    # Add CORS headers to all responses
    @app.middleware("http")
    async def add_cors_headers(request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response 