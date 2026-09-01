from fastapi import FastAPI, HTTPException, Depends, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from database import init_db, get_db_connection
from auth import hash_password, verify_password, create_access_token, decode_access_token
import sqlite3
import json

app = FastAPI(title="PrepNest API & Aptitude Practice Module")

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

# -------------------------------------------------------------
# Auth Request Models
# -------------------------------------------------------------
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

# -------------------------------------------------------------
# Aptitude Request & Response Models
# -------------------------------------------------------------
class AnswerItem(BaseModel):
    question_id: int
    selected_option: Optional[str] = None # 'A', 'B', 'C', 'D' or None

class SubmitTestRequest(BaseModel):
    user_id: Optional[int] = 1
    category: str = "all" # 'quantitative', 'logical', 'verbal', 'mock'
    time_taken_seconds: int = 0
    answers: List[AnswerItem]

# -------------------------------------------------------------
# General Endpoints
# -------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "PrepNest Platform API"}

# -------------------------------------------------------------
# Auth Endpoints
# -------------------------------------------------------------
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
    except sqlite3.Error:
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

# -------------------------------------------------------------
# Aptitude Practice Module Endpoints
# -------------------------------------------------------------
@app.get("/api/aptitude/categories")
def get_aptitude_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    categories = [
        {
            "id": "quantitative",
            "name": "Quantitative Aptitude",
            "code": "QA",
            "description": "Master numerical analysis, arithmetic, algebra, probability, and speed math for campus recruitment exams.",
            "color": "indigo",
            "badge": "Numerical & Math"
        },
        {
            "id": "logical",
            "name": "Logical Reasoning",
            "code": "LR",
            "description": "Sharpen analytical thinking, syllogisms, blood relations, pattern recognition, and puzzle solving.",
            "color": "purple",
            "badge": "Analytical Logic"
        },
        {
            "id": "verbal",
            "name": "Verbal Ability",
            "code": "VA",
            "description": "Excel in reading comprehension, grammar correction, para-jumbles, vocabulary, and verbal analogies.",
            "color": "pink",
            "badge": "Grammar & Vocab"
        }
    ]
    
    for cat in categories:
        cursor.execute("SELECT COUNT(*) as cnt FROM aptitude_questions WHERE category = ?", (cat["id"],))
        cat["total_questions"] = cursor.fetchone()["cnt"]
        
        cursor.execute("SELECT DISTINCT subtopic FROM aptitude_questions WHERE category = ?", (cat["id"],))
        cat["subtopics"] = [row["subtopic"] for row in cursor.fetchall()]
        
        cursor.execute("""
            SELECT COUNT(*) as test_count, AVG(score_percentage) as avg_score 
            FROM aptitude_test_results 
            WHERE category = ?
        """, (cat["id"],))
        stats = cursor.fetchone()
        cat["tests_completed"] = stats["test_count"] or 0
        cat["avg_score"] = round(stats["avg_score"], 1) if stats["avg_score"] is not None else 0.0

    # Global Aptitude stats
    cursor.execute("SELECT COUNT(*) as total_tests, AVG(score_percentage) as overall_avg FROM aptitude_test_results")
    overall = cursor.fetchone()
    total_tests = overall["total_tests"] or 0
    overall_accuracy = round(overall["overall_avg"], 1) if overall["overall_avg"] is not None else 0.0
    
    conn.close()
    return {
        "categories": categories,
        "overall_stats": {
            "total_tests_completed": total_tests,
            "overall_accuracy": overall_accuracy,
            "placement_readiness_boost": min(100, int(overall_accuracy * 0.85) if total_tests > 0 else 75)
        }
    }

