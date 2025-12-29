from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    origins = [
        "http://localhost:2001",
        "http://127.0.0.1:2001",
        "http://192.168.10.13:2001",
        "https://virtual-herbal-garden-r1uw.onrender.com:2001"

    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"]
    )