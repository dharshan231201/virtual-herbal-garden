#/server/ai_service/main.py
import os
import io
from fastapi import FastAPI, HTTPException, UploadFile, File, status
from PIL import Image
import google.generativeai as genai
from google.generativeai.types import HarmCategory,HarmBlockThreshold

# Shared imports
from common import schemas
from common.utils import setup_cors  # Import the utility

from pathlib import Path
from dotenv import load_dotenv
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"

# 2. Force Load
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Herbal Garden - AI Service")
setup_cors(app)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
genai.configure(api_key=api_key)


@app.get("/")
async def health_check():
    return {"status": "AI Service is running"}

# --- AI Chat Endpoint ---

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




@app.post("/ai/chat", response_model=schemas.ChatResponse)
async def chat_with_ai(chat_request: schemas.ChatRequest):
    try:
        # Use the lightweight flash model for speed
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        
        # System instruction to keep the AI focused
        context = (
            "You are a helpful assistant for a virtual herbal garden. "
            "Provide information about plants, their uses, and general herbal remedies based on traditional knowledge. "
            "Keep responses concise and informative."
        )
        
        full_prompt_for_ai = f"{context}\n\nUser query: {chat_request.message}"
        response = await model.generate_content_async(
            contents=[{"role": "user", "parts": [full_prompt_for_ai]}] # Pass the combined prompt here
            # Remove the system_instruction=... parameter as it's not recognized
        )
        ai_response = response.text
        return {"response": ai_response}
    except Exception as e:
        print(f"Gemini API error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI Chat error: {e}")

# --- Plant Identification Endpoint ---
@app.post("/ai/identify", response_model=schemas.PlantIdentificationResponse)
async def identify_plant(image: UploadFile = File(...)):
    # Validate file type
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        # Process image for Gemini
        image_bytes = await image.read()
        img = Image.open(io.BytesIO(image_bytes))

        model = genai.GenerativeModel('models/gemini-1.5-flash')
        
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
        ai_text = response.text

        plant_name = "Unknown Plant"
        description = "Could not identify the plant or its description."
        usage = "No usage information available."
        confidence = None

        for line in ai_text.split('\n'):
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
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to identify plant: {str(e)}")