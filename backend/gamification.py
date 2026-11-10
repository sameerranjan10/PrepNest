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
    "project_created": 20,         # Creating a project (+20 XP)
    "project_completed": 100,      # Completing a project (+100 XP)
    "project_github": 20,          # Linking GitHub repository (+20 XP)
    "project_demo": 20,            # Adding a live demo link (+20 XP)
    "project_interview_prep": 50,  # Completing project interview prep (+50 XP)
    "project_featured": 30,        # Featuring project in portfolio (+30 XP)
}

XP_DISPLAY_RULES = [
    {"activity": "DSA Problem", "xp": 50, "description": "Solve any DSA question in directory or sheet"},
    {"activity": "Coding Problem", "xp": 60, "description": "Pass all test cases in the code editor"},
    {"activity": "Aptitude Quiz", "xp": 30, "description": "Complete a timed or practice aptitude test"},
    {"activity": "Mock Interview", "xp": 100, "description": "Complete an AI technical or HR mock round"},
    {"activity": "Project Created", "xp": 20, "description": "Add a new software project to your profile"},
    {"activity": "Project Completed", "xp": 100, "description": "Mark all milestones and finish your project"},
    {"activity": "Project GitHub", "xp": 20, "description": "Link your project GitHub repository"},
    {"activity": "Project Live Demo", "xp": 20, "description": "Deploy and link a working live project demo"},
    {"activity": "Interview Prep", "xp": 50, "description": "Prepare project explanations and technical Q&A"},
    {"activity": "Featured Project", "xp": 30, "description": "Feature your top project in your portfolio showcase"},
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
    "dev_test": "Demo Practice Exercise",
    "project_created": "Created Project",
    "project_completed": "Completed Full Project",
    "project_github": "Linked Project GitHub",
    "project_demo": "Added Live Project Demo",
    "project_interview_prep": "Project Interview Prep",
    "project_featured": "Featured Project on Portfolio",
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

    # 5. User Achievements Table (No duplicates via UNIQUE(user_id, achievement_key))
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_achievements (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            achievement_key VARCHAR(60) NOT NULL,
            unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, achievement_key)
        );
        CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
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
    Deterministic placement readiness percentage (0% to 100%)
    Computed strictly from actual user activity in PostgreSQL:
    - DSA Solved: up to 35% (min(35, dsa_count * 3))
    - Aptitude Quizzes: up to 25% (min(25, apt_count * 5))
    - Mock Interviews: up to 20% (min(20, mock_count * 10))
    - Roadmap Topics: up to 15% (min(15, roadmap_count * 3))
    - Daily Streak: up to 5% (min(5, streak))
    Returns 0% when user has zero activity.
    """
    try:
        cursor.execute("SELECT COUNT(*) as c FROM user_dsa_progress WHERE user_id = %s AND is_solved = true;", (user_id,))
        dsa_count = cursor.fetchone()["c"]

        cursor.execute("SELECT COUNT(*) as c FROM aptitude_test_results WHERE user_id = %s;", (user_id,))
        apt_count = cursor.fetchone()["c"]

        cursor.execute("SELECT COUNT(*) as c FROM mock_interview_results WHERE user_id = %s;", (user_id,))
        mock_count = cursor.fetchone()["c"]

        cursor.execute("SELECT COUNT(*) as c FROM user_roadmap_progress WHERE user_id = %s AND status = 'completed';", (user_id,))
        roadmap_count = cursor.fetchone()["c"]

        streak = calculate_streak(user_id, cursor)

        dsa_part = min(35, dsa_count * 3)
        apt_part = min(25, apt_count * 5)
        mock_part = min(20, mock_count * 10)
        roadmap_part = min(15, roadmap_count * 3)
        streak_part = min(5, streak)

        readiness = min(100, max(0, dsa_part + apt_part + mock_part + roadmap_part + streak_part))
        return int(readiness)
    except Exception as e:
        print(f"[WARN] get_user_readiness error: {e}")
        return 0


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


ACHIEVEMENT_DEFINITIONS = [
    {
        "key": "first_problem",
        "title": "First Problem Solved",
        "description": "Solve your very first DSA or Aptitude problem on PrepNest.",
        "target": 1,
    },
    {
        "key": "streak_7",
        "title": "7-Day Streak",
        "description": "Maintain 7 consecutive days of active placement preparation.",
        "target": 7,
    },
    {
        "key": "streak_30",
        "title": "30-Day Streak",
        "description": "Maintain a 30-day consecutive preparation streak.",
        "target": 30,
    },
    {
        "key": "dsa_50",
        "title": "50 DSA Problems",
        "description": "Solve 50 unique DSA problems in the directory.",
        "target": 50,
    },
    {
        "key": "dsa_100",
        "title": "100 DSA Problems",
        "description": "Solve 100 unique DSA problems in the directory.",
        "target": 100,
    },
    {
        "key": "roadmap_completed",
        "title": "Roadmap Completed",
        "description": "Complete every topic in at least one full learning roadmap track.",
        "target": 1,
    },
    {
        "key": "interview_ready",
        "title": "Interview Ready",
        "description": "Reach a Placement Readiness score of 75% or higher.",
        "target": 75,
    },
]


def _sync_and_get_achievements(
    user_id: int,
    dsa_solved: int,
    apt_solved: int,
    streak: int,
    readiness: int,
    domains_completed: int,
    cursor,
) -> List[Dict[str, Any]]:
    """
    Evaluates real criteria, records newly unlocked achievements without duplicates,
    and returns both unlocked and locked achievement statuses.
    """
    if not user_id:
        return []

    progress_map = {
        "first_problem": min(1, int(dsa_solved) + int(apt_solved)),
        "streak_7": min(7, int(streak)),
        "streak_30": min(30, int(streak)),
        "dsa_50": min(50, int(dsa_solved)),
        "dsa_100": min(100, int(dsa_solved)),
        "roadmap_completed": min(1, int(domains_completed)),
        "interview_ready": min(75, int(readiness)),
    }

    for ach in ACHIEVEMENT_DEFINITIONS:
        key = ach["key"]
        if progress_map.get(key, 0) >= ach["target"]:
            try:
                cursor.execute(
                    """
                    INSERT INTO user_achievements (user_id, achievement_key)
                    VALUES (%s, %s)
                    ON CONFLICT (user_id, achievement_key) DO NOTHING;
                    """,
                    (user_id, key),
                )
            except Exception:
                pass

    unlocked_map: Dict[str, str] = {}
    try:
        cursor.execute(
            "SELECT achievement_key, unlocked_at FROM user_achievements WHERE user_id = %s;",
            (user_id,),
        )
        for row in cursor.fetchall():
            unlocked_map[row["achievement_key"]] = (
                row["unlocked_at"].isoformat() if row.get("unlocked_at") else ""
            )
    except Exception:
        pass

    result = []
    for ach in ACHIEVEMENT_DEFINITIONS:
        key = ach["key"]
        prog = progress_map.get(key, 0)
        is_unlocked = key in unlocked_map or prog >= ach["target"]
        result.append({
            "key": key,
            "title": ach["title"],
            "description": ach["description"],
            "unlocked": is_unlocked,
            "unlocked_at": unlocked_map.get(key),
            "progress": prog,
            "target": ach["target"],
        })
    return result


def _compute_real_rank_history(current_user_id: int, cursor) -> List[Dict[str, Any]]:
    """
    Derives actual historical rank and cumulative XP progression strictly from recorded
    xp_transactions dates in PostgreSQL. Returns [] if fewer than 2 real activity dates exist.
    """
    try:
        cursor.execute("""
            SELECT DISTINCT (created_at AT TIME ZONE 'UTC')::date AS tx_date
            FROM xp_transactions
            WHERE user_id = %s
            ORDER BY tx_date DESC
            LIMIT 14;
        """, (current_user_id,))
        user_dates = sorted([r["tx_date"] for r in cursor.fetchall() if r.get("tx_date")])
        if len(user_dates) < 2:
            return []

        cursor.execute("""
            SELECT user_id, (created_at AT TIME ZONE 'UTC')::date AS tx_date, SUM(amount)::int AS day_xp
            FROM xp_transactions
            GROUP BY user_id, (created_at AT TIME ZONE 'UTC')::date;
        """)
        tx_rows = cursor.fetchall()
        if not tx_rows:
            return []

        user_totals: Dict[int, Dict[date, int]] = {}
        for r in tx_rows:
            uid = int(r["user_id"])
            user_totals.setdefault(uid, {})[r["tx_date"]] = int(r["day_xp"] or 0)

        history = []
        for d in user_dates:
            standings = []
            for uid, day_map in user_totals.items():
                cum = sum(val for dt, val in day_map.items() if dt <= d)
                if cum > 0 or uid == current_user_id:
                    standings.append((uid, cum))
            standings.sort(key=lambda item: (-item[1], item[0]))
            rank_on_day = next((idx + 1 for idx, item in enumerate(standings) if item[0] == current_user_id), len(standings))
            cum_xp = sum(val for dt, val in user_totals.get(current_user_id, {}).items() if dt <= d)
            day_xp = user_totals.get(current_user_id, {}).get(d, 0)
            history.append({
                "date": d.isoformat(),
                "label": d.strftime("%b %d"),
                "rank": rank_on_day,
                "cumulative_xp": cum_xp,
                "daily_xp": day_xp,
            })
        return history
    except Exception as e:
        print(f"[WARN] _compute_real_rank_history error: {e}")
        return []


def get_leaderboard_data(
    period: str = "overall",
    current_user_id: int = 1,
    cursor = None,
    batch: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Produces the single-source-of-truth Leaderboard payload from actual PostgreSQL records.
    Supports:
      - 'weekly': Rolling 7 days (PostgreSQL CURRENT_TIMESTAMP - 7 days, UTC)
      - 'monthly': Rolling 30 days (PostgreSQL CURRENT_TIMESTAMP - 30 days, UTC)
      - 'overall': All accumulated activity (UTC)
    Optional 'batch' filter restricts leaderboard to a specific graduation year (e.g. '2026').
    """
    period_lower = (period or "overall").lower().strip()
    if period_lower not in ["weekly", "monthly", "overall"]:
        period_lower = "overall"

    batch_clean = str(batch).strip() if batch else None
    if batch_clean and batch_clean.lower() in ("all", "none", ""):
        batch_clean = None

    if period_lower == "weekly":
        date_filter_raw = "AND t.created_at >= (CURRENT_TIMESTAMP - INTERVAL '7 days')"
        prev_filter_raw = "AND t.created_at >= (CURRENT_TIMESTAMP - INTERVAL '14 days') AND t.created_at < (CURRENT_TIMESTAMP - INTERVAL '7 days')"
        period_label = "Rolling last 7 days (UTC)"
    elif period_lower == "monthly":
        date_filter_raw = "AND t.created_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days')"
        prev_filter_raw = "AND t.created_at >= (CURRENT_TIMESTAMP - INTERVAL '60 days') AND t.created_at < (CURRENT_TIMESTAMP - INTERVAL '30 days')"
        period_label = "Rolling last 30 days (UTC)"
    else:
        date_filter_raw = ""
        prev_filter_raw = None
        period_label = "All accumulated activity (UTC)"

    # Fetch distinct real graduation batches
    cursor.execute("""
        SELECT DISTINCT grad_year
        FROM users
        WHERE grad_year IS NOT NULL
        ORDER BY grad_year ASC;
    """)
    available_batches = [str(r["grad_year"]) for r in cursor.fetchall() if r.get("grad_year")]

    batch_where_sql = ""
    params: List[Any] = []
    if batch_clean and batch_clean.isdigit():
        batch_where_sql = "WHERE u.grad_year = %s"
        params.append(int(batch_clean))

    # Aggregate XP, DSA solved, Aptitude solved, Roadmap topics completed per user
    query = f"""
        WITH user_period_xp AS (
            SELECT 
                u.id as user_id,
                u.full_name,
                u.email,
                u.target_role,
                u.grad_year,
                COALESCE(u.college, '') as college,
                COALESCE(u.avatar_url, '') as avatar_url,
                COALESCE(SUM(t.amount), 0)::int as period_xp,
                MIN(t.created_at) as earliest_activity
            FROM users u
            LEFT JOIN xp_transactions t ON u.id = t.user_id {date_filter_raw}
            {batch_where_sql}
            GROUP BY u.id, u.full_name, u.email, u.target_role, u.grad_year, u.college, u.avatar_url
        ),
        user_all_xp AS (
            SELECT user_id, COALESCE(SUM(amount), 0)::int AS lifetime_xp
            FROM xp_transactions
            GROUP BY user_id
        ),
        user_problems AS (
            SELECT user_id, COUNT(DISTINCT problem_id)::int as solved_problems
            FROM user_dsa_progress
            WHERE is_solved = true
            GROUP BY user_id
        ),
        user_aptitude AS (
            SELECT user_id, COUNT(DISTINCT question_id)::int as solved_aptitude
            FROM user_question_progress
            WHERE status = 'solved'
            GROUP BY user_id
        ),
        user_roadmap AS (
            SELECT user_id, COUNT(DISTINCT topic_id)::int as completed_roadmap
            FROM user_roadmap_progress
            WHERE status = 'completed'
            GROUP BY user_id
        )
        SELECT 
            x.user_id,
            x.full_name,
            x.email,
            x.target_role,
            x.grad_year,
            x.college,
            x.avatar_url,
            x.period_xp,
            COALESCE(ax.lifetime_xp, 0) as lifetime_xp,
            x.earliest_activity,
            COALESCE(p.solved_problems, 0) as problems_solved,
            COALESCE(ap.solved_aptitude, 0) as aptitude_solved,
            COALESCE(rm.completed_roadmap, 0) as roadmap_completed
        FROM user_period_xp x
        LEFT JOIN user_all_xp ax ON x.user_id = ax.user_id
        LEFT JOIN user_problems p ON x.user_id = p.user_id
        LEFT JOIN user_aptitude ap ON x.user_id = ap.user_id
        LEFT JOIN user_roadmap rm ON x.user_id = rm.user_id
        ORDER BY 
            x.period_xp DESC,
            problems_solved DESC,
            aptitude_solved DESC,
            x.user_id ASC;
    """
    cursor.execute(query, tuple(params))
    raw_users = cursor.fetchall()

    # Previous period ranks for weekly / monthly rank delta (only when prior activity exists)
    prev_rank_map: Dict[int, int] = {}
    if prev_filter_raw:
        prev_query = f"""
            SELECT u.id AS user_id, COALESCE(SUM(t.amount), 0)::int AS prev_xp
            FROM users u
            LEFT JOIN xp_transactions t ON u.id = t.user_id {prev_filter_raw}
            {batch_where_sql}
            GROUP BY u.id
            ORDER BY prev_xp DESC, u.id ASC;
        """
        cursor.execute(prev_query, tuple(params))
        prev_rows = cursor.fetchall()
        if any(r["prev_xp"] > 0 for r in prev_rows):
            for p_idx, pr in enumerate(prev_rows):
                if pr["prev_xp"] > 0:
                    prev_rank_map[pr["user_id"]] = p_idx + 1

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

    # Platform totals from PostgreSQL
    cursor.execute("SELECT COUNT(*) as total_dsa FROM dsa_problems;")
    total_dsa = max(1, (cursor.fetchone() or {}).get("total_dsa", 1) or 1)

    cursor.execute("SELECT COUNT(*) as total_apt FROM aptitude_questions;")
    total_aptitude = int((cursor.fetchone() or {}).get("total_apt", 0) or 0)

    cursor.execute("SELECT COUNT(*) as total_rm FROM roadmap_topics;")
    total_roadmap = int((cursor.fetchone() or {}).get("total_rm", 0) or 0)

    cursor.execute("""
        SELECT user_id, ROUND(AVG(COALESCE(accuracy, score_percentage))::numeric, 0)::int AS avg_apt
        FROM aptitude_test_results
        GROUP BY user_id;
    """)
    apt_avg_map = {r["user_id"]: int(r["avg_apt"] or 0) for r in cursor.fetchall()}

    cursor.execute("""
        SELECT user_id, ROUND(AVG(score)::numeric, 0)::int AS avg_mock
        FROM mock_interview_results
        GROUP BY user_id;
    """)
    mock_avg_map = {r["user_id"]: int(r["avg_mock"] or 0) for r in cursor.fetchall()}

    total_candidates = len(raw_users)
    rankings = []
    current_user_card = None

    for idx, u in enumerate(raw_users):
        uid = u["user_id"]
        streak = calculate_streak(uid, cursor)
        readiness = get_user_readiness(uid, cursor)
        level_info = calculate_level(u["lifetime_xp"])

        name = u["full_name"] or u["email"].split("@")[0]
        parts = name.strip().split()
        initials = (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper() if parts else "ST"

        badges = []
        if u["problems_solved"] >= 1 or u["aptitude_solved"] >= 1:
            badges.append("First Problem Solved")
        if streak >= 7:
            badges.append("7-Day Streak")
        if u["problems_solved"] >= 50:
            badges.append("50 DSA Problems")
        if readiness >= 75:
            badges.append("Interview Ready")
        if u["lifetime_xp"] >= 500 and "Consistent Achiever" not in badges:
            badges.append("Consistent Achiever")

        rank = idx + 1
        prev_rank = prev_rank_map.get(uid)
        rank_change = (prev_rank - rank) if prev_rank is not None else None
        is_current = (uid == current_user_id)

        percentile = (
            100.0
            if total_candidates <= 1
            else round(((total_candidates - rank) / (total_candidates - 1)) * 100, 1)
        )

        dsa_metric = min(100, round((u["problems_solved"] / total_dsa) * 100, 1)) if u["problems_solved"] > 0 else 0
        apt_metric = apt_avg_map.get(uid, 0)
        interview_metric = mock_avg_map.get(uid, 0)

        user_item = {
            "id": uid,
            "rank": rank,
            "rankChange": rank_change,
            "percentile": percentile,
            "name": name,
            "email": u["email"],
            "username": u["email"].split("@")[0],
            "avatar": initials,
            "avatar_url": u.get("avatar_url") or None,
            "role": u["target_role"] or "Software Engineer Aspirant",
            "batch": str(u["grad_year"]) if u.get("grad_year") else None,
            "institution": (u.get("college") or "").strip() or None,
            "xp": u["period_xp"],
            "total_xp": u["lifetime_xp"],
            "level": level_info["level"],
            "next_level_xp": level_info["next_level_xp"],
            "xp_in_level": level_info["xp_in_level"],
            "progress_percentage": level_info["progress_percentage"],
            "problems": u["problems_solved"],
            "aptitude_solved": u["aptitude_solved"],
            "roadmap_completed": u["roadmap_completed"],
            "streak": streak,
            "readiness": readiness,
            "dsa": dsa_metric,
            "aptitude": apt_metric,
            "interview": interview_metric,
            "badges": badges,
            "recent_activities": user_recent_map.get(uid, []),
            "is_current_user": is_current,
        }

        rankings.append(user_item)
        if is_current:
            current_user_card = user_item

    # Active participants (users with positive activity in selected scope)
    active_participants = sum(
        1 for item in rankings if item["xp"] > 0 or item["problems"] > 0 or item["aptitude_solved"] > 0 or item["streak"] > 0
    )

    # Fallback if logged-in user belongs to a different batch when filtered by batch
    if not current_user_card and current_user_id:
        cursor.execute(
            "SELECT id, full_name, email, target_role, grad_year, college, avatar_url, COALESCE(total_xp, 0) AS total_xp FROM users WHERE id = %s;",
            (current_user_id,),
        )
        u = cursor.fetchone()
        if u:
            streak = calculate_streak(current_user_id, cursor)
            readiness = get_user_readiness(current_user_id, cursor)
            level_info = calculate_level(u["total_xp"])
            parts = (u["full_name"] or "").strip().split()
            initials = (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper() if parts else "ME"
            current_user_card = {
                "id": u["id"],
                "rank": len(rankings) + 1,
                "rankChange": None,
                "percentile": 0.0,
                "name": u["full_name"] or "You",
                "email": u["email"],
                "username": u["email"].split("@")[0],
                "avatar": initials,
                "avatar_url": u.get("avatar_url") or None,
                "role": u["target_role"] or "Software Engineer Aspirant",
                "batch": str(u["grad_year"]) if u.get("grad_year") else None,
                "institution": (u.get("college") or "").strip() or None,
                "xp": u["total_xp"],
                "total_xp": u["total_xp"],
                "level": level_info["level"],
                "next_level_xp": level_info["next_level_xp"],
                "xp_in_level": level_info["xp_in_level"],
                "progress_percentage": level_info["progress_percentage"],
                "problems": 0,
                "aptitude_solved": 0,
                "roadmap_completed": 0,
                "streak": streak,
                "readiness": readiness,
                "dsa": 0,
                "aptitude": apt_avg_map.get(current_user_id, 0),
                "interview": mock_avg_map.get(current_user_id, 0),
                "badges": [],
                "recent_activities": user_recent_map.get(current_user_id, []),
                "is_current_user": True,
            }

    # Count full roadmap domains completed for current user
    domains_completed = 0
    if current_user_id:
        try:
            cursor.execute("""
                SELECT COUNT(*)::int AS dc FROM (
                    SELECT d.id
                    FROM roadmap_domains d
                    JOIN roadmap_topics t ON t.domain_id = d.id
                    LEFT JOIN user_roadmap_progress urp ON urp.topic_id = t.id AND urp.user_id = %s AND urp.status = 'completed'
                    GROUP BY d.id
                    HAVING COUNT(t.id) > 0 AND COUNT(t.id) = COUNT(urp.topic_id)
                ) sub;
            """, (current_user_id,))
            dc_row = cursor.fetchone()
            domains_completed = int(dc_row["dc"] if dc_row else 0)
        except Exception:
            domains_completed = 0

    achievements = _sync_and_get_achievements(
        user_id=current_user_id,
        dsa_solved=(current_user_card or {}).get("problems", 0),
        apt_solved=(current_user_card or {}).get("aptitude_solved", 0),
        streak=(current_user_card or {}).get("streak", 0),
        readiness=(current_user_card or {}).get("readiness", 0),
        domains_completed=domains_completed,
        cursor=cursor,
    )
    rank_history = _compute_real_rank_history(current_user_id, cursor) if current_user_id else []

    top_three = rankings[:3]
    highest_xp = rankings[0]["xp"] if rankings and rankings[0]["xp"] > 0 else 100

    return {
        "period": period_lower,
        "period_info": {
            "label": period_label,
            "timezone": "UTC",
        },
        "batch": batch_clean,
        "available_batches": available_batches,
        "total_learners": total_candidates,
        "active_participants": active_participants,
        "current_user": current_user_card,
        "top_three": top_three,
        "rankings": rankings,
        "highest_xp": highest_xp,
        "totals": {
            "dsa_total": int(total_dsa),
            "aptitude_total": int(total_aptitude),
            "roadmap_total": int(total_roadmap),
        },
        "achievements": achievements,
        "rank_history": rank_history,
        "xp_rules": XP_DISPLAY_RULES,
        "updated_at": datetime.utcnow().isoformat(),
    }


def seed_campus_cohort_if_needed(cursor):
    """
    Avoids seeding synthetic cohort users when real registered accounts already exist.
    """
    cursor.execute("SELECT COUNT(*) as count FROM users;")
    user_count = cursor.fetchone()["count"]
    if user_count > 1:
        return

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
