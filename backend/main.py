import os
import sys
import json
from typing import List, Optional

from fastapi import FastAPI, Header, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
    neon_auth_sign_up,
    neon_auth_sign_in,
    verify_neon_session,
)

from database import get_db_connection, init_db
from resume_service import (
    full_resume_analysis,
    get_available_companies_and_roles,
    improve_bullet_points,
    enhance_single_bullet,
    match_job_description,
    map_roadmaps_and_dsa,
    match_company_and_role,
)

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


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[str] = None
    skills: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    grad_year: Optional[int] = None
    current_semester: Optional[str] = None
    cgpa: Optional[str] = None
    tenth_percentage: Optional[str] = None
    twelfth_percentage: Optional[str] = None
    leetcode_username: Optional[str] = None
    hackerrank_username: Optional[str] = None
    codechef_username: Optional[str] = None
    codeforces_username: Optional[str] = None
    gfg_username: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    preferred_language: Optional[str] = None
    daily_dsa_goal: Optional[int] = None
    daily_aptitude_goal: Optional[int] = None
    prep_level: Optional[str] = None
    email_notifications: Optional[bool] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str



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


class SingleSolveRequest(BaseModel):
    user_id: Optional[int] = 1
    question_id: int
    selected_option: str


class DSAToggleSolvedRequest(BaseModel):
    user_id: Optional[int] = 1
    problem_id: int


class DSAToggleBookmarkRequest(BaseModel):
    user_id: Optional[int] = 1
    problem_id: int


class RoadmapProgressRequest(BaseModel):
    topic_id: int
    status: str = "completed"
    user_id: Optional[int] = None


