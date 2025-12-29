import os
import uuid
import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from passlib.context import CryptContext
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from dotenv import load_dotenv
from jose import jwt

# Absolute imports from your monorepo structure
from common.database import get_db
from common import schemas
from common.utils import setup_cors

# Load environment variables
load_dotenv()

app = FastAPI(title="Herbal Garden - Auth Service")
setup_cors(app)

# SECURITY CONFIG
SECRET_KEY = "finiteloop_secure_secret"  # Must match SECRET_KEY in other services
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
BASE_URL = os.getenv("BASE_URL", "http://localhost:2001")

# Mail Configuration
mail_conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

# --- Helpers ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# --- Endpoints ---

@app.get("/")
async def health_check():
    return {"status": "Auth Service is running"}

@app.post("/auth/google-sync")
async def google_sync(user_data: dict, db: Session = Depends(get_db)):
    """Syncs Google User with Postgres using email as primary key"""
    # Look up using existing columns: email, first_name, last_name
    user = db.execute(
        text("SELECT email, first_name, last_name FROM public.users WHERE email = :email"), 
        {"email": user_data['email']}
    ).mappings().first()
    
    if not user:
        # Insert using your specific columns (no 'id' or 'username')
        user = db.execute(text("""
            INSERT INTO public.users (email, first_name, hashed_password) 
            VALUES (:email, :fn, 'GOOGLE_USER') 
            RETURNING email, first_name, last_name
        """), {
            "email": user_data['email'], 
            "fn": user_data.get('first_name', '')
        }).mappings().first()
        db.commit()

    # We map 'id' to 'email' in the response so the frontend stays consistent
    token = create_access_token(data={"sub": user['email'], "id": user['email']})
    return {
        "access_token": token,
        "user": {
            "id": user['email'], 
            "email": user['email'], 
            "first_name": user['first_name']
        }
    }

@app.post("/auth/register")
async def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Manual User Registration using hashed_password column"""
    existing = db.execute(text("SELECT 1 FROM public.users WHERE email = :e"), {"e": user_data.email}).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    hashed = hash_password(user_data.password)
    result = db.execute(text("""
        INSERT INTO public.users (email, hashed_password, first_name, last_name)
        VALUES (:email, :password, :fn, :ln) 
        RETURNING email, first_name, last_name
    """), {
        "email": user_data.email, 
        "password": hashed,
        "fn": user_data.first_name, 
        "ln": user_data.last_name
    }).mappings().first()
    db.commit()



    login_link = f"{BASE_URL}/login"
    email_content = f"""
    <h3>Thans for creating an account</h3>
    <p>Your username is : <strong>{user_data.email}</strong></p>
    <p><a href="{login_link}">Click here to reset your password</a></p>
    """

    message = MessageSchema(subject="Herbal Garden - Account created", recipients=[user_data.email], body=email_content, subtype=MessageType.html)
    fm = FastMail(mail_conf)
    await fm.send_message(message)

    return {
        "id": result['email'], 
        "email": result['email'], 
        "first_name": result['first_name']
    }


@app.post("/auth/login")
def login(data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Manual Login and JWT Generation using email and hashed_password"""
    # Fetch user data using mapped names
    user = db.execute(
        text("SELECT email, first_name, hashed_password FROM public.users WHERE email = :email"), 
        {"email": data.email}
    ).mappings().first()
    
    if not user or not user['hashed_password'] or not verify_password(data.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Store email in the 'id' field of the token and response
    token = create_access_token(data={"sub": user['email'], "id": user['email']})
    return {
        "access_token": token, 
        "user": {
            "id": user['email'], 
            "email": user['email'], 
            "first_name": user['first_name']
        }
    }

@app.post("/auth/forgot-password")
async def forgot_password(data: schemas.ResetCodeCreate, db: Session = Depends(get_db)):
    """Generates a UUID reset code and emails it"""
    user = db.execute(text("SELECT email FROM public.users WHERE email = :email"), {"email": data.email}).first()
    if not user:
        return {"message": "If an account exists, an email has been sent."}

    reset_id = str(uuid.uuid4())
    # Note: Column names match: id, email, resetId, status, created_at, expired_in
    db.execute(text("""
        INSERT INTO public.resetcode (email, "resetId", status, created_at, expired_in)
        VALUES (:email, :rid, 'pending', NOW(), INTERVAL '1 hour')
    """), {"email": data.email, "rid": reset_id})
    db.commit()

    reset_link = f"{BASE_URL}/reset-password?code={reset_id}"
    email_content = f"""
    <h3>Password Reset Request</h3>
    <p>Your reset code is: <strong>{reset_id}</strong></p>
    <p><a href="{reset_link}">Click here to reset your password</a></p>
    """

    message = MessageSchema(subject="Herbal Garden - Password Reset", recipients=[data.email], body=email_content, subtype=MessageType.html)
    fm = FastMail(mail_conf)
    await fm.send_message(message)
    return {"message": "Reset email sent"}

@app.post("/auth/reset-password")
async def reset_password(data: schemas.ResetCodeVerify, db: Session = Depends(get_db)):
    """Verifies the reset code and updates hashed_password"""
    # Use mappings() to safely access 'email' and 'id'
    record = db.execute(text("""
        SELECT id, email FROM public.resetcode WHERE email = :email AND "resetId" = :rid 
        AND status = 'pending' AND (created_at + expired_in) > NOW()
    """), {"email": data.email, "rid": data.resetId}).mappings().first()
    
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    
    new_hashed = hash_password(data.new_password)
    db.execute(text("UPDATE public.users SET hashed_password = :p WHERE email = :e"), 
               {"p": new_hashed, "e": data.email})
    
    # Update status of the reset code
    db.execute(text("UPDATE public." \
    "" \
    "" \
    "" \
    "" \
    "" \
    "resetcode SET status = 'used' WHERE id = :id"), {"id": record['id']})
    db.commit()
    
    return {"message": "Password updated successfully"}