import jwt
import hashlib
from datetime import datetime, timedelta
from typing import Optional

SECRET_KEY = "super-secret-key-ai-studio-saas-antigravity"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

def hash_password(password: str) -> str:
    # Reliable lightweight hashing using SHA-256 + salt for local setup
    salt = "ai_studio_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


# -------------------------------------------------------------
# Neon Authentication Integration (Managed Better Auth)
# -------------------------------------------------------------

import os
import json
import urllib.request
import urllib.error

NEON_AUTH_URL = os.getenv(
    "NEON_AUTH_URL",
    "https://ep-purple-lab-b3uwg1re.neonauth.c-4.ap-southeast-1.aws.neon.tech/neondb/auth"
).rstrip("/")


def neon_auth_sign_up(name: str, email: str, password: str, origin: Optional[str] = None) -> tuple[bool, Optional[dict], Optional[str]]:
    """
    Registers a new user via Neon Auth (/sign-up/email).
    Returns (success, response_data, error_message).
    """
    url = f"{NEON_AUTH_URL}/sign-up/email"
    payload = json.dumps({
        "name": name,
        "email": email.lower().strip(),
        "password": password
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "PrepNest-Backend/1.0",
            "Origin": origin or "http://localhost:5173"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            return True, data, None
    except urllib.error.HTTPError as e:
        try:
            err_body = json.loads(e.read().decode("utf-8"))
            msg = err_body.get("message") or err_body.get("error") or str(err_body)
        except Exception:
            msg = f"Neon Auth error HTTP {e.code}"
        return False, None, msg
    except Exception as e:
        return False, None, f"Could not connect to Neon Auth: {str(e)}"


def neon_auth_sign_in(email: str, password: str, origin: Optional[str] = None) -> tuple[bool, Optional[dict], Optional[str]]:
    """
    Authenticates a user via Neon Auth (/sign-in/email).
    Returns (success, response_data, error_message).
    """
    url = f"{NEON_AUTH_URL}/sign-in/email"
    payload = json.dumps({
        "email": email.lower().strip(),
        "password": password
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "PrepNest-Backend/1.0",
            "Origin": origin or "http://localhost:5173"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            return True, data, None
    except urllib.error.HTTPError as e:
        try:
            err_body = json.loads(e.read().decode("utf-8"))
            msg = err_body.get("message") or err_body.get("error") or str(err_body)
        except Exception:
            msg = f"Neon Auth error HTTP {e.code}"
        return False, None, msg
    except Exception as e:
        return False, None, f"Could not connect to Neon Auth: {str(e)}"


def verify_neon_session(token: str, cursor) -> Optional[dict]:
    """
    Directly checks the neon_auth.session table in Neon PostgreSQL.
    Returns session dict with email, name, neon_user_id if valid and not expired.
    """
    if not token:
        return None
    try:
        cursor.execute("""
            SELECT s.token, s."expiresAt", u.id AS neon_user_id, u.email, u.name
            FROM neon_auth.session s
            JOIN neon_auth.user u ON s."userId" = u.id
            WHERE s.token = %s AND s."expiresAt" > CURRENT_TIMESTAMP;
        """, (token,))
        row = cursor.fetchone()
        if row:
            return dict(row)
    except Exception:
        # neon_auth schema might not exist or error
        pass
    return None

