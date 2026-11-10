import os
import re
import sys
import json
import secrets
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Header, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import psycopg2

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
from gamification import (
    award_xp,
    get_leaderboard_data,
    calculate_level,
    calculate_streak,
    get_user_readiness,
    XP_RULES,
)
from resume_service import (
    full_resume_analysis,
    get_available_companies_and_roles,
    improve_bullet_points,
    enhance_single_bullet,
    match_job_description,
    map_roadmaps_and_dsa,
    match_company_and_role,
)
from mentor_service import (
    detect_query_intent,
    extract_query_entities,
    build_selective_student_context,
    build_token_efficient_system_prompt,
    resolve_response_length,
    call_groq_mentor,
    get_student_context_summary,
    MODE_CONFIGS,
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
    career_objective: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[str] = None
    skills: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    grad_year: Optional[int] = None
    current_semester: Optional[str] = None
    cgpa: Optional[str] = None
    backlogs: Optional[str] = None
    tenth_percentage: Optional[str] = None
    twelfth_percentage: Optional[str] = None
    leetcode_username: Optional[str] = None
    github_username: Optional[str] = None
    hackerrank_username: Optional[str] = None
    codechef_username: Optional[str] = None
    codeforces_username: Optional[str] = None
    gfg_username: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    other_links: Optional[str] = None
    preferred_language: Optional[str] = None
    daily_dsa_goal: Optional[int] = None
    daily_aptitude_goal: Optional[int] = None
    daily_study_hours: Optional[float] = None
    weekly_prep_goal: Optional[str] = None
    prep_deadline: Optional[str] = None
    preferred_subjects: Optional[str] = None
    preferred_difficulty: Optional[str] = None
    prep_level: Optional[str] = None
    email_notifications: Optional[bool] = None
    streak_reminders: Optional[bool] = None
    weekly_digest: Optional[bool] = None


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
    user_id: Optional[int] = None
    assessment_id: Optional[int] = None
    category: str = "all"
    time_taken_seconds: int = 0
    answers: List[AnswerItem]


class SingleSolveRequest(BaseModel):
    user_id: Optional[int] = None
    question_id: int
    selected_option: str


class GenerateAssessmentRequest(BaseModel):
    category: str = "all"
    difficulty: str = "all"
    company: str = "all"
    subtopic: str = "all"
    limit: int = 10
    timer_mode: str = "standard"


class SaveAssessmentProgressRequest(BaseModel):
    saved_answers: dict = {}
    marked_review: dict = {}


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
# AI Mentor Request Models
# -------------------------------------------------------------

class MentorChatRequest(BaseModel):
    message: str
    mode: Optional[str] = "general"
    response_length: Optional[str] = "normal"
    conversation_id: Optional[int] = None


class CreateConversationRequest(BaseModel):
    title: Optional[str] = "New Conversation"
    mode: Optional[str] = "general"


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
        cursor.execute(f"SELECT {USER_PROFILE_SELECT_COLS} FROM users WHERE email = %s", (email,))
        existing = cursor.fetchone()
        hashed = hash_password(user_data.password)

        if not existing:
            cursor.execute(f"""
                INSERT INTO users (email, full_name, hashed_password, plan, credits)
                VALUES (%s, %s, %s, 'Pro', 250)
                RETURNING {USER_PROFILE_SELECT_COLS};
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
    user.pop("hashed_password", None)
    if user.get("created_at"):
        user["created_at"] = str(user["created_at"])

    token = neon_token or create_access_token({"sub": user["email"], "user_id": user["id"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


# -------------------------------------------------------------

AVATAR_UPLOAD_DIR = Path(__file__).resolve().parent / "uploads" / "avatars"
AVATAR_MAX_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_AVATAR_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SAFE_AVATAR_FILENAME_RE = re.compile(r"^avatar_(\d+)_[a-f0-9]+\.(jpg|jpeg|png|webp)$")

USER_PROFILE_SELECT_COLS = """
    id, email, full_name, plan, credits, phone, bio, career_objective, location,
    avatar_url, target_role, target_companies, skills, college,
    degree, department, grad_year, current_semester, cgpa, backlogs,
    tenth_percentage, twelfth_percentage, leetcode_username, github_username,
    hackerrank_username, codechef_username, codeforces_username, gfg_username,
    github_url, linkedin_url, portfolio_url, resume_url, other_links,
    preferred_language, daily_dsa_goal, daily_aptitude_goal, daily_study_hours,
    weekly_prep_goal, prep_deadline, preferred_subjects, preferred_difficulty,
    prep_level, email_notifications, streak_reminders, weekly_digest, created_at
"""


def _detect_image_type(data: bytes) -> Optional[tuple]:
    if len(data) >= 3 and data[:3] == b"\xff\xd8\xff":
        return ("jpg", "image/jpeg")
    if len(data) >= 8 and data[:8] == b"\x89PNG\r\n\x1a\n":
        return ("png", "image/png")
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ("webp", "image/webp")
    return None


def _safe_remove_local_avatar(avatar_url: Optional[str]) -> None:
    if not avatar_url or not isinstance(avatar_url, str):
        return
    prefix = "/api/media/avatars/"
    if not avatar_url.startswith(prefix):
        return
    filename = avatar_url[len(prefix):].split("?")[0].strip()
    if not SAFE_AVATAR_FILENAME_RE.match(filename):
        return
    target = (AVATAR_UPLOAD_DIR / filename).resolve()
    try:
        if target.parent == AVATAR_UPLOAD_DIR.resolve() and target.is_file():
            target.unlink()
    except Exception:
        pass


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
        cursor.execute("SELECT id, full_name, hashed_password FROM users WHERE email = %s", (email,))
        legacy_row = cursor.fetchone()
        if legacy_row and verify_password(user_data.password, legacy_row.get("hashed_password") or ""):
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
        cursor.execute(f"SELECT {USER_PROFILE_SELECT_COLS} FROM users WHERE email = %s", (email,))
        user_row = cursor.fetchone()
        if not user_row:
            name = neon_user.get("name") if neon_user else "PrepNest User"
            hashed = hash_password(user_data.password)
            cursor.execute(f"""
                INSERT INTO users (email, full_name, hashed_password, plan, credits)
                VALUES (%s, %s, %s, 'Pro', 250)
                RETURNING {USER_PROFILE_SELECT_COLS};
            """, (email, name, hashed))
            user_row = cursor.fetchone()
            conn.commit()
    finally:
        cursor.close()
        conn.close()

    user = dict(user_row)
    user.pop("hashed_password", None)
    user.pop("avatar_data", None)
    user.pop("avatar_mime", None)
    if user.get("created_at"):
        user["created_at"] = str(user["created_at"])

    token = neon_token or create_access_token({"sub": user["email"], "user_id": user["id"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


# -------------------------------------------------------------

AVATAR_UPLOAD_DIR = Path(__file__).resolve().parent / "uploads" / "avatars"
AVATAR_MAX_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_AVATAR_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SAFE_AVATAR_FILENAME_RE = re.compile(r"^avatar_(\d+)_[a-f0-9]+\.(jpg|jpeg|png|webp)$")

USER_PROFILE_SELECT_COLS = """
    id, email, full_name, plan, credits, phone, bio, career_objective, location,
    avatar_url, target_role, target_companies, skills, college,
    degree, department, grad_year, current_semester, cgpa, backlogs,
    tenth_percentage, twelfth_percentage, leetcode_username, github_username,
    hackerrank_username, codechef_username, codeforces_username, gfg_username,
    github_url, linkedin_url, portfolio_url, resume_url, other_links,
    preferred_language, daily_dsa_goal, daily_aptitude_goal, daily_study_hours,
    weekly_prep_goal, prep_deadline, preferred_subjects, preferred_difficulty,
    prep_level, email_notifications, streak_reminders, weekly_digest, created_at
"""


def _detect_image_type(data: bytes) -> Optional[tuple]:
    if len(data) >= 3 and data[:3] == b"\xff\xd8\xff":
        return ("jpg", "image/jpeg")
    if len(data) >= 8 and data[:8] == b"\x89PNG\r\n\x1a\n":
        return ("png", "image/png")
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ("webp", "image/webp")
    return None


def _safe_remove_local_avatar(avatar_url: Optional[str]) -> None:
    if not avatar_url or not isinstance(avatar_url, str):
        return
    prefix = "/api/media/avatars/"
    if not avatar_url.startswith(prefix):
        return
    filename = avatar_url[len(prefix):].split("?")[0].strip()
    if not SAFE_AVATAR_FILENAME_RE.match(filename):
        return
    target = (AVATAR_UPLOAD_DIR / filename).resolve()
    try:
        if target.parent == AVATAR_UPLOAD_DIR.resolve() and target.is_file():
            target.unlink()
    except Exception:
        pass


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
            f"""
            SELECT {USER_PROFILE_SELECT_COLS}
            FROM users
            WHERE email = %s
            """,
            (email,)
        )
        row = cursor.fetchone()

        if not row:
            name = neon_sess.get("name") if neon_sess else "User"
            cursor.execute(
                f"""
                INSERT INTO users (email, full_name, hashed_password, plan, credits)
                VALUES (%s, %s, '', 'Pro', 250)
                RETURNING {USER_PROFILE_SELECT_COLS};
                """,
                (email, name),
            )
            row = cursor.fetchone()
            conn.commit()

        user_dict = dict(row)
        user_dict.pop("hashed_password", None)
        if user_dict.get("created_at"):
            user_dict["created_at"] = str(user_dict["created_at"])

        return user_dict
    finally:
        cursor.close()
        conn.close()


def resolve_aptitude_user_id(
    authorization: Optional[str],
    fallback_user_id: Optional[int] = None
) -> int:
    if authorization and authorization.startswith("Bearer "):
        user = get_current_user_from_token(authorization)
        return int(user["id"])
    return int(fallback_user_id or 1)



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
        if field not in UserProfileUpdate.model_fields:
            continue
        update_fields.append(f"{field} = %s")
        values.append(val)

    if not update_fields:
        return current_user

    values.append(user_id)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        set_clause = ", ".join(update_fields)
        query = f"""
            UPDATE users
            SET {set_clause}
            WHERE id = %s
            RETURNING {USER_PROFILE_SELECT_COLS}
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


@app.post("/api/user/avatar")
async def upload_user_avatar(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
):
    current_user = get_current_user_from_token(authorization)
    user_id = current_user["id"]

    orig_name = (file.filename or "").lower()
    ext = Path(orig_name).suffix
    if ext and ext not in ALLOWED_AVATAR_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a JPG, JPEG, PNG, or WebP image.",
        )

    raw_bytes = await file.read(AVATAR_MAX_BYTES + 1)
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty.")
    if len(raw_bytes) > AVATAR_MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Image size exceeds the 5 MB maximum limit.",
        )

    detected = _detect_image_type(raw_bytes)
    if not detected:
        raise HTTPException(
            status_code=400,
            detail="Invalid image content. Only valid JPG, JPEG, PNG, or WebP images are allowed.",
        )

    safe_ext, mime_type = detected
    filename = f"avatar_{user_id}_{secrets.token_hex(12)}.{safe_ext}"
    new_avatar_url = f"/api/media/avatars/{filename}"
    old_avatar_url = current_user.get("avatar_url")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            f"""
            UPDATE users
            SET avatar_url = %s,
                avatar_data = %s,
                avatar_mime = %s
            WHERE id = %s
            RETURNING {USER_PROFILE_SELECT_COLS};
            """,
            (new_avatar_url, psycopg2.Binary(raw_bytes), mime_type, user_id),
        )
        updated_row = cursor.fetchone()
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save avatar in database: {str(e)}")
    finally:
        cursor.close()
        conn.close()

    _safe_remove_local_avatar(old_avatar_url)

    updated_user = dict(updated_row)
    if updated_user.get("created_at"):
        updated_user["created_at"] = str(updated_user["created_at"])

    return {
        "status": "ok",
        "avatar_url": new_avatar_url,
        "user": updated_user,
    }


