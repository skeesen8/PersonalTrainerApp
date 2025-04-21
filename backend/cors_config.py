from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import Response
from typing import List

def setup_cors(app: FastAPI, allowed_origins: List[str]) -> None:
    """
    Configure CORS for the FastAPI application
    """
    # Define all headers we want to allow
    allowed_headers = [
        "Content-Type",
        "Accept",
        "Authorization",
        "authorization",  # Add lowercase version
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ]

    # Ensure the Vercel frontend origin is in the allowed origins
    if "https://personal-trainer-app-topaz.vercel.app" not in allowed_origins:
        allowed_origins.append("https://personal-trainer-app-topaz.vercel.app")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=allowed_headers,  # Use our explicit headers list
        expose_headers=["*"],
        max_age=3600,
    )

    @app.middleware("http")
    async def add_security_headers(request: Request, call_next) -> Response:
        # Handle preflight requests
        if request.method == "OPTIONS":
            response = Response(status_code=200)
            origin = request.headers.get("origin", "").strip()
            
            if origin in allowed_origins:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Methods"] = "*"
                response.headers["Access-Control-Allow-Headers"] = ", ".join(allowed_headers)
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Max-Age"] = "3600"
                response.headers["Vary"] = "Origin"
            return response
            
        response = await call_next(request)
        
        # Get the origin from the request
        origin = request.headers.get("origin", "").strip()
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Expose-Headers"] = "*"
            response.headers["Vary"] = "Origin"
        
        return response 