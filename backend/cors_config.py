from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import Response
from typing import List
import logging
import json

# Configure logging with more detail
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] CORS: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("cors_debug")

def setup_cors(app: FastAPI, allowed_origins: List[str]) -> None:
    """
    Configure CORS for the FastAPI application with detailed debugging
    """
    # Define all headers we want to allow - case sensitive!
    allowed_headers = [
        "Accept",
        "Accept-Encoding",
        "Authorization",
        "Content-Type",
        "DNT",
        "Origin",
        "User-Agent",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ]

    # Ensure the Vercel frontend origin is in the allowed origins
    if "https://personal-trainer-app-topaz.vercel.app" not in allowed_origins:
        allowed_origins.append("https://personal-trainer-app-topaz.vercel.app")

    def log_cors_debug(prefix: str, data: dict) -> None:
        """Helper to log CORS-related data in a consistent format"""
        logger.debug(f"\n{'='*20} {prefix} {'='*20}")
        for key, value in data.items():
            logger.debug(f"{key}: {value}")
        logger.debug('='*50)

    @app.middleware("http")
    async def cors_debug_middleware(request: Request, call_next):
        # Log detailed request information
        request_headers = dict(request.headers)
        log_cors_debug("Incoming Request", {
            "Method": request.method,
            "URL": str(request.url),
            "Origin": request_headers.get("origin", "No Origin"),
            "Access-Control-Request-Method": request_headers.get("access-control-request-method", "None"),
            "Access-Control-Request-Headers": request_headers.get("access-control-request-headers", "None"),
            "All Headers": json.dumps(request_headers, indent=2)
        })
        
        # Handle preflight requests with detailed logging
        if request.method == "OPTIONS":
            origin = request.headers.get("origin", "").strip()
            requested_method = request.headers.get("access-control-request-method")
            requested_headers = request.headers.get("access-control-request-headers")
            
            log_cors_debug("Preflight Details", {
                "Origin Allowed": origin in allowed_origins,
                "Requested Method": requested_method,
                "Requested Headers": requested_headers,
                "Allowed Headers": ", ".join(allowed_headers)
            })

            if origin in allowed_origins:
                headers = {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                    "Access-Control-Allow-Headers": ", ".join(allowed_headers),
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "3600",
                    "Vary": "Origin"
                }
                
                log_cors_debug("Preflight Response", {
                    "Status": "204 No Content",
                    "Headers": json.dumps(headers, indent=2)
                })
                return Response(status_code=204, headers=headers)
            
            log_cors_debug("Preflight Rejected", {
                "Reason": "Origin not allowed",
                "Requested Origin": origin,
                "Allowed Origins": allowed_origins
            })
            return Response(status_code=204)
        
        # Handle actual request
        response = await call_next(request)
        
        # Add CORS headers to all responses
        origin = request.headers.get("origin", "").strip()
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Headers"] = ", ".join(allowed_headers)
            response.headers["Vary"] = "Origin"
        
        # Log response details
        log_cors_debug("Response", {
            "Status": response.status_code,
            "Headers": json.dumps(dict(response.headers), indent=2)
        })
        
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