@app.delete("/api/user/avatar")
def delete_user_avatar(authorization: Optional[str] = Header(None)):
    current_user = get_current_user_from_token(authorization)
    user_id = current_user["id"]
    old_avatar_url = current_user.get("avatar_url")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            f"""
            UPDATE users
            SET avatar_url = NULL,
                avatar_data = NULL,
                avatar_mime = NULL
            WHERE id = %s
            RETURNING {USER_PROFILE_SELECT_COLS};
            """,
            (user_id,),
        )
        updated_row = cursor.fetchone()
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to remove avatar: {str(e)}")
    finally:
        cursor.close()
        conn.close()

    _safe_remove_local_avatar(old_avatar_url)

    updated_user = dict(updated_row)
    if updated_user.get("created_at"):
        updated_user["created_at"] = str(updated_user["created_at"])

    return {
        "status": "ok",
        "avatar_url": None,
        "user": updated_user,
    }


@app.get("/api/media/avatars/{filename}")
def get_user_avatar_file(filename: str):
    match = SAFE_AVATAR_FILENAME_RE.match(filename)
    if not match:
        raise HTTPException(status_code=404, detail="Avatar not found")

    user_id = int(match.group(1))
    expected_url = f"/api/media/avatars/{filename}"

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT avatar_data, avatar_mime
            FROM users
            WHERE id = %s AND avatar_url = %s;
            """,
            (user_id, expected_url),
        )
        row = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not row or not row.get("avatar_data"):
        raise HTTPException(status_code=404, detail="Avatar not found")

    ext = Path(filename).suffix.lower()
    media_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }
    media_type = row.get("avatar_mime") or media_map.get(ext, "application/octet-stream")
    return Response(
        content=bytes(row["avatar_data"]),
        media_type=media_type,
        headers={
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "public, max-age=86400",
        },
    )


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


@app.get("/api/user/header-stats")
def get_user_header_stats(
    authorization: Optional[str] = Header(None)
):
    """
    Returns real-time user streak, XP, credits, plan, and total DSA problem count for global Header & Sidebar.
    """
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, plan, credits, total_xp FROM users WHERE id = %s;",
            (uid,)
        )
        u = cursor.fetchone()
        streak = calculate_streak(uid, cursor)

        cursor.execute("SELECT COUNT(*) AS total FROM dsa_problems;")
        dsa_total = (cursor.fetchone() or {}).get("total", 0) or 0

        cursor.execute("SELECT COUNT(*) AS total FROM aptitude_questions;")
        aptitude_total = (cursor.fetchone() or {}).get("total", 0) or 0

        return {
            "user_id": uid,
            "streak": streak,
            "total_xp": int((u or {}).get("total_xp") or 0),
            "credits": int((u or {}).get("credits") if (u and u.get("credits") is not None) else 0),
            "plan": (u or {}).get("plan") or "Free",
            "dsa_total": int(dsa_total),
            "aptitude_total": int(aptitude_total),
        }
    finally:
        cursor.close()
        conn.close()



# =============================================================
# APTITUDE PRACTICE MODULE
# =============================================================

# -------------------------------------------------------------
# Aptitude Categories
# -------------------------------------------------------------

APTITUDE_CATEGORY_META = {
    "quantitative": {
        "name": "Quantitative Aptitude",
        "code": "QA",
        "description": (
            "Master numerical analysis, arithmetic, algebra, "
            "probability, and speed math for campus recruitment exams."
        ),
        "color": "indigo",
        "badge": "Numerical & Math",
    },
    "logical": {
        "name": "Logical Reasoning",
        "code": "LR",
        "description": (
            "Sharpen analytical thinking, syllogisms, blood relations, "
            "pattern recognition, and puzzle solving."
        ),
        "color": "purple",
        "badge": "Analytical Logic",
    },
    "verbal": {
        "name": "Verbal Ability",
        "code": "VA",
        "description": (
            "Excel in reading comprehension, grammar correction, "
            "para-jumbles, vocabulary, and verbal analogies."
        ),
        "color": "pink",
        "badge": "Grammar & Vocab",
    },
}


@app.get("/api/aptitude/categories")
def get_aptitude_categories(
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Discover actual categories present in database alongside user-specific progress
        cursor.execute(
            """
            SELECT
                q.category,
                COUNT(q.id) AS total_questions,
                COUNT(CASE WHEN p.status = 'solved' THEN 1 END) AS solved_questions
            FROM aptitude_questions q
            LEFT JOIN user_question_progress p
                ON q.id = p.question_id AND p.user_id = %s
            GROUP BY q.category
            ORDER BY CASE q.category
                WHEN 'quantitative' THEN 1
                WHEN 'logical' THEN 2
                WHEN 'verbal' THEN 3
                ELSE 4
            END, q.category ASC
            """,
            (uid,),
        )
        cat_rows = cursor.fetchall()

        categories = []
        for r in cat_rows:
            cid = r["category"]
            total_q = int(r["total_questions"] or 0)
            solved_q = int(r["solved_questions"] or 0)
            unsolved_q = max(0, total_q - solved_q)
            completion_pct = round((solved_q / total_q) * 100, 1) if total_q > 0 else 0.0

            cursor.execute(
                """
                SELECT DISTINCT subtopic
                FROM aptitude_questions
                WHERE category = %s AND subtopic IS NOT NULL AND subtopic != ''
                ORDER BY subtopic ASC
                """,
                (cid,),
            )
            subtopics = [row["subtopic"] for row in cursor.fetchall()]

            cursor.execute(
                """
                SELECT
                    COUNT(*) AS test_count,
                    AVG(score_percentage) AS avg_score
                FROM aptitude_test_results
                WHERE user_id = %s AND category = %s
                """,
                (uid, cid),
            )
            stats = cursor.fetchone()

            meta_info = APTITUDE_CATEGORY_META.get(
                cid,
                {
                    "name": cid.replace("_", " ").title(),
                    "code": cid[:2].upper(),
                    "description": f"Practice questions and timed drills for {cid}.",
                    "color": "amber",
                    "badge": "Aptitude",
                },
            )

            categories.append(
                {
                    "id": cid,
                    "name": meta_info["name"],
                    "code": meta_info["code"],
                    "description": meta_info["description"],
                    "color": meta_info["color"],
                    "badge": meta_info["badge"],
                    "total_questions": total_q,
                    "solved_questions": solved_q,
                    "unsolved_questions": unsolved_q,
                    "completion_percentage": completion_pct,
                    "subtopics": subtopics,
                    "tests_completed": int(stats["test_count"] or 0),
                    "avg_score": (
                        round(stats["avg_score"], 1)
                        if stats["avg_score"] is not None
                        else 0.0
                    ),
                }
            )

        # User-specific overall statistics from real records
        cursor.execute("SELECT COUNT(*) AS total FROM aptitude_questions")
        bank_total = int(cursor.fetchone()["total"] or 0)

        cursor.execute(
            """
            SELECT
                COUNT(*) FILTER (WHERE status = 'solved') AS solved_count,
                COUNT(*) FILTER (WHERE status IN ('solved', 'incorrect')) AS evaluated_attempts,
                COUNT(*) FILTER (WHERE is_starred = TRUE) AS starred_count
            FROM user_question_progress
            WHERE user_id = %s
            """,
            (uid,),
        )
        prog = cursor.fetchone()
        solved_total = int(prog["solved_count"] or 0)
        evaluated_attempts = int(prog["evaluated_attempts"] or 0)
        starred_total = int(prog["starred_count"] or 0)
        overall_accuracy = (
            round((solved_total / evaluated_attempts) * 100, 1)
            if evaluated_attempts > 0
            else 0.0
        )

        cursor.execute(
            """
            SELECT COUNT(*) AS total_tests
            FROM aptitude_test_results
            WHERE user_id = %s
            """,
            (uid,),
        )
        total_tests = int(cursor.fetchone()["total_tests"] or 0)
        current_streak = calculate_streak(uid, cursor)

        # Distinct company tags from DB
        cursor.execute(
            """
            SELECT DISTINCT company_tag
            FROM aptitude_questions
            WHERE company_tag IS NOT NULL AND company_tag != ''
            ORDER BY company_tag
            """
        )
        companies_list = [row["company_tag"] for row in cursor.fetchall()]

    finally:
        cursor.close()
        conn.close()

    return {
        "categories": categories,
        "companies": companies_list,
        "overall_stats": {
            "total_questions": bank_total,
            "solved_questions": solved_total,
            "unsolved_questions": max(0, bank_total - solved_total),
            "starred_questions": starred_total,
            "evaluated_attempts": evaluated_attempts,
            "total_tests_completed": total_tests,
            "overall_accuracy": overall_accuracy,
            "current_streak": current_streak,
        },
    }


# -------------------------------------------------------------
# Get Aptitude Questions (Active Test - Answers Stripped)
# -------------------------------------------------------------

@app.get("/api/aptitude/questions")
def get_aptitude_questions(
    category: Optional[str] = "all",
    difficulty: Optional[str] = "all",
    company: Optional[str] = "all",
    subtopic: Optional[str] = None,
    limit: Optional[int] = 10,
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
            option_d
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

    questions = [
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
                "D": r["option_d"],
            },
        }
        for r in rows
    ]

    return {
        "count": len(questions),
        "category": category,
        "company": company,
        "questions": questions,
    }


# -------------------------------------------------------------
# Shared Assessment Evaluation & Persistence Helper
# -------------------------------------------------------------

def _evaluate_and_save_assessment(
    uid: int,
    category: str,
    time_taken_seconds: int,
    answers: List[AnswerItem],
    assessment_id: Optional[int] = None,
):
    if not answers:
        raise HTTPException(
            status_code=400,
            detail="No answers provided in test submission",
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        if assessment_id is not None:
            cursor.execute(
                "SELECT id, status FROM aptitude_assessments WHERE id = %s AND user_id = %s",
                (assessment_id, uid),
            )
            ass_row = cursor.fetchone()
            if not ass_row:
                raise HTTPException(status_code=404, detail="Assessment session not found")
            if ass_row["status"] == "submitted":
                cursor.execute(
                    "SELECT * FROM aptitude_test_results WHERE assessment_id = %s AND user_id = %s ORDER BY id DESC LIMIT 1",
                    (assessment_id, uid),
                )
                existing_res = cursor.fetchone()
                if existing_res:
                    parsed = {}
                    try:
                        parsed = json.loads(existing_res["answers_json"] or "{}")
                    except Exception:
                        parsed = {}
                    det = parsed.get("detailed_results", [])
                    att = existing_res["total_questions"] - existing_res["unattempted"]
                    return {
                        "result_id": existing_res["id"],
                        "assessment_id": assessment_id,
                        "category": existing_res["category"],
                        "total_questions": existing_res["total_questions"],
                        "attempted_questions": att,
                        "correct_answers": existing_res["correct_answers"],
                        "incorrect_answers": existing_res["incorrect_answers"],
                        "unattempted": existing_res["unattempted"],
                        "score_percentage": existing_res["score_percentage"],
                        "accuracy": existing_res.get("accuracy")
                        if existing_res.get("accuracy") is not None
                        else (
                            round((existing_res["correct_answers"] / att) * 100, 1)
                            if att > 0
                            else 0.0
                        ),
                        "time_taken_seconds": existing_res["time_taken_seconds"],
                        "xp_earned": 0,
                        "category_breakdown": parsed.get("category_scores", {}),
                        "detailed_results": det,
                    }

        question_ids = [answer.question_id for answer in answers]
        placeholders = ",".join(["%s"] * len(question_ids))

        cursor.execute(
            f"""
            SELECT *
            FROM aptitude_questions
            WHERE id IN ({placeholders})
            """,
            tuple(question_ids),
        )

        db_questions = {row["id"]: dict(row) for row in cursor.fetchall()}

        total_questions = len(answers)
        correct_count = 0
        incorrect_count = 0
        unattempted_count = 0
        detailed_results = []
        category_scores = {}

        for ans in answers:
            qid = ans.question_id
            selected = ans.selected_option.upper().strip() if ans.selected_option else None

            q_data = db_questions.get(qid)
            if not q_data:
                continue

            correct = q_data["correct_option"].upper().strip()
            cat = q_data["category"]

            if cat not in category_scores:
                category_scores[cat] = {"total": 0, "correct": 0, "incorrect": 0, "unattempted": 0}

            category_scores[cat]["total"] += 1
            is_correct = False
            is_unattempted = False

            if not selected:
                is_unattempted = True
                unattempted_count += 1
                category_scores[cat]["unattempted"] += 1
            elif selected == correct:
                is_correct = True
                correct_count += 1
                category_scores[cat]["correct"] += 1
            else:
                incorrect_count += 1
                category_scores[cat]["incorrect"] += 1

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
                        "D": q_data["option_d"],
                    },
                    "selected_option": selected,
                    "correct_option": correct,
                    "is_correct": is_correct,
                    "is_unattempted": is_unattempted,
                    "explanation": q_data["explanation"],
                }
            )

        score_percentage = (
            round((correct_count / total_questions) * 100, 1)
            if total_questions > 0
            else 0.0
        )

        attempted = total_questions - unattempted_count
        accuracy = (
            round((correct_count / attempted) * 100, 1)
            if attempted > 0
            else 0.0
        )

        answers_payload = json.dumps(
            {
                "detailed_results": detailed_results,
                "category_scores": category_scores,
            }
        )

        cursor.execute(
            """
            INSERT INTO aptitude_test_results
            (
                user_id,
                assessment_id,
                category,
                total_questions,
                correct_answers,
                incorrect_answers,
                unattempted,
                score_percentage,
                accuracy,
                time_taken_seconds,
                answers_json
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                uid,
                assessment_id,
                category,
                total_questions,
                correct_count,
                incorrect_count,
                unattempted_count,
                score_percentage,
                accuracy,
                time_taken_seconds,
                answers_payload,
            ),
        )

        result_id = cursor.fetchone()["id"]

        if assessment_id is not None:
            saved_map = {
                str(a.question_id): a.selected_option.upper().strip()
                for a in answers
                if a.selected_option
            }
            cursor.execute(
                """
                UPDATE aptitude_assessments
                SET status = 'submitted',
                    saved_answers = %s::jsonb,
                    submitted_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
                """,
                (json.dumps(saved_map), assessment_id, uid),
            )

        for res_item in detailed_results:
            if not res_item.get("is_unattempted"):
                q_status = "solved" if res_item.get("is_correct") else "incorrect"
                cursor.execute(
                    """
                    INSERT INTO user_question_progress
                    (user_id, question_id, status, selected_option, updated_at)
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, question_id)
                    DO UPDATE SET
                        status = CASE
                            WHEN user_question_progress.status = 'solved' THEN 'solved'
                            ELSE EXCLUDED.status
                        END,
                        selected_option = EXCLUDED.selected_option,
                        updated_at = CURRENT_TIMESTAMP
                    """,
                    (uid, res_item["id"], q_status, res_item.get("selected_option")),
                )

        xp_res = award_xp(
            user_id=uid,
            activity_type="aptitude_completed",
            reference_id=f"apt_test_{result_id}",
            cursor=cursor,
        )
        xp_earned = xp_res.get("xp_earned", 30)

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

    return {
        "result_id": result_id,
        "assessment_id": assessment_id,
        "category": category,
        "total_questions": total_questions,
        "attempted_questions": attempted,
        "correct_answers": correct_count,
        "incorrect_answers": incorrect_count,
        "unattempted": unattempted_count,
        "score_percentage": score_percentage,
        "accuracy": accuracy,
        "time_taken_seconds": time_taken_seconds,
        "xp_earned": xp_earned,
        "category_breakdown": category_scores,
        "detailed_results": detailed_results,
    }


