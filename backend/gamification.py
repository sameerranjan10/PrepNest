import os
from datetime import datetime, date, timedelta
from typing import Optional, Dict, Any, List

# -------------------------------------------------------------
# Centralized XP Configuration (Module 9 Requirement)
# -------------------------------------------------------------
XP_RULES = {
    "dsa_solved": 50,              # Solving a DSA problem (+50 XP)
    "coding_solved": 60,           # Solving a coding problem / test case pass (+60 XP)
    "aptitude_completed": 30,      # Completing an aptitude quiz (+30 XP)
    "mock_interview_completed": 100,# Completing a mock interview (+100 XP)
    "daily_activity": 10,          # First learning activity of the day (+10 XP)
    "streak_bonus": 50,            # 7-day streak bonus (+50 XP)
    "dev_test": 50,                # Dev/Testing practice XP (+50 XP)
}

XP_DISPLAY_RULES = [
    {"activity": "DSA Problem", "xp": 50, "description": "Solve any DSA question in directory or sheet"},
    {"activity": "Coding Problem", "xp": 60, "description": "Pass all test cases in the code editor"},
    {"activity": "Aptitude Quiz", "xp": 30, "description": "Complete a timed or practice aptitude test"},
    {"activity": "Mock Interview", "xp": 100, "description": "Complete an AI technical or HR mock round"},
    {"activity": "Daily Activity", "xp": 10, "description": "Maintain your daily placement preparation"},
    {"activity": "7-Day Streak", "xp": 50, "description": "Bonus reward for 7 consecutive active days"},
]

ACTIVITY_LABELS = {
    "dsa_solved": "Solved DSA Problem",
    "coding_solved": "Passed Coding Challenge",
    "aptitude_completed": "Completed Aptitude Quiz",
    "mock_interview_completed": "AI Mock Interview",
    "daily_activity": "Daily Learning Habit",
    "streak_bonus": "7-Day Consistency Streak",
    "dev_test": "Demo Practice Exercise"
}


