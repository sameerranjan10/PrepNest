import json
from typing import List, Optional

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from database import get_db_connection, init_db

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

    if not row or not verify_password(user_data.password, row["hashed_password"]):
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

def get_current_user_from_token(authorization: Optional[str]):
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
        user_dict["created_at"] = str(user_dict["created_at"])

    return user_dict


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
            "progressPercent": pct
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