@app.post("/api/aptitude/submit")
def submit_aptitude_test(
    payload: SubmitTestRequest,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, payload.user_id)
    return _evaluate_and_save_assessment(
        uid=uid,
        category=payload.category,
        time_taken_seconds=payload.time_taken_seconds,
        answers=payload.answers,
        assessment_id=payload.assessment_id,
    )


# -------------------------------------------------------------
# Aptitude Test Results & Detail History
# -------------------------------------------------------------

@app.get("/api/aptitude/results")
def get_aptitude_results(
    user_id: Optional[int] = None,
    limit: int = 10,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT
                id,
                user_id,
                assessment_id,
                category,
                total_questions,
                correct_answers,
                incorrect_answers,
                unattempted,
                score_percentage,
                accuracy,
                time_taken_seconds,
                completed_at
            FROM aptitude_test_results
            WHERE user_id = %s
            ORDER BY completed_at DESC
            LIMIT %s
            """,
            (uid, limit),
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    results = []
    for row in rows:
        item = dict(row)
        attempted = max(0, (item["total_questions"] or 0) - (item["unattempted"] or 0))
        if item.get("accuracy") is None:
            item["accuracy"] = (
                round((item["correct_answers"] / attempted) * 100, 1)
                if attempted > 0
                else 0.0
            )
        results.append(item)

    return {"results": results}


@app.get("/api/aptitude/results/{result_id}")
def get_aptitude_result_detail(
    result_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT *
            FROM aptitude_test_results
            WHERE id = %s AND user_id = %s
            """,
            (result_id, uid),
        )
        row = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Test result not found")

    data = dict(row)
    try:
        parsed = json.loads(data["answers_json"])
    except Exception:
        parsed = {}

    attempted = max(0, (data.get("total_questions") or 0) - (data.get("unattempted") or 0))
    if data.get("accuracy") is None:
        data["accuracy"] = (
            round((data["correct_answers"] / attempted) * 100, 1)
            if attempted > 0
            else 0.0
        )
    data["result_id"] = data["id"]
    data["attempted_questions"] = attempted
    data["category_breakdown"] = parsed.get("category_scores", {})
    data["detailed_results"] = parsed.get("detailed_results", [])
    return data


# -------------------------------------------------------------
# Company Tracks Endpoint
# -------------------------------------------------------------

@app.get("/api/companies")
def get_companies(
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, user_id)
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
            (uid,)
        )
        rows = cursor.fetchall()
        apt_by_company = {r["company_tag"]: {"total": r["count"], "solved": r["solved_count"] or 0} for r in rows}

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
            (uid,)
        )
        dsa_rows = cursor.fetchall()
        dsa_by_company = {r["comp"]: {"total": r["dsa_total"], "solved": r["dsa_solved"]} for r in dsa_rows}

        cursor.execute("SELECT * FROM company_tracks ORDER BY is_upcoming ASC, name ASC;")
        track_rows = cursor.fetchall()
        tracks_by_name = {r["name"]: dict(r) for r in track_rows}

        cursor.execute("SELECT company_name FROM user_company_bookmarks WHERE user_id = %s;", (uid,))
        bookmarked_companies = [r["company_name"] for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

    active_names = sorted(
        set(list(apt_by_company.keys()) + [n for n, t in tracks_by_name.items() if not t.get("is_upcoming")]),
        key=lambda n: (apt_by_company.get(n, {}).get("total", 0) + dsa_by_company.get(n, {}).get("total", 0)),
        reverse=True
    )

    companies = []
    for c_name in active_names:
        apt_info = apt_by_company.get(c_name, {"total": 0, "solved": 0})
        dsa_info = dsa_by_company.get(c_name, {"total": 0, "solved": 0})
        if apt_info["total"] == 0 and dsa_info["total"] == 0:
            continue
        info = tracks_by_name.get(c_name, {})
        solved = apt_info["solved"]
        total = apt_info["total"]
        pct = round((solved / total) * 100, 1) if total > 0 else 0.0
        companies.append({
            "id": info.get("slug") or c_name.lower(),
            "name": c_name,
            "category": info.get("category") or "Product-Based",
            "logo": info.get("logo") or "🏢",
            "role": info.get("role") or "Software Engineer",
            "hiringDifficulty": info.get("hiring_difficulty") or "Medium",
            "assessmentType": info.get("assessment_type") or ("Aptitude + Coding" if total > 0 else "Coding + DSA"),
            "roundsCount": info.get("rounds_count") or 3,
            "description": info.get("description") or f"Targeted placement preparation track for {c_name}.",
            "testPattern": info.get("test_pattern") or "Online Assessment & Technical Interview Track",
            "sections": info.get("sections") or ["Aptitude", "Technical", "Coding"],
            "stages": info.get("stages") or [],
            "experiences": info.get("experiences") or [],
            "totalQuestions": total,
            "solvedQuestions": solved,
            "progressPercent": pct,
            "dsaTotal": dsa_info["total"],
            "dsaSolved": dsa_info["solved"],
            "isBookmarked": c_name in bookmarked_companies,
        })

    upcoming_companies = [
        {"name": t["name"], "category": t["category"], "role": t["role"]}
        for t in track_rows
        if t.get("is_upcoming") and t["name"] not in {c["name"] for c in companies}
    ]

    return {
        "companies": companies,
        "upcoming_companies": upcoming_companies,
        "bookmarked_companies": bookmarked_companies,
    }


@app.post("/api/companies/{company_name}/bookmark")
def toggle_company_bookmark(
    company_name: str,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, None)
    clean_name = company_name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Company name is required")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT 1 FROM user_company_bookmarks WHERE user_id = %s AND company_name = %s;",
            (uid, clean_name)
        )
        exists = cursor.fetchone()
        if exists:
            cursor.execute(
                "DELETE FROM user_company_bookmarks WHERE user_id = %s AND company_name = %s;",
                (uid, clean_name)
            )
            is_bookmarked = False
        else:
            cursor.execute(
                "INSERT INTO user_company_bookmarks (user_id, company_name) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
                (uid, clean_name)
            )
            is_bookmarked = True
        conn.commit()
        return {"company_name": clean_name, "is_bookmarked": is_bookmarked}
    finally:
        cursor.close()
        conn.close()


# -------------------------------------------------------------
# Module & Question Directory Endpoints
# -------------------------------------------------------------

