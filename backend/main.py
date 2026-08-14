from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import init_db, get_db_connection
from auth import hash_password, verify_password, create_access_token, decode_access_token
import sqlite3

app = FastAPI(title="AI Studio SaaS Auth API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

# Request Models
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "AI Studio Auth API"}

@app.post("/api/auth/register", response_model=TokenResponse)
def register_user(user_data: UserRegister):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (user_data.email.lower(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    hashed = hash_password(user_data.password)
    try:
        cursor.execute(
            "INSERT INTO users (email, full_name, hashed_password, plan, credits) VALUES (?, ?, ?, 'Pro', 250)",
            (user_data.email.lower(), user_data.full_name, hashed)
        )
        conn.commit()
        user_id = cursor.lastrowid
    except sqlite3.Error as e:
        conn.close()
        raise HTTPException(status_code=500, detail="Database insertion failed")
    
    cursor.execute("SELECT id, email, full_name, plan, credits, created_at FROM users WHERE id = ?", (user_id,))
    user = dict(cursor.fetchone())
    conn.close()
    
    token = create_access_token({"sub": user["email"], "user_id": user["id"]})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(user_data: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (user_data.email.lower(),))
    row = cursor.fetchone()
    conn.close()
    
    if not row or not verify_password(user_data.password, row["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = {
        "id": row["id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "plan": row["plan"],
        "credits": row["credits"],
        "created_at": row["created_at"]
    }
    
    token = create_access_token({"sub": user["email"], "user_id": user["id"]})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/api/auth/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    email = payload.get("sub")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name, plan, credits, created_at FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
        
    return dict(row)
