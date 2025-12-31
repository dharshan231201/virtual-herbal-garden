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
setup_cors(app)

# =========================
# HEALTH
# =========================
@app.get("/")
async def health():
    return {"status": "AI Service running (Groq + PlantNet)"}

# =========================
# AI CHAT (Groq) ✅ FIXED
# =========================
@app.post("/ai/chat", response_model=schemas.ChatResponse)
async def chat_with_ai(chat_request: schemas.ChatRequest):
    try:
        payload = {
            "model": "llama-3.1-8b-instant",  # ✅ FREE + STABLE
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
            ],
            "temperature": 0.4
        }

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        res = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=20
        )

        if res.status_code != 200:
            print("Groq error:", res.text)
            raise HTTPException(
                status_code=500,
                detail="Groq API error. Check backend logs."
            )

        data = res.json()
        ai_text = data["choices"][0]["message"]["content"]

        return {"response": ai_text}

    except Exception as e:
        print("AI CHAT FAILED:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# PLANT IDENTIFICATION (PlantNet)
# =========================
@app.post("/ai/identify", response_model=schemas.PlantIdentificationResponse)
async def identify_plant(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # -------------------------------
        # 1️⃣ IDENTIFY via PlantNet
        # -------------------------------
        image_bytes = await image.read()

        files = {
            "images": ("plant.jpg", image_bytes, image.content_type)
        }
        data = {"organs": "leaf"}

        url = f"https://my-api.plantnet.org/v2/identify/all?api-key={PLANTNET_API_KEY}"
        res = requests.post(url, files=files, data=data, timeout=30)
        res.raise_for_status()

        result = res.json()
        results = result.get("results", [])

        if not results:
            return {
                "plant_name": "Unknown Plant",
                "description": "Could not identify the plant from the image.",
                "usage": "No usage information available.",
                "confidence": None
            }

        best = results[0]
        species = best.get("species", {})

        scientific_name = species.get("scientificName", "Unknown")
        common_names = species.get("commonNames") or []
        plant_name = common_names[0] if common_names else scientific_name
        confidence = round(best.get("score", 0) * 100, 2)

        # -------------------------------
        # 2️⃣ ENRICH via Groq (TEXT ONLY)
        # -------------------------------
        groq_prompt = f"""
Provide concise herbal information for the plant below.

Plant Name: {plant_name}
Scientific Name: {scientific_name}

Return in this format:
Description:
Usage:
Precautions:
"""

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a knowledgeable herbal medicine assistant."
                },
                {
                    "role": "user",
                    "content": groq_prompt
                }
            ],
            "temperature": 0.3
        }

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        groq_res = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=20
        )

        groq_res.raise_for_status()
        ai_text = groq_res.json()["choices"][0]["message"]["content"]

        # -------------------------------
        # 3️⃣ PARSE AI RESPONSE
        # -------------------------------
        description = ""
        usage = ""
        precautions = ""

        for line in ai_text.splitlines():
            if line.lower().startswith("description"):
                description = line.split(":", 1)[1].strip()
            elif line.lower().startswith("usage"):
                usage = line.split(":", 1)[1].strip()
            elif line.lower().startswith("precautions"):
                precautions = line.split(":", 1)[1].strip()

        return {
            "plant_name": plant_name,
            "description": description or f"Scientific name: {scientific_name}",
            "usage": usage or "No usage information available.",
            "confidence": confidence
        }

    except Exception as e:
        print("IDENTIFY ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))