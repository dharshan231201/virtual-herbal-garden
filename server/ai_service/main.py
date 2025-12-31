# /server/ai_service/main.py
import os
import requests
from fastapi import FastAPI, HTTPException, UploadFile, File
from dotenv import load_dotenv

from common import schemas
from common.utils import setup_cors

load_dotenv()

app = FastAPI(title="Herbal Garden - AI Service")
setup_cors(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PLANTNET_API_KEY = os.getenv("PLANTNET_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY missing")
if not PLANTNET_API_KEY:
    raise RuntimeError("PLANTNET_API_KEY missing")


@app.get("/")
async def health():
    return {"status": "AI Service running (Groq + PlantNet)"}


# =====================
# AI CHAT (Groq)
# =====================
@app.post("/ai/chat", response_model=schemas.ChatResponse)
async def chat_with_ai(chat_request: schemas.ChatRequest):
    try:
        res = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama3-70b-8192",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a herbal expert assistant.",
                    },
                    {"role": "user", "content": chat_request.message},
                ],
            },
            timeout=20,
        )
        res.raise_for_status()
        text = res.json()["choices"][0]["message"]["content"]
        return {"response": text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =====================
# PLANT IDENTIFY (PlantNet)
# =====================
@app.post("/ai/identify", response_model=schemas.PlantIdentificationResponse)
async def identify_plant(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image")

    try:
        img = await image.read()

        res = requests.post(
            f"https://my-api.plantnet.org/v2/identify/all?api-key={PLANTNET_API_KEY}",
            files={"images": ("plant.jpg", img, image.content_type)},
            data={"organs": ["leaf"]},
            timeout=30,
        )
        res.raise_for_status()
        data = res.json()

        if not data.get("results"):
            return {
                "plant_name": "Unknown Plant",
                "description": "Could not identify the plant.",
                "usage": "No usage information available.",
                "confidence": None,
            }

        best = data["results"][0]
        species = best["species"]

        return {
            "plant_name": species.get("commonNames", ["Unknown"])[0],
            "description": f"Scientific name: {species.get('scientificName')}",
            "usage": "Ask the AI assistant for medicinal uses.",
            "confidence": round(best["score"] * 100, 2),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