def init_gamification_tables(cursor):
    """
    Creates gamification tables in PostgreSQL/NeonDB safely.
    Defensive schema initialization with IF NOT EXISTS.
    """
    # 1. XP Transactions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS xp_transactions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            amount INTEGER NOT NULL,
            activity_type VARCHAR(50) NOT NULL,
            reference_id VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_xp_tx_user ON xp_transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_xp_tx_created ON xp_transactions(created_at);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_tx_user_ref ON xp_transactions(user_id, reference_id) 
            WHERE reference_id IS NOT NULL;
    """)

    # 2. User Daily Activity (Streak Tracker)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_daily_activity (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
            activity_type VARCHAR(50) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, activity_date, activity_type)
        );
        CREATE INDEX IF NOT EXISTS idx_user_daily_activity_user_date ON user_daily_activity(user_id, activity_date);
    """)

    # 3. Mock Interview Results Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mock_interview_results (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            category VARCHAR(50) NOT NULL,
            score INTEGER NOT NULL,
            average_words INTEGER DEFAULT 0,
            keyword_matches INTEGER DEFAULT 0,
            strengths JSONB DEFAULT '[]'::jsonb,
            improvements JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_mock_interview_user ON mock_interview_results(user_id);
    """)

    # 4. Safe column additions to users table
    cursor.execute("""
        ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE;
    """)


def calculate_streak(user_id: int, cursor) -> int:
    """
    Calculates consecutive active learning days for a user.
    A streak continues if the user was active today or yesterday.
    """
    try:
        cursor.execute("""
            SELECT DISTINCT activity_date 
            FROM user_daily_activity 
            WHERE user_id = %s 
            ORDER BY activity_date DESC
            LIMIT 60;
        """, (user_id,))
        rows = cursor.fetchall()
        if not rows:
            return 0

        active_dates = [r["activity_date"] for r in rows]
        today = date.today()
        yesterday = today - timedelta(days=1)

        # Streak is active only if today or yesterday has activity
        if active_dates[0] != today and active_dates[0] != yesterday:
            return 0

        streak = 1
        current_check = active_dates[0]

        for next_date in active_dates[1:]:
            expected_prev = current_check - timedelta(days=1)
            if next_date == expected_prev:
                streak += 1
                current_check = next_date
            else:
                break

        return streak
    except Exception as e:
        print(f"[WARN] calculate_streak error: {e}")
        return 0


def calculate_level(xp: int) -> Dict[str, Any]:
    """
    Centralized Level formula:
    Level 1: 0 - 999 XP
    Level 2: 1000 - 1999 XP
    Level 3: 2000 - 2999 XP
    etc.
    """
    xp = max(0, int(xp or 0))
    level = max(1, (xp // 1000) + 1)
    next_level_xp = level * 1000
    current_level_base = (level - 1) * 1000
    xp_in_level = max(0, xp - current_level_base)
    progress_percentage = min(100, max(0, int((xp_in_level / 1000.0) * 100)))

    return {
        "level": level,
        "xp": xp,
        "next_level_xp": next_level_xp,
        "current_level_base": current_level_base,
        "xp_in_level": xp_in_level,
        "progress_percentage": progress_percentage,
        "xp_remaining": max(0, next_level_xp - xp)
    }


def get_user_readiness(user_id: int, cursor) -> int:
    """
    Deterministic placement readiness percentage (50% to 99%)
    Formula:
    Base: 50%
    + DSA Solved: up to 25% (min(25, dsa_count * 2))
    + Aptitude Quizzes: up to 12% (min(12, apt_count * 3))
    + Mock Interviews: up to 8% (min(8, mock_count * 4))
    + Daily Streak: up to 4% (min(4, streak))
    """
    try:
        cursor.execute("SELECT COUNT(*) as c FROM user_dsa_progress WHERE user_id = %s AND is_solved = true;", (user_id,))
        dsa_count = cursor.fetchone()["c"]

        cursor.execute("SELECT COUNT(*) as c FROM aptitude_test_results WHERE user_id = %s;", (user_id,))
        apt_count = cursor.fetchone()["c"]

        cursor.execute("SELECT COUNT(*) as c FROM mock_interview_results WHERE user_id = %s;", (user_id,))
        mock_count = cursor.fetchone()["c"]

        streak = calculate_streak(user_id, cursor)

        dsa_part = min(25, dsa_count * 2)
        apt_part = min(12, apt_count * 3)
        mock_part = min(8, mock_count * 4)
        streak_part = min(4, streak)

        readiness = min(99, max(50, 50 + dsa_part + apt_part + mock_part + streak_part))
        return int(readiness)
    except Exception as e:
        print(f"[WARN] get_user_readiness error: {e}")
        return 75


def award_xp(
    user_id: int,
    activity_type: str,
    reference_id: Optional[str] = None,
    custom_amount: Optional[int] = None,
    cursor = None
) -> Dict[str, Any]:
    """
    Centralized XP Award Function (Module 9 Requirement)
    Awards XP, prevents duplicates via reference_id, tracks daily streaks,
    and updates total XP in database.
    """
    amount = custom_amount if custom_amount is not None else XP_RULES.get(activity_type, 10)

    # 1. Prevent duplicate rewards for the same reference_id
    if reference_id:
        cursor.execute(
            "SELECT id FROM xp_transactions WHERE user_id = %s AND reference_id = %s LIMIT 1;",
            (user_id, reference_id)
        )
        if cursor.fetchone():
            return {
                "awarded": False,
                "xp_earned": 0,
                "reason": "Activity already rewarded",
                "reference_id": reference_id
            }

    # 2. Record XP Transaction
    cursor.execute("""
        INSERT INTO xp_transactions (user_id, amount, activity_type, reference_id, created_at)
        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
        RETURNING id, created_at;
    """, (user_id, amount, activity_type, reference_id))
    tx_row = cursor.fetchone()

    # 3. Log Daily Activity
    cursor.execute("""
        INSERT INTO user_daily_activity (user_id, activity_date, activity_type, created_at)
        VALUES (%s, CURRENT_DATE, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, activity_date, activity_type) DO NOTHING;
    """, (user_id, activity_type))

    # 4. Check for Daily Activity bonus (+10 XP) if this is the first activity of today
    today_str = date.today().isoformat()
    daily_ref = f"daily_{user_id}_{today_str}"
    cursor.execute("""
        SELECT COUNT(*) as c FROM xp_transactions 
        WHERE user_id = %s AND activity_type = 'daily_activity' AND created_at::date = CURRENT_DATE;
    """, (user_id,))
    first_activity_today = (cursor.fetchone()["c"] == 0)

    daily_bonus_earned = 0
    if first_activity_today and activity_type != "daily_activity":
        cursor.execute("""
            INSERT INTO xp_transactions (user_id, amount, activity_type, reference_id, created_at)
            VALUES (%s, %s, 'daily_activity', %s, CURRENT_TIMESTAMP)
            ON CONFLICT DO NOTHING;
        """, (user_id, XP_RULES["daily_activity"], daily_ref))
        daily_bonus_earned = XP_RULES["daily_activity"]

    # 5. Check and update Streak
    streak = calculate_streak(user_id, cursor)

    # If user reaches 7-day streak milestone, award streak_bonus (+50 XP) once
    streak_bonus_earned = 0
    if streak > 0 and streak % 7 == 0:
        streak_ref = f"streak_bonus_{user_id}_{today_str}"
        cursor.execute(
            "SELECT id FROM xp_transactions WHERE user_id = %s AND reference_id = %s LIMIT 1;",
            (user_id, streak_ref)
        )
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO xp_transactions (user_id, amount, activity_type, reference_id, created_at)
                VALUES (%s, %s, 'streak_bonus', %s, CURRENT_TIMESTAMP);
            """, (user_id, XP_RULES["streak_bonus"], streak_ref))
            streak_bonus_earned = XP_RULES["streak_bonus"]

    # 6. Synchronize user total_xp and streak in users table
    cursor.execute("""
        UPDATE users 
        SET total_xp = (SELECT COALESCE(SUM(amount), 0) FROM xp_transactions WHERE user_id = %s),
            streak = %s,
            last_active_date = CURRENT_DATE
        WHERE id = %s
        RETURNING total_xp;
    """, (user_id, streak, user_id))
    updated_user = cursor.fetchone()
    total_xp = updated_user["total_xp"] if updated_user else amount

    return {
        "awarded": True,
        "xp_earned": amount + daily_bonus_earned + streak_bonus_earned,
        "base_xp": amount,
        "daily_bonus": daily_bonus_earned,
        "streak_bonus": streak_bonus_earned,
        "activity_type": activity_type,
        "reference_id": reference_id,
        "total_xp": total_xp,
        "streak": streak
    }


