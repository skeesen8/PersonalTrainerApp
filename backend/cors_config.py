from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import Response
from typing import List
import secrets

def generate_nonce() -> str:
    return secrets.token_urlsafe(32)

def setup_cors(app: FastAPI, allowed_origins: List[str]) -> None:
    """
    Configure CORS and CSP for the FastAPI application
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

    @app.middleware("http")
    async def add_security_headers(request: Request, call_next) -> Response:
        # Generate a nonce for this request
        nonce = generate_nonce()
        
        response = await call_next(request)
        
        # Define CSP directives
        csp_directives = [
            "default-src 'self'",
            f"script-src 'self' 'nonce-{nonce}' https://personal-trainer-app-topaz.vercel.app",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
        ]
        
        # Add security headers
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Nonce"] = nonce
        
        return response

    # Add CORS headers to all responses
    @app.middleware("http")
    async def add_cors_headers(request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response 