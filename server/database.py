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
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
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
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()