# /server/ai_service/main.py
import os
import requests
from fastapi import FastAPI, HTTPException, UploadFile, File
from dotenv import load_dotenv

from common import schemas
from common.utils import setup_cors

# =========================
# ENV
# =========================
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PLANTNET_API_KEY = os.getenv("PLANTNET_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY missing")

if not PLANTNET_API_KEY:
    raise RuntimeError("PLANTNET_API_KEY missing")

# =========================
# APP
# =========================
app = FastAPI(title="Herbal Garden - AI Service")
setup_cors(app)   # ✅ IMPORTANT for frontend

# =========================
# HEALTH
# =========================
@app.get("/")
async def health():
    return {"status": "AI Service running (Groq + PlantNet)"}

# =========================
# AI CHAT (Groq)
# =========================
@app.post("/ai/chat", response_model=schemas.ChatResponse)
async def chat_with_ai(chat_request: schemas.ChatRequest):
    try:
        payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a herbal expert assistant. "
                        "Explain plants, medicinal uses, safety, allergies, "
                        "and traditional remedies clearly and concisely."
                    )
                },
                {
                    "role": "user",
                    "content": chat_request.message
                }
            ]
        }

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=20
        )

        response.raise_for_status()

        ai_text = response.json()["choices"][0]["message"]["content"]
        return {"response": ai_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat failed: {str(e)}")

# =========================
# PLANT IDENTIFICATION (PlantNet)
# =========================
@app.post("/ai/identify", response_model=schemas.PlantIdentificationResponse)
async def identify_plant(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        image_bytes = await image.read()

        files = {
            "images": ("plant.jpg", image_bytes, image.content_type)
        }

        data = {
            "organs": "leaf"
        }

        url = f"https://my-api.plantnet.org/v2/identify/all?api-key={PLANTNET_API_KEY}"

        res = requests.post(url, files=files, data=data, timeout=30)
        res.raise_for_status()

        result = res.json()
        results = result.get("results", [])

        # ✅ SAFE fallback
        if not results:
            return {
                "plant_name": "Unknown Plant",
                "description": "Could not confidently identify the plant.",
                "usage": "Ask the AI Assistant for more details.",
                "confidence": None
            }

        best = results[0]
        species = best.get("species", {})

        common_names = species.get("commonNames") or []
        scientific_name = species.get("scientificName", "Unknown")

        plant_name = (
            common_names[0]
            if isinstance(common_names, list) and len(common_names) > 0
            else scientific_name
        )

        confidence = round(best.get("score", 0) * 100, 2)

        return {
            "plant_name": plant_name,
            "description": f"Scientific name: {scientific_name}",
            "usage": "Use the AI Assistant to explore medicinal uses and precautions.",
            "confidence": confidence
        }

    except Exception as e:
        print("Plant identification error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
