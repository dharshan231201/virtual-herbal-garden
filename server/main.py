# server/main.py
from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import os
from dotenv import load_dotenv

from .database import get_db, engine
from . import schemas

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from fastapi import UploadFile, File
from PIL import Image
import io

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# --- CORS Configuration ---
origins = [
    "http://localhost",
    "http://localhost:2001",
    "http://127.0.0.1:2001",
    "http://3.83.150.152:2001", #public IP
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- End CORS Configuration ---



@app.get("/health")
async def health_check():
    db_status = {"database": "unreachable"} # Default status if something goes wrong

    try:
        # Attempt to get a database session
        with get_db() as db: # This uses the dependency to get a session
            # Execute a simple query to test the connection
            # The 'text("SELECT 1")' is a common, lightweight way to test connectivity
            db.execute(text("SELECT 1"))
            db_status = {"database": "connected"}
    except Exception as e:
        # If any exception occurs during DB connection or query, mark it as failed
        db_status = {"database": "failed", "error": str(e)}
        # You might raise an HTTPException here if you want the health check itself to return a 500
        # raise HTTPException(status_code=500, detail="Database connection failed")

    # Return a comprehensive status
    return {
        "status": "ok" if db_status["database"] == "connected" else "degraded",
        "message": "Backend is healthy" if db_status["database"] == "connected" else "Backend health degraded",
        "dependencies": {
            "database": db_status
        }
    }



@app.get("/")
async def read_root():
    return {"message": "Welcome to the Virtual Herbal Garden API!"}


## User Endpoints

@app.post("/users/sync", response_model=schemas.User)
def sync_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user_query = text("SELECT google_id, email, first_name, last_name FROM users WHERE google_id = :google_id;")
    existing_user = db.execute(existing_user_query, {"google_id": user_data.google_id}).first()

    if existing_user:
        # User exists, update only necessary fields (email, first_name, last_name)
        update_query = text("""
            UPDATE users
            SET email = :email, first_name = :first_name, last_name = :last_name
            WHERE google_id = :google_id
            RETURNING google_id, email, first_name, last_name;
        """)
        try:
            result = db.execute(update_query, {
                "google_id": user_data.google_id,
                "email": user_data.email,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name
            }).first()
            db.commit()
            return schemas.User(**result._asdict())
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error updating user: {e}")
    else:
        # User does not exist, create new user
        insert_query = text("""
            INSERT INTO users (google_id, email, first_name, last_name)
            VALUES (:google_id, :email, :first_name, :last_name)
            RETURNING google_id, email, first_name, last_name;
        """)
        try:
            result = db.execute(insert_query, {
                "google_id": user_data.google_id,
                "email": user_data.email,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name
            }).first()
            db.commit()
            if result:
                return schemas.User(**result._asdict())
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User could not be created")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error creating user: {e}")

@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = text("SELECT google_id, email, first_name, last_name FROM users OFFSET :skip LIMIT :limit;")
    result = db.execute(query, {"skip": skip, "limit": limit}).fetchall()
    return [schemas.User(**row._asdict()) for row in result]

@app.get("/users/{google_id}", response_model=schemas.User)
def read_user(google_id: str, db: Session = Depends(get_db)):
    query = text("SELECT google_id, email, first_name, last_name FROM users WHERE google_id = :google_id;")
    result = db.execute(query, {"google_id": google_id}).first()
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return schemas.User(**result._asdict())


## Plant Endpoints

@app.post("/plants/", response_model=schemas.Plant)
def create_plant(plant: schemas.PlantCreate, db: Session = Depends(get_db)):
    # 1. Validate common_name uniqueness
    existing_plant_by_common_name = db.execute(
        text("SELECT common_name FROM plants WHERE common_name = :common_name"),
        {"common_name": plant.common_name}
    ).first()

    if existing_plant_by_common_name:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, # Conflict
            detail=f"Plant with common name '{plant.common_name}' already exists."
        )

    # 2. Validate scientific_name uniqueness (if provided)
    if plant.scientific_name:
        existing_plant_by_scientific_name = db.execute(
            text("SELECT scientific_name FROM plants WHERE scientific_name = :scientific_name"),
            {"scientific_name": plant.scientific_name}
        ).first()

        if existing_plant_by_scientific_name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, # Conflict
                detail=f"Plant with scientific name '{plant.scientific_name}' already exists."
            )

    # If validations pass, proceed with insertion
    query = text("""
        INSERT INTO plants (common_name, scientific_name, description, uses, region, plant_type, image_url, three_d_model_url)
        VALUES (:common_name, :scientific_name, :description, :uses, :region, :plant_type, :image_url, :three_d_model_url)
        RETURNING plant_id, common_name, scientific_name, description, uses, region, plant_type, image_url, three_d_model_url;
    """)
    try:
        result = db.execute(query, {
            "common_name": plant.common_name,
            "scientific_name": plant.scientific_name,
            "description": plant.description,
            "uses": plant.uses, # SQLAlchemy/PostgreSQL handles List[str] directly to TEXT[]
            "region": plant.region,
            "plant_type": plant.plant_type,
            "image_url": str(plant.image_url) if plant.image_url else None, # Convert HttpUrl to string
            "three_d_model_url": str(plant.three_d_model_url) if plant.three_d_model_url else None
        }).first()
        db.commit()
        if result:
            plant_data = result._asdict() # Convert the SQLAlchemy Row object to a dictionary for Pydantic
            return schemas.Plant(**plant_data) # Use the correct Pydantic model
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Plant could not be created")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {e}")