@app.get("/api/aptitude/questions")
def get_aptitude_questions(
    category: Optional[str] = "all",
    difficulty: Optional[str] = "all",
    subtopic: Optional[str] = None,
    limit: Optional[int] = 10
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT id, category, subtopic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation FROM aptitude_questions WHERE 1=1"
    params = []
    
    if category and category.lower() != "all":
        query += " AND category = ?"
        params.append(category.lower())
        
    if difficulty and difficulty.lower() != "all":
        query += " AND LOWER(difficulty) = ?"
        params.append(difficulty.lower())
        
    if subtopic:
        query += " AND subtopic = ?"
        params.append(subtopic)
        
    query += " ORDER BY RANDOM() LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    
    questions = []
    for r in rows:
        questions.append({
            "id": r["id"],
            "category": r["category"],
            "subtopic": r["subtopic"],
            "difficulty": r["difficulty"],
            "question_text": r["question_text"],
            "options": {
                "A": r["option_a"],
                "B": r["option_b"],
                "C": r["option_c"],
                "D": r["option_d"]
            },
            # Include correct_option and explanation for client verification / offline modes
            "correct_option": r["correct_option"],
            "explanation": r["explanation"]
        })
        
    return {
        "count": len(questions),
        "category": category,
        "questions": questions
    }

@app.post("/api/aptitude/submit")
def submit_aptitude_test(payload: SubmitTestRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if not payload.answers:
        conn.close()
        raise HTTPException(status_code=400, detail="No answers provided in test submission")
    
    question_ids = [a.question_id for a in payload.answers]
    placeholders = ",".join("?" for _ in question_ids)
    cursor.execute(f"SELECT * FROM aptitude_questions WHERE id IN ({placeholders})", tuple(question_ids))
    db_questions = {row["id"]: dict(row) for row in cursor.fetchall()}
    
    user_answer_map = {a.question_id: (a.selected_option.upper() if a.selected_option else None) for a in payload.answers}
    
    total_questions = len(payload.answers)
    correct_count = 0
    incorrect_count = 0
    unattempted_count = 0
    detailed_results = []
    
    category_scores = {}
    
    for ans in payload.answers:
        qid = ans.question_id
        selected = ans.selected_option.upper() if ans.selected_option else None
        q_data = db_questions.get(qid)
        
        if not q_data:
            continue
            
        correct = q_data["correct_option"].upper()
        cat = q_data["category"]
        
        if cat not in category_scores:
            category_scores[cat] = {"total": 0, "correct": 0}
        category_scores[cat]["total"] += 1
        
        is_correct = False
        is_unattempted = False
        
        if not selected:
            is_unattempted = True
            unattempted_count += 1
        elif selected == correct:
            is_correct = True
            correct_count += 1
            category_scores[cat]["correct"] += 1
        else:
            incorrect_count += 1
            
        detailed_results.append({
            "id": qid,
            "category": q_data["category"],
            "subtopic": q_data["subtopic"],
            "difficulty": q_data["difficulty"],
            "question_text": q_data["question_text"],
            "options": {
                "A": q_data["option_a"],
                "B": q_data["option_b"],
                "C": q_data["option_c"],
                "D": q_data["option_d"],
            },
            "selected_option": selected,
            "correct_option": correct,
            "is_correct": is_correct,
            "is_unattempted": is_unattempted,
            "explanation": q_data["explanation"]
        })
        
    score_percentage = round((correct_count / total_questions) * 100, 1) if total_questions > 0 else 0.0
    attempted = total_questions - unattempted_count
    accuracy = round((correct_count / attempted) * 100, 1) if attempted > 0 else 0.0
    
    # Save result to DB
    answers_payload = json.dumps({
        "detailed_results": detailed_results,
        "category_scores": category_scores
    })
    
    cursor.execute("""
        INSERT INTO aptitude_test_results 
        (user_id, category, total_questions, correct_answers, incorrect_answers, unattempted, score_percentage, time_taken_seconds, answers_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.user_id or 1,
        payload.category,
        total_questions,
        correct_count,
        incorrect_count,
        unattempted_count,
        score_percentage,
        payload.time_taken_seconds,
        answers_payload
    ))
    conn.commit()
    result_id = cursor.lastrowid
    conn.close()
    
    # XP Reward calculation
    xp_earned = (correct_count * 25) + (10 if score_percentage >= 80 else 0)
    
    return {
        "result_id": result_id,
        "category": payload.category,
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "incorrect_answers": incorrect_count,
        "unattempted": unattempted_count,
        "score_percentage": score_percentage,
        "accuracy": accuracy,
        "time_taken_seconds": payload.time_taken_seconds,
        "xp_earned": xp_earned,
        "category_breakdown": category_scores,
        "detailed_results": detailed_results
    }

@app.get("/api/aptitude/results")
def get_aptitude_results(user_id: Optional[int] = 1, limit: int = 10):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, user_id, category, total_questions, correct_answers, incorrect_answers, unattempted, score_percentage, time_taken_seconds, completed_at 
        FROM aptitude_test_results 
        WHERE user_id = ? 
        ORDER BY completed_at DESC 
        LIMIT ?
    """, (user_id, limit))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append(dict(r))
    return {"results": results}

@app.get("/api/aptitude/results/{result_id}")
def get_aptitude_result_detail(result_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM aptitude_test_results WHERE id = ?", (result_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Test result not found")
        
    data = dict(row)
    try:
        data["answers_data"] = json.loads(data["answers_json"])
    except Exception:
        data["answers_data"] = {}
    return data
