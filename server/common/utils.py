import os
from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    cors_origins = os.getenv("CORS_ORIGINS", "")

    origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]


    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"]
    )