@app.get("/plants/", response_model=list[schemas.Plant])
def get_all_plants(
    # This now only takes one search_query parameter
    search_query: Optional[str] = Query(None, alias="q", description="Search by common name, scientific name, description, or uses"),
    skip: int = 0, # Pagination: number of records to skip
    limit: int = 100, # Pagination: maximum number of records to return
    db: Session = Depends(get_db)
):
    query_str = "SELECT plant_id, common_name, scientific_name, description, image_url, uses, region, plant_type, three_d_model_url FROM plants WHERE 1=1"
    params = {}

    if search_query:
        # This is the crucial change: The single search_query now checks against
        # common_name, scientific_name, description, AND uses.
        # ARRAY_TO_STRING(uses, ' ') converts the PostgreSQL TEXT[] array into a
        # space-separated string (e.g., "{Medicinal, Culinary}" becomes "Medicinal Culinary")
        # allowing ILIKE to perform a fuzzy search within it.
        query_str += """
            AND (
                common_name ILIKE :search OR
                scientific_name ILIKE :search OR
                description ILIKE :search OR
                ARRAY_TO_STRING(uses, ' ') ILIKE :search
            )
        """
        # The same search parameter applies to all fields for a unified search bar
        params["search"] = f"%{search_query}%"

    # Add pagination (OFFSET and LIMIT)
    query_str += " OFFSET :skip LIMIT :limit;"
    params["skip"] = skip
    params["limit"] = limit

    final_query = text(query_str)
    result = db.execute(final_query, params).fetchall()

    if not result:
        return []

    # Map results to Pydantic schemas. 'uses' is already a List[str] from PostgreSQL.
    parsed_plants = []
    for row in result:
        plant_dict = row._asdict()
        parsed_plants.append(schemas.Plant(**plant_dict))

    return parsed_plants

@app.get("/plants/{plant_id}", response_model=schemas.Plant)
def read_plant(plant_id: int, db: Session = Depends(get_db)):
    query = text("SELECT plant_id, common_name, scientific_name, description, uses, region, plant_type, image_url, three_d_model_url FROM plants WHERE plant_id = :plant_id;")
    result = db.execute(query, {"plant_id": plant_id}).first()
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    return schemas.Plant(**result._asdict())


## Bookmark Endpoints

@app.post("/bookmarks/", response_model=schemas.Bookmark)
def create_bookmark(bookmark: schemas.BookmarkCreate, db: Session = Depends(get_db)):
    # 1. Validate user_google_id existence
    user_exists_query = text("SELECT 1 FROM users WHERE google_id = :google_id;")
    user_exists = db.execute(user_exists_query, {"google_id": bookmark.user_google_id}).first()
    if not user_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # 2. Validate plant_id existence
    plant_exists_query = text("SELECT 1 FROM plants WHERE plant_id = :plant_id;")
    plant_exists = db.execute(plant_exists_query, {"plant_id": bookmark.plant_id}).first()
    if not plant_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found.")

    # 3. Check for existing bookmark (to prevent duplicates)
    existing_bookmark_query = text("SELECT bookmark_id FROM bookmarks WHERE user_google_id = :user_google_id AND plant_id = :plant_id;")
    existing_bookmark = db.execute(existing_bookmark_query, {
        "user_google_id": bookmark.user_google_id,
        "plant_id": bookmark.plant_id
    }).first()
    if existing_bookmark:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This plant is already bookmarked by this user.")

    # Proceed with insertion if all validations pass
    insert_query = text("""
        INSERT INTO bookmarks (user_google_id, plant_id)
        VALUES (:user_google_id, :plant_id)
        RETURNING bookmark_id, user_google_id, plant_id, bookmarked_at;
    """)
    try:
        result = db.execute(insert_query, {
            "user_google_id": bookmark.user_google_id,
            "plant_id": bookmark.plant_id
        }).first()
        db.commit()
        if result:
            return schemas.Bookmark(**result._asdict())
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Bookmark could not be created.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error creating bookmark: {e}")

