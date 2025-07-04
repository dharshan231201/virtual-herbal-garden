# server/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os # Import os to use environment variables

# Use environment variables for sensitive data like database credentials
# It's highly recommended to use a .env file and load it, but for simplicity
# we'll use direct strings for now. In production, ALWAYS use environment variables.
# Example: DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@host:port/database")

# Replace with your actual PostgreSQL connection details
# Format: "postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
# Ensure these match the user and database you created.
DATABASE_URL = "postgresql://dharshan:dharshan@plants-aws-instance.c6biiy4ksjl9.us-east-1.rds.amazonaws.com:5432/PlantAWS"
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
