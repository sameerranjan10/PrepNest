from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from database import init_db, get_db_connection
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

import json


app = FastAPI(title="PrepNest API & Aptitude Practice Module")


# -------------------------------------------------------------
# CORS Configuration
# -------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------
# Startup
# -------------------------------------------------------------

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
# Aptitude Request Models
# -------------------------------------------------------------

class AnswerItem(BaseModel):
    question_id: int
    selected_option: Optional[str] = None


class SubmitTestRequest(BaseModel):
    user_id: Optional[int] = 1
    category: str = "all"
    time_taken_seconds: int = 0
    answers: List[AnswerItem]


# -------------------------------------------------------------
# General Endpoints
# -------------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "PrepNest Platform API"
    }


# -------------------------------------------------------------
# Authentication
# -------------------------------------------------------------

@app.post("/api/auth/register", response_model=TokenResponse)
def register_user(user_data: UserRegister):

    conn = get_db_connection()
    cursor = conn.cursor()

    email = user_data.email.lower().strip()

    try:
        # Check whether user already exists
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )

        hashed = hash_password(user_data.password)

        # PostgreSQL uses RETURNING instead of lastrowid
        cursor.execute(
            """
            INSERT INTO users
            (email, full_name, hashed_password, plan, credits)
            VALUES (%s, %s, %s, 'Pro', 250)
            RETURNING id, email, full_name, plan, credits, created_at
            """,
            (
                email,
                user_data.full_name.strip(),
                hashed
            )
        )

        user_row = cursor.fetchone()

        conn.commit()

    except HTTPException:
        conn.rollback()
        cursor.close()
        conn.close()
        raise

    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()

        raise HTTPException(
            status_code=500,
            detail=f"Database insertion failed: {str(e)}"
        )

    cursor.close()
    conn.close()

    user = dict(user_row)

    if user.get("created_at"):
        user["created_at"] = str(user["created_at"])

    token = create_access_token(
        {
            "sub": user["email"],
            "user_id": user["id"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


# -------------------------------------------------------------

@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(user_data: UserLogin):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT * FROM users WHERE email = %s",
            (user_data.email.lower().strip(),)
        )

        row = cursor.fetchone()

    finally:
        cursor.close()
        conn.close()

    if not row:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user_data.password,
        row["hashed_password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    user = {
        "id": row["id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "plan": row["plan"],
        "credits": row["credits"],
        "created_at": (
            str(row["created_at"])
            if row["created_at"]
            else None
        )
    }

    token = create_access_token(
        {
            "sub": user["email"],
            "user_id": user["id"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


# -------------------------------------------------------------

@app.get("/api/auth/me")
def get_current_user(
    authorization: Optional[str] = Header(None)
):

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )

    token = authorization.split(" ")[1]

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    email = payload.get("sub")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id, email, full_name, plan, credits, created_at
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        row = cursor.fetchone()

    finally:
        cursor.close()
        conn.close()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user_dict = dict(row)

    if user_dict.get("created_at"):
        user_dict["created_at"] = str(
            user_dict["created_at"]
        )

    return user_dict


# =============================================================
# APTITUDE PRACTICE MODULE
# =============================================================


# -------------------------------------------------------------
# Aptitude Categories
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
            "description": (
                "Master numerical analysis, arithmetic, algebra, "
                "probability, and speed math for campus recruitment exams."
            ),
            "color": "indigo",
            "badge": "Numerical & Math"
        },
        {
            "id": "logical",
            "name": "Logical Reasoning",
            "code": "LR",
            "description": (
                "Sharpen analytical thinking, syllogisms, blood relations, "
                "pattern recognition, and puzzle solving."
            ),
            "color": "purple",
            "badge": "Analytical Logic"
        },
        {
            "id": "verbal",
            "name": "Verbal Ability",
            "code": "VA",
            "description": (
                "Excel in reading comprehension, grammar correction, "
                "para-jumbles, vocabulary, and verbal analogies."
            ),
            "color": "pink",
            "badge": "Grammar & Vocab"
        }
    ]

    try:

        for cat in categories:

            # Total questions
            cursor.execute(
                """
                SELECT COUNT(*) AS cnt
                FROM aptitude_questions
                WHERE category = %s
                """,
                (cat["id"],)
            )

            result = cursor.fetchone()
            cat["total_questions"] = result["cnt"]

            # Subtopics
            cursor.execute(
                """
                SELECT DISTINCT subtopic
                FROM aptitude_questions
                WHERE category = %s
                """,
                (cat["id"],)
            )

            cat["subtopics"] = [
                row["subtopic"]
                for row in cursor.fetchall()
            ]

            # Test statistics
            cursor.execute(
                """
                SELECT
                    COUNT(*) AS test_count,
                    AVG(score_percentage) AS avg_score
                FROM aptitude_test_results
                WHERE category = %s
                """,
                (cat["id"],)
            )

            stats = cursor.fetchone()

            cat["tests_completed"] = (
                stats["test_count"] or 0
            )

            cat["avg_score"] = (
                round(stats["avg_score"], 1)
                if stats["avg_score"] is not None
                else 0.0
            )

        # Global statistics
        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_tests,
                AVG(score_percentage) AS overall_avg
            FROM aptitude_test_results
            """
        )

        overall = cursor.fetchone()

        total_tests = overall["total_tests"] or 0

        overall_accuracy = (
            round(overall["overall_avg"], 1)
            if overall["overall_avg"] is not None
            else 0.0
        )

    finally:
        cursor.close()
        conn.close()

    return {
        "categories": categories,
        "overall_stats": {
            "total_tests_completed": total_tests,
            "overall_accuracy": overall_accuracy,
            "placement_readiness_boost": min(
                100,
                int(overall_accuracy * 0.85)
                if total_tests > 0
                else 75
            )
        }
    }


# -------------------------------------------------------------
# Get Aptitude Questions
# -------------------------------------------------------------

@app.get("/api/aptitude/questions")
def get_aptitude_questions(
    category: Optional[str] = "all",
    difficulty: Optional[str] = "all",
    subtopic: Optional[str] = None,
    limit: Optional[int] = 10
):

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            id,
            category,
            subtopic,
            difficulty,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explanation
        FROM aptitude_questions
        WHERE 1=1
    """

    params = []

    if category and category.lower() != "all":

        query += " AND category = %s"
        params.append(category.lower())

    if difficulty and difficulty.lower() != "all":

        query += " AND LOWER(difficulty) = %s"
        params.append(difficulty.lower())

    if subtopic:

        query += " AND subtopic = %s"
        params.append(subtopic)

    query += " ORDER BY RANDOM() LIMIT %s"
    params.append(limit)

    try:

        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()

    finally:
        cursor.close()
        conn.close()

    questions = []

    for r in rows:

        questions.append(
            {
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

                "correct_option": r["correct_option"],
                "explanation": r["explanation"]
            }
        )

    return {
        "count": len(questions),
        "category": category,
        "questions": questions
    }


# -------------------------------------------------------------
# Submit Aptitude Test
# -------------------------------------------------------------

@app.post("/api/aptitude/submit")
def submit_aptitude_test(
    payload: SubmitTestRequest
):

    if not payload.answers:

        raise HTTPException(
            status_code=400,
            detail="No answers provided in test submission"
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        question_ids = [
            answer.question_id
            for answer in payload.answers
        ]

        placeholders = ",".join(
            ["%s"] * len(question_ids)
        )

        cursor.execute(
            f"""
            SELECT *
            FROM aptitude_questions
            WHERE id IN ({placeholders})
            """,
            tuple(question_ids)
        )

        db_questions = {
            row["id"]: dict(row)
            for row in cursor.fetchall()
        }

        total_questions = len(payload.answers)

        correct_count = 0
        incorrect_count = 0
        unattempted_count = 0

        detailed_results = []

        category_scores = {}

        for ans in payload.answers:

            qid = ans.question_id

            selected = (
                ans.selected_option.upper()
                if ans.selected_option
                else None
            )

            q_data = db_questions.get(qid)

            if not q_data:
                continue

            correct = q_data["correct_option"].upper()

            cat = q_data["category"]

            if cat not in category_scores:

                category_scores[cat] = {
                    "total": 0,
                    "correct": 0
                }

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

            detailed_results.append(
                {
                    "id": qid,
                    "category": q_data["category"],
                    "subtopic": q_data["subtopic"],
                    "difficulty": q_data["difficulty"],
                    "question_text": q_data["question_text"],

                    "options": {
                        "A": q_data["option_a"],
                        "B": q_data["option_b"],
                        "C": q_data["option_c"],
                        "D": q_data["option_d"]
                    },

                    "selected_option": selected,
                    "correct_option": correct,
                    "is_correct": is_correct,
                    "is_unattempted": is_unattempted,
                    "explanation": q_data["explanation"]
                }
            )

        score_percentage = (
            round(
                (correct_count / total_questions) * 100,
                1
            )
            if total_questions > 0
            else 0.0
        )

        attempted = (
            total_questions - unattempted_count
        )

        accuracy = (
            round(
                (correct_count / attempted) * 100,
                1
            )
            if attempted > 0
            else 0.0
        )

        answers_payload = json.dumps(
            {
                "detailed_results": detailed_results,
                "category_scores": category_scores
            }
        )

        # PostgreSQL INSERT
        # Use RETURNING instead of cursor.lastrowid
        cursor.execute(
            """
            INSERT INTO aptitude_test_results
            (
                user_id,
                category,
                total_questions,
                correct_answers,
                incorrect_answers,
                unattempted,
                score_percentage,
                time_taken_seconds,
                answers_json
            )
            VALUES
            (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            )
            RETURNING id
            """,
            (
                payload.user_id or 1,
                payload.category,
                total_questions,
                correct_count,
                incorrect_count,
                unattempted_count,
                score_percentage,
                payload.time_taken_seconds,
                answers_payload
            )
        )

        result_id = cursor.fetchone()["id"]

        conn.commit()

    except Exception:

        conn.rollback()
        raise

    finally:

        cursor.close()
        conn.close()

    # XP calculation
    xp_earned = (
        correct_count * 25
    ) + (
        10 if score_percentage >= 80 else 0
    )

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


# -------------------------------------------------------------
# Aptitude Test Results
# -------------------------------------------------------------

@app.get("/api/aptitude/results")
def get_aptitude_results(
    user_id: Optional[int] = 1,
    limit: int = 10
):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            SELECT
                id,
                user_id,
                category,
                total_questions,
                correct_answers,
                incorrect_answers,
                unattempted,
                score_percentage,
                time_taken_seconds,
                completed_at
            FROM aptitude_test_results
            WHERE user_id = %s
            ORDER BY completed_at DESC
            LIMIT %s
            """,
            (
                user_id,
                limit
            )
        )

        rows = cursor.fetchall()

    finally:

        cursor.close()
        conn.close()

    results = [
        dict(row)
        for row in rows
    ]

    return {
        "results": results
    }


# -------------------------------------------------------------
# Aptitude Result Details
# -------------------------------------------------------------

@app.get("/api/aptitude/results/{result_id}")
def get_aptitude_result_detail(
    result_id: int
):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            SELECT *
            FROM aptitude_test_results
            WHERE id = %s
            """,
            (result_id,)
        )

        row = cursor.fetchone()

    finally:

        cursor.close()
        conn.close()

    if not row:

        raise HTTPException(
            status_code=404,
            detail="Test result not found"
        )

    data = dict(row)

    try:

        data["answers_data"] = json.loads(
            data["answers_json"]
        )

    except Exception:

        data["answers_data"] = {}

    return data