@app.get("/bookmarks/", response_model=list[schemas.Bookmark])
def read_bookmarks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = text("SELECT bookmark_id, user_google_id, plant_id, bookmarked_at FROM bookmarks OFFSET :skip LIMIT :limit;")
    result = db.execute(query, {"skip": skip, "limit": limit}).fetchall()
    return [schemas.Bookmark(**row._asdict()) for row in result]

@app.get("/bookmarks/user/{user_google_id}", response_model=list[schemas.Bookmark])
def read_user_bookmarks(user_google_id: str, db: Session = Depends(get_db)):
    query = text("SELECT bookmark_id, user_google_id, plant_id, bookmarked_at FROM bookmarks WHERE user_google_id = :user_google_id;")
    result = db.execute(query, {"user_google_id": user_google_id}).fetchall()
    if not result:
        return []
    return [schemas.Bookmark(**row._asdict()) for row in result]

@app.delete("/bookmarks/{user_google_id}/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookmark(user_google_id: str, plant_id: int, db: Session = Depends(get_db)):
    query = text("DELETE FROM bookmarks WHERE user_google_id = :user_google_id AND plant_id = :plant_id RETURNING bookmark_id;")
    result = db.execute(query, {"user_google_id": user_google_id, "plant_id": plant_id}).first()
    db.commit()
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found for this user and plant")
    return # No content returned for 204 status code

## AI Chat Endpoint
@app.get("/list_gemini_models/")
async def list_gemini_models():
    available_models = []
    try:
        for m in genai.list_models():
            # Filter for models that support text generation using generateContent
            if 'generateContent' in m.supported_generation_methods:
                available_models.append({
                    "name": m.name,
                    "supported_methods": m.supported_generation_methods
                })
        return {"available_gemini_models": available_models}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error listing models: {e}")


# CORRECTED: Changed endpoint path from "/chat/" to "/ai/chat" to match frontend
@app.post("/ai/chat", response_model=schemas.ChatResponse)
async def chat_with_ai(chat_request: schemas.ChatRequest):
    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash') # Keep using this model or one you verified

        # Define the system instruction
        system_instruction_content = (
            "You are a helpful assistant for a virtual herbal garden. "
            "Provide information about plants, their uses, and general herbal remedies based on traditional knowledge. "
            "Keep responses concise and informative."
        )

        # Combine the system instruction with the user's actual message
        # The model will read this as one complete user input that sets context.
        full_prompt_for_ai = f"{system_instruction_content}\n\nUser query: {chat_request.message}"

        response = await model.generate_content_async(
            contents=[{"role": "user", "parts": [full_prompt_for_ai]}] # Pass the combined prompt here
            # Remove the system_instruction=... parameter as it's not recognized
        )
        ai_response = response.text
        return {"response": ai_response}
    except Exception as e:
        print(f"Gemini API error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI Chat error: {e}")

# google lens
@app.post("/identify-plant/", response_model=schemas.PlantIdentificationResponse)
async def identify_plant(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

    try:
        # Read image content as bytes
        image_bytes = await image.read()

        # Load image using PIL (Pillow)
        img = Image.open(io.BytesIO(image_bytes))

        # Initialize the multimodal Gemini model
        model = genai.GenerativeModel('models/gemini-1.5-flash')

        # Define the prompt for the AI.
        prompt = [
            "Analyze this image and identify the plant. "
            "Then, provide a brief description of the plant and its common traditional/medicinal usages. "
            "Format your response strictly as follows: "
            "Plant Name: [Name]\nDescription: [Description]\nUsage: [Usage]\n"
            "If you cannot identify it, state 'Unknown Plant'.",
            img
        ]

        response = await model.generate_content_async(
            prompt,
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
        )

        ai_response_text = response.text

        plant_name = "Unknown Plant"
        description = "Could not identify the plant or its description."
        usage = "No usage information available."
        confidence = None

        for line in ai_response_text.split('\n'):
            if line.startswith("Plant Name:"):
                plant_name = line.replace("Plant Name:", "").strip()
            elif line.startswith("Description:"):
                description = line.replace("Description:", "").strip()
            elif line.startswith("Usage:"):
                usage = line.replace("Usage:", "").strip()

        if "unknown plant" in plant_name.lower():
            description = "The AI could not identify this plant from the image."
            usage = "No specific usage information available."

        return schemas.PlantIdentificationResponse(
            plant_name=plant_name,
            description=description,
            usage=usage,
            confidence=confidence
        )

    except Exception as e:
        print(f"Error in plant identification: {e}")
        # Explicitly convert the exception to a string for the detail message
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to identify plant: {str(e)}") #