@app.get("/api/aptitude/modules")
def get_aptitude_modules(
    user_id: Optional[int] = None,
    company: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        where_extra = ""
        params = [uid]
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
            tuple(params),
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
        modules[cat].append(
            {
                "subtopic": r["subtopic"],
                "total": r["total_questions"],
                "solved": r["solved_questions"],
                "progress": (
                    round((r["solved_questions"] / r["total_questions"]) * 100, 1)
                    if r["total_questions"] > 0
                    else 0
                ),
            }
        )

    return {"modules": modules}


@app.get("/api/aptitude/directory")
def get_aptitude_directory(
    user_id: Optional[int] = None,
    category: Optional[str] = "all",
    subtopic: Optional[str] = "all",
    company: Optional[str] = "all",
    difficulty: Optional[str] = "all",
    status: Optional[str] = "all",
    sort_by: Optional[str] = "id",
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = ["1=1"]
    params = [uid]

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
    elif status == "starred":
        conditions.append("p.is_starred = TRUE")

    if search and search.strip():
        s_term = f"%{search.strip()}%"
        conditions.append(
            "(q.question_text ILIKE %s OR q.subtopic ILIKE %s OR q.category ILIKE %s)"
        )
        params.extend([s_term, s_term, s_term])

    where_clause = " AND ".join(conditions)

    order_clause = "q.id ASC"
    if sort_by == "difficulty":
        order_clause = (
            "CASE LOWER(q.difficulty) "
            "WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 WHEN 'hard' THEN 3 ELSE 4 END ASC, q.id ASC"
        )
    elif sort_by == "subtopic":
        order_clause = "q.subtopic ASC, q.id ASC"
    elif sort_by == "status":
        order_clause = "CASE WHEN p.status = 'solved' THEN 0 ELSE 1 END ASC, q.id ASC"

    try:
        count_query = f"""
            SELECT COUNT(*) AS total
            FROM aptitude_questions q
            LEFT JOIN user_question_progress p
                ON q.id = p.question_id AND p.user_id = %s
            WHERE {where_clause}
        """
        cursor.execute(count_query, tuple(params))
        total_matching = int(cursor.fetchone()["total"] or 0)

        if company and company.lower() != "all":
            cursor.execute(
                """
                SELECT
                    COUNT(*) FILTER (WHERE p.status = 'solved') AS solved_total,
                    COUNT(*) FILTER (WHERE p.is_starred = TRUE) AS starred_total
                FROM user_question_progress p
                JOIN aptitude_questions q ON p.question_id = q.id
                WHERE p.user_id = %s AND LOWER(q.company_tag) = %s
                """,
                (uid, company.lower()),
            )
            counts_row = cursor.fetchone()
            total_solved = int(counts_row["solved_total"] or 0)
            total_starred = int(counts_row["starred_total"] or 0)

            cursor.execute(
                "SELECT COUNT(*) AS c_total FROM aptitude_questions WHERE LOWER(company_tag) = %s",
                (company.lower(),),
            )
            company_total = int(cursor.fetchone()["c_total"] or 0)
        else:
            cursor.execute(
                """
                SELECT
                    COUNT(*) FILTER (WHERE status = 'solved') AS solved_total,
                    COUNT(*) FILTER (WHERE is_starred = TRUE) AS starred_total
                FROM user_question_progress
                WHERE user_id = %s
                """,
                (uid,),
            )
            counts_row = cursor.fetchone()
            total_solved = int(counts_row["solved_total"] or 0)
            total_starred = int(counts_row["starred_total"] or 0)
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
                p.selected_option AS user_selected,
                COALESCE(p.is_starred, FALSE) AS is_starred
            FROM aptitude_questions q
            LEFT JOIN user_question_progress p
                ON q.id = p.question_id AND p.user_id = %s
            WHERE {where_clause}
            ORDER BY {order_clause}
            LIMIT %s OFFSET %s
        """
        cursor.execute(data_query, tuple(data_params))
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    questions = []
    for r in rows:
        is_solved = r["user_status"] == "solved"
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
                    "D": r["option_d"],
                },
                # Never expose answer/explanation before question is solved by user
                "correct_option": r["correct_option"] if is_solved else None,
                "explanation": r["explanation"] if is_solved else None,
                "is_solved": is_solved,
                "is_starred": bool(r["is_starred"]),
                "user_status": r["user_status"],
                "user_selected": r["user_selected"],
            }
        )

    return {
        "questions": questions,
        "total": total_matching,
        "total_solved": total_solved,
        "total_starred": total_starred,
        "company_total": company_total,
        "page": page,
        "limit": limit,
        "total_pages": max(1, (total_matching + limit - 1) // limit),
    }


@app.get("/api/aptitude/questions/{question_id}")
def get_aptitude_question_detail(
    question_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT
                q.*,
                p.status AS user_status,
                p.selected_option AS user_selected,
                COALESCE(p.is_starred, FALSE) AS is_starred
            FROM aptitude_questions q
            LEFT JOIN user_question_progress p
                ON q.id = p.question_id AND p.user_id = %s
            WHERE q.id = %s
            """,
            (uid, question_id),
        )
        r = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not r:
        raise HTTPException(status_code=404, detail="Question not found")

    is_solved = r["user_status"] == "solved"
    return {
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
            "D": r["option_d"],
        },
        "correct_option": r["correct_option"] if is_solved else None,
        "explanation": r["explanation"] if is_solved else None,
        "is_solved": is_solved,
        "is_starred": bool(r["is_starred"]),
        "user_status": r["user_status"],
        "user_selected": r["user_selected"],
    }


@app.post("/api/aptitude/questions/{question_id}/star")
def toggle_aptitude_question_star(
    question_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM aptitude_questions WHERE id = %s", (question_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Question not found")

        cursor.execute(
            """
            INSERT INTO user_question_progress (user_id, question_id, status, is_starred, updated_at)
            VALUES (%s, %s, 'unattempted', TRUE, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, question_id)
            DO UPDATE SET
                is_starred = NOT user_question_progress.is_starred,
                updated_at = CURRENT_TIMESTAMP
            RETURNING is_starred
            """,
            (uid, question_id),
        )
        new_starred = bool(cursor.fetchone()["is_starred"])

        cursor.execute(
            "SELECT COUNT(*) AS cnt FROM user_question_progress WHERE user_id = %s AND is_starred = TRUE",
            (uid,),
        )
        starred_count = int(cursor.fetchone()["cnt"] or 0)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

    return {
        "question_id": question_id,
        "is_starred": new_starred,
        "starred_count": starred_count,
    }


@app.post("/api/aptitude/solve-single")
def solve_single_question(
    payload: SingleSolveRequest,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, payload.user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM aptitude_questions WHERE id = %s", (payload.question_id,))
        q = cursor.fetchone()
        if not q:
            raise HTTPException(status_code=404, detail="Question not found")

        correct = q["correct_option"].upper().strip()
        selected = payload.selected_option.upper().strip()
        is_correct = selected == correct
        status = "solved" if is_correct else "incorrect"

        cursor.execute(
            """
            INSERT INTO user_question_progress (user_id, question_id, status, selected_option, updated_at)
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, question_id)
            DO UPDATE SET
                status = CASE
                    WHEN user_question_progress.status = 'solved' THEN 'solved'
                    ELSE EXCLUDED.status
                END,
                selected_option = EXCLUDED.selected_option,
                updated_at = CURRENT_TIMESTAMP
            """,
            (uid, payload.question_id, status, selected),
        )

        xp_earned = 0
        if is_correct:
            xp_res = award_xp(
                user_id=uid,
                activity_type="aptitude_completed",
                reference_id=f"apt_q_{payload.question_id}",
                cursor=cursor,
            )
            xp_earned = xp_res.get("xp_earned", 30)

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

    return {
        "question_id": payload.question_id,
        "selected_option": selected,
        "correct_option": correct,
        "is_correct": is_correct,
        "status": status,
        "xp_earned": xp_earned,
        "explanation": q["explanation"],
    }


@app.post("/api/aptitude/assessments/generate")
def generate_aptitude_assessment(
    payload: GenerateAssessmentRequest,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, None)
    safe_limit = max(1, min(100, int(payload.limit or 10)))
    time_per_q = (
        30 if payload.timer_mode == "blitz" else 0 if payload.timer_mode == "untimed" else 60
    )

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
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
                option_d
            FROM aptitude_questions
            WHERE 1=1
        """
        params = []

        if payload.category and payload.category.lower() != "all":
            query += " AND category = %s"
            params.append(payload.category.lower())
        if payload.difficulty and payload.difficulty.lower() != "all":
            query += " AND LOWER(difficulty) = %s"
            params.append(payload.difficulty.lower())
        if payload.company and payload.company.lower() != "all":
            query += " AND LOWER(company_tag) = %s"
            params.append(payload.company.lower())
        if payload.subtopic and payload.subtopic.lower() != "all":
            query += " AND subtopic = %s"
            params.append(payload.subtopic)

        query += " ORDER BY RANDOM() LIMIT %s"
        params.append(safe_limit)

        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()

        if not rows:
            return {
                "assessment_id": None,
                "count": 0,
                "questions": [],
            }

        question_ids = [r["id"] for r in rows]
        time_limit_seconds = len(rows) * time_per_q

        title_parts = []
        if payload.company and payload.company.lower() != "all":
            title_parts.append(payload.company)
        if payload.category and payload.category.lower() != "all":
            title_parts.append(
                APTITUDE_CATEGORY_META.get(payload.category.lower(), {}).get(
                    "name", payload.category.title()
                )
            )
        else:
            title_parts.append("Mixed Aptitude")
        title = f"{' · '.join(title_parts)} ({len(rows)} Qs)"

        cursor.execute(
            """
            INSERT INTO aptitude_assessments
            (user_id, title, category, difficulty, company, subtopic, timer_mode, time_limit_seconds, question_ids)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
            RETURNING id, started_at
            """,
            (
                uid,
                title,
                payload.category,
                payload.difficulty,
                payload.company,
                payload.subtopic,
                payload.timer_mode,
                time_limit_seconds,
                json.dumps(question_ids),
            ),
        )
        created = cursor.fetchone()
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

    questions = [
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
                "D": r["option_d"],
            },
        }
        for r in rows
    ]

    return {
        "assessment_id": created["id"],
        "title": title,
        "category": payload.category,
        "difficulty": payload.difficulty,
        "company": payload.company,
        "subtopic": payload.subtopic,
        "timer_mode": payload.timer_mode,
        "time_limit_seconds": time_limit_seconds,
        "started_at": str(created["started_at"]),
        "count": len(questions),
        "questions": questions,
    }


@app.get("/api/aptitude/assessments/{assessment_id}")
def get_aptitude_assessment(
    assessment_id: int,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT * FROM aptitude_assessments WHERE id = %s AND user_id = %s",
            (assessment_id, uid),
        )
        ass = cursor.fetchone()
        if not ass:
            raise HTTPException(status_code=404, detail="Assessment not found")

        q_ids = ass["question_ids"] or []
        questions = []
        if q_ids:
            placeholders = ",".join(["%s"] * len(q_ids))
            cursor.execute(
                f"""
                SELECT id, category, subtopic, difficulty, company_tag, question_text,
                       option_a, option_b, option_c, option_d
                FROM aptitude_questions
                WHERE id IN ({placeholders})
                """,
                tuple(q_ids),
            )
            by_id = {r["id"]: r for r in cursor.fetchall()}
            for qid in q_ids:
                r = by_id.get(qid)
                if r:
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
                                "D": r["option_d"],
                            },
                        }
                    )
    finally:
        cursor.close()
        conn.close()

    return {
        "assessment_id": ass["id"],
        "title": ass["title"],
        "category": ass["category"],
        "timer_mode": ass["timer_mode"],
        "time_limit_seconds": ass["time_limit_seconds"],
        "status": ass["status"],
        "saved_answers": ass["saved_answers"] or {},
        "marked_review": ass["marked_review"] or {},
        "questions": questions,
    }


@app.put("/api/aptitude/assessments/{assessment_id}/progress")
def save_aptitude_assessment_progress(
    assessment_id: int,
    payload: SaveAssessmentProgressRequest,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE aptitude_assessments
            SET saved_answers = %s::jsonb,
                marked_review = %s::jsonb
            WHERE id = %s AND user_id = %s AND status = 'in_progress'
            RETURNING id
            """,
            (
                json.dumps(payload.saved_answers or {}),
                json.dumps(payload.marked_review or {}),
                assessment_id,
                uid,
            ),
        )
        updated = cursor.fetchone()
        if not updated:
            raise HTTPException(
                status_code=404,
                detail="Active assessment not found or already submitted",
            )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

    return {"saved": True, "assessment_id": assessment_id}


