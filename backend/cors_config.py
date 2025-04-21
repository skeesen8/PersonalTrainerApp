from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import Response
from typing import List
import logging
import json

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("cors_debug")

def setup_cors(app: FastAPI, allowed_origins: List[str]) -> None:
    """
    Configure CORS for the FastAPI application with debug logging
    """
    # Define all headers we want to allow
    allowed_headers = [
        "Content-Type",
        "Accept",
        "Authorization",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "Content-Length",
        "Accept-Encoding",
        "Accept-Language",
        "Cache-Control"
    ]

    # Ensure the Vercel frontend origin is in the allowed origins
    if "https://personal-trainer-app-topaz.vercel.app" not in allowed_origins:
        allowed_origins.append("https://personal-trainer-app-topaz.vercel.app")

    @app.middleware("http")
    async def cors_debug_middleware(request: Request, call_next):
        # Log incoming request details
        logger.debug(f"\n{'='*50}\nIncoming Request Debug:")
        logger.debug(f"Method: {request.method}")
        logger.debug(f"URL: {request.url}")
        logger.debug(f"Headers:\n{json.dumps(dict(request.headers), indent=2)}")
        
        # Handle preflight requests with detailed logging
        if request.method == "OPTIONS":
            logger.debug("\nHandling Preflight Request:")
            origin = request.headers.get("origin", "").strip()
            logger.debug(f"Origin: {origin}")
            logger.debug(f"Is origin allowed? {origin in allowed_origins}")
            
            headers = {
                "Access-Control-Allow-Origin": origin if origin in allowed_origins else "",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": ", ".join(allowed_headers),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
                "Vary": "Origin"
            }
            
            logger.debug(f"Response Headers:\n{json.dumps(headers, indent=2)}")
            return Response(status_code=200, headers=headers)
        
        # Process the regular request
        response = await call_next(request)
        
        # Add CORS headers to response
        origin = request.headers.get("origin", "").strip()
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Headers"] = ", ".join(allowed_headers)
            response.headers["Vary"] = "Origin"
        
        # Log response details
        logger.debug("\nResponse Debug:")
        logger.debug(f"Status Code: {response.status_code}")
        logger.debug(f"Headers:\n{json.dumps(dict(response.headers), indent=2)}")
        logger.debug(f"{'='*50}\n")
        
        return response

    # Add the CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=allowed_headers,
        expose_headers=["*"],
        max_age=3600,
    ) 