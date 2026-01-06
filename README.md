#  Virtual Herbal Garden

Virtual Herbal Garden is a full-stack 3-tier web application that helps users explore medicinal plants, identify plants from images, and learn about herbal uses with the help of AI.  
The project uses **React (Vite)** on the frontend and **FastAPI microservices** on the backend, with AI integrations for plant identification and herbal guidance.

https://virtual-herbal-garden-r1uw.onrender.com/
---

##  Architecture
<img width="1536" height="1024" alt="3 tier Virtual Herbal Garden" src="https://github.com/user-attachments/assets/aa096439-512b-41a1-8fd8-e249cccea59c" />


##  Features

###  Plant Explorer
- Browse a curated list of medicinal plants
- Search plants by name
- View plant details (description, uses, scientific name)
- Bookmark favorite plants (authenticated users)

###  Plant Identification (AI)
- Upload an image of a plant
- Plant identified using **PlantNet API**
- AI (Groq LLM) generates:
  - Plant description
  - Common usage
  - Safety & precautions

### AI Herbal Assistant
- Chat with an AI assistant
- Ask about:
  - Herbal remedies
  - Medicinal uses
  - Allergies & precautions
- Powered by **Groq LLM (LLaMA 3.1)**

### Authentication
- User Registration
- Login / Logout
- Forgot Password (email reset code)
- Reset Password flow
- JWT-based authentication
- Gmail Setup using Gmail API 

---

##  Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS

### Backend
- FastAPI
- Python
- PostgreSQL - NeonDB

### AI & External APIs
- Groq API (AI chat & herbal descriptions)
- PlantNet API (Plant identification from images)
- SMTP GCloud Gmail

### Deployment
- Render (Frontend & Backend services)

## Common Issues & Resolutions

#### 1. Port Management: Local Development vs Production

  - **Cause:** In the localhost you have specify the port of the frontend and backend services during Local development where as in the production development it dynamically assigns the port
  - **Fix:** removed the ports in the env file and then re ran the application 

#### 2. Page Goes Blank on Refresh (Client-Side Routing Issue)

  - **Cause:** When refreshing pages like /plants, /identify, or /ai-assistant, the application showed a blank screen in production (Render).
  - **Fix:** Configured Render Static Site **Redirects** to forward all routes to index.html.

#### 3. AI API Errors Due to Deprecated Models

  - **Cause:** AI Chats were failing with errors like model_decommissioned
  - **Fix:** : tried different models of groq and succeeded in using llama-3.1-8b-instant.