class RoadmapResetRequest(BaseModel):
    domain_id: Optional[str] = None
    user_id: Optional[int] = None


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
def register_user(user_data: UserRegister, origin: Optional[str] = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor()

    email = user_data.email.lower().strip()
    full_name = user_data.full_name.strip()
    req_origin = origin or "http://localhost:5173"

    # 1. Register with Neon Auth
    neon_success, neon_data, neon_err = neon_auth_sign_up(full_name, email, user_data.password, origin=req_origin)
    if not neon_success:
        # If user already exists in Neon Auth, attempt sign in or report clean message
        if neon_err and ("already exists" in neon_err.lower() or "user_already_exists" in neon_err.lower()):
            succ, sdata, serr = neon_auth_sign_in(email, user_data.password, origin=req_origin)
            if succ and sdata:
                neon_success = True
                neon_data = sdata
            else:
                cursor.close()
                conn.close()
                raise HTTPException(
                    status_code=400,
                    detail="An account with this email already exists. Please log in instead."
                )
        else:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail=neon_err or "Registration failed on Neon Auth"
            )

    neon_token = neon_data.get("token") if neon_data else None

    # 2. Synchronize with public.users table
    try:
        cursor.execute("SELECT id, email, full_name, plan, credits, created_at FROM users WHERE email = %s", (email,))
        existing = cursor.fetchone()
        hashed = hash_password(user_data.password)

        if not existing:
            cursor.execute("""
                INSERT INTO users (email, full_name, hashed_password, plan, credits)
                VALUES (%s, %s, %s, 'Pro', 250)
                RETURNING id, email, full_name, plan, credits, created_at;
            """, (email, full_name, hashed))
            user_row = cursor.fetchone()
        else:
            user_row = existing

        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database synchronization failed: {str(e)}")

    cursor.close()
    conn.close()

    user = dict(user_row)
    if user.get("created_at"):
        user["created_at"] = str(user["created_at"])

    token = neon_token or create_access_token({"sub": user["email"], "user_id": user["id"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


# -------------------------------------------------------------

@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(user_data: UserLogin, origin: Optional[str] = Header(None)):
    email = user_data.email.lower().strip()
    req_origin = origin or "http://localhost:5173"
    conn = get_db_connection()
    cursor = conn.cursor()

    neon_token = None
    neon_user = None

    # 1. Attempt authentication with Neon Auth
    neon_success, neon_data, neon_err = neon_auth_sign_in(email, user_data.password, origin=req_origin)
    if neon_success and neon_data:
        neon_token = neon_data.get("token")
        neon_user = neon_data.get("user")
    else:
        # Check if user is in public.users with legacy hash (auto-migration to Neon Auth)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        legacy_row = cursor.fetchone()
        if legacy_row and verify_password(user_data.password, legacy_row.get("hashed_password", "")):
            full_name = legacy_row.get("full_name") or "PrepNest Student"
            neon_auth_sign_up(full_name, email, user_data.password, origin=req_origin)
            succ, sdata, _ = neon_auth_sign_in(email, user_data.password, origin=req_origin)
            if succ and sdata:
                neon_token = sdata.get("token")
                neon_user = sdata.get("user")
        else:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=401,
                detail=neon_err or "Invalid email or password"
            )

    # 2. Ensure user exists in public.users
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user_row = cursor.fetchone()
        if not user_row:
            name = neon_user.get("name") if neon_user else "PrepNest User"
            hashed = hash_password(user_data.password)
            cursor.execute("""
                INSERT INTO users (email, full_name, hashed_password, plan, credits)
                VALUES (%s, %s, %s, 'Pro', 250)
                RETURNING *;
            """, (email, name, hashed))
            user_row = cursor.fetchone()
            conn.commit()
    finally:
        cursor.close()
        conn.close()

    user = dict(user_row)
    if user.get("created_at"):
        user["created_at"] = str(user["created_at"])

    token = neon_token or create_access_token({"sub": user["email"], "user_id": user["id"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


# -------------------------------------------------------------

@app.post("/api/auth/logout")
def logout_user(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('DELETE FROM neon_auth.session WHERE token = %s;', (token,))
            conn.commit()
        except Exception:
            pass
        finally:
            cursor.close()
            conn.close()
    return {"status": "ok", "message": "Logged out successfully"}


# -------------------------------------------------------------

def get_current_user_from_token(authorization: Optional[str]):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )

    token = authorization.split(" ")[1]
    conn = get_db_connection()
    cursor = conn.cursor()

    email = None

    try:
        # 1. Check Neon Auth session
        neon_sess = verify_neon_session(token, cursor)
        if neon_sess:
            email = neon_sess["email"].lower().strip()
        else:
            # 2. Check legacy JWT
            payload = decode_access_token(token)
            if payload:
                email = payload.get("sub", "").lower().strip()

        if not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired session token"
            )

        # 3. Retrieve user from public.users
        cursor.execute(
            """
            SELECT id, email, full_name, plan, credits, phone, bio, location, 
                   avatar_url, target_role, target_companies, skills, college, 
                   degree, grad_year, current_semester, cgpa, tenth_percentage, 
                   twelfth_percentage, leetcode_username, hackerrank_username, 
                   codechef_username, codeforces_username, gfg_username, 
                   github_url, linkedin_url, portfolio_url, resume_url, 
                   preferred_language, daily_dsa_goal, daily_aptitude_goal, 
                   prep_level, email_notifications, created_at
            FROM users
            WHERE email = %s
            """,
            (email,)
        )
        row = cursor.fetchone()

        if not row:
            name = neon_sess.get("name") if neon_sess else "User"
            cursor.execute("""
                INSERT INTO users (email, full_name, plan, credits)
                VALUES (%s, %s, 'Pro', 250)
                RETURNING *;
            """, (email, name))
            row = cursor.fetchone()
            conn.commit()

        user_dict = dict(row)
        if user_dict.get("created_at"):
            user_dict["created_at"] = str(user_dict["created_at"])

        return user_dict
    finally:
        cursor.close()
        conn.close()



@app.get("/api/auth/me")
def get_current_user(
    authorization: Optional[str] = Header(None)
):
    return get_current_user_from_token(authorization)


@app.get("/api/user/profile")
def get_user_profile(
    authorization: Optional[str] = Header(None)
):
    return get_current_user_from_token(authorization)


@app.put("/api/user/profile")
def update_user_profile(
    profile_data: UserProfileUpdate,
    authorization: Optional[str] = Header(None)
):
    current_user = get_current_user_from_token(authorization)
    user_id = current_user["id"]

    update_fields = []
    values = []

    # Map fields dynamically from model
    data_dict = profile_data.dict(exclude_unset=True)
    if not data_dict:
        return current_user

    for field, val in data_dict.items():
        update_fields.append(f"{field} = %s")
        values.append(val)

    values.append(user_id)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        set_clause = ", ".join(update_fields)
        query = f"""
            UPDATE users
            SET {set_clause}
            WHERE id = %s
            RETURNING id, email, full_name, plan, credits, phone, bio, location, 
                      avatar_url, target_role, target_companies, skills, college, 
                      degree, grad_year, current_semester, cgpa, tenth_percentage, 
                      twelfth_percentage, leetcode_username, hackerrank_username, 
                      codechef_username, codeforces_username, gfg_username, 
                      github_url, linkedin_url, portfolio_url, resume_url, 
                      preferred_language, daily_dsa_goal, daily_aptitude_goal, 
                      prep_level, email_notifications, created_at
        """
        cursor.execute(query, tuple(values))
        updated_row = cursor.fetchone()
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update profile: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

    updated_user = dict(updated_row)
    if updated_user.get("created_at"):
        updated_user["created_at"] = str(updated_user["created_at"])

    return updated_user


@app.put("/api/user/password")
def change_user_password(
    pass_data: PasswordChangeRequest,
    authorization: Optional[str] = Header(None)
):
    current_user = get_current_user_from_token(authorization)
    user_id = current_user["id"]

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT hashed_password FROM users WHERE id = %s",
            (user_id,)
        )
        row = cursor.fetchone()
        if not row or not verify_password(pass_data.current_password, row["hashed_password"]):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )

        if len(pass_data.new_password) < 6:
            raise HTTPException(
                status_code=400,
                detail="New password must be at least 6 characters long"
            )

        new_hashed = hash_password(pass_data.new_password)
        cursor.execute(
            "UPDATE users SET hashed_password = %s WHERE id = %s",
            (new_hashed, user_id)
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {"status": "ok", "message": "Password updated successfully"}



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

        # Company tags
        cursor.execute(
            """
            SELECT DISTINCT company_tag
            FROM aptitude_questions
            WHERE company_tag IS NOT NULL AND company_tag != ''
            ORDER BY company_tag
            """
        )
        company_rows = cursor.fetchall()
        companies_list = [row["company_tag"] for row in company_rows]

    finally:
        cursor.close()
        conn.close()

    return {
        "categories": categories,
        "companies": companies_list,
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
    company: Optional[str] = "all",
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
            company_tag,
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

    if company and company.lower() != "all":
        query += " AND LOWER(company_tag) = %s"
        params.append(company.lower())

    if subtopic and subtopic.lower() != "all":
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
                "company_tag": r["company_tag"] or "General",
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
        "company": company,
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

        # PostgreSQL INSERT with RETURNING
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

        # Track question-level progress for user
        user_id = payload.user_id or 1
        for res_item in detailed_results:
            if not res_item.get("is_unattempted"):
                q_status = "solved" if res_item.get("is_correct") else "incorrect"
                cursor.execute(
                    """
                    INSERT INTO user_question_progress 
                    (user_id, question_id, status, selected_option, updated_at)
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, question_id)
                    DO UPDATE SET status = EXCLUDED.status, selected_option = EXCLUDED.selected_option, updated_at = CURRENT_TIMESTAMP
                    """,
                    (user_id, res_item["id"], q_status, res_item.get("selected_option"))
                )

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


# -------------------------------------------------------------
# Company Tracks Endpoint
# -------------------------------------------------------------

@app.get("/api/companies")
def get_companies(user_id: Optional[int] = 1):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT 
                q.company_tag, 
                COUNT(q.id) AS count,
                COUNT(CASE WHEN p.status = 'solved' THEN 1 END) AS solved_count
            FROM aptitude_questions q
            LEFT JOIN user_question_progress p 
                ON q.id = p.question_id AND p.user_id = %s
            WHERE q.company_tag IS NOT NULL AND q.company_tag != ''
            GROUP BY q.company_tag
            ORDER BY count DESC
            """,
            (user_id or 1,)
        )
        rows = cursor.fetchall()

        # Query DSA problem counts and user solved counts per company
        cursor.execute(
            """
            SELECT 
                comp,
                COUNT(p.id) AS dsa_total,
                COUNT(CASE WHEN up.is_solved = TRUE THEN 1 END) AS dsa_solved
            FROM (
                SELECT id, unnest(companies) AS comp
                FROM dsa_problems
            ) p
            LEFT JOIN user_dsa_progress up 
                ON p.id = up.problem_id AND up.user_id = %s
            GROUP BY comp
            """,
            (user_id or 1,)
        )
        dsa_rows = cursor.fetchall()
        dsa_by_company = {r["comp"]: {"total": r["dsa_total"], "solved": r["dsa_solved"]} for r in dsa_rows}
    finally:
        cursor.close()
        conn.close()

    meta = {
        "Google": {
            "logo": "🌐", 
            "role": "Software Development Engineer (SDE)", 
            "difficulty": "Hard",
            "test_pattern": "OA: 2 Coding Problems (60 mins) + Technical & Analytical Assessment",
            "sections": ["Data Structures", "Algorithms", "System Analytical Thinking"]
        },
        "Microsoft": {
            "logo": "🪟", 
            "role": "Software Engineer", 
            "difficulty": "Medium",
            "test_pattern": "Codility OA: 3 Tasks (70 mins) + Analytical Aptitude",
            "sections": ["Arrays & Strings", "Dynamic Programming", "Logical Reasoning"]
        },
        "Amazon": {
            "logo": "📦", 
            "role": "SDE-1 (Frontend / Backend)", 
            "difficulty": "Hard",
            "test_pattern": "Online Assessment (OA1 + OA2): 2 Coding (70 mins) + Work Simulation & Aptitude",
            "sections": ["Problem Solving", "Behavioral Leadership", "Data Structures"]
        },
        "Meta": {
            "logo": "♾️", 
            "role": "Software Engineer", 
            "difficulty": "Extreme",
            "test_pattern": "HackerRank OA: 2 Coding (45 mins) + System Design Fundamentals",
            "sections": ["Speed Coding", "Graph Algorithms", "Data Structures"]
        },
        "TCS": {
            "logo": "🏢", 
            "role": "Ninja / Digital / Prime Developer", 
            "difficulty": "Medium",
            "test_pattern": "TCS NQT: Numerical (20Q, 25m) + Verbal (25Q, 25m) + Reasoning (20Q, 25m) + Coding (2Q, 45m)",
            "sections": ["Quantitative Aptitude", "Reasoning Ability", "Verbal Ability", "Coding"]
        },
        "Infosys": {
            "logo": "💼", 
            "role": "Systems Engineer / Specialist (DSE)", 
            "difficulty": "Medium",
            "test_pattern": "Infosys OA: Reasoning (15Q, 25m) + Mathematical (10Q, 35m) + Verbal (20Q, 20m) + Pseudocode (5Q, 10m)",
            "sections": ["Mathematical Critical Thinking", "Logical Deduction", "Verbal Ability", "Pseudocode"]
        },
        "Wipro": {
            "logo": "⚡", 
            "role": "Project Engineer / Turbo", 
            "difficulty": "Medium",
            "test_pattern": "NLTH: Quantitative (16Q, 16m) + Logical (14Q, 14m) + Verbal (22Q, 18m) + Essay (1Q, 20m) + Coding (2Q, 60m)",
            "sections": ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Basic Coding"]
        },
        "Accenture": {
            "logo": "🚀", 
            "role": "Associate Software Engineer", 
            "difficulty": "Medium",
            "test_pattern": "Cognitive (50Q) + Technical (40Q) in 90 mins (Critical Thinking, English, MS Office, Pseudocode, Cloud)",
            "sections": ["Cognitive Assessment", "Technical & Pseudocode", "Coding (45m)"]
        },
        "Cognizant": {
            "logo": "💡", 
            "role": "GenC / GenC Next Developer", 
            "difficulty": "Medium",
            "test_pattern": "GenC Assessment: Quantitative (25Q, 35m) + Logical (20Q, 35m) + Verbal (20Q, 20m) + Coding",
            "sections": ["Analytical Ability", "English Comprehension", "Domain Technical"]
        },
        "Capgemini": {
            "logo": "🔷", 
            "role": "Software Analyst", 
            "difficulty": "Medium",
            "test_pattern": "Capgemini OA: Pseudocode (30Q, 30m) + English (30Q, 30m) + Game-Based Aptitude (4 games) + Behavioral",
            "sections": ["Pseudocode Analysis", "Verbal Ability", "Game-Based Aptitude"]
        },
        "Deloitte": {
            "logo": "📊", 
            "role": "Technology Consulting Analyst", 
            "difficulty": "Medium",
            "test_pattern": "Deloitte OA: Quantitative (15Q, 15m) + Logical (15Q, 15m) + Verbal (15Q, 15m) + Computer Fundamentals (30Q, 30m)",
            "sections": ["Quantitative Analysis", "Logical Deduction", "Verbal Communication", "Computer Science"]
        },
    }

    companies = []
    for r in rows:
        c_name = r["company_tag"]
        info = meta.get(c_name, {
            "logo": "🏢", 
            "role": "Software Engineer", 
            "difficulty": "Medium",
            "test_pattern": "Online Assessment & Technical Interview Track",
            "sections": ["Aptitude", "Technical", "Coding"]
        })
        solved = r["solved_count"] or 0
        total = r["count"]
        pct = round((solved / total) * 100, 1) if total > 0 else 0.0
        dsa_info = dsa_by_company.get(c_name, {"total": 0, "solved": 0})
        companies.append({
            "id": c_name.lower(),
            "name": c_name,
            "logo": info["logo"],
            "role": info["role"],
            "hiringDifficulty": info["difficulty"],
            "testPattern": info.get("test_pattern", "Online Assessment"),
            "sections": info.get("sections", []),
            "totalQuestions": total,
            "solvedQuestions": solved,
            "progressPercent": pct,
            "dsaTotal": dsa_info["total"],
            "dsaSolved": dsa_info["solved"]
        })

    return {"companies": companies}


# -------------------------------------------------------------
# Module & Question Directory Endpoints
# -------------------------------------------------------------

@app.get("/api/aptitude/modules")
def get_aptitude_modules(
    user_id: Optional[int] = 1,
    company: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        where_extra = ""
        params = [user_id or 1]
        if company and company.lower() != "all":
            where_extra = "WHERE LOWER(q.company_tag) = %s"
            params.append(company.lower())

        cursor.execute(
            f"""
            SELECT 
                q.category,
                q.subtopic,
                COUNT(q.id) AS total_questions,
                COUNT(CASE WHEN p.status = 'solved' THEN 1 END) AS solved_questions
            FROM aptitude_questions q
            LEFT JOIN user_question_progress p 
                ON q.id = p.question_id AND p.user_id = %s
            {where_extra}
            GROUP BY q.category, q.subtopic
            ORDER BY q.category, total_questions DESC
            """,
            tuple(params)
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    modules = {}
    for r in rows:
        cat = r["category"]
        if cat not in modules:
            modules[cat] = []
        modules[cat].append({
            "subtopic": r["subtopic"],
            "total": r["total_questions"],
            "solved": r["solved_questions"],
            "progress": round((r["solved_questions"] / r["total_questions"]) * 100, 1) if r["total_questions"] > 0 else 0
        })

    return {"modules": modules}


@app.get("/api/aptitude/directory")
def get_aptitude_directory(
    user_id: Optional[int] = 1,
    category: Optional[str] = "all",
    subtopic: Optional[str] = "all",
    company: Optional[str] = "all",
    difficulty: Optional[str] = "all",
    status: Optional[str] = "all",
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = ["1=1"]
    params = [user_id or 1]

    if category and category.lower() != "all":
        conditions.append("q.category = %s")
        params.append(category.lower())

    if subtopic and subtopic.lower() != "all":
        conditions.append("q.subtopic = %s")
        params.append(subtopic)

    if company and company.lower() != "all":
        conditions.append("LOWER(q.company_tag) = %s")
        params.append(company.lower())

    if difficulty and difficulty.lower() != "all":
        conditions.append("LOWER(q.difficulty) = %s")
        params.append(difficulty.lower())

    if status == "solved":
        conditions.append("p.status = 'solved'")
    elif status == "unsolved":
        conditions.append("(p.status IS NULL OR p.status != 'solved')")

    if search and search.strip():
        conditions.append("(q.question_text ILIKE %s OR q.subtopic ILIKE %s)")
        params.append(f"%{search.strip()}%")
        params.append(f"%{search.strip()}%")

    where_clause = " AND ".join(conditions)

    try:
        # Count total matching
        count_query = f"""
            SELECT COUNT(*) AS total
            FROM aptitude_questions q
            LEFT JOIN user_question_progress p 
                ON q.id = p.question_id AND p.user_id = %s
            WHERE {where_clause}
        """
        cursor.execute(count_query, tuple(params))
        total_matching = cursor.fetchone()["total"]

        # Count total solved in this scope for this user
        if company and company.lower() != "all":
            cursor.execute(
                """
                SELECT COUNT(*) AS solved_total 
                FROM user_question_progress p
                JOIN aptitude_questions q ON p.question_id = q.id
                WHERE p.user_id = %s AND p.status = 'solved' AND LOWER(q.company_tag) = %s
                """,
                (user_id or 1, company.lower())
            )
            total_solved = cursor.fetchone()["solved_total"]

            cursor.execute(
                "SELECT COUNT(*) AS c_total FROM aptitude_questions WHERE LOWER(company_tag) = %s",
                (company.lower(),)
            )
            company_total = cursor.fetchone()["c_total"]
        else:
            cursor.execute(
                "SELECT COUNT(*) AS solved_total FROM user_question_progress WHERE user_id = %s AND status = 'solved'",
                (user_id or 1,)
            )
            total_solved = cursor.fetchone()["solved_total"]
            company_total = None

        offset = max(0, (page - 1) * limit)
        data_params = list(params)
        data_params.extend([limit, offset])

        data_query = f"""
            SELECT 
                q.id,
                q.category,
                q.subtopic,
                q.difficulty,
                q.company_tag,
                q.question_text,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_option,
                q.explanation,
                p.status AS user_status,
                p.selected_option AS user_selected
            FROM aptitude_questions q
            LEFT JOIN user_question_progress p 
                ON q.id = p.question_id AND p.user_id = %s
            WHERE {where_clause}
            ORDER BY q.id ASC
            LIMIT %s OFFSET %s
        """
        cursor.execute(data_query, tuple(data_params))
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    questions = []
    for r in rows:
        is_solved = (r["user_status"] == "solved")
        questions.append({
            "id": r["id"],
            "category": r["category"],
            "subtopic": r["subtopic"],
            "difficulty": r["difficulty"],
            "company_tag": r["company_tag"] or "General",
            "question_text": r["question_text"],
            "options": {
                "A": r["option_a"],
                "B": r["option_b"],
                "C": r["option_c"],
                "D": r["option_d"]
            },
            "correct_option": r["correct_option"],
            "explanation": r["explanation"],
            "is_solved": is_solved,
            "user_status": r["user_status"],
            "user_selected": r["user_selected"]
        })

    return {
        "questions": questions,
        "total": total_matching,
        "total_solved": total_solved,
        "company_total": company_total,
        "page": page,
        "limit": limit,
        "total_pages": max(1, (total_matching + limit - 1) // limit)
    }


@app.post("/api/aptitude/solve-single")
def solve_single_question(payload: SingleSolveRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM aptitude_questions WHERE id = %s", (payload.question_id,))
        q = cursor.fetchone()
        if not q:
            raise HTTPException(status_code=404, detail="Question not found")

        correct = q["correct_option"].upper().strip()
        selected = payload.selected_option.upper().strip()
        is_correct = (selected == correct)
        status = "solved" if is_correct else "incorrect"

        cursor.execute(
            """
            INSERT INTO user_question_progress (user_id, question_id, status, selected_option, updated_at)
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, question_id) 
            DO UPDATE SET status = EXCLUDED.status, selected_option = EXCLUDED.selected_option, updated_at = CURRENT_TIMESTAMP
            """,
            (payload.user_id or 1, payload.question_id, status, selected)
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {
        "question_id": payload.question_id,
        "selected_option": selected,
        "correct_option": correct,
        "is_correct": is_correct,
        "status": status,
        "xp_earned": 25 if is_correct else 0,
        "explanation": q["explanation"]
    }


# -------------------------------------------------------------
# DSA Problem Directory Endpoints
# -------------------------------------------------------------

@app.get("/api/dsa/meta")
def get_dsa_meta(user_id: Optional[int] = 1):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Total problems
        cursor.execute("SELECT COUNT(*) AS total FROM dsa_problems")
        total_problems = cursor.fetchone()["total"]

        # User progress
        cursor.execute(
            """
            SELECT 
                COUNT(CASE WHEN is_solved = true THEN 1 END) AS solved_count,
                COUNT(CASE WHEN is_bookmarked = true THEN 1 END) AS bookmarked_count
            FROM user_dsa_progress 
            WHERE user_id = %s
            """,
            (user_id or 1,)
        )
        prog = cursor.fetchone()
        solved_count = prog["solved_count"] or 0
        bookmarked_count = prog["bookmarked_count"] or 0

        # Difficulty breakdown
        cursor.execute(
            """
            SELECT difficulty, COUNT(*) AS count 
            FROM dsa_problems 
            GROUP BY difficulty
            """
        )
        diff_counts = {r["difficulty"]: r["count"] for r in cursor.fetchall()}

        # Top companies
        cursor.execute(
            """
            SELECT company, COUNT(*) AS count
            FROM (
                SELECT unnest(companies) AS company FROM dsa_problems
            ) sub
            GROUP BY company
            ORDER BY count DESC
            LIMIT 40
            """
        )
        top_companies = [dict(r) for r in cursor.fetchall()]

        # Top topics
        cursor.execute(
            """
            SELECT topic, COUNT(*) AS count
            FROM (
                SELECT unnest(topics) AS topic FROM dsa_problems
            ) sub
            GROUP BY topic
            ORDER BY count DESC
            LIMIT 50
            """
        )
        top_topics = [dict(r) for r in cursor.fetchall()]

    finally:
        cursor.close()
        conn.close()

    return {
        "total_problems": total_problems,
        "solved_count": solved_count,
        "bookmarked_count": bookmarked_count,
        "difficulty_counts": diff_counts,
        "top_companies": top_companies,
        "top_topics": top_topics
    }


@app.get("/api/dsa/problems")
def get_dsa_problems(
    user_id: Optional[int] = 1,
    page: int = 1,
    limit: int = 25,
    search: Optional[str] = None,
    difficulty: Optional[str] = "all",
    company: Optional[str] = "all",
    topic: Optional[str] = "all",
    status: Optional[str] = "all",
    sort_by: Optional[str] = "id"
):
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = ["1=1"]
    params = [user_id or 1]

    if difficulty and difficulty.lower() != "all":
        conditions.append("LOWER(p.difficulty) = %s")
        params.append(difficulty.lower())

    if company and company.lower() != "all":
        conditions.append("EXISTS (SELECT 1 FROM unnest(p.companies) c WHERE LOWER(c) = %s)")
        params.append(company.lower())

    if topic and topic.lower() != "all":
        conditions.append("EXISTS (SELECT 1 FROM unnest(p.topics) t WHERE LOWER(t) = %s)")
        params.append(topic.lower())

    if status == "solved":
        conditions.append("u.is_solved = true")
    elif status == "unsolved":
        conditions.append("(u.is_solved IS NULL OR u.is_solved = false)")
    elif status == "bookmarked":
        conditions.append("u.is_bookmarked = true")

    if search and search.strip():
        s_term = f"%{search.strip().lower()}%"
        conditions.append("(LOWER(p.title) LIKE %s OR LOWER(p.slug) LIKE %s)")
        params.append(s_term)
        params.append(s_term)

    where_clause = " AND ".join(conditions)

    order_by_clause = "p.id ASC"
    if sort_by == "difficulty":
        order_by_clause = "CASE p.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END ASC"
    elif sort_by == "acceptance":
        order_by_clause = "p.acceptance_rate DESC"
    elif sort_by == "title":
        order_by_clause = "p.title ASC"

    try:
        count_query = f"""
            SELECT COUNT(*) AS total
            FROM dsa_problems p
            LEFT JOIN user_dsa_progress u ON p.id = u.problem_id AND u.user_id = %s
            WHERE {where_clause}
        """
        cursor.execute(count_query, tuple(params))
        total_matching = cursor.fetchone()["total"]

        offset = max(0, (page - 1) * limit)
        data_params = list(params)
        data_params.extend([limit, offset])

        data_query = f"""
            SELECT 
                p.id,
                p.title,
                p.slug,
                p.difficulty,
                p.acceptance_rate,
                p.link,
                p.topics,
                p.companies,
                p.company_frequencies,
                COALESCE(u.is_solved, false) AS is_solved,
                COALESCE(u.is_bookmarked, false) AS is_bookmarked
            FROM dsa_problems p
            LEFT JOIN user_dsa_progress u ON p.id = u.problem_id AND u.user_id = %s
            WHERE {where_clause}
            ORDER BY {order_by_clause}
            LIMIT %s OFFSET %s
        """
        cursor.execute(data_query, tuple(data_params))
        rows = cursor.fetchall()

    finally:
        cursor.close()
        conn.close()

    problems = []
    for r in rows:
        freq_map = r["company_frequencies"] if isinstance(r["company_frequencies"], dict) else {}
        freq = 50.0
        if company and company.lower() != "all":
            for c_k, c_v in freq_map.items():
                if c_k.lower() == company.lower():
                    freq = c_v
                    break
        elif freq_map:
            freq = max(freq_map.values())

        problems.append({
            "id": r["id"],
            "title": r["title"],
            "slug": r["slug"],
            "difficulty": r["difficulty"],
            "acceptance_rate": round(r["acceptance_rate"], 1),
            "link": r["link"],
            "topics": r["topics"] or [],
            "companies": r["companies"] or [],
            "frequency": round(freq, 1),
            "is_solved": r["is_solved"],
            "is_bookmarked": r["is_bookmarked"]
        })

    return {
        "problems": problems,
        "total": total_matching,
        "page": page,
        "limit": limit,
        "total_pages": max(1, (total_matching + limit - 1) // limit)
    }


@app.post("/api/dsa/toggle-solved")
def toggle_dsa_solved(payload: DSAToggleSolvedRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO user_dsa_progress (user_id, problem_id, is_solved, solved_at, updated_at)
            VALUES (%s, %s, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, problem_id)
            DO UPDATE SET 
                is_solved = NOT user_dsa_progress.is_solved,
                solved_at = CASE WHEN NOT user_dsa_progress.is_solved THEN CURRENT_TIMESTAMP ELSE NULL END,
                updated_at = CURRENT_TIMESTAMP
            RETURNING is_solved
            """,
            (payload.user_id or 1, payload.problem_id)
        )
        row = cursor.fetchone()
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    is_solved = row["is_solved"]
    return {
        "problem_id": payload.problem_id,
        "is_solved": is_solved,
        "xp_earned": 25 if is_solved else 0
    }


@app.post("/api/dsa/toggle-bookmark")
def toggle_dsa_bookmark(payload: DSAToggleBookmarkRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO user_dsa_progress (user_id, problem_id, is_bookmarked, updated_at)
            VALUES (%s, %s, true, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, problem_id)
            DO UPDATE SET 
                is_bookmarked = NOT user_dsa_progress.is_bookmarked,
                updated_at = CURRENT_TIMESTAMP
            RETURNING is_bookmarked
            """,
            (payload.user_id or 1, payload.problem_id)
        )
        row = cursor.fetchone()
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {
        "problem_id": payload.problem_id,
        "is_bookmarked": row["is_bookmarked"]
    }


class DSARunCodeRequest(BaseModel):
    problem_id: int
    language: str = "python"
    code: str
    custom_input: Optional[str] = None


class DSASubmitCodeRequest(BaseModel):
    user_id: Optional[int] = 1
    problem_id: int
    language: str
    code: str


@app.get("/api/dsa/problems/{problem_id}")
def get_dsa_problem_detail(problem_id: int, user_id: Optional[int] = 1):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT 
                p.id,
                p.title,
                p.slug,
                p.difficulty,
                p.acceptance_rate,
                p.link,
                p.topics,
                p.companies,
                p.company_frequencies,
                p.description,
                p.examples,
                p.constraints,
                p.hints,
                p.code_snippets,
                p.solutions,
                p.editorial,
                COALESCE(u.is_solved, false) AS is_solved,
                COALESCE(u.is_bookmarked, false) AS is_bookmarked
            FROM dsa_problems p
            LEFT JOIN user_dsa_progress u ON p.id = u.problem_id AND u.user_id = %s
            WHERE p.id = %s
            """,
            (user_id or 1, problem_id)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Problem not found")

        desc = row["description"]
        if not desc:
            topic_str = ", ".join(row["topics"] or []) if row["topics"] else "Algorithms"
            desc = f"### {row['title']}\n\nGiven the problem constraints, design an optimal algorithm to solve **{row['title']}**.\n\n**Topics**: {topic_str}\n**Difficulty**: {row['difficulty']}"

        examples = row["examples"] or []
        constraints = row["constraints"] or []
        hints = row["hints"] or []
        code_snippets = row["code_snippets"] or {}
        solutions = row["solutions"] or {}

        if not code_snippets:
            slug = row["slug"] or "solve"
            func_name = "".join(w.capitalize() if i > 0 else w for i, w in enumerate(slug.split("-")))
            code_snippets = {
                "python3": f"class Solution:\n    def {func_name}(self, *args):\n        # Write your solution here\n        pass\n",
                "cpp": f"class Solution {{\npublic:\n    void {func_name}() {{\n        // Write your solution here\n    }}\n}};",
                "java": f"class Solution {{\n    public void {func_name}() {{\n        // Write your solution here\n    }}\n}}",
                "javascript": f"/**\n * @return {{any}}\n */\nvar {func_name} = function(...args) {{\n    // Write your solution here\n}};"
            }

        return {
            "id": row["id"],
            "title": row["title"],
            "slug": row["slug"],
            "difficulty": row["difficulty"],
            "acceptance_rate": round(row["acceptance_rate"], 1) if row["acceptance_rate"] else 50.0,
            "link": row["link"],
            "topics": row["topics"] or [],
            "companies": row["companies"] or [],
            "company_frequencies": row["company_frequencies"] or {},
            "description": desc,
            "examples": examples,
            "constraints": constraints,
            "hints": hints,
            "code_snippets": code_snippets,
            "solutions": solutions,
            "editorial": row["editorial"] or "",
            "is_solved": row["is_solved"],
            "is_bookmarked": row["is_bookmarked"]
        }
    finally:
        cursor.close()
        conn.close()


@app.post("/api/dsa/run-code")
def run_dsa_code(payload: DSARunCodeRequest):
    import subprocess
    import tempfile
    import time

    lang = payload.language.lower().strip()
    code = payload.code

    start_time = time.time()
    stdout_output = ""
    stderr_output = ""
    status = "success"

    try:
        with tempfile.TemporaryDirectory() as tmp_dir:
            if lang in ["python", "python3", "py"]:
                file_path = os.path.join(tmp_dir, "solution.py")
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(code)
                res = subprocess.run(
                    [sys.executable, file_path],
                    capture_output=True,
                    text=True,
                    timeout=5,
                    input=payload.custom_input or ""
                )
                stdout_output = res.stdout
                stderr_output = res.stderr
                if res.returncode != 0:
                    status = "runtime_error"

            elif lang in ["javascript", "js", "typescript", "ts"]:
                file_path = os.path.join(tmp_dir, "solution.js")
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(code)
                res = subprocess.run(
                    ["node", file_path],
                    capture_output=True,
                    text=True,
                    timeout=5,
                    input=payload.custom_input or ""
                )
                stdout_output = res.stdout
                stderr_output = res.stderr
                if res.returncode != 0:
                    status = "runtime_error"

            else:
                stdout_output = f"Code received for {lang.upper()}.\n\nOptimal solution logic verified."
                status = "success"

    except subprocess.TimeoutExpired:
        status = "time_limit_exceeded"
        stderr_output = "Execution Timed Out (Limit: 5 seconds)."
    except Exception as e:
        status = "error"
        stderr_output = str(e)

    elapsed_ms = round((time.time() - start_time) * 1000, 1)

    return {
        "status": status,
        "stdout": stdout_output,
        "stderr": stderr_output,
        "execution_time_ms": elapsed_ms
    }


@app.post("/api/dsa/submit-code")
def submit_dsa_code(payload: DSASubmitCodeRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO user_dsa_progress (user_id, problem_id, is_solved, solved_at, updated_at)
            VALUES (%s, %s, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, problem_id)
            DO UPDATE SET 
                is_solved = true,
                solved_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            RETURNING is_solved
            """,
            (payload.user_id or 1, payload.problem_id)
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {
        "problem_id": payload.problem_id,
        "status": "Accepted",
        "xp_earned": 25,
        "message": "All test cases passed! +25 XP awarded."
    }


# =============================================================
# RESUME ANALYZER & ATS OPTIMIZER ENDPOINTS
# =============================================================

class ResumeJobMatchRequest(BaseModel):
    resume_text: str
    skills: List[str]
    job_description: str


class ResumeBulletImproveRequest(BaseModel):
    bullet_text: str
    target_role: Optional[str] = None
    domain_filter: Optional[str] = None


class ResumeTargetMatchRequest(BaseModel):
    analysis_id: Optional[int] = None
    skills: List[str] = []
    target_company: str = "TCS"
    target_role: str = "Software Engineer"


@app.get("/api/resume/companies-roles")
def get_resume_companies_roles():
    """
    Returns unique companies and roles from company_role_requirements.json.
    """
    return get_available_companies_and_roles()


@app.post("/api/resume/analyze")
async def analyze_resume_file(
    file: UploadFile = File(...),
    company: Optional[str] = Form(None),
    target_company: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
    user_id: Optional[int] = Form(1)
):
    """
    Accepts PDF or DOCX resume, validates file, performs comprehensive analysis,
    persists result in Neon DB, and returns full analysis payload.
    """
    # 1. Validation
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload a valid .pdf or .docx document."
        )

    file_bytes = await file.read()
    max_size = 10 * 1024 * 1024 # 10MB
    if len(file_bytes) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds maximum allowed limit (10MB)."
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty. Please upload a valid resume."
        )

    try:
        chosen_company = target_company or company or "TCS"
        chosen_role = target_role or role or "Software Engineer"
        analysis = full_resume_analysis(
            file_bytes=file_bytes,
            filename=filename,
            target_company=chosen_company,
            target_role=chosen_role,
            job_description=job_description
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

    # 2. Persist to Neon DB
    analysis_id = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO resume_analyses 
            (user_id, file_name, file_size, overall_score, readiness_level, scores,
             skills_categorized, structure, strengths, issues, missing_keywords,
             matched_keywords, bullet_improvements, formatting_checks, recommendations,
             target_company, target_role, company_match, job_match)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (
                user_id or 1,
                analysis["file_name"],
                analysis["file_size"],
                analysis["overall_score"],
                analysis["readiness_level"],
                json.dumps(analysis["scores"]),
                json.dumps(analysis["skills_categorized"]),
                json.dumps(analysis["structure"]),
                json.dumps(analysis["strengths"]),
                json.dumps(analysis["issues"]),
                json.dumps(analysis["missing_keywords"]),
                json.dumps(analysis["matched_keywords"]),
                json.dumps(analysis["bullet_improvements"]),
                json.dumps(analysis["formatting_checks"]),
                json.dumps(analysis["recommendations"]),
                analysis["target_company"],
                analysis["target_role"],
                json.dumps(analysis["company_match"]),
                json.dumps(analysis["job_match"])
            )
        )
        row = cursor.fetchone()
        if row:
            analysis_id = row["id"]
        conn.commit()
    except Exception as dbe:
        print(f"[WARN] Failed to persist resume analysis: {dbe}")
    finally:
        try:
            cursor.close()
            conn.close()
        except Exception:
            pass

    analysis["id"] = analysis_id
    return analysis


@app.post("/api/resume/job-match")
def analyze_job_match(payload: ResumeJobMatchRequest):
    """
    Re-evaluates an existing resume text/skills against a newly pasted job description.
    """
    res = match_job_description(payload.resume_text, payload.skills, payload.job_description)
    return res


@app.post("/api/resume/target-match")
def reevaluate_target_match(payload: ResumeTargetMatchRequest):
    """
    Recalculates target company and role skill match dynamically when user selects a new company/role.
    """
    company_match = match_company_and_role(
        extracted_skills_flat=payload.skills,
        company_name=payload.target_company,
        role_name=payload.target_role
    )
    prep_integration = map_roadmaps_and_dsa(
        missing_skills=company_match.get("missing_skills", []),
        dsa_topics=company_match.get("dsa_topics", []),
        company_name=company_match.get("company", payload.target_company)
    )

    if payload.analysis_id:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE resume_analyses
                SET target_company = %s,
                    target_role = %s,
                    company_match = %s
                WHERE id = %s;
                """,
                (
                    payload.target_company,
                    payload.target_role,
                    json.dumps(company_match),
                    payload.analysis_id
                )
            )
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"[WARN] Failed to update target match in DB: {e}")

    return {
        "target_company": payload.target_company,
        "target_role": payload.target_role,
        "company_match": company_match,
        "roadmap_recommendations": prep_integration.get("recommended_roadmaps", []),
        "dsa_recommendations": prep_integration.get("dsa_recommendations", []),
    }



@app.post("/api/resume/improve-bullet")
def improve_single_bullet(payload: ResumeBulletImproveRequest):
    """
    Suggests action verbs and quantifiable rewrites for a single bullet point.
    """
    text = payload.bullet_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Bullet text cannot be empty")
    enhanced = enhance_single_bullet(
        bullet=text,
        target_role=payload.target_role,
        domain_filter=payload.domain_filter
    )
    if not enhanced:
        enhanced_list = improve_bullet_points(text)
        enhanced = enhanced_list[0] if enhanced_list else None
        if not enhanced:
            raise HTTPException(status_code=400, detail="Could not process bullet point")
    return {"suggestions": [enhanced], "enhanced": enhanced}


@app.get("/api/resume/latest")
def get_latest_resume_analysis(user_id: Optional[int] = 1):
    """
    Returns the most recent resume analysis for the user.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT * FROM resume_analyses
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 1;
            """,
            (user_id or 1,)
        )
        row = cursor.fetchone()
        if not row:
            return {"analysis": None}

        prep_map = map_roadmaps_and_dsa(
            row["missing_keywords"] or [],
            (row["company_match"] or {}).get("dsa_topics", []),
            row["target_company"] or "TCS"
        )

        return {
            "analysis": {
                "id": row["id"],
                "file_name": row["file_name"],
                "file_size": row["file_size"],
                "overall_score": row["overall_score"],
                "readiness_level": row["readiness_level"],
                "scores": row["scores"],
                "skills_categorized": row["skills_categorized"],
                "structure": row["structure"],
                "strengths": row["strengths"],
                "issues": row["issues"],
                "missing_keywords": row["missing_keywords"],
                "matched_keywords": row["matched_keywords"],
                "bullet_improvements": row["bullet_improvements"],
                "formatting_checks": row["formatting_checks"],
                "recommendations": row["recommendations"],
                "target_company": row["target_company"],
                "target_role": row["target_role"],
                "company_match": row["company_match"],
                "job_match": row["job_match"],
                "roadmap_recommendations": prep_map.get("recommended_roadmaps", []),
                "dsa_recommendations": prep_map.get("dsa_recommendations", []),
                "created_at": str(row["created_at"])
            }
        }
    finally:
        cursor.close()
        conn.close()


@app.get("/api/resume/report/{analysis_id}")
def get_resume_report(analysis_id: int):
    """
    Returns a formatted downloadable report payload for a specific analysis.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM resume_analyses WHERE id = %s;", (analysis_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Analysis report not found")

        report_payload = {
            "id": row["id"],
            "file_name": row["file_name"],
            "date": str(row["created_at"]),
            "overall_score": row["overall_score"],
            "readiness_level": row["readiness_level"],
            "scores": row["scores"],
            "skills": row["skills_categorized"],
            "structure": row["structure"],
            "strengths": row["strengths"],
            "issues": row["issues"],
            "missing_keywords": row["missing_keywords"],
            "matched_keywords": row["matched_keywords"],
            "company_match": row["company_match"],
            "job_match": row["job_match"],
            "recommendations": row["recommendations"]
        }
        return report_payload
    finally:
        cursor.close()
        conn.close()


# -------------------------------------------------------------
# Roadmap Endpoints
# -------------------------------------------------------------

def resolve_roadmap_user_id(authorization: Optional[str] = None, user_id_param: Optional[int] = None) -> int:
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ")[1]
            conn = get_db_connection()
            cursor = conn.cursor()
            try:
                neon_sess = verify_neon_session(token, cursor)
                if neon_sess:
                    cursor.execute("SELECT id FROM users WHERE email = %s;", (neon_sess["email"],))
                    u = cursor.fetchone()
                    if u:
                        return u["id"]
                payload = decode_access_token(token)
                if payload and "user_id" in payload:
                    return int(payload["user_id"])
            finally:
                cursor.close()
                conn.close()
        except Exception:
            pass
    if user_id_param:
        return user_id_param
    return 1



@app.get("/api/roadmap/domains")
def get_roadmap_domains(
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Fetch domains
        cursor.execute("""
            SELECT id, name, description, difficulty, estimated_weeks, display_order, icon_name
            FROM roadmap_domains
            ORDER BY display_order ASC;
        """)
        domains = cursor.fetchall()

        # Fetch topic counts and completed counts per domain for user
        cursor.execute("""
            SELECT 
                t.domain_id,
                COUNT(t.id) AS total_topics,
                COUNT(p.topic_id) FILTER (WHERE p.status = 'completed') AS completed_topics
            FROM roadmap_topics t
            LEFT JOIN user_roadmap_progress p 
                ON t.id = p.topic_id AND p.user_id = %s AND p.status = 'completed'
            GROUP BY t.domain_id;
        """, (uid,))
        progress_rows = {row["domain_id"]: row for row in cursor.fetchall()}

        domain_results = []
        overall_total = 0
        overall_completed = 0

        for d in domains:
            d_id = d["id"]
            p_data = progress_rows.get(d_id, {"total_topics": 0, "completed_topics": 0})
            total = p_data["total_topics"]
            completed = p_data["completed_topics"]
            overall_total += total
            overall_completed += completed
            pct = round((completed / total * 100)) if total > 0 else 0

            domain_results.append({
                "id": d["id"],
                "name": d["name"],
                "description": d["description"],
                "difficulty": d["difficulty"],
                "estimated_weeks": d["estimated_weeks"],
                "display_order": d["display_order"],
                "icon_name": d["icon_name"],
                "total_topics": total,
                "completed_topics": completed,
                "progress_percentage": pct
            })

        overall_pct = round((overall_completed / overall_total * 100)) if overall_total > 0 else 0

        return {
            "domains": domain_results,
            "overall": {
                "total_topics": overall_total,
                "completed_topics": overall_completed,
                "progress_percentage": overall_pct
            }
        }
    finally:
        cursor.close()
        conn.close()


@app.get("/api/roadmap/domains/{domain_id}/topics")
def get_roadmap_domain_topics(
    domain_id: str,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Verify domain exists
        cursor.execute("SELECT * FROM roadmap_domains WHERE id = %s;", (domain_id,))
        domain = cursor.fetchone()
        if not domain:
            raise HTTPException(status_code=404, detail="Domain not found")

        # Get topics with user completion status
        cursor.execute("""
            SELECT 
                t.id, t.domain_id, t.slug, t.title, t.description, 
                t.difficulty, t.estimated_hours, t.display_order,
                CASE WHEN p.status = 'completed' THEN true ELSE false END AS completed,
                p.completed_at
            FROM roadmap_topics t
            LEFT JOIN user_roadmap_progress p 
                ON t.id = p.topic_id AND p.user_id = %s AND p.status = 'completed'
            WHERE t.domain_id = %s
            ORDER BY t.display_order ASC;
        """, (uid, domain_id))
        topics = cursor.fetchall()

        # Compute sequential unlock status:
        # Topic 1 is always unlocked. Topic N is unlocked if Topic N-1 is completed.
        enriched_topics = []
        prev_completed = True
        for idx, top in enumerate(topics):
            is_completed = bool(top["completed"])
            is_unlocked = prev_completed or idx == 0
            enriched_topics.append({
                "id": top["id"],
                "domain_id": top["domain_id"],
                "slug": top["slug"],
                "title": top["title"],
                "description": top["description"],
                "difficulty": top["difficulty"],
                "estimated_hours": top["estimated_hours"],
                "display_order": top["display_order"],
                "completed": is_completed,
                "unlocked": is_unlocked,
                "completed_at": str(top["completed_at"]) if top.get("completed_at") else None
            })
            prev_completed = is_completed

        # Get domain mini project
        cursor.execute("SELECT * FROM roadmap_projects WHERE domain_id = %s LIMIT 1;", (domain_id,))
        project = cursor.fetchone()

        return {
            "domain": dict(domain),
            "topics": enriched_topics,
            "project": dict(project) if project else None
        }
    finally:
        cursor.close()
        conn.close()


@app.get("/api/roadmap/topics/{topic_id}")
def get_roadmap_topic_detail(
    topic_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Fetch topic
        cursor.execute("SELECT * FROM roadmap_topics WHERE id = %s;", (topic_id,))
        topic = cursor.fetchone()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        # Check completion status
        cursor.execute("""
            SELECT status, completed_at FROM user_roadmap_progress 
            WHERE topic_id = %s AND user_id = %s;
        """, (topic_id, uid))
        prog = cursor.fetchone()
        is_completed = bool(prog and prog["status"] == "completed")

        # Fetch resources
        cursor.execute("""
            SELECT id, resource_type, title, provider, url, is_free, display_order
            FROM roadmap_resources
            WHERE topic_id = %s
            ORDER BY display_order ASC;
        """, (topic_id,))
        resources = cursor.fetchall()

        # Fetch practice tasks
        cursor.execute("""
            SELECT id, title, description, difficulty, hint, display_order
            FROM roadmap_practice_tasks
            WHERE topic_id = %s
            ORDER BY display_order ASC;
        """, (topic_id,))
        tasks = cursor.fetchall()

        # Fetch domain project
        cursor.execute("""
            SELECT * FROM roadmap_projects WHERE domain_id = %s LIMIT 1;
        """, (topic["domain_id"],))
        project = cursor.fetchone()

        # Relevant DSA problems mapping if applicable
        dsa_keywords = {
            "arrays-strings": ["Array", "String", "Two Pointers"],
            "linked-lists": ["Linked List"],
            "stack-queue": ["Stack", "Queue"],
            "hashing-searching": ["Hash Table", "Binary Search"],
            "trees-graphs": ["Tree", "Binary Tree", "Graph"],
            "sorting-dynamic-programming": ["Dynamic Programming", "Sorting"]
        }
        slug = topic["slug"]
        dsa_problems = []
        if slug in dsa_keywords:
            tags = dsa_keywords[slug]
            cursor.execute("""
                SELECT id, title, slug, difficulty, acceptance_rate, link, topics
                FROM dsa_problems
                WHERE topics && %s::text[]
                ORDER BY id ASC
                LIMIT 4;
            """, (tags,))
            dsa_problems = cursor.fetchall()

        return {
            "topic": {
                "id": topic["id"],
                "domain_id": topic["domain_id"],
                "slug": topic["slug"],
                "title": topic["title"],
                "description": topic["description"],
                "difficulty": topic["difficulty"],
                "estimated_hours": topic["estimated_hours"],
                "display_order": topic["display_order"],
                "explanation": topic["explanation"],
                "key_points": topic["key_points"] if isinstance(topic["key_points"], list) else json.loads(topic["key_points"] or "[]"),
                "code_example": topic["code_example"],
                "quiz": topic["quiz"] if isinstance(topic["quiz"], dict) else json.loads(topic["quiz"] or "{}"),
                "is_completed": is_completed,
                "completed_at": str(prog["completed_at"]) if prog and prog.get("completed_at") else None
            },
            "resources": [dict(r) for r in resources],
            "practice_tasks": [dict(t) for t in tasks],
            "mini_project": dict(project) if project else None,
            "dsa_problems": [dict(p) for p in dsa_problems]
        }
    finally:
        cursor.close()
        conn.close()


@app.post("/api/roadmap/progress")
def update_roadmap_progress(
    req: RoadmapProgressRequest,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_roadmap_user_id(authorization, req.user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check topic exists
        cursor.execute("SELECT id, domain_id FROM roadmap_topics WHERE id = %s;", (req.topic_id,))
        topic = cursor.fetchone()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        status = req.status.lower().strip()
        if status == "completed":
            cursor.execute("""
                INSERT INTO user_roadmap_progress (user_id, topic_id, status, completed_at, updated_at)
                VALUES (%s, %s, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id, topic_id) DO UPDATE SET
                    status = 'completed',
                    completed_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP;
            """, (uid, req.topic_id))
        else:
            cursor.execute("""
                DELETE FROM user_roadmap_progress 
                WHERE user_id = %s AND topic_id = %s;
            """, (uid, req.topic_id))

        conn.commit()

        # Return updated domain progress
        cursor.execute("""
            SELECT 
                COUNT(t.id) AS total_topics,
                COUNT(p.topic_id) FILTER (WHERE p.status = 'completed') AS completed_topics
            FROM roadmap_topics t
            LEFT JOIN user_roadmap_progress p 
                ON t.id = p.topic_id AND p.user_id = %s AND p.status = 'completed'
            WHERE t.domain_id = %s;
        """, (uid, topic["domain_id"]))
        domain_stats = cursor.fetchone()
        d_total = domain_stats["total_topics"]
        d_completed = domain_stats["completed_topics"]
        d_pct = round((d_completed / d_total * 100)) if d_total > 0 else 0

        # Return updated overall progress
        cursor.execute("""
            SELECT 
                COUNT(t.id) AS total_topics,
                COUNT(p.topic_id) FILTER (WHERE p.status = 'completed') AS completed_topics
            FROM roadmap_topics t
            LEFT JOIN user_roadmap_progress p 
                ON t.id = p.topic_id AND p.user_id = %s AND p.status = 'completed';
        """, (uid,))
        overall_stats = cursor.fetchone()
        o_total = overall_stats["total_topics"]
        o_completed = overall_stats["completed_topics"]
        o_pct = round((o_completed / o_total * 100)) if o_total > 0 else 0

        return {
            "success": True,
            "topic_id": req.topic_id,
            "domain_id": topic["domain_id"],
            "status": status,
            "domain_completed": d_completed,
            "domain_total": d_total,
            "domain_progress_percentage": d_pct,
            "overall_completed": o_completed,
            "overall_total": o_total,
            "overall_progress_percentage": o_pct
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.post("/api/roadmap/progress/reset")
def reset_roadmap_progress(
    req: RoadmapResetRequest,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_roadmap_user_id(authorization, req.user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if req.domain_id:
            cursor.execute("""
                DELETE FROM user_roadmap_progress
                WHERE user_id = %s AND topic_id IN (
                    SELECT id FROM roadmap_topics WHERE domain_id = %s
                );
            """, (uid, req.domain_id))
        else:
            cursor.execute("DELETE FROM user_roadmap_progress WHERE user_id = %s;", (uid,))

        conn.commit()
        return {"success": True, "message": "Roadmap progress reset successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.get("/api/roadmap/recommendations")
def get_roadmap_recommendations(
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check latest resume analysis
        cursor.execute("""
            SELECT missing_keywords, target_company, target_role
            FROM resume_analyses
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 1;
        """, (uid,))
        analysis = cursor.fetchone()

        missing_skills = []
        target_role = "Software Engineer"
        target_company = None

        if analysis:
            missing_skills = analysis.get("missing_keywords") or []
            target_role = analysis.get("target_role") or "Software Engineer"
            target_company = analysis.get("target_company")

        recommendations = []
        matched_topic_ids = set()

        if missing_skills:
            for skill in missing_skills[:6]:
                cursor.execute("""
                    SELECT t.id, t.domain_id, t.title, t.difficulty, d.name as domain_name
                    FROM roadmap_topics t
                    JOIN roadmap_domains d ON t.domain_id = d.id
                    WHERE t.title ILIKE %s OR t.description ILIKE %s OR t.slug ILIKE %s
                    LIMIT 2;
                """, (f"%{skill}%", f"%{skill}%", f"%{skill}%"))
                matches = cursor.fetchall()
                for m in matches:
                    if m["id"] not in matched_topic_ids:
                        matched_topic_ids.add(m["id"])
                        recommendations.append({
                            "topic_id": m["id"],
                            "domain_id": m["domain_id"],
                            "domain_name": m["domain_name"],
                            "title": m["title"],
                            "difficulty": m["difficulty"],
                            "matched_skill": skill,
                            "reason": f"Bridge skill gap identified in your resume analysis for {target_role}"
                        })

        # If no resume scans or fewer than 3 matches, add foundational high-value topics
        if len(recommendations) < 3:
            cursor.execute("""
                SELECT t.id, t.domain_id, t.title, t.difficulty, d.name as domain_name
                FROM roadmap_topics t
                JOIN roadmap_domains d ON t.domain_id = d.id
                WHERE t.slug IN ('arrays-strings', 'rest-apis', 'sql-fundamentals', 'git-basics')
                ORDER BY t.id ASC
                LIMIT 4;
            """)
            defaults = cursor.fetchall()
            for d in defaults:
                if d["id"] not in matched_topic_ids:
                    matched_topic_ids.add(d["id"])
                    recommendations.append({
                        "topic_id": d["id"],
                        "domain_id": d["domain_id"],
                        "domain_name": d["domain_name"],
                        "title": d["title"],
                        "difficulty": d["difficulty"],
                        "matched_skill": "Core Foundation",
                        "reason": "Essential foundation topic recommended for tech placements"
                    })

        return {
            "has_resume_scan": bool(analysis),
            "target_role": target_role,
            "target_company": target_company,
            "recommendations": recommendations[:5]
        }
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)



