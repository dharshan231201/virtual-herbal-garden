'''# server/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os # Import os to use environment variables
#from dotenv import load_dotenv

#load_dotenv()
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")

DATABASE_URL = (f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}")

# Create the SQLAlchemy engine
engine = create_engine(
    DATABASE_URL, pool_pre_ping=True
)

# Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

'''

# server/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError, DisconnectionError, InterfaceError
import os # Import os to use environment variables
#from dotenv import load_dotenv # REMOVE or COMMENT THIS LINE WHEN RUNNING WITH DOCKER COMPOSE

#load_dotenv() # REMOVE or COMMENT THIS LINE WHEN RUNNING WITH DOCKER COMPOSE

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")

# --- IMPORTANT: Add a validation check for all variables ---
if not all([POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT]):
    missing_vars = [name for name, value in {
        "POSTGRES_USER": POSTGRES_USER,
        "POSTGRES_PASSWORD": POSTGRES_PASSWORD,
        "POSTGRES_DB": POSTGRES_DB,
        "POSTGRES_HOST": POSTGRES_HOST,
        "POSTGRES_PORT": POSTGRES_PORT
    }.items() if value is None]
    raise RuntimeError(f"Missing one or more PostgreSQL environment variables: {', '.join(missing_vars)}")

DATABASE_URL = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
)
print(f"Database URL constructed: {DATABASE_URL}") # Add this print for debugging confirmation

print("hello")
# Create the SQLAlchemy engine
engine = create_engine(
    DATABASE_URL, pool_pre_ping=True
)

# Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get a database session
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

def get_db():
    db = None
    try:
        db = SessionLocal() # Attempt to get a session
        # Perform a quick connection test immediately
        db.execute(text("SELECT 1")) # This will raise if the connection fails
        yield db
    except (OperationalError, DisconnectionError, InterfaceError) as e:
        # Catch common SQLAlchemy database connection/operational errors
        print(f"Database connection error: {e}") # Log the error
        raise e # Re-raise the exception so FastAPI's dependency injection sees it
    except Exception as e:
        # Catch any other unexpected errors during session creation/test
        print(f"An unexpected error occurred in get_db: {e}")
        raise e
    finally:
        if db:
            db.close() # Ensure the session is closed