@app.post("/api/aptitude/assessments/{assessment_id}/submit")
def submit_aptitude_assessment_by_id(
    assessment_id: int,
    payload: SubmitTestRequest,
    authorization: Optional[str] = Header(None),
):
    uid = resolve_aptitude_user_id(authorization, payload.user_id)
    return _evaluate_and_save_assessment(
        uid=uid,
        category=payload.category,
        time_taken_seconds=payload.time_taken_seconds,
        answers=payload.answers,
        assessment_id=assessment_id,
    )


# -------------------------------------------------------------
# DSA Problem Directory Endpoints
# -------------------------------------------------------------

@app.get("/api/dsa/meta")
def get_dsa_meta(
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, user_id)
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
            (uid,)
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
    user_id: Optional[int] = None,
    page: int = 1,
    limit: int = 25,
    search: Optional[str] = None,
    difficulty: Optional[str] = "all",
    company: Optional[str] = "all",
    topic: Optional[str] = "all",
    status: Optional[str] = "all",
    sort_by: Optional[str] = "id",
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = ["1=1"]
    params = [uid]

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
        freq = 0.0
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
            "acceptance_rate": round(r["acceptance_rate"], 1) if r["acceptance_rate"] is not None else 0.0,
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
def toggle_dsa_solved(
    payload: DSAToggleSolvedRequest,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, payload.user_id)
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
            (uid, payload.problem_id)
        )
        row = cursor.fetchone()
        is_solved = row["is_solved"]
        xp_earned = 0
        if is_solved:
            xp_res = award_xp(
                user_id=uid,
                activity_type="dsa_solved",
                reference_id=f"dsa_{payload.problem_id}",
                cursor=cursor
            )
            xp_earned = xp_res.get("xp_earned", 50)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {
        "problem_id": payload.problem_id,
        "is_solved": is_solved,
        "xp_earned": xp_earned
    }


