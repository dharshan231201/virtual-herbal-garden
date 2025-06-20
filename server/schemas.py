# server/schemas.py
import datetime
from datetime import datetime
from pydantic import BaseModel, HttpUrl
from typing import Optional, List # Import List for array type

class UserBase(BaseModel):
    #google_id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    google_id: str # This is crucial for linking with Firebase Auth

class User(UserBase):
    google_id: str # Include google_id when reading
    # You might add user_id or other database-specific fields here later if needed

    class Config:
        from_attributes = True # This replaces orm_mode = True in newer Pydantic versions


class PlantBase(BaseModel):
    common_name: str
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    uses: Optional[List[str]] = None # Use List for PostgreSQL TEXT[]
    region: Optional[str] = None
    plant_type: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    three_d_model_url: Optional[HttpUrl] = None # Still included as per your SQL schema

class PlantCreate(PlantBase):
    pass

class Plant(PlantBase):
    plant_id: int # Primary key is plant_id

    class Config:
        from_attributes = True # Allows Pydantic to read from attributes (e.g., from query results)

class BookmarkCreate(BaseModel):
    user_google_id: str
    plant_id: int

class Bookmark(BookmarkCreate):
    bookmark_id: int
    bookmarked_at: datetime # Will be datetime, but simpler as string for now

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

class PlantIdentificationResponse(BaseModel):
    plant_name: str
    description: str
    usage: str
    confidence: Optional[float] = None 