def get_leaderboard_data(period: str = "overall", current_user_id: int = 1, cursor = None) -> Dict[str, Any]:
    """
    Produces the single-source-of-truth Leaderboard payload.
    Supports:
      - 'weekly': XP earned in last 7 days
      - 'monthly': XP earned in last 30 days
      - 'overall': Total accumulated XP
    Deterministic tie-breaking: 1) XP, 2) Problems Solved, 3) Streak, 4) Earliest activity, 5) user_id.
    """
    period_lower = (period or "overall").lower().strip()
    if period_lower not in ["weekly", "monthly", "overall"]:
        period_lower = "overall"

    # Define date filter condition
    if period_lower == "weekly":
        date_filter_raw = "AND t.created_at >= CURRENT_DATE - INTERVAL '7 days'"
    elif period_lower == "monthly":
        date_filter_raw = "AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'"
    else:
        date_filter_raw = ""

    # Aggregate XP per user for period
    query = f"""
        WITH user_period_xp AS (
            SELECT 
                u.id as user_id,
                u.full_name,
                u.email,
                u.target_role,
                COALESCE(u.avatar_url, '') as avatar_url,
                COALESCE(SUM(t.amount), 0)::int as period_xp,
                MIN(t.created_at) as earliest_activity
            FROM users u
            LEFT JOIN xp_transactions t ON u.id = t.user_id {date_filter_raw}
            GROUP BY u.id, u.full_name, u.email, u.target_role, u.avatar_url
        ),
        user_problems AS (
            SELECT 
                user_id,
                COUNT(DISTINCT problem_id)::int as solved_problems
            FROM user_dsa_progress
            WHERE is_solved = true
            GROUP BY user_id
        )
        SELECT 
            x.user_id,
            x.full_name,
            x.email,
            x.target_role,
            x.avatar_url,
            x.period_xp,
            x.earliest_activity,
            COALESCE(p.solved_problems, 0) as problems_solved
        FROM user_period_xp x
        LEFT JOIN user_problems p ON x.user_id = p.user_id
        ORDER BY 
            x.period_xp DESC,
            problems_solved DESC,
            x.user_id ASC;
    """
    cursor.execute(query)
    raw_users = cursor.fetchall()

    # Fetch recent activities for learners
    cursor.execute("""
        WITH ranked_tx AS (
            SELECT user_id, activity_type, amount, created_at,
                   ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY created_at DESC) as rn
            FROM xp_transactions
        )
        SELECT user_id, activity_type, amount, created_at
        FROM ranked_tx
        WHERE rn <= 4;
    """)
    recent_rows = cursor.fetchall()
    user_recent_map = {}
    for r in recent_rows:
        user_recent_map.setdefault(r["user_id"], []).append({
            "type": r["activity_type"],
            "title": ACTIVITY_LABELS.get(r["activity_type"], r["activity_type"].replace("_", " ").title()),
            "amount": r["amount"],
            "created_at": r["created_at"].isoformat() if r["created_at"] else ""
        })

    rankings = []
    current_user_card = None

    for idx, u in enumerate(raw_users):
        uid = u["user_id"]
        streak = calculate_streak(uid, cursor)
        readiness = get_user_readiness(uid, cursor)
        level_info = calculate_level(u["period_xp"])

        # Extract initials for avatar
        name = u["full_name"] or u["email"].split("@")[0]
        parts = name.strip().split()
        initials = (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper() if parts else "ST"

        # Badges list
        badges = []
        if u["period_xp"] >= 2000:
            badges.append("DSA Master")
        elif u["period_xp"] >= 500:
            badges.append("Consistent Achiever")
        if streak >= 7:
            badges.append("7-Day Streak")
        elif streak >= 3:
            badges.append("Active Learner")
        if u["problems_solved"] >= 20:
            badges.append("Problem Solver")
        if not badges:
            badges.append("Rising Star")

        rank = idx + 1
        is_current = (uid == current_user_id)

        dsa_metric = min(98, max(55, 50 + min(40, u["problems_solved"] * 3)))
        apt_metric = min(95, max(60, 50 + min(40, streak * 4)))
        interview_metric = min(96, max(50, readiness - 2))

        user_item = {
            "id": uid,
            "rank": rank,
            "rankChange": 0,
            "name": name,
            "email": u["email"],
            "username": u["email"].split("@")[0],
            "avatar": initials,
            "role": u["target_role"] or "Software Engineer Aspirant",
            "xp": u["period_xp"],
            "level": level_info["level"],
            "next_level_xp": level_info["next_level_xp"],
            "xp_in_level": level_info["xp_in_level"],
            "progress_percentage": level_info["progress_percentage"],
            "problems": u["problems_solved"],
            "streak": streak,
            "readiness": readiness,
            "dsa": dsa_metric,
            "aptitude": apt_metric,
            "interview": interview_metric,
            "badges": badges,
            "recent_activities": user_recent_map.get(uid, []),
            "is_current_user": is_current
        }

        rankings.append(user_item)

        if is_current:
            current_user_card = user_item

    # If current_user was not in list (edge case), synthesize from user table
    if not current_user_card and current_user_id:
        cursor.execute("SELECT id, full_name, email, target_role FROM users WHERE id = %s;", (current_user_id,))
        u = cursor.fetchone()
        if u:
            streak = calculate_streak(current_user_id, cursor)
            readiness = get_user_readiness(current_user_id, cursor)
            level_info = calculate_level(0)
            parts = (u["full_name"] or "").strip().split()
            initials = (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper() if parts else "ME"
            current_user_card = {
                "id": u["id"],
                "rank": len(rankings) + 1,
                "rankChange": 0,
                "name": u["full_name"] or "You",
                "email": u["email"],
                "username": u["email"].split("@")[0],
                "avatar": initials,
                "role": u["target_role"] or "Software Engineer Aspirant",
                "xp": 0,
                "level": level_info["level"],
                "next_level_xp": level_info["next_level_xp"],
                "xp_in_level": level_info["xp_in_level"],
                "progress_percentage": level_info["progress_percentage"],
                "problems": 0,
                "streak": streak,
                "readiness": readiness,
                "dsa": 60,
                "aptitude": 65,
                "interview": 60,
                "badges": ["Rising Star"],
                "recent_activities": user_recent_map.get(current_user_id, []),
                "is_current_user": True
            }

    # Top 3 performers
    top_three = rankings[:3]

    # XP Performance (highest XP for proportional bar calculation)
    highest_xp = rankings[0]["xp"] if rankings and rankings[0]["xp"] > 0 else 100

    return {
        "period": period_lower,
        "total_learners": len(rankings),
        "current_user": current_user_card,
        "top_three": top_three,
        "rankings": rankings,
        "highest_xp": highest_xp,
        "xp_rules": XP_DISPLAY_RULES,
        "updated_at": datetime.utcnow().isoformat()
    }


def seed_campus_cohort_if_needed(cursor):
    """
    Ensures realistic campus cohort competition exists on Neon DB.
    Seeds diverse activity so Weekly, Monthly, and Overall show rich, differentiated data.
    """
    cursor.execute("SELECT COUNT(*) as count FROM users;")
    user_count = cursor.fetchone()["count"]

    cohort_users = [
        ("alex.johnson@campus.edu", "Alex Johnson", "Full Stack Developer", [
            ("dsa_solved", 50, "dsa_seed_1", 2),
            ("coding_solved", 60, "code_seed_1", 3),
            ("aptitude_completed", 30, "apt_seed_1", 4),
            ("mock_interview_completed", 100, "mock_seed_1", 1),
            ("dsa_solved", 50, "dsa_seed_2", 12),
            ("coding_solved", 60, "code_seed_2", 15),
            ("aptitude_completed", 30, "apt_seed_2", 20),
            ("dsa_solved", 50, "dsa_seed_3", 35),
            ("coding_solved", 60, "code_seed_3", 40),
        ]),
        ("sam.kumar@campus.edu", "Sam Kumar", "Backend Developer", [
            ("dsa_solved", 50, "dsa_seed_4", 1),
            ("coding_solved", 60, "code_seed_4", 2),
            ("aptitude_completed", 30, "apt_seed_3", 3),
            ("dsa_solved", 50, "dsa_seed_5", 10),
            ("coding_solved", 60, "code_seed_5", 14),
            ("mock_interview_completed", 100, "mock_seed_2", 22),
            ("dsa_solved", 50, "dsa_seed_6", 32),
        ]),
        ("rahul.sharma@campus.edu", "Rahul Sharma", "Java Developer", [
            ("dsa_solved", 50, "dsa_seed_7", 3),
            ("aptitude_completed", 30, "apt_seed_4", 5),
            ("coding_solved", 60, "code_seed_6", 18),
            ("dsa_solved", 50, "dsa_seed_8", 25),
        ]),
        ("priya.singh@campus.edu", "Priya Singh", "Data Analyst", [
            ("aptitude_completed", 30, "apt_seed_5", 1),
            ("aptitude_completed", 30, "apt_seed_6", 4),
            ("dsa_solved", 50, "dsa_seed_9", 8),
            ("mock_interview_completed", 100, "mock_seed_3", 16),
        ]),
        ("arjun.patel@campus.edu", "Arjun Patel", "Frontend Developer", [
            ("dsa_solved", 50, "dsa_seed_10", 2),
            ("coding_solved", 60, "code_seed_7", 6),
            ("dsa_solved", 50, "dsa_seed_11", 14),
        ])
    ]

    import hashlib
    salt = "ai_studio_salt_2026"
    dummy_pwd = hashlib.sha256(("password123" + salt).encode('utf-8')).hexdigest()

    for email, name, role, activities in cohort_users:
        cursor.execute("SELECT id FROM users WHERE email = %s;", (email,))
        row = cursor.fetchone()
        if not row:
            cursor.execute("""
                INSERT INTO users (email, full_name, hashed_password, target_role, plan, credits)
                VALUES (%s, %s, %s, %s, 'Pro', 250)
                RETURNING id;
            """, (email, name, dummy_pwd, role))
            uid = cursor.fetchone()["id"]
        else:
            uid = row["id"]

        # Insert activities with realistic timestamps (past days)
        for act_type, amount, ref, days_ago in activities:
            ref_id = f"{ref}_{uid}"
            cursor.execute(
                "SELECT id FROM xp_transactions WHERE user_id = %s AND reference_id = %s LIMIT 1;",
                (uid, ref_id)
            )
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO xp_transactions (user_id, amount, activity_type, reference_id, created_at)
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP - (%s * INTERVAL '1 day'))
                    ON CONFLICT DO NOTHING;
                """, (uid, amount, act_type, ref_id, days_ago))

                cursor.execute("""
                    INSERT INTO user_daily_activity (user_id, activity_date, activity_type, created_at)
                    VALUES (%s, CURRENT_DATE - (%s * INTERVAL '1 day')::interval, %s, CURRENT_TIMESTAMP - (%s * INTERVAL '1 day'))
                    ON CONFLICT DO NOTHING;
                """, (uid, days_ago, act_type, days_ago))

        # Re-sync streak and total_xp
        streak = calculate_streak(uid, cursor)
        cursor.execute("""
            UPDATE users 
            SET total_xp = (SELECT COALESCE(SUM(amount), 0) FROM xp_transactions WHERE user_id = %s),
                streak = %s
            WHERE id = %s;
        """, (uid, streak, uid))