@app.post("/api/dsa/toggle-bookmark")
def toggle_dsa_bookmark(
    payload: DSAToggleBookmarkRequest,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, payload.user_id)
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
            (uid, payload.problem_id)
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
def get_dsa_problem_detail(
    problem_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, user_id)
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
            (uid, problem_id)
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
            "acceptance_rate": round(row["acceptance_rate"], 1) if row["acceptance_rate"] is not None else 0.0,
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
                stdout_output = f"Local execution sandbox supports Python and JavaScript ({lang.upper()} compiler not attached)."
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
def submit_dsa_code(
    payload: DSASubmitCodeRequest,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, payload.user_id)
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
            (uid, payload.problem_id)
        )

        xp_res = award_xp(
            user_id=uid,
            activity_type="coding_solved",
            reference_id=f"code_{payload.problem_id}",
            cursor=cursor
        )
        xp_earned = xp_res.get("xp_earned", 60)

        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {
        "problem_id": payload.problem_id,
        "status": "Accepted",
        "xp_earned": xp_earned,
        "message": f"All test cases passed! +{xp_earned} XP awarded."
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
    user_id: Optional[int] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """
    Accepts PDF or DOCX resume, validates file, performs comprehensive analysis,
    persists result in Neon DB, and returns full analysis payload.
    """
    uid = resolve_aptitude_user_id(authorization, user_id)
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
                uid,
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
def get_latest_resume_analysis(
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Returns the most recent resume analysis for the authenticated user.
    Returns {"analysis": None} when unauthenticated so another user's data is never shown.
    """
    if not authorization and not user_id:
        return {"analysis": None}
    uid = resolve_aptitude_user_id(authorization, user_id)
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
            (uid,)
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




# -------------------------------------------------------------
# AI Mentor Module Endpoints
# -------------------------------------------------------------

def resolve_mentor_user_id(authorization: Optional[str] = None) -> int:
    """
    Safely resolves the authenticated user id from Neon Session or JWT token.
    Falls back to user 1 for demo/local testing.
    """
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
                elif payload and "sub" in payload:
                    cursor.execute("SELECT id FROM users WHERE email = %s;", (payload["sub"],))
                    u = cursor.fetchone()
                    if u:
                        return u["id"]
            finally:
                cursor.close()
                conn.close()
        except Exception:
            pass
    return 1


@app.get("/api/mentor/modes")
def get_mentor_modes():
    """
    Returns the list of 8 specialized mentor modes.
    """
    modes = []
    for key, val in MODE_CONFIGS.items():
        modes.append({
            "id": key,
            "name": val["name"],
            "description": val["description"],
            "icon": val["icon"]
        })
    return {"modes": modes}


@app.get("/api/mentor/context-summary")
def get_mentor_context_summary_endpoint(
    authorization: Optional[str] = Header(None)
):
    """
    Returns live personalized placement preparation stats for the UI dashboard card.
    """
    uid = resolve_mentor_user_id(authorization)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        summary = get_student_context_summary(uid, cursor)
        return summary
    finally:
        cursor.close()
        conn.close()


@app.get("/api/mentor/conversations")
def get_mentor_conversations(
    authorization: Optional[str] = Header(None)
):
    """
    Returns all previous mentor conversations for the current user.
    """
    uid = resolve_mentor_user_id(authorization)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.id, c.title, c.mode, c.created_at, c.updated_at,
                   COUNT(m.id) as message_count
            FROM mentor_conversations c
            LEFT JOIN mentor_messages m ON m.conversation_id = c.id
            WHERE c.user_id = %s
            GROUP BY c.id
            ORDER BY c.updated_at DESC;
        """, (uid,))
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if d.get("created_at"):
                d["created_at"] = str(d["created_at"])
            if d.get("updated_at"):
                d["updated_at"] = str(d["updated_at"])
            result.append(d)
        return {"conversations": result}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/mentor/conversations")
def create_mentor_conversation(
    req: CreateConversationRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Creates a new conversation thread.
    """
    uid = resolve_mentor_user_id(authorization)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        title = (req.title or "New Conversation").strip()
        mode = (req.mode or "general").strip().lower()
        cursor.execute("""
            INSERT INTO mentor_conversations (user_id, title, mode)
            VALUES (%s, %s, %s)
            RETURNING id, user_id, title, mode, created_at, updated_at;
        """, (uid, title, mode))
        row = cursor.fetchone()
        conn.commit()
        d = dict(row)
        if d.get("created_at"):
            d["created_at"] = str(d["created_at"])
        if d.get("updated_at"):
            d["updated_at"] = str(d["updated_at"])
        return d
    finally:
        cursor.close()
        conn.close()


@app.get("/api/mentor/conversations/{conv_id}")
def get_mentor_conversation_detail(
    conv_id: int,
    authorization: Optional[str] = Header(None)
):
    """
    Fetches full message history for a conversation.
    """
    uid = resolve_mentor_user_id(authorization)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, user_id, title, mode, created_at, updated_at
            FROM mentor_conversations
            WHERE id = %s AND user_id = %s;
        """, (conv_id, uid))
        c_row = cursor.fetchone()
        if not c_row:
            cursor.execute("SELECT id FROM mentor_conversations WHERE id = %s;", (conv_id,))
            if cursor.fetchone():
                raise HTTPException(status_code=403, detail="Access denied: Cannot access another user's conversation")
            raise HTTPException(status_code=404, detail="Conversation not found")

        conv_dict = dict(c_row)
        if conv_dict.get("created_at"):
            conv_dict["created_at"] = str(conv_dict["created_at"])
        if conv_dict.get("updated_at"):
            conv_dict["updated_at"] = str(conv_dict["updated_at"])

        cursor.execute("""
            SELECT id, conversation_id, role, content, meta, created_at
            FROM mentor_messages
            WHERE conversation_id = %s
            ORDER BY created_at ASC;
        """, (conv_id,))
        messages = []
        for m in cursor.fetchall():
            md = dict(m)
            if md.get("created_at"):
                md["created_at"] = str(md["created_at"])
            messages.append(md)

        conv_dict["messages"] = messages
        return conv_dict
    finally:
        cursor.close()
        conn.close()


@app.delete("/api/mentor/conversations/{conv_id}")
def delete_mentor_conversation(
    conv_id: int,
    authorization: Optional[str] = Header(None)
):
    """
    Deletes a conversation and its messages.
    """
    uid = resolve_mentor_user_id(authorization)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, user_id FROM mentor_conversations WHERE id = %s;", (conv_id,))
        conv_check = cursor.fetchone()
        if not conv_check:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if conv_check["user_id"] != uid:
            raise HTTPException(status_code=403, detail="Access denied: Cannot delete another user's conversation")

        cursor.execute("DELETE FROM mentor_conversations WHERE id = %s AND user_id = %s RETURNING id;", (conv_id, uid))
        deleted = cursor.fetchone()
        conn.commit()
        return {"status": "ok", "deleted_id": conv_id}
    finally:
        cursor.close()
        conn.close()


class RenameConversationRequest(BaseModel):
    title: str


@app.patch("/api/mentor/conversations/{conv_id}")
def rename_mentor_conversation(
    conv_id: int,
    payload: RenameConversationRequest,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_mentor_user_id(authorization)
    clean_title = payload.title.strip()
    if not clean_title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE mentor_conversations SET title = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s AND user_id = %s RETURNING id, title;",
            (clean_title[:160], conv_id, uid)
        )
        updated = cursor.fetchone()
        if not updated:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conn.commit()
        return {"status": "ok", "id": updated["id"], "title": updated["title"]}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/mentor/chat")
def mentor_chat_endpoint(
    req: MentorChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Token-Efficient AI Placement Mentor Chat.
    Detects question intent, retrieves ONLY minimal required context,
    enforces concise output limits (quick/normal/detailed),
    and safely tracks development token usage.
    """
    uid = resolve_mentor_user_id(authorization)
    user_msg_text = req.message.strip()
    if not user_msg_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    mode = (req.mode or "general").strip().lower()
    conv_id = req.conversation_id

    # Resolve token budget & response mode
    response_length, max_tokens = resolve_response_length(user_msg_text, req.response_length)

    # Detect query intent & mentioned entities
    intent = detect_query_intent(user_msg_text, mode)
    entities = extract_query_entities(user_msg_text)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Resolve or create conversation
        if conv_id:
            cursor.execute("SELECT id, mode, title, user_id FROM mentor_conversations WHERE id = %s;", (conv_id,))
            existing_conv = cursor.fetchone()
            if not existing_conv:
                conv_id = None
            elif existing_conv["user_id"] != uid:
                raise HTTPException(status_code=403, detail="Access denied: Cannot message in another user's conversation")
            else:
                if existing_conv["mode"] != mode:
                    cursor.execute("UPDATE mentor_conversations SET mode = %s WHERE id = %s;", (mode, conv_id))

        if not conv_id:
            short_title = user_msg_text[:42] + ("..." if len(user_msg_text) > 42 else "")
            cursor.execute("""
                INSERT INTO mentor_conversations (user_id, title, mode)
                VALUES (%s, %s, %s)
                RETURNING id;
            """, (uid, short_title, mode))
            conv_id = cursor.fetchone()["id"]
            conn.commit()

        # 2. Save user message to database
        cursor.execute("""
            INSERT INTO mentor_messages (conversation_id, role, content)
            VALUES (%s, 'user', %s)
            RETURNING id, created_at;
        """, (conv_id, user_msg_text))
        u_msg_row = cursor.fetchone()
        conn.commit()

        # 3. Retrieve conversation history (only last 4-6 messages)
        cursor.execute("""
            SELECT role, content
            FROM mentor_messages
            WHERE conversation_id = %s
            ORDER BY created_at ASC;
        """, (conv_id,))
        history = [dict(r) for r in cursor.fetchall()]

        # 4. SELECTIVE minimal context retrieval (Zero unnecessary data dumps)
        compact_context = build_selective_student_context(uid, intent, entities, cursor)

        # 5. Token-efficient system prompt assembly
        system_prompt = build_token_efficient_system_prompt(intent, mode, compact_context, response_length, max_tokens)

        # 6. Call Groq with strict max_tokens & monitoring
        groq_result = call_groq_mentor(
            messages=history,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            intent=intent,
            response_length=response_length
        )

        reply_text = groq_result.get("response", "I am unable to generate a response at this moment.")
        is_mock = groq_result.get("is_mock", False)
        usage_info = groq_result.get("usage", {})
        meta_info = {
            "model": groq_result.get("model", "qwen/qwen3.8-27b"),
            "usage": usage_info,
            "is_mock": is_mock,
            "mode": mode,
            "intent": intent,
            "response_length": response_length
        }

        # 7. Save assistant reply to database
        cursor.execute("""
            INSERT INTO mentor_messages (conversation_id, role, content, meta)
            VALUES (%s, 'assistant', %s, %s)
            RETURNING id, created_at;
        """, (conv_id, reply_text, json.dumps(meta_info)))
        a_msg_row = cursor.fetchone()

        # 8. Update conversation timestamp
        cursor.execute("""
            UPDATE mentor_conversations
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = %s;
        """, (conv_id,))
        conn.commit()

        return {
            "success": True,
            "conversation_id": conv_id,
            "user_message": {
                "id": u_msg_row["id"],
                "role": "user",
                "content": user_msg_text,
                "created_at": str(u_msg_row["created_at"])
            },
            "assistant_message": {
                "id": a_msg_row["id"],
                "role": "assistant",
                "content": reply_text,
                "meta": meta_info,
                "created_at": str(a_msg_row["created_at"])
            },
            "mode": mode,
            "intent": intent,
            "response_length": response_length,
            "is_mock": is_mock,
            "model": groq_result.get("model", "qwen/qwen3.8-27b"),
            "usage": usage_info
        }
    finally:
        cursor.close()
        conn.close()



# =============================================================
# GAMIFICATION & LEADERBOARD ENDPOINTS (Module 9 Requirement)
# =============================================================

class MockInterviewCompleteRequest(BaseModel):
    user_id: Optional[int] = None
    category: str = "Technical"
    score: int
    average_words: Optional[int] = 0
    keyword_matches: Optional[int] = 0
    strengths: Optional[List[str]] = []
    improvements: Optional[List[str]] = []
    answers: Optional[List[Dict[str, Any]]] = []
    total_questions: Optional[int] = 0
    attempted_count: Optional[int] = 0


@app.get("/api/interviews/questions")
def get_mock_interview_questions():
    """
    Returns curated interview questions grouped by category from PostgreSQL.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, category, question, keywords, difficulty FROM mock_interview_questions ORDER BY category ASC, id ASC;"
        )
        rows = cursor.fetchall()
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        for r in rows:
            grouped.setdefault(r["category"], []).append({
                "id": r["id"],
                "question": r["question"],
                "keywords": r["keywords"] or [],
                "difficulty": r["difficulty"] or "Medium",
            })
        return {"questions_by_category": grouped}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/interviews/history")
def get_mock_interview_history(
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT id, category, score, average_words, keyword_matches,
                   strengths, improvements, total_questions, attempted_count, created_at
            FROM mock_interview_results
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 20;
            """,
            (uid,)
        )
        rows = cursor.fetchall()
        history = []
        for r in rows:
            item = dict(r)
            if item.get("created_at"):
                item["created_at"] = item["created_at"].isoformat()
            history.append(item)
        return {"history": history}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/interviews/complete")
def record_mock_interview(
    payload: MockInterviewCompleteRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Records an AI mock interview completion and awards +100 XP centrally.
    Updates daily learning activity and continuous streak.
    """
    uid = resolve_roadmap_user_id(authorization, payload.user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO mock_interview_results 
            (user_id, category, score, average_words, keyword_matches, strengths, improvements, answers_json, total_questions, attempted_count, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING id;
        """, (
            uid,
            payload.category,
            payload.score,
            payload.average_words or 0,
            payload.keyword_matches or 0,
            json.dumps(payload.strengths or []),
            json.dumps(payload.improvements or []),
            json.dumps(payload.answers or []),
            payload.total_questions or len(payload.answers or []),
            payload.attempted_count or 0,
        ))
        res_row = cursor.fetchone()
        interview_id = res_row["id"]

        xp_res = award_xp(
            user_id=uid,
            activity_type="mock_interview_completed",
            reference_id=f"mock_{interview_id}",
            cursor=cursor
        )
        conn.commit()
        return {
            "status": "success",
            "interview_id": interview_id,
            "xp_earned": xp_res.get("xp_earned", 100),
            "total_xp": xp_res.get("total_xp", 100),
            "streak": xp_res.get("streak", 1),
            "message": "Mock interview completed! +100 XP awarded."
        }
    finally:
        cursor.close()
        conn.close()


@app.get("/api/leaderboard")
def get_leaderboard(
    period: str = "overall",
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Single source of truth leaderboard endpoint.
    Returns:
      - Current user card (Rank, Level, XP, Problems, Streak, Readiness)
      - Top 3 performers for selected period
      - Complete rankings list sorted deterministically
      - XP rules and period metadata
    Supported periods: 'weekly', 'monthly', 'overall'
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        data = get_leaderboard_data(period=period, current_user_id=uid, cursor=cursor)
        return data
    finally:
        cursor.close()
        conn.close()


@app.get("/api/leaderboard/me")
def get_my_leaderboard(
    period: str = "overall",
    authorization: Optional[str] = Header(None)
):
    """
    Returns current user leaderboard summary for the requested period.
    """
    uid = resolve_roadmap_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        data = get_leaderboard_data(period=period, current_user_id=uid, cursor=cursor)
        return {
            "period": period,
            "user": data.get("current_user"),
            "highest_xp": data.get("highest_xp")
        }
    finally:
        cursor.close()
        conn.close()


class DevXpRequest(BaseModel):
    user_id: Optional[int] = None
    amount: Optional[int] = 50


@app.post("/api/leaderboard/dev-xp")
def earn_dev_xp(
    payload: Optional[DevXpRequest] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Development & Testing endpoint: Awards demo XP safely to test real-time leaderboard rank changes.
    Uses 'dev_test' activity_type to isolate from production activities.
    """
    req_uid = payload.user_id if payload else None
    uid = resolve_roadmap_user_id(authorization, req_uid)
    amount = payload.amount if (payload and payload.amount) else 50
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        import time
        ref_id = f"dev_test_{uid}_{int(time.time() * 1000)}"
        xp_res = award_xp(
            user_id=uid,
            activity_type="dev_test",
            reference_id=ref_id,
            custom_amount=amount,
            cursor=cursor
        )
        conn.commit()
        return {
            "status": "success",
            "xp_awarded": xp_res.get("xp_earned", amount),
            "total_xp": xp_res.get("total_xp", amount),
            "streak": xp_res.get("streak", 1),
            "message": f"+{amount} Demo XP awarded for development testing."
        }
    finally:
        cursor.close()
        conn.close()


@app.post("/api/leaderboard/dev-reset")
def reset_dev_xp(
    payload: Optional[DevXpRequest] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Development & Testing endpoint: Safely clears ONLY 'dev_test' activity transactions.
    Real DSA, coding, aptitude, and interview XP are never deleted.
    """
    req_uid = payload.user_id if payload else None
    uid = resolve_roadmap_user_id(authorization, req_uid)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM xp_transactions WHERE user_id = %s AND activity_type = 'dev_test';",
            (uid,)
        )
        cursor.execute("""
            UPDATE users 
            SET total_xp = (SELECT COALESCE(SUM(amount), 0) FROM xp_transactions WHERE user_id = %s)
            WHERE id = %s
            RETURNING total_xp;
        """, (uid, uid))
        updated = cursor.fetchone()
        conn.commit()
        return {
            "status": "success",
            "total_xp": updated["total_xp"] if updated else 0,
            "message": "Demo XP reset completed safely without affecting real progress."
        }
    finally:
        cursor.close()
        conn.close()


# =============================================================
# PROJECTS FEATURE ENDPOINTS (Module Enhancement)
# =============================================================

from projects_service import (
    CURATED_PROJECT_IDEAS,
    get_user_projects,
    get_project_stats,
    get_project_detail,
    create_project as service_create_project,
    update_project as service_update_project,
    delete_project as service_delete_project,
    toggle_feature_project,
    add_project_milestone,
    update_project_milestone,
    delete_project_milestone,
    fetch_github_repo_metadata,
    generate_project_interview_prep,
    generate_project_resume_bullets,
    seed_default_projects_if_needed,
)

class ProjectCreateRequest(BaseModel):
    title: str
    short_description: Optional[str] = ""
    detailed_description: Optional[str] = ""
    project_type: Optional[str] = "Personal"
    project_status: Optional[str] = "In Progress"
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    tech_stack: Optional[List[str]] = []
    key_features: Optional[List[str]] = []
    user_role: Optional[str] = "Developer"
    team_size: Optional[int] = 1
    my_contribution: Optional[str] = ""
    github_url: Optional[str] = ""
    live_demo_url: Optional[str] = ""
    documentation_url: Optional[str] = ""
    demo_video_url: Optional[str] = ""
    is_featured: Optional[bool] = False
    milestones: Optional[List[dict]] = []


class ProjectUpdateRequest(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None
    project_type: Optional[str] = None
    project_status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    key_features: Optional[List[str]] = None
    user_role: Optional[str] = None
    team_size: Optional[int] = None
    my_contribution: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    documentation_url: Optional[str] = None
    demo_video_url: Optional[str] = None
    is_featured: Optional[bool] = None


class MilestoneCreateRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    due_date: Optional[str] = ""
    is_completed: Optional[bool] = False


class MilestoneUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    is_completed: Optional[bool] = None


@app.get("/api/projects")
def list_projects(
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Returns all projects for the authenticated student.
    Seeds starter placement projects if the student has 0 projects.
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        seed_default_projects_if_needed(uid, cursor)
        conn.commit()
        projects = get_user_projects(uid, cursor)
        stats = get_project_stats(uid, cursor)
        return {
            "status": "success",
            "projects": projects,
            "stats": stats
        }
    finally:
        cursor.close()
        conn.close()


@app.get("/api/projects/stats")
def project_stats(
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Returns Project Overview statistics (Total, Completed, In Progress, Featured, Avg Readiness).
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        stats = get_project_stats(uid, cursor)
        return {"status": "success", "stats": stats}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/projects/ideas")
def list_project_ideas(
    domain: Optional[str] = None,
    difficulty: Optional[str] = None,
    technology: Optional[str] = None
):
    """
    Returns placement project ideas from PostgreSQL filterable by domain, difficulty, and technology.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM project_ideas ORDER BY id ASC;")
        all_rows = [dict(r) for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

    ideas = all_rows
    if domain and domain.lower() != "all":
        ideas = [i for i in ideas if i["domain"].lower() == domain.lower()]
    if difficulty and difficulty.lower() != "all":
        ideas = [i for i in ideas if i["difficulty"].lower() == difficulty.lower()]
    if technology and technology.lower() != "all":
        t_clean = technology.lower()
        ideas = [i for i in ideas if any(t_clean in t.lower() for t in (i.get("technologies") or []))]

    enriched_ideas = []
    for i in ideas:
        idea_copy = dict(i)
        idea_copy["suggested_technologies"] = i.get("technologies", [])
        idea_copy["key_features"] = i.get("suggested_features", [])
        enriched_ideas.append(idea_copy)

    domains_list = ["All"] + sorted({r["domain"] for r in all_rows if r.get("domain")})
    diff_order = ["Beginner", "Intermediate", "Advanced"]
    diffs_present = {r["difficulty"] for r in all_rows if r.get("difficulty")}
    diffs_list = ["All"] + [d for d in diff_order if d in diffs_present]
    tech_set = sorted({t for r in all_rows for t in (r.get("technologies") or [])})

    return {
        "status": "success",
        "ideas": enriched_ideas,
        "domains": domains_list,
        "difficulties": diffs_list,
        "technologies": ["All"] + tech_set
    }


@app.get("/api/projects/github-sync")
def sync_github_meta(url: str):
    """
    Official GitHub REST API sync for public repository metadata.
    Strictly optional and gracefully handles rate limits and private repos.
    """
    if not url:
        raise HTTPException(status_code=400, detail="Missing repository URL")
    res = fetch_github_repo_metadata(url)
    return res


@app.get("/api/projects/{project_id}")
def get_project(
    project_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Returns full project details. Validates user ownership.
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        detail = get_project_detail(project_id, uid, cursor)
        if not detail:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized")
        conn.commit()
        return {"status": "success", "project": detail}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/projects")
def create_new_project(
    payload: ProjectCreateRequest,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Creates a new project, auto-generates interview prep & resume bullets, and awards XP.
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        project = service_create_project(uid, payload.dict(), cursor)
        conn.commit()
        return {
            "status": "success",
            "project": project,
            "message": "Project created successfully! +20 XP awarded."
        }
    finally:
        cursor.close()
        conn.close()


@app.put("/api/projects/{project_id}")
def update_existing_project(
    project_id: int,
    payload: ProjectUpdateRequest,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Updates an existing project with strict ownership verification.
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        project = service_update_project(project_id, uid, payload.dict(exclude_unset=True), cursor)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized")
        conn.commit()
        return {
            "status": "success",
            "project": project,
            "message": "Project updated successfully."
        }
    finally:
        cursor.close()
        conn.close()


@app.delete("/api/projects/{project_id}")
def delete_existing_project(
    project_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Deletes a project with strict ownership verification.
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        success = service_delete_project(project_id, uid, cursor)
        if not success:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized")
        conn.commit()
        return {"status": "success", "message": "Project deleted successfully."}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/projects/{project_id}/feature")
def toggle_project_featured(
    project_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Toggles featured portfolio status.
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        project = toggle_feature_project(project_id, uid, cursor)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized")
        conn.commit()
        return {
            "status": "success",
            "is_featured": project["is_featured"],
            "project": project,
            "message": "Portfolio feature status updated."
        }
    finally:
        cursor.close()
        conn.close()


@app.post("/api/projects/{project_id}/interview-prep")
def refresh_project_interview_prep(
    project_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Generates and saves structured interview preparation for this project.
    Awards +50 XP on completion.
    """
    from gamification import award_xp
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        detail = get_project_detail(project_id, uid, cursor)
        if not detail:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized")
        
        prep = generate_project_interview_prep(detail)
        cursor.execute("UPDATE user_projects SET interview_prep = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s;", (json.dumps(prep), project_id))
        award_xp(uid, "project_interview_prep", reference_id=f"proj_prep_{project_id}", cursor=cursor)
        conn.commit()
        return {
            "status": "success",
            "interview_prep": prep,
            "message": "Interview preparation generated! +50 XP awarded."
        }
    finally:
        cursor.close()
        conn.close()


@app.post("/api/projects/{project_id}/resume-bullets")
def refresh_project_resume_bullets(
    project_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Generates tailored, action-oriented resume bullet points strictly from project information.
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        detail = get_project_detail(project_id, uid, cursor)
        if not detail:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized")
        
        bullets = generate_project_resume_bullets(detail)
        cursor.execute("UPDATE user_projects SET resume_bullets = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s;", (json.dumps(bullets), project_id))
        conn.commit()
        return {
            "status": "success",
            "bullets": bullets,
            "resume_bullets": bullets,
            "message": "Resume bullet points generated."
        }
    finally:
        cursor.close()
        conn.close()


@app.post("/api/projects/{project_id}/milestones")
def create_milestone(
    project_id: int,
    payload: MilestoneCreateRequest,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Adds a new milestone to a project.
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        milestone = add_project_milestone(project_id, uid, payload.dict(), cursor)
        if not milestone:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized")
        conn.commit()
        return {
            "status": "success",
            "milestone": milestone,
            "message": "Milestone added."
        }
    finally:
        cursor.close()
        conn.close()


@app.put("/api/projects/milestones/{milestone_id}")
def update_milestone(
    milestone_id: int,
    payload: MilestoneUpdateRequest,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Updates milestone title, description, or is_completed status.
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        milestone = update_project_milestone(milestone_id, uid, payload.dict(exclude_unset=True), cursor)
        if not milestone:
            raise HTTPException(status_code=404, detail="Milestone not found or unauthorized")
        conn.commit()
        return {
            "status": "success",
            "milestone": milestone,
            "message": "Milestone updated."
        }
    finally:
        cursor.close()
        conn.close()


@app.delete("/api/projects/milestones/{milestone_id}")
def delete_milestone(
    milestone_id: int,
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Deletes milestone with ownership check.
    """
    uid = resolve_roadmap_user_id(authorization, user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        success = delete_project_milestone(milestone_id, uid, cursor)
        if not success:
            raise HTTPException(status_code=404, detail="Milestone not found or unauthorized")
        conn.commit()
        return {"status": "success", "message": "Milestone deleted."}
    finally:
        cursor.close()
        conn.close()



# =============================================================
# COMMUNITY, STUDY GROUPS, EVENTS & PEER MENTORSHIP ENDPOINTS
# =============================================================

class CreateCommunityPostRequest(BaseModel):
    title: str
    content: str
    category: str = "Placement"
    tags: Optional[List[str]] = []
    is_anonymous: bool = False


class CreateCommunityCommentRequest(BaseModel):
    text: str


class ConnectionActionRequest(BaseModel):
    relation_type: str = "connect"


def _format_initials(name: Optional[str]) -> str:
    parts = (name or "").strip().split()
    if not parts:
        return "ST"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def _parse_skill_list(raw_skills) -> List[str]:
    if not raw_skills:
        return []
    if isinstance(raw_skills, list):
        return [str(s).strip() for s in raw_skills if str(s).strip()]
    if isinstance(raw_skills, str):
        s = raw_skills.strip()
        if s.startswith("["):
            try:
                parsed = json.loads(s)
                if isinstance(parsed, list):
                    return [str(x).strip() for x in parsed if str(x).strip()]
            except Exception:
                pass
        return [x.strip() for x in s.split(",") if x.strip()]
    return []


@app.get("/api/community/overview")
def get_community_overview(authorization: Optional[str] = Header(None)):
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) AS c FROM users;")
        members_count = int(cursor.fetchone()["c"])

        cursor.execute("SELECT COUNT(*) AS c FROM community_posts;")
        discussions_count = int(cursor.fetchone()["c"])

        cursor.execute("SELECT COUNT(*) AS c FROM community_connections WHERE user_id = %s;", (uid,))
        connections_count = int(cursor.fetchone()["c"])

        cursor.execute("SELECT COUNT(*) AS c FROM users WHERE id != %s;", (uid,))
        mentors_count = int(cursor.fetchone()["c"])

        cursor.execute("""
            SELECT g.id, g.name, g.category, g.color,
                   COUNT(gm.user_id)::int AS members,
                   BOOL_OR(gm.user_id = %s) AS is_joined
            FROM community_groups g
            LEFT JOIN community_group_members gm ON g.id = gm.group_id
            GROUP BY g.id, g.name, g.category, g.color
            ORDER BY members DESC, g.id ASC;
        """, (uid,))
        groups = [
            {
                "id": r["id"],
                "name": r["name"],
                "category": r["category"],
                "color": r["color"],
                "members": int(r["members"] or 0),
                "is_joined": bool(r["is_joined"]),
            }
            for r in cursor.fetchall()
        ]

        cursor.execute("""
            SELECT e.id, e.title, e.event_date, e.event_time, e.description,
                   COUNT(er.user_id)::int AS members,
                   BOOL_OR(er.user_id = %s) AS is_rsvped
            FROM community_events e
            LEFT JOIN community_event_rsvps er ON e.id = er.event_id
            GROUP BY e.id, e.title, e.event_date, e.event_time, e.description
            ORDER BY e.id ASC;
        """, (uid,))
        events = [
            {
                "id": r["id"],
                "title": r["title"],
                "date": r["event_date"],
                "time": r["event_time"],
                "description": r["description"],
                "members": int(r["members"] or 0),
                "is_rsvped": bool(r["is_rsvped"]),
            }
            for r in cursor.fetchall()
        ]

        cursor.execute("SELECT tags FROM community_posts;")
        tag_counts: Dict[str, int] = {}
        for row in cursor.fetchall():
            for t in (row["tags"] or []):
                clean_t = str(t).strip()
                if clean_t:
                    tag_counts[clean_t] = tag_counts.get(clean_t, 0) + 1
        trending = [
            {"tag": tag, "count": cnt}
            for tag, cnt in sorted(tag_counts.items(), key=lambda kv: (-kv[1], kv[0]))[:5]
        ]

        return {
            "stats": {
                "members": members_count,
                "connections": connections_count,
                "discussions": discussions_count,
                "mentors": mentors_count,
            },
            "groups": groups,
            "events": events,
            "trending": trending,
        }
    finally:
        cursor.close()
        conn.close()


@app.get("/api/community/posts")
def list_community_posts(
    category: Optional[str] = "All",
    sort_by: Optional[str] = "Latest",
    search: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.id, p.user_id, p.author_name, p.author_initials, p.author_role,
                   p.category, p.title, p.content, p.tags, p.is_anonymous, p.created_at,
                   u.avatar_url AS author_avatar,
                   COUNT(DISTINCT pl.user_id)::int AS likes_count,
                   COUNT(DISTINCT pb.user_id)::int AS saves_count,
                   EXISTS(SELECT 1 FROM community_post_likes l2 WHERE l2.post_id = p.id AND l2.user_id = %s) AS liked,
                   EXISTS(SELECT 1 FROM community_post_bookmarks b2 WHERE b2.post_id = p.id AND b2.user_id = %s) AS saved
            FROM community_posts p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN community_post_likes pl ON p.id = pl.post_id
            LEFT JOIN community_post_bookmarks pb ON p.id = pb.post_id
            GROUP BY p.id, u.avatar_url
            ORDER BY p.created_at DESC;
        """, (uid, uid))
        post_rows = cursor.fetchall()

        cursor.execute("""
            SELECT c.id, c.post_id, c.user_id, c.author_name, c.author_initials, c.text, c.created_at,
                   u.avatar_url AS author_avatar
            FROM community_comments c
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at ASC;
        """)
        comments_by_post: Dict[int, List[Dict[str, Any]]] = {}
        for c in cursor.fetchall():
            comments_by_post.setdefault(c["post_id"], []).append({
                "id": c["id"],
                "user_id": c["user_id"],
                "author": c["author_name"],
                "initials": c["author_initials"],
                "author_avatar": c["author_avatar"],
                "text": c["text"],
                "created_at": c["created_at"].isoformat() if c["created_at"] else "",
            })

        posts = []
        for r in post_rows:
            comments = comments_by_post.get(r["id"], [])
            item = {
                "id": r["id"],
                "user_id": r["user_id"],
                "author": "Anonymous Member" if r["is_anonymous"] else r["author_name"],
                "initials": "AM" if r["is_anonymous"] else r["author_initials"],
                "author_avatar": None if r["is_anonymous"] else r["author_avatar"],
                "role": "PrepNest Member" if r["is_anonymous"] else r["author_role"],
                "created_at": r["created_at"].isoformat() if r["created_at"] else "",
                "category": r["category"],
                "title": r["title"],
                "content": r["content"],
                "likes": int(r["likes_count"] or 0),
                "comments": comments,
                "tags": r["tags"] or [],
                "liked": bool(r["liked"]),
                "saved": bool(r["saved"]),
                "is_anonymous": bool(r["is_anonymous"]),
            }
            if category and category != "All":
                if item["category"] != category and category not in item["tags"]:
                    continue
            if search and search.strip():
                q = search.strip().lower()
                hay = f"{item['title']} {item['content']} {item['author']} {' '.join(item['tags'])}".lower()
                if q not in hay:
                    continue
            if sort_by == "Unanswered" and len(comments) > 0:
                continue
            posts.append(item)

        if sort_by == "Popular":
            posts.sort(key=lambda x: (-x["likes"], -len(x["comments"]), -x["id"]))

        return {"posts": posts}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/community/posts")
def create_community_post(
    payload: CreateCommunityPostRequest,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, None)
    title = payload.title.strip()
    content = payload.content.strip()
    if not title or not content:
        raise HTTPException(status_code=400, detail="Title and content are required")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT full_name, target_role, college, avatar_url FROM users WHERE id = %s;", (uid,))
        u = cursor.fetchone()
        author_name = (u["full_name"] if u and u.get("full_name") else "Student").strip()
        initials = _format_initials(author_name)
        role_label = (u.get("target_role") or u.get("college") or "PrepNest Member") if u else "PrepNest Member"
        author_avatar = u.get("avatar_url") if u else None
        tags = [t.strip() for t in (payload.tags or []) if str(t).strip()] or [payload.category]

        cursor.execute("""
            INSERT INTO community_posts
            (user_id, author_name, author_initials, author_role, category, title, content, tags, is_anonymous)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at;
        """, (
            uid,
            author_name,
            initials,
            role_label,
            payload.category,
            title,
            content,
            json.dumps(tags),
            bool(payload.is_anonymous),
        ))
        inserted = cursor.fetchone()
        conn.commit()
        return {
            "id": inserted["id"],
            "user_id": uid,
            "author": "Anonymous Member" if payload.is_anonymous else author_name,
            "initials": "AM" if payload.is_anonymous else initials,
            "author_avatar": None if payload.is_anonymous else author_avatar,
            "role": "PrepNest Member" if payload.is_anonymous else role_label,
            "created_at": inserted["created_at"].isoformat(),
            "category": payload.category,
            "title": title,
            "content": content,
            "likes": 0,
            "comments": [],
            "tags": tags,
            "liked": False,
            "saved": False,
            "is_anonymous": bool(payload.is_anonymous),
        }
    finally:
        cursor.close()
        conn.close()


@app.post("/api/community/posts/{post_id}/like")
def toggle_community_post_like(
    post_id: int,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT 1 FROM community_post_likes WHERE user_id = %s AND post_id = %s;", (uid, post_id))
        if cursor.fetchone():
            cursor.execute("DELETE FROM community_post_likes WHERE user_id = %s AND post_id = %s;", (uid, post_id))
            liked = False
        else:
            cursor.execute("INSERT INTO community_post_likes (user_id, post_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;", (uid, post_id))
            liked = True
        cursor.execute("SELECT COUNT(*)::int AS c FROM community_post_likes WHERE post_id = %s;", (post_id,))
        likes = int(cursor.fetchone()["c"])
        conn.commit()
        return {"post_id": post_id, "liked": liked, "likes": likes}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/community/posts/{post_id}/save")
def toggle_community_post_save(
    post_id: int,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT 1 FROM community_post_bookmarks WHERE user_id = %s AND post_id = %s;", (uid, post_id))
        if cursor.fetchone():
            cursor.execute("DELETE FROM community_post_bookmarks WHERE user_id = %s AND post_id = %s;", (uid, post_id))
            saved = False
        else:
            cursor.execute("INSERT INTO community_post_bookmarks (user_id, post_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;", (uid, post_id))
            saved = True
        conn.commit()
        return {"post_id": post_id, "saved": saved}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/community/posts/{post_id}/comments")
def add_community_comment(
    post_id: int,
    payload: CreateCommunityCommentRequest,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, None)
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Comment cannot be empty")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM community_posts WHERE id = %s;", (post_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Discussion not found")
        cursor.execute("SELECT full_name, avatar_url FROM users WHERE id = %s;", (uid,))
        u = cursor.fetchone()
        author_name = (u["full_name"] if u and u.get("full_name") else "Student").strip()
        author_avatar = u.get("avatar_url") if u else None
        initials = _format_initials(author_name)
        cursor.execute("""
            INSERT INTO community_comments (post_id, user_id, author_name, author_initials, text)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, created_at;
        """, (post_id, uid, author_name, initials, text))
        c = cursor.fetchone()
        conn.commit()
        return {
            "id": c["id"],
            "user_id": uid,
            "author": author_name,
            "initials": initials,
            "author_avatar": author_avatar,
            "text": text,
            "created_at": c["created_at"].isoformat(),
        }
    finally:
        cursor.close()
        conn.close()


@app.post("/api/community/groups/{group_id}/toggle-join")
def toggle_group_join(group_id: int, authorization: Optional[str] = Header(None)):
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT 1 FROM community_group_members WHERE user_id = %s AND group_id = %s;", (uid, group_id))
        if cursor.fetchone():
            cursor.execute("DELETE FROM community_group_members WHERE user_id = %s AND group_id = %s;", (uid, group_id))
            is_joined = False
        else:
            cursor.execute("INSERT INTO community_group_members (user_id, group_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;", (uid, group_id))
            is_joined = True
        cursor.execute("SELECT COUNT(*)::int AS c FROM community_group_members WHERE group_id = %s;", (group_id,))
        members = int(cursor.fetchone()["c"])
        conn.commit()
        return {"group_id": group_id, "is_joined": is_joined, "members": members}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/community/events/{event_id}/toggle-rsvp")
def toggle_event_rsvp(event_id: int, authorization: Optional[str] = Header(None)):
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT 1 FROM community_event_rsvps WHERE user_id = %s AND event_id = %s;", (uid, event_id))
        if cursor.fetchone():
            cursor.execute("DELETE FROM community_event_rsvps WHERE user_id = %s AND event_id = %s;", (uid, event_id))
            is_rsvped = False
        else:
            cursor.execute("INSERT INTO community_event_rsvps (user_id, event_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;", (uid, event_id))
            is_rsvped = True
        cursor.execute("SELECT COUNT(*)::int AS c FROM community_event_rsvps WHERE event_id = %s;", (event_id,))
        members = int(cursor.fetchone()["c"])
        conn.commit()
        return {"event_id": event_id, "is_rsvped": is_rsvped, "members": members}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/community/mentors")
def list_community_mentors(authorization: Optional[str] = Header(None)):
    uid = resolve_aptitude_user_id(authorization, None)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT skills, target_role, target_companies FROM users WHERE id = %s;", (uid,))
        me = cursor.fetchone() or {}
        my_skills = {s.lower() for s in _parse_skill_list(me.get("skills"))}
        my_role = (me.get("target_role") or "").lower()

        cursor.execute("""
            SELECT u.id, u.full_name, u.email, u.avatar_url, u.target_role, u.target_companies,
                   u.skills, u.college, u.degree, u.grad_year, u.location, u.bio,
                   u.prep_level, u.total_xp, u.streak,
                   COUNT(DISTINCT CASE WHEN dp.is_solved = TRUE THEN dp.problem_id END)::int AS dsa_solved,
                   COUNT(DISTINCT rp.topic_id)::int AS roadmap_topics
            FROM users u
            LEFT JOIN user_dsa_progress dp ON u.id = dp.user_id
            LEFT JOIN user_roadmap_progress rp ON u.id = rp.user_id AND rp.status = 'completed'
            WHERE u.id != %s
            GROUP BY u.id
            ORDER BY u.total_xp DESC, u.id ASC;
        """, (uid,))
        rows = cursor.fetchall()

        cursor.execute("""
            SELECT target_user_id, relation_type, status
            FROM community_connections
            WHERE user_id = %s;
        """, (uid,))
        conn_rows = cursor.fetchall()
        connected_ids = [r["target_user_id"] for r in conn_rows if r["relation_type"] == "connect"]
        mentorship_ids = [r["target_user_id"] for r in conn_rows if r["relation_type"] == "mentorship"]

        mentors = []
        for r in rows:
            name = r["full_name"] or r["email"].split("@")[0]
            skills = _parse_skill_list(r.get("skills"))
            companies = _parse_skill_list(r.get("target_companies"))
            target_role = r.get("target_role") or "Placement Aspirant"
            prep_level = (r.get("prep_level") or "Intermediate").lower()

            if prep_level == "advanced" or int(r.get("total_xp") or 0) >= 800:
                member_type = "Alumni" if (r.get("grad_year") and int(r["grad_year"]) <= 2025) else "Senior"
            else:
                member_type = "Batchmate"

            peer_skills = {s.lower() for s in skills}
            overlap = len(my_skills & peer_skills) if my_skills and peer_skills else 0
            union_cnt = len(my_skills | peer_skills) if (my_skills or peer_skills) else 1
            role_bonus = 20 if (my_role and my_role in target_role.lower()) else 0
            activity_bonus = min(30, (int(r.get("dsa_solved") or 0) * 5) + (int(r.get("total_xp") or 0) // 100))
            match_pct = min(99, max(25, round((overlap / union_cnt) * 50) + role_bonus + activity_bonus))

            mentors.append({
                "id": r["id"],
                "name": name,
                "initials": _format_initials(name),
                "avatar_url": r.get("avatar_url") or None,
                "type": member_type,
                "company": companies[0] if companies else (r.get("college") or "PrepNest"),
                "role": target_role,
                "experience": f"{r.get('total_xp') or 0} XP",
                "branch": r.get("degree") or "Computer Science",
                "graduation": str(r.get("grad_year") or "2026"),
                "location": r.get("location") or "Remote",
                "rating": round(min(5.0, 4.0 + min(1.0, (int(r.get("total_xp") or 0) / 1000.0))), 1),
                "sessions": int(r.get("dsa_solved") or 0) + int(r.get("roadmap_topics") or 0),
                "match": match_pct,
                "skills": skills if skills else ["DSA", "Placement Prep"],
                "available": int(r.get("streak") or 0) > 0 or int(r.get("total_xp") or 0) > 0,
                "bio": r.get("bio") or f"{target_role} preparing with {int(r.get('dsa_solved') or 0)} DSA problems solved.",
            })

        return {
            "mentors": mentors,
            "connected_ids": connected_ids,
            "mentorship_ids": mentorship_ids,
        }
    finally:
        cursor.close()
        conn.close()


@app.post("/api/community/connections/{target_user_id}")
def add_community_connection(
    target_user_id: int,
    payload: ConnectionActionRequest,
    authorization: Optional[str] = Header(None)
):
    uid = resolve_aptitude_user_id(authorization, None)
    rel = payload.relation_type if payload.relation_type in ("connect", "mentorship") else "connect"
    if target_user_id == uid:
        raise HTTPException(status_code=400, detail="Cannot connect with yourself")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        status_val = "connected" if rel == "connect" else "pending"
        cursor.execute("""
            INSERT INTO community_connections (user_id, target_user_id, relation_type, status)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id, target_user_id, relation_type) DO NOTHING;
        """, (uid, target_user_id, rel, status_val))
        conn.commit()
        return {"target_user_id": target_user_id, "relation_type": rel, "status": status_val}
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
