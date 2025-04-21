from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import Response
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
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )

    @app.middleware("http")
    async def add_security_headers(request: Request, call_next) -> Response:
        # Handle preflight requests
        if request.method == "OPTIONS":
            response = Response(status_code=200)
            origin = request.headers.get("origin")
            if origin in allowed_origins:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Methods"] = "*"
                response.headers["Access-Control-Allow-Headers"] = "*"
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Max-Age"] = "3600"
            return response
            
        response = await call_next(request)
        
        # Get the origin from the request
        origin = request.headers.get("origin")
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response 