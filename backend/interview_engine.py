import os
import re
import json
import time
import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("prepnest.interview")

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
COMPANIES_ROLES_PATH = os.path.join(DATA_DIR, "company_role_requirements.json")

COMPANY_ROLES_DATA: List[Dict[str, Any]] = []
if os.path.exists(COMPANIES_ROLES_PATH):
    try:
        with open(COMPANIES_ROLES_PATH, "r", encoding="utf-8") as f:
            COMPANY_ROLES_DATA = json.load(f)
    except Exception as e:
        logger.warning(f"Failed loading company_role_requirements.json: {e}")


PERSONALITY_PROMPTS = {
    "professional": {
        "label": "Professional",
        "tone": "Formal, composed, structured, polite senior interviewer. Balanced probing follow-ups.",
        "intro_style": "Welcome to your structured interview session.",
    },
    "friendly": {
        "label": "Friendly",
        "tone": "Warm, encouraging, supportive mentor-style interviewer who puts the candidate at ease while evaluating objectively.",
        "intro_style": "Glad to have you here today! Take your time and think out loud as we walk through this together.",
    },
    "strict": {
        "label": "Strict",
        "tone": "Direct, high-bar principal interviewer. Concise phrasing, challenges vague claims immediately, demands technical tradeoffs and justification.",
        "intro_style": "We have limited time and a high bar today, so please keep your answers precise and technically grounded.",
    },
}

MODE_RULES = {
    "realistic": {
        "label": "Realistic Interview",
        "immediate_feedback": False,
        "allow_hints": False,
        "max_followups_per_topic": 2,
        "description": "Simulates a real panel round: no immediate hints or answers during the session; detailed evaluation delivered after completion.",
    },
    "practice": {
        "label": "Practice & Coaching",
        "immediate_feedback": True,
        "allow_hints": True,
        "max_followups_per_topic": 2,
        "description": "Guided preparation with optional hints, immediate turn feedback, explanations, and topic tips.",
    },
    "pressure": {
        "label": "Pressure Mode",
        "immediate_feedback": False,
        "allow_hints": False,
        "max_followups_per_topic": 2,
        "description": "High-pressure interview simulation with shorter response windows, strict follow-ups, and zero assistance.",
    },
}

FOLLOWUP_STRATEGIES = [
    "clarification",
    "depth",
    "application",
    "challenge",
    "correction",
    "alternative",
    "reflection",
]

DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"]


def _parse_json_list(raw: Any) -> List[str]:
    if not raw:
        return []
    if isinstance(raw, list):
        return [str(x).strip() for x in raw if str(x).strip()]
    if isinstance(raw, str):
        s = raw.strip()
        if s.startswith("["):
            try:
                parsed = json.loads(s)
                if isinstance(parsed, list):
                    return [str(x).strip() for x in parsed if str(x).strip()]
            except Exception:
                pass
        return [x.strip() for x in s.split(",") if x.strip()]
    return []


def _parse_json_object(raw_text: str) -> Optional[Dict[str, Any]]:
    if not raw_text:
        return None
    cleaned = raw_text.strip()
    # Strip <think>...</think> blocks if emitted by reasoning models
    cleaned = re.sub(r"<think>.*?</think>", "", cleaned, flags=re.DOTALL).strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        obj = json.loads(cleaned)
        return obj if isinstance(obj, dict) else None
    except Exception:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if match:
            try:
                obj = json.loads(match.group(0))
                return obj if isinstance(obj, dict) else None
            except Exception:
                return None
    return None


def call_groq_structured_json(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 500,
    temperature: float = 0.35,
) -> Optional[Dict[str, Any]]:
    """
    Calls configured Groq LLM and enforces validated JSON dictionary output.
    Returns None gracefully on missing key, timeout, or parse failure so callers can fall back safely.
    """
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    target_model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b").strip()
    if not groq_api_key or groq_api_key.startswith("gsk_your_groq"):
        return None

    try:
        from groq import Groq

        client = Groq(api_key=groq_api_key, timeout=14.0)
        candidates = list(
            dict.fromkeys(
                [
                    target_model,
                    "llama-3.3-70b-versatile",
                    "openai/gpt-oss-20b",
                    "qwen/qwen3.8-27b",
                ]
            )
        )
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        for model_name in candidates:
            try:
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    response_format={"type": "json_object"},
                )
                content = completion.choices[0].message.content or ""
                parsed = _parse_json_object(content)
                if parsed:
                    return parsed
            except Exception:
                # Try without response_format if specific model rejects json_object
                try:
                    completion = client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens,
                    )
                    content = completion.choices[0].message.content or ""
                    parsed = _parse_json_object(content)
                    if parsed:
                        return parsed
                except Exception as inner_err:
                    logger.warning(f"Groq interview call failed on {model_name}: {inner_err}")
                    continue
    except Exception as e:
        logger.warning(f"Groq client error in interview_engine: {e}")

    return None


# =============================================================
# 1. CANDIDATE CONTEXT & COMPANY PATTERN BUILDER
# =============================================================


def resolve_company_context(
    company_name: Optional[str],
    target_role: Optional[str],
    cursor,
) -> Dict[str, Any]:
    """
    Retrieves real company interview pattern metadata from company_tracks and
    company_role_requirements.json. Clearly marks patterns as commonly reported patterns
    (never claiming confidential questions).
    """
    if not company_name or company_name.strip().lower() in ("general", "none", "all"):
        return {
            "company_slug": None,
            "company_name": None,
            "category": "General",
            "hiring_difficulty": "Medium",
            "sections": [],
            "stages": [],
            "required_skills": [],
            "dsa_topics": [],
            "behavioral_focus": "STAR method ownership, collaboration, problem resolution",
            "pattern_source_note": "Role-aligned technical and behavioral practice.",
        }

    c_clean = company_name.strip()
    track_row = None
    try:
        cursor.execute(
            """
            SELECT slug, name, category, role, hiring_difficulty, assessment_type,
                   description, test_pattern, sections, stages, experiences
            FROM company_tracks
            WHERE LOWER(name) = LOWER(%s) OR LOWER(slug) = LOWER(%s)
            LIMIT 1;
            """,
            (c_clean, c_clean),
        )
        track_row = cursor.fetchone()
    except Exception as e:
        logger.warning(f"company_tracks lookup error: {e}")

    req_match = None
    r_norm = (target_role or "").strip().lower()
    for item in COMPANY_ROLES_DATA:
        ic = (item.get("company") or "").strip().lower()
        ir = (item.get("role") or "").strip().lower()
        if ic == c_clean.lower() and (not r_norm or r_norm in ir or ir in r_norm):
            req_match = item
            break
    if not req_match:
        for item in COMPANY_ROLES_DATA:
            if (item.get("company") or "").strip().lower() == c_clean.lower():
                req_match = item
                break

    sections = []
    stages = []
    takeaways = []
    difficulty = "Medium"
    resolved_name = c_clean
    slug = c_clean.lower()

    if track_row:
        resolved_name = track_row["name"]
        slug = track_row["slug"]
        difficulty = track_row.get("hiring_difficulty") or "Medium"
        sections = track_row.get("sections") or []
        stages = track_row.get("stages") or []
        experiences = track_row.get("experiences") or []
        takeaways = [
            e.get("takeaway", "")
            for e in experiences
            if isinstance(e, dict) and e.get("takeaway")
        ]

    req_skills = (
        [s.strip() for s in req_match["required_skills"].split(";") if s.strip()]
        if req_match and req_match.get("required_skills")
        else []
    )
    dsa_topics = (
        [s.strip() for s in req_match["dsa_topics"].split(";") if s.strip()]
        if req_match and req_match.get("dsa_topics")
        else []
    )
    soft_skills = (
        [s.strip() for s in req_match["soft_skills"].split(";") if s.strip()]
        if req_match and req_match.get("soft_skills")
        else ["Communication", "Problem Solving", "Teamwork"]
    )

    behavioral_focus = ", ".join(soft_skills)
    if resolved_name.lower() == "amazon":
        behavioral_focus = "Amazon Leadership Principles (Ownership, Customer Obsession, Dive Deep, Bias for Action) via STAR"
    elif resolved_name.lower() == "google":
        behavioral_focus = "Googleyness, navigating ambiguity, analytical tradeoffs, collaborative ownership"

    return {
        "company_slug": slug,
        "company_name": resolved_name,
        "category": track_row.get("category") if track_row else "Company Track",
        "hiring_difficulty": difficulty,
        "sections": sections,
        "stages": [s.get("stage") for s in stages if isinstance(s, dict) and s.get("stage")],
        "takeaways": takeaways,
        "required_skills": req_skills,
        "dsa_topics": dsa_topics,
        "behavioral_focus": behavioral_focus,
        "pattern_source_note": "Based on commonly reported interview patterns and PrepNest topic directories; not confidential company questions.",
    }


def build_interview_candidate_context(user_id: int, cursor) -> Dict[str, Any]:
    """
    Collects verified candidate facts from PostgreSQL without inventing missing details.
    """
    ctx: Dict[str, Any] = {
        "full_name": "Candidate",
        "target_role": None,
        "target_companies": [],
        "skills": [],
        "college": None,
        "degree": None,
        "department": None,
        "preferred_language": "Python",
        "prep_level": "Intermediate",
        "preferred_subjects": [],
        "resume_skills": [],
        "resume_missing_keywords": [],
        "dsa_solved_count": 0,
        "dsa_strong_topics": [],
        "completed_roadmap_domains": [],
        "weak_interview_categories": [],
        "past_interview_count": 0,
    }

    try:
        cursor.execute(
            """
            SELECT full_name, target_role, target_companies, skills, college, degree,
                   department, preferred_language, prep_level, preferred_subjects
            FROM users WHERE id = %s;
            """,
            (user_id,),
        )
        u = cursor.fetchone()
        if u:
            ctx["full_name"] = (u.get("full_name") or "Candidate").strip()
            ctx["target_role"] = u.get("target_role")
            ctx["target_companies"] = _parse_json_list(u.get("target_companies"))
            ctx["skills"] = _parse_json_list(u.get("skills"))
            ctx["college"] = u.get("college")
            ctx["degree"] = u.get("degree")
            ctx["department"] = u.get("department")
            ctx["preferred_language"] = u.get("preferred_language") or "Python"
            ctx["prep_level"] = u.get("prep_level") or "Intermediate"
            ctx["preferred_subjects"] = _parse_json_list(u.get("preferred_subjects"))
    except Exception as e:
        logger.warning(f"User profile read failed: {e}")

    # Latest resume analysis
    try:
        cursor.execute(
            """
            SELECT matched_keywords, missing_keywords, target_role, target_company
            FROM resume_analyses
            WHERE user_id = %s
            ORDER BY created_at DESC LIMIT 1;
            """,
            (user_id,),
        )
        r = cursor.fetchone()
        if r:
            ctx["resume_skills"] = _parse_json_list(r.get("matched_keywords"))[:8]
            ctx["resume_missing_keywords"] = _parse_json_list(r.get("missing_keywords"))[:6]
            if not ctx["target_role"] and r.get("target_role"):
                ctx["target_role"] = r.get("target_role")
    except Exception:
        pass

    # DSA solved history
    try:
        cursor.execute(
            """
            SELECT p.topics
            FROM user_dsa_progress udp
            JOIN dsa_problems p ON udp.problem_id = p.id
            WHERE udp.user_id = %s AND udp.is_solved = TRUE;
            """,
            (user_id,),
        )
        rows = cursor.fetchall()
        ctx["dsa_solved_count"] = len(rows)
        topic_counts: Dict[str, int] = {}
        for row in rows:
            for t in (row.get("topics") or []):
                topic_counts[t] = topic_counts.get(t, 0) + 1
        ctx["dsa_strong_topics"] = [
            k for k, _ in sorted(topic_counts.items(), key=lambda kv: -kv[1])[:5]
        ]
    except Exception:
        pass

    # Completed roadmap domains
    try:
        cursor.execute(
            """
            SELECT DISTINCT d.name
            FROM user_roadmap_progress urp
            JOIN roadmap_topics t ON urp.topic_id = t.id
            JOIN roadmap_domains d ON t.domain_id = d.id
            WHERE urp.user_id = %s AND urp.status = 'completed';
            """,
            (user_id,),
        )
        ctx["completed_roadmap_domains"] = [r["name"] for r in cursor.fetchall()]
    except Exception:
        pass

    # Past interview performance + weak topics
    try:
        cursor.execute(
            """
            SELECT category, score, answers_json
            FROM mock_interview_results
            WHERE user_id = %s
            ORDER BY created_at DESC LIMIT 6;
            """,
            (user_id,),
        )
        hist_rows = cursor.fetchall()
        ctx["past_interview_count"] = len(hist_rows)
        weak_topics: List[str] = []
        for hr in hist_rows:
            if (hr.get("score") or 0) < 65:
                weak_topics.append(hr["category"])
            ans = hr.get("answers_json") or []
            if isinstance(ans, list):
                for a in ans:
                    if isinstance(a, dict) and (a.get("score", 100) < 60):
                        t = a.get("topic")
                        if t:
                            weak_topics.append(str(t))
        ctx["weak_interview_categories"] = list(dict.fromkeys(weak_topics))[:5]
    except Exception:
        pass

    return ctx


# =============================================================
# 2. QUESTION SELECTION & PROVENANCE
# =============================================================


def _initial_difficulty(experience_level: str, company_diff: str, mode: str) -> str:
    exp = (experience_level or "fresher").lower()
    if mode == "pressure" or company_diff in ("Hard", "Extreme") or exp == "experienced":
        return "Medium" if exp == "fresher" else "Hard"
    if exp == "fresher":
        return "Easy"
    return "Medium"


def _step_difficulty(current_diff: str, score: int) -> str:
    idx = DIFFICULTY_LEVELS.index(current_diff) if current_diff in DIFFICULTY_LEVELS else 1
    if score >= 82 and idx < len(DIFFICULTY_LEVELS) - 1:
        return DIFFICULTY_LEVELS[idx + 1]
    if score < 45 and idx > 0:
        return DIFFICULTY_LEVELS[idx - 1]
    return DIFFICULTY_LEVELS[idx]


def select_next_bank_question(
    category: str,
    target_difficulty: str,
    asked_ids: List[int],
    asked_prompts: List[str],
    candidate_ctx: Dict[str, Any],
    company_ctx: Dict[str, Any],
    cursor,
    project_questions: Optional[List[Dict[str, Any]]] = None,
) -> Optional[Dict[str, Any]]:
    """
    Prioritizes:
    1. Project defense questions (when in Project mode)
    2. Verified PrepNest PostgreSQL mock_interview_questions tailored to skills/weak topics/difficulty
    """
    asked_set = set(int(x) for x in (asked_ids or []) if str(x).isdigit())
    asked_text_set = {p.strip().lower() for p in (asked_prompts or []) if isinstance(p, str)}

    if category == "Project" and project_questions:
        for idx, pq in enumerate(project_questions):
            qtext = (pq.get("question") or "").strip()
            if qtext and qtext.lower() not in asked_text_set:
                return {
                    "source_question_id": idx + 100000,
                    "question_source": "project_defense",
                    "question": qtext,
                    "topic": pq.get("topic") or "Project Architecture",
                    "difficulty": pq.get("difficulty") or target_difficulty,
                    "keywords": pq.get("keywords") or [],
                }

    # Query verified bank
    if category == "Mixed":
        cursor.execute(
            "SELECT id, category, COALESCE(topic, 'General') AS topic, question, keywords, difficulty FROM mock_interview_questions ORDER BY id ASC;"
        )
    else:
        cursor.execute(
            "SELECT id, category, COALESCE(topic, 'General') AS topic, question, keywords, difficulty FROM mock_interview_questions WHERE category = %s ORDER BY id ASC;",
            (category,),
        )
    candidates = cursor.fetchall()

    preferred_skills = {
        s.lower()
        for s in (
            candidate_ctx.get("skills", [])
            + candidate_ctx.get("preferred_subjects", [])
            + candidate_ctx.get("weak_interview_categories", [])
            + company_ctx.get("required_skills", [])
            + company_ctx.get("dsa_topics", [])
            + company_ctx.get("sections", [])
        )
    }

    best = None
    best_score = -10**9
    for row in candidates:
        qid = int(row["id"])
        qtext = row["question"].strip()
        if qid in asked_set or qtext.lower() in asked_text_set:
            continue

        score = 0
        if (row.get("difficulty") or "Medium") == target_difficulty:
            score += 25
        topic_lower = (row.get("topic") or "").lower()
        q_lower = qtext.lower()
        for kw in preferred_skills:
            if kw and (kw in topic_lower or kw in q_lower):
                score += 12
        # Prioritize weak categories from previous interviews
        for wk in candidate_ctx.get("weak_interview_categories", []):
            if wk.lower() in topic_lower or wk.lower() in (row.get("category") or "").lower():
                score += 18
        if best is None or score > best_score:
            best = row
            best_score = score

    if not best:
        return None

    return {
        "source_question_id": int(best["id"]),
        "question_source": "verified_question_bank",
        "question": best["question"],
        "topic": best.get("topic") or best["category"],
        "difficulty": best.get("difficulty") or target_difficulty,
        "keywords": best.get("keywords") or [],
    }


def _generate_contextual_question(
    session: Dict[str, Any],
    candidate_ctx: Dict[str, Any],
    company_ctx: Dict[str, Any],
    phase: str,
    target_difficulty: str,
    asked_prompts: List[str],
    cursor,
    project_questions: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Gets the next main/warmup/final question: prioritizes verified bank first,
    then generates a tailored practice question if bank items are exhausted or for company-specific warm-up/final rounds.
    """
    category = session["category"]
    asked_ids = session.get("asked_question_ids") or []

    # Warm-up question tailored to candidate background
    if phase == "warmup":
        lang = candidate_ctx.get("preferred_language") or "Python"
        role = session.get("target_role") or candidate_ctx.get("target_role") or "Software Engineer"
        comp = company_ctx.get("company_name")
        skills = candidate_ctx.get("skills") or [lang]
        lead_skill = skills[0] if skills else lang

        if category in ("HR", "Behavioral"):
            q = (
                f"To get started, tell me briefly about your background and what motivates you to target the {role} role"
                + (f" at {comp}?" if comp else "?")
            )
            return {
                "source_question_id": None,
                "question_source": "company_pattern" if comp else "topic_directory",
                "question": q,
                "topic": "Background & Motivation",
                "difficulty": "Easy",
                "keywords": ["background", "project", "skills", "role"],
            }

        # Technical / Mixed warm-up referencing candidate's verified skill
        if category == "Project" and project_questions:
            first = select_next_bank_question(
                category, "Easy", asked_ids, asked_prompts, candidate_ctx, company_ctx, cursor, project_questions
            )
            if first:
                return first

        bank_easy = select_next_bank_question(
            "Technical" if category == "Mixed" else category,
            "Easy",
            asked_ids,
            asked_prompts,
            candidate_ctx,
            company_ctx,
            cursor,
            project_questions,
        )
        if bank_easy:
            return bank_easy

        return {
            "source_question_id": None,
            "question_source": "topic_directory",
            "question": f"Since you work with {lead_skill}, walk me through a core concept or data structure you rely on most often in {lead_skill} and why.",
            "topic": lead_skill,
            "difficulty": "Easy",
            "keywords": [lead_skill.lower(), "complexity", "memory", "use case"],
        }

    # Final phase question
    if phase == "final":
        comp = company_ctx.get("company_name")
        role = session.get("target_role") or candidate_ctx.get("target_role") or "Software Engineer"
        q = (
            f"Before we wrap up your {role} interview"
            + (f" for {comp}" if comp else "")
            + ", what is one engineering project or tough technical trade-off you are most proud of, and do you have any questions for me about the team or role?"
        )
        return {
            "source_question_id": None,
            "question_source": "closing",
            "question": q,
            "topic": "Reflection & Candidate Questions",
            "difficulty": "Medium",
            "keywords": ["tradeoff", "architecture", "ownership", "question"],
        }

    # Main interview phase: prefer verified bank item first
    bank_item = select_next_bank_question(
        category,
        target_difficulty,
        asked_ids,
        asked_prompts,
        candidate_ctx,
        company_ctx,
        cursor,
        project_questions,
    )
    if bank_item:
        return bank_item

    # Fallback / company-pattern AI practice question when bank exhausted
    pers = PERSONALITY_PROMPTS.get(session["personality"], PERSONALITY_PROMPTS["professional"])
    comp_name = company_ctx.get("company_name") or "a leading tech company"
    sections = ", ".join(company_ctx.get("sections") or ["DSA", "Core CS", "System Design"])
    skills = ", ".join(candidate_ctx.get("skills")[:5]) or candidate_ctx.get("preferred_language", "Python")

    llm_q = call_groq_structured_json(
        system_prompt=(
            f"You are a {pers['label']} interviewer ({pers['tone']}). "
            "Generate ONE original practice interview question strictly in JSON: "
            '{"question": str, "topic": str, "difficulty": "Easy"|"Medium"|"Hard", "keywords": [str]}. '
            "Never repeat already asked questions. Do NOT claim the question is an actual confidential company question."
        ),
        user_prompt=(
            f"Track: {category} | Role: {session.get('target_role') or 'Software Engineer'} | "
            f"Company pattern focus: {comp_name} ({sections}) | Difficulty: {target_difficulty} | "
            f"Candidate skills: {skills} | Already asked: {json.dumps(asked_prompts[-8:])}"
        ),
        max_tokens=260,
        temperature=0.45,
    )
    if llm_q and llm_q.get("question"):
        return {
            "source_question_id": None,
            "question_source": "company_pattern" if company_ctx.get("company_name") else "ai_generated",
            "question": str(llm_q["question"]).strip(),
            "topic": str(llm_q.get("topic") or category),
            "difficulty": llm_q.get("difficulty") if llm_q.get("difficulty") in DIFFICULTY_LEVELS else target_difficulty,
            "keywords": [str(k) for k in (llm_q.get("keywords") or [])[:6]],
        }

    # Deterministic last-resort fallback question
    return {
        "source_question_id": None,
        "question_source": "topic_directory",
        "question": "Describe how you would design, test, and scale a backend endpoint that suddenly sees 10x traffic spikes.",
        "topic": "System Design & Scalability",
        "difficulty": target_difficulty,
        "keywords": ["caching", "rate limit", "database", "load balancer", "latency"],
    }


# =============================================================
# 3. ANSWER EVALUATOR (LLM + DETERMINISTIC FALLBACK)
# =============================================================


def _heuristic_evaluate_answer(
    question_text: str,
    answer_text: str,
    keywords: List[str],
    category: str,
) -> Dict[str, Any]:
    text = (answer_text or "").strip()
    if not text:
        return {
            "score": 0,
            "verdict": "Unanswered",
            "word_count": 0,
            "technical_score": 0,
            "conceptual_score": 0,
            "problem_solving_score": 0,
            "communication_score": 0,
            "relevance_score": 0,
            "is_ambiguous": True,
            "is_incorrect": False,
            "matched_keywords": [],
            "what_was_correct": "No response was submitted.",
            "what_was_missing": "A direct explanation addressing the prompt.",
            "suggested_improvement": "Structure your answer with key definitions, reasoning, and an example.",
            "expected_answer": f"A structured answer covering {', '.join(keywords[:4]) if keywords else 'core principles and tradeoffs'}.",
            "recommended_followup_strategy": "clarification",
        }

    lower = text.lower()
    words = lower.split()
    word_count = len(words)
    matched = [k for k in (keywords or []) if k.lower() in lower]
    kw_ratio = (len(matched) / len(keywords)) if keywords else (0.6 if word_count >= 25 else 0.3)

    depth_pts = 35 if word_count >= 75 else 28 if word_count >= 45 else 20 if word_count >= 20 else 10
    kw_pts = round(kw_ratio * 45)
    struct_pts = 20 if any(ch in text for ch in (".", ",", ";")) and word_count >= 12 else 10
    score = min(100, max(12, depth_pts + kw_pts + struct_pts))

    is_ambiguous = word_count < 18 or (len(matched) == 0 and word_count < 35)
    is_incorrect = score < 35
    verdict = "Strong" if score >= 80 else "Good" if score >= 62 else "Partial" if score >= 40 else "Weak"

    missing_kws = [k for k in (keywords or []) if k not in matched]
    strategy = (
        "clarification"
        if is_ambiguous
        else "correction"
        if is_incorrect
        else "depth"
        if score < 75
        else "challenge"
    )
    if category in ("HR", "Behavioral") and word_count < 45:
        strategy = "application"

    return {
        "score": score,
        "verdict": verdict,
        "word_count": word_count,
        "technical_score": min(100, round(kw_ratio * 100)) if keywords else score,
        "conceptual_score": score,
        "problem_solving_score": max(20, score - 4),
        "communication_score": min(100, 45 + min(55, word_count)),
        "relevance_score": min(100, max(35, score + 5)),
        "is_ambiguous": is_ambiguous,
        "is_incorrect": is_incorrect,
        "matched_keywords": matched,
        "what_was_correct": (
            f"Addressed key concepts: {', '.join(matched)}."
            if matched
            else "Attempted to explain the concept clearly."
        ),
        "what_was_missing": (
            f"Could elaborate more on: {', '.join(missing_kws[:4])}."
            if missing_kws
            else "Specific concrete example, complexity analysis, or edge-case justification."
        ),
        "suggested_improvement": "Use concrete examples, explicit time/space tradeoffs (for technical) or STAR metrics (for behavioral).",
        "expected_answer": (
            f"A complete answer should clearly explain {', '.join(keywords[:5])} with practical reasoning."
            if keywords
            else "A clear explanation covering core concept, practical usage, and tradeoffs."
        ),
        "recommended_followup_strategy": strategy,
    }


def evaluate_candidate_response(
    question_text: str,
    answer_text: str,
    category: str,
    topic: str,
    difficulty: str,
    keywords: List[str],
    transcription_uncertain: bool = False,
) -> Dict[str, Any]:
    """
    Evaluates candidate response using structured Groq LLM rubric, tolerating speech transcription noise,
    with deterministic fallback if LLM fails or times out.
    """
    heuristic = _heuristic_evaluate_answer(question_text, answer_text, keywords, category)
    if not (answer_text or "").strip():
        return heuristic

    system_prompt = (
        "You are a fair, objective senior technical/behavioral interview evaluator. "
        "Evaluate the candidate's response strictly against an interview rubric and return ONLY valid JSON with keys: "
        '{"score": int(0..100), "verdict": "Strong"|"Good"|"Partial"|"Weak", '
        '"technical_score": int(0..100), "conceptual_score": int(0..100), '
        '"problem_solving_score": int(0..100), "communication_score": int(0..100), '
        '"relevance_score": int(0..100), "is_ambiguous": bool, "is_incorrect": bool, '
        '"what_was_correct": str, "what_was_missing": str, "suggested_improvement": str, '
        '"expected_answer": str, "recommended_followup_strategy": '
        '"clarification"|"depth"|"application"|"challenge"|"correction"|"alternative"|"reflection"}. '
        "IMPORTANT RULES: "
        "1) The response may come from Web Speech API transcription — do NOT penalize minor phonetic typos, missing punctuation, or spoken phrasing. "
        "2) For coding/algorithm prompts discussed verbally, evaluate algorithmic logic, complexity, and edge cases — do NOT treat spoken explanations as failing code compilation. "
        "3) For Behavioral/HR prompts, assess STAR structure (Situation, Task, Action, Result) and individual ownership."
    )
    user_prompt = (
        f"Category: {category} | Topic: {topic} | Difficulty: {difficulty}\n"
        f"Question: {question_text}\n"
        f"Expected Concepts/Keywords: {', '.join(keywords or [])}\n"
        f"Speech Transcription Used: {transcription_uncertain}\n"
        f"Candidate Response: {answer_text[:2500]}"
    )

    llm_eval = call_groq_structured_json(system_prompt, user_prompt, max_tokens=550, temperature=0.2)
    if not llm_eval:
        return heuristic

    def _clamp(v, default):
        try:
            return max(0, min(100, int(round(float(v)))))
        except Exception:
            return default

    score = _clamp(llm_eval.get("score"), heuristic["score"])
    strategy = llm_eval.get("recommended_followup_strategy")
    if strategy not in FOLLOWUP_STRATEGIES:
        strategy = heuristic["recommended_followup_strategy"]

    verdict = llm_eval.get("verdict")
    if verdict not in ("Strong", "Good", "Partial", "Weak"):
        verdict = "Strong" if score >= 80 else "Good" if score >= 62 else "Partial" if score >= 40 else "Weak"

    return {
        "score": score,
        "verdict": verdict,
        "word_count": heuristic["word_count"],
        "technical_score": _clamp(llm_eval.get("technical_score"), score),
        "conceptual_score": _clamp(llm_eval.get("conceptual_score"), score),
        "problem_solving_score": _clamp(llm_eval.get("problem_solving_score"), score),
        "communication_score": _clamp(llm_eval.get("communication_score"), heuristic["communication_score"]),
        "relevance_score": _clamp(llm_eval.get("relevance_score"), score),
        "is_ambiguous": bool(llm_eval.get("is_ambiguous", heuristic["is_ambiguous"])),
        "is_incorrect": bool(llm_eval.get("is_incorrect", score < 40)),
        "matched_keywords": heuristic["matched_keywords"],
        "what_was_correct": str(llm_eval.get("what_was_correct") or heuristic["what_was_correct"]),
        "what_was_missing": str(llm_eval.get("what_was_missing") or heuristic["what_was_missing"]),
        "suggested_improvement": str(llm_eval.get("suggested_improvement") or heuristic["suggested_improvement"]),
        "expected_answer": str(llm_eval.get("expected_answer") or heuristic["expected_answer"]),
        "recommended_followup_strategy": strategy,
    }


# =============================================================
# 4. CONVERSATIONAL LIFECYCLE & ADAPTIVE FOLLOW-UP ENGINE
# =============================================================


def _build_interviewer_intro(
    session: Dict[str, Any],
    candidate_ctx: Dict[str, Any],
    company_ctx: Dict[str, Any],
) -> Dict[str, Any]:
    pers = PERSONALITY_PROMPTS.get(session["personality"], PERSONALITY_PROMPTS["professional"])
    mode_cfg = MODE_RULES.get(session["mode"], MODE_RULES["realistic"])
    first_name = (candidate_ctx.get("full_name") or "there").split()[0]
    comp = company_ctx.get("company_name")
    role = session.get("target_role") or candidate_ctx.get("target_role") or "Software Engineer"
    cat = session["category"]

    topics_preview = ", ".join(session.get("planned_topics") or ["Core Concepts", "Problem Solving"])
    default_msg = (
        f"Hello {first_name}! {pers['intro_style']} "
        f"Today's {session['duration_minutes']}-minute {cat} interview "
        + (f"(aligned with {comp} {role} patterns) " if comp else f"for {role} ")
        + f"will cover {topics_preview} in {mode_cfg['label']} mode."
    )
    default_q = "Before we dive into our first question, are you ready to begin, and would you like to quickly confirm your focus area?"

    llm_intro = call_groq_structured_json(
        system_prompt=(
            f"You are an experienced human interviewer with a {pers['label']} personality ({pers['tone']}). "
            f"Mode is {mode_cfg['label']}: {mode_cfg['description']}. "
            "Write Phase 1 INTRODUCTION cleanly in JSON: "
            '{"interviewer_message": str, "question_text": str}. '
            "Greet the candidate by first name, briefly state the structure/topics, and ask if they are ready to start. Keep concise (2-4 sentences total)."
        ),
        user_prompt=(
            f"Candidate: {first_name} | Track: {cat} | Role: {role} | Company: {comp or 'General'} | "
            f"Duration: {session['duration_minutes']} min | Focus topics: {topics_preview}"
        ),
        max_tokens=220,
        temperature=0.45,
    )

    return {
        "phase": "introduction",
        "question_source": "introduction",
        "source_question_id": None,
        "question_topic": "Interview Introduction",
        "question_difficulty": "Easy",
        "followup_strategy": None,
        "interviewer_message": (llm_intro or {}).get("interviewer_message") or default_msg,
        "question_text": (llm_intro or {}).get("question_text") or default_q,
        "keywords": [],
    }


def _generate_adaptive_followup(
    session: Dict[str, Any],
    last_turn: Dict[str, Any],
    candidate_answer: str,
    eval_result: Dict[str, Any],
    company_ctx: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generates an intelligent contextual follow-up directly referencing the candidate's response,
    selecting among the 7 follow-up strategies based on evaluation and mode.
    """
    pers = PERSONALITY_PROMPTS.get(session["personality"], PERSONALITY_PROMPTS["professional"])
    mode = session["mode"]
    strategy = eval_result.get("recommended_followup_strategy") or "depth"
    if mode == "pressure" and eval_result.get("score", 0) >= 55:
        strategy = "challenge" if (session.get("followups_used_for_topic", 0) == 0) else "alternative"

    hide_answer_rule = (
        "You may give brief constructive coaching, but ask a guiding follow-up rather than spoiling the whole answer."
        if mode == "practice"
        else "Do NOT reveal the full correct answer yet. Acknowledge naturally and probe with ONE targeted follow-up question."
    )

    strategy_instructions = {
        "clarification": "The answer was brief or ambiguous. Ask the candidate to clarify or expand on a specific claim they just made.",
        "depth": "Probe deeper into the underlying mechanism, internals, or time/space complexity of what they explained.",
        "application": "Ask how they would apply this concept or approach in a real-world system or concrete situation.",
        "challenge": "Introduce a harder edge case, scale constraint, or failure scenario based on their answer.",
        "correction": "The explanation missed something or had a misconception. Ask a targeted guiding question without revealing the answer directly.",
        "alternative": "Ask whether an alternative data structure, architecture, or approach could be more efficient and why.",
        "reflection": "Ask the candidate to justify the trade-offs or decisions they made in their response.",
    }

    llm_fu = call_groq_structured_json(
        system_prompt=(
            f"You are conducting a live interview as a {pers['label']} interviewer ({pers['tone']}). "
            f"Follow-up strategy: {strategy.upper()} — {strategy_instructions.get(strategy, '')} "
            f"{hide_answer_rule} "
            "Return ONLY valid JSON: "
            '{"interviewer_message": str, "question_text": str, "followup_strategy": str}. '
            "Rules: Ask ONE sharp question directly tied to what the candidate just said. Never repeat previous questions."
        ),
        user_prompt=(
            f"Summary so far: {session.get('conversation_summary', '')}\n"
            f"Company/Role context: {company_ctx.get('company_name') or 'General'} / {session.get('target_role') or 'Software Engineer'}\n"
            f"Previous question ({last_turn.get('question_topic')} / {last_turn.get('question_difficulty')}): {last_turn.get('question_text')}\n"
            f"Candidate's answer: {candidate_answer[:1400]}\n"
            f"Evaluator note: score={eval_result.get('score')}, missing={eval_result.get('what_was_missing')}"
        ),
        max_tokens=280,
        temperature=0.4,
    )

    if llm_fu and llm_fu.get("question_text"):
        used_strategy = llm_fu.get("followup_strategy")
        if used_strategy not in FOLLOWUP_STRATEGIES:
            used_strategy = strategy
        return {
            "phase": "followup",
            "question_source": "ai_followup",
            "source_question_id": None,
            "question_topic": last_turn.get("question_topic") or session["category"],
            "question_difficulty": _step_difficulty(last_turn.get("question_difficulty") or "Medium", eval_result.get("score", 50)),
            "followup_strategy": used_strategy,
            "interviewer_message": str(llm_fu.get("interviewer_message") or "Let's dig a bit deeper into your answer."),
            "question_text": str(llm_fu["question_text"]).strip(),
            "keywords": last_turn.get("keywords") or [],
        }

    # Deterministic contextual follow-up fallback
    fallback_prompts = {
        "clarification": "Could you clarify the core reasoning behind that point and walk through a specific example?",
        "depth": f"Good start. What happens under the hood here, and what are the time and space complexity trade-offs?",
        "application": f"How would you apply this in a production system handling concurrent users or real constraints?",
        "challenge": "What edge case or failure mode would break this approach at 100x scale, and how would you mitigate it?",
        "correction": "Think carefully about the constraint we discussed — what might behave differently under edge conditions?",
        "alternative": "Could an alternative approach solve this with better efficiency or simpler maintenance? Compare both.",
        "reflection": "Why did you choose that specific trade-off over alternatives, and what would make you switch?",
    }
    return {
        "phase": "followup",
        "question_source": "ai_followup",
        "source_question_id": None,
        "question_topic": last_turn.get("question_topic") or session["category"],
        "question_difficulty": last_turn.get("question_difficulty") or session["current_difficulty"],
        "followup_strategy": strategy,
        "interviewer_message": "Thank you for sharing that perspective. Let's follow up on what you mentioned.",
        "question_text": fallback_prompts.get(strategy, fallback_prompts["depth"]),
        "keywords": last_turn.get("keywords") or [],
    }


def _generate_transition_message(
    session: Dict[str, Any],
    prev_question_text: str,
    candidate_answer: str,
    next_q: Dict[str, Any],
    company_ctx: Dict[str, Any],
) -> str:
    pers = PERSONALITY_PROMPTS.get(session["personality"], PERSONALITY_PROMPTS["professional"])
    llm_tr = call_groq_structured_json(
        system_prompt=(
            f"You are a {pers['label']} interviewer ({pers['tone']}). "
            "Write a brief, natural 1-sentence transition acknowledging the candidate's previous answer (WITHOUT giving away correctness in Realistic/Pressure mode) and introducing the next topic cleanly. "
            'Return JSON: {"interviewer_message": str}.'
        ),
        user_prompt=(
            f"Previous question: {prev_question_text}\n"
            f"Candidate answer snippet: {candidate_answer[:500]}\n"
            f"Next topic: {next_q.get('topic')} | Next question: {next_q.get('question')}"
        ),
        max_tokens=140,
        temperature=0.4,
    )
    if llm_tr and llm_tr.get("interviewer_message"):
        return str(llm_tr["interviewer_message"]).strip()
    return f"Got it, thank you. Let's transition to {next_q.get('topic') or 'our next topic'}."


def _update_compact_summary(prev_summary: str, topic: str, score: int, strategy: Optional[str]) -> str:
    tag = f"{topic}({score}%{f'/{strategy}' if strategy else ''})"
    parts = [p.strip() for p in (prev_summary or "").split("|") if p.strip()]
    parts.append(tag)
    return " | ".join(parts[-6:])[:360]


# =============================================================
# 5. REPORT GENERATOR & REAL RECOMMENDATIONS
# =============================================================


def generate_full_interview_report(
    session: Dict[str, Any],
    turns: List[Dict[str, Any]],
    candidate_ctx: Dict[str, Any],
    company_ctx: Dict[str, Any],
    cursor,
) -> Dict[str, Any]:
    """
    Produces the comprehensive Evaluation Report strictly from evaluated turn records
    and queries real PostgreSQL DSA problems + Roadmap topics for weak areas.
    """
    scored_turns = [
        t for t in turns
        if t.get("phase") not in ("introduction",)
        and t.get("candidate_answer") is not None
    ]
    attempted_turns = [t for t in scored_turns if (t.get("candidate_answer") or "").strip()]
    total_asked = max(1, len([t for t in turns if t.get("phase") != "introduction"]))
    attempted_count = len(attempted_turns)

    evals = [t.get("evaluation_json") or {} for t in attempted_turns]
    if evals:
        overall_score = round(sum(int(e.get("score", 0)) for e in evals) / len(evals))
        tech_score = round(sum(int(e.get("technical_score", e.get("score", 0))) for e in evals) / len(evals))
        concept_score = round(sum(int(e.get("conceptual_score", e.get("score", 0))) for e in evals) / len(evals))
        problem_score = round(sum(int(e.get("problem_solving_score", e.get("score", 0))) for e in evals) / len(evals))
        comm_score = round(sum(int(e.get("communication_score", e.get("score", 0))) for e in evals) / len(evals))
        rel_score = round(sum(int(e.get("relevance_score", e.get("score", 0))) for e in evals) / len(evals))
        avg_words = round(sum(int(e.get("word_count", 0)) for e in evals) / len(evals))
        correct_count = sum(1 for e in evals if int(e.get("score", 0)) >= 62)
        keyword_matches = sum(len(e.get("matched_keywords") or []) for e in evals)
    else:
        overall_score = tech_score = concept_score = problem_score = comm_score = rel_score = 0
        avg_words = correct_count = keyword_matches = 0

    completion_pct = min(100, round((attempted_count / total_asked) * 100)) if total_asked else 0

    if overall_score >= 82:
        classification = "Strong Hire / Interview Ready"
    elif overall_score >= 68:
        classification = "Solid Performance — Minor Refinement Needed"
    elif overall_score >= 50:
        classification = "Developing — Needs Targeted Revision"
    else:
        classification = "Foundational — Practice Core Concepts"

    weak_topics: List[str] = []
    strengths: List[str] = []
    improvements: List[str] = []
    question_analysis: List[Dict[str, Any]] = []

    for idx, t in enumerate(scored_turns):
        ev = t.get("evaluation_json") or {}
        ans = (t.get("candidate_answer") or "").strip()
        q_score = int(ev.get("score", 0)) if ans else 0
        topic = t.get("question_topic") or session["category"]
        if q_score < 62 or not ans:
            if topic not in weak_topics:
                weak_topics.append(topic)

        question_analysis.append({
            "turn_number": t.get("turn_number", idx + 1),
            "phase": t.get("phase"),
            "question_source": t.get("question_source") or "verified_question_bank",
            "topic": topic,
            "difficulty": t.get("question_difficulty") or "Medium",
            "followup_strategy": t.get("followup_strategy"),
            "question": t.get("question_text"),
            "candidate_response": ans,
            "score": q_score,
            "verdict": ev.get("verdict") or ("Unanswered" if not ans else "Evaluated"),
            "what_was_correct": ev.get("what_was_correct") or ("No answer recorded." if not ans else "Provided relevant context."),
            "what_was_missing": ev.get("what_was_missing") or "Deeper technical trade-offs or examples.",
            "suggested_improvement": ev.get("suggested_improvement") or "State core principle first, then justify complexity and edge cases.",
            "expected_answer": ev.get("expected_answer") or "",
        })

    if overall_score >= 70:
        strengths.append("Consistent performance across core questions and adaptive follow-ups.")
    if comm_score >= 68 and avg_words >= 35:
        strengths.append("Clear communication structure with well-developed explanations.")
    if problem_score >= 70:
        strengths.append("Solid problem-solving reasoning under follow-up probing.")
    if not strengths:
        strengths.append("Completed interactive mock interview under live response constraints.")

    if weak_topics:
        improvements.append(f"Deepen conceptual mastery and practical examples in: {', '.join(weak_topics[:3])}.")
    if avg_words < 35 and attempted_count > 0:
        improvements.append("Expand responses beyond brief statements (aim for 45–80 words with concrete examples).")
    if problem_score < 65:
        improvements.append("Practice justifying time/space complexity and alternative designs during follow-ups.")
    if not improvements:
        improvements.append("Challenge yourself next in Strict Personality or Pressure Mode to sharpen edge-case defense.")

    # Real PostgreSQL DSA Problem Recommendations
    rec_dsa: List[Dict[str, Any]] = []
    try:
        search_terms = weak_topics + (company_ctx.get("dsa_topics") or [])
        cursor.execute(
            """
            SELECT p.id, p.title, p.slug, p.difficulty, p.topics
            FROM dsa_problems p
            WHERE p.id NOT IN (
                SELECT problem_id FROM user_dsa_progress WHERE user_id = %s AND is_solved = TRUE
            )
            ORDER BY CASE WHEN p.difficulty = %s THEN 0 ELSE 1 END, p.id ASC
            LIMIT 25;
            """,
            (session["user_id"], "Hard" if overall_score >= 78 else "Medium"),
        )
        dsa_pool = cursor.fetchall()
        for row in dsa_pool:
            row_topics = " ".join(row.get("topics") or []).lower()
            if any(term.lower() in row_topics for term in search_terms if term):
                rec_dsa.append({
                    "id": row["id"],
                    "title": row["title"],
                    "difficulty": row["difficulty"],
                    "topics": (row.get("topics") or [])[:3],
                })
                if len(rec_dsa) >= 4:
                    break
        if len(rec_dsa) < 3:
            for row in dsa_pool[: 3 - len(rec_dsa)]:
                if not any(d["id"] == row["id"] for d in rec_dsa):
                    rec_dsa.append({
                        "id": row["id"],
                        "title": row["title"],
                        "difficulty": row["difficulty"],
                        "topics": (row.get("topics") or [])[:3],
                    })
    except Exception:
        pass

    # Real PostgreSQL Roadmap Topic Recommendations
    rec_roadmaps: List[Dict[str, Any]] = []
    try:
        cursor.execute(
            """
            SELECT t.id, t.title, t.domain_id, d.name AS domain_name, t.difficulty
            FROM roadmap_topics t
            JOIN roadmap_domains d ON t.domain_id = d.id
            WHERE t.id NOT IN (
                SELECT topic_id FROM user_roadmap_progress WHERE user_id = %s AND status = 'completed'
            )
            ORDER BY d.display_order ASC, t.display_order ASC
            LIMIT 15;
            """,
            (session["user_id"],),
        )
        rm_pool = cursor.fetchall()
        for row in rm_pool:
            hay = f"{row['title']} {row['domain_name']}".lower()
            if any(w.lower() in hay for w in weak_topics if w):
                rec_roadmaps.append(dict(row))
                if len(rec_roadmaps) >= 3:
                    break
        if len(rec_roadmaps) < 3:
            for row in rm_pool[: 3 - len(rec_roadmaps)]:
                if not any(r["id"] == row["id"] for r in rec_roadmaps):
                    rec_roadmaps.append(dict(row))
    except Exception:
        pass

    next_diff = "Hard" if overall_score >= 78 else "Medium" if overall_score >= 52 else "Easy"
    next_mode = "pressure" if overall_score >= 78 else "realistic" if overall_score >= 55 else "practice"

    speech_count = sum(1 for t in attempted_turns if t.get("transcription_uncertain"))
    fluency_note = (
        f"Measured from {attempted_count} structured response(s) ({avg_words} avg words"
        + (f", {speech_count} voice-transcribed" if speech_count else ", text-based")
        + "); biometric confidence is not fabricated."
    )

    return {
        "overall": {
            "score": overall_score,
            "classification": classification,
            "questions_attempted": attempted_count,
            "total_questions": total_asked,
            "questions_correct": correct_count,
            "completion_percentage": completion_pct,
            "average_words": avg_words,
            "keyword_matches": keyword_matches,
        },
        "skill_evaluation": {
            "technical_knowledge": tech_score,
            "problem_solving": problem_score,
            "communication": comm_score,
            "conceptual_understanding": concept_score,
            "answer_relevance": rel_score,
            "confidence_note": fluency_note,
        },
        "strengths": strengths,
        "improvements": improvements,
        "question_analysis": question_analysis,
        "personalized_recommendations": {
            "weak_topics": weak_topics or ["None critically flagged — maintain steady practice"],
            "recommended_dsa_problems": rec_dsa,
            "recommended_roadmap_topics": rec_roadmaps,
            "revision_areas": weak_topics[:4] if weak_topics else ["Advanced Edge Cases", "System Tradeoffs"],
            "recommended_next_difficulty": next_diff,
            "recommended_next_mode": next_mode,
        },
        "company_pattern_note": company_ctx.get("pattern_source_note"),
    }


# =============================================================
# 6. SESSION LIFECYCLE CONTROLLER
# =============================================================


def _compute_max_questions(duration_minutes: int, mode: str) -> int:
    if duration_minutes >= 25:
        return 8
    if duration_minutes >= 15:
        return 6
    return 4 if mode == "pressure" else 5


def create_interview_session(
    user_id: int,
    category: str,
    company_name: Optional[str],
    target_role: Optional[str],
    personality: str,
    mode: str,
    experience_level: str,
    duration_minutes: int,
    project_data: Optional[Dict[str, Any]],
    cursor,
) -> Dict[str, Any]:
    """
    Creates and persists a new adaptive AI interview session + Turn 1 (Introduction).
    """
    pers = personality if personality in PERSONALITY_PROMPTS else "professional"
    mode_norm = mode if mode in MODE_RULES else "realistic"
    exp_norm = experience_level if experience_level in ("fresher", "intermediate", "experienced") else "fresher"
    dur = max(5, min(45, int(duration_minutes or 15)))
    cat_norm = category if category in ("Technical", "HR", "Behavioral", "Mixed", "Project") else "Technical"

    candidate_ctx = build_interview_candidate_context(user_id, cursor)
    resolved_role = (target_role or "").strip() or candidate_ctx.get("target_role") or "Software Development Engineer"
    company_ctx = resolve_company_context(company_name, resolved_role, cursor)

    start_diff = _initial_difficulty(exp_norm, company_ctx.get("hiring_difficulty", "Medium"), mode_norm)
    max_questions = _compute_max_questions(dur, mode_norm)

    planned_topics: List[str] = []
    if cat_norm == "Technical":
        planned_topics = (company_ctx.get("sections") or [])[:3] + (candidate_ctx.get("skills") or ["DSA", "DBMS", "Operating Systems"])[:3]
    elif cat_norm == "HR":
        planned_topics = ["Background", "Role & Company Fit", "Strengths & Problem Solving", "Career Goals"]
    elif cat_norm == "Behavioral":
        planned_topics = ["Teamwork (STAR)", "Execution Under Pressure", "Ownership & Conflict", "Leadership"]
    elif cat_norm == "Project":
        planned_topics = [
            f"Project Defense: {(project_data or {}).get('projectTitle') or 'Architecture'}",
            "Design Trade-offs",
            "Scalability & Testing",
        ]
    else:  # Mixed
        planned_topics = ["Core Technical & DSA", "System & CS Fundamentals", "Behavioral (STAR)", "HR Fit"]

    planned_topics = list(dict.fromkeys([t for t in planned_topics if t]))[:5]

    snapshot = {
        "candidate": candidate_ctx,
        "company": company_ctx,
        "project_questions": (project_data or {}).get("questions") or [],
        "project_title": (project_data or {}).get("projectTitle"),
    }

    total_seconds = dur * 60
    cursor.execute(
        """
        INSERT INTO mock_interview_sessions
        (user_id, category, company_slug, company_name, target_role, personality, mode,
         experience_level, duration_minutes, status, current_phase, current_difficulty,
         planned_topics, asked_question_ids, asked_prompts, conversation_summary,
         candidate_profile_snapshot, time_remaining_seconds, current_turn_index,
         followups_used_for_topic, main_questions_asked, max_questions)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'active', 'introduction', %s,
                %s, '[]'::jsonb, '[]'::jsonb, '', %s, %s, 1, 0, 0, %s)
        RETURNING *;
        """,
        (
            user_id,
            cat_norm,
            company_ctx.get("company_slug"),
            company_ctx.get("company_name"),
            resolved_role,
            pers,
            mode_norm,
            exp_norm,
            dur,
            start_diff,
            json.dumps(planned_topics),
            json.dumps(snapshot),
            total_seconds,
            max_questions,
        ),
    )
    session = dict(cursor.fetchone())
    intro_prompt = _build_interviewer_intro(session, candidate_ctx, company_ctx)

    cursor.execute(
        """
        INSERT INTO mock_interview_turns
        (session_id, turn_number, phase, question_source, source_question_id,
         question_topic, question_difficulty, followup_strategy, interviewer_message,
         question_text, is_complete)
        VALUES (%s, 1, %s, %s, NULL, %s, %s, NULL, %s, %s, TRUE)
        RETURNING *;
        """,
        (
            session["id"],
            intro_prompt["phase"],
            intro_prompt["question_source"],
            intro_prompt["question_topic"],
            intro_prompt["question_difficulty"],
            intro_prompt["interviewer_message"],
            intro_prompt["question_text"],
        ),
    )
    turn1 = dict(cursor.fetchone())
    cursor.execute(
        "UPDATE mock_interview_sessions SET pending_prompt = %s WHERE id = %s;",
        (json.dumps(intro_prompt), session["id"]),
    )

    return _format_session_response(session, [turn1], intro_prompt, None)


def _format_session_response(
    session: Dict[str, Any],
    turns: List[Dict[str, Any]],
    current_prompt: Dict[str, Any],
    practice_feedback: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    snap = session.get("candidate_profile_snapshot") or {}
    company_ctx = snap.get("company") or {}
    return {
        "session_id": session["id"],
        "status": session["status"],
        "category": session["category"],
        "company_name": session.get("company_name"),
        "target_role": session.get("target_role"),
        "personality": session["personality"],
        "mode": session["mode"],
        "experience_level": session["experience_level"],
        "duration_minutes": session["duration_minutes"],
        "time_remaining_seconds": int(session.get("time_remaining_seconds") or 0),
        "current_phase": session["current_phase"],
        "current_difficulty": session["current_difficulty"],
        "current_turn_number": int(session.get("current_turn_index") or len(turns)),
        "main_questions_asked": int(session.get("main_questions_asked") or 0),
        "max_questions": int(session.get("max_questions") or 6),
        "planned_topics": session.get("planned_topics") or [],
        "current_prompt": current_prompt,
        "practice_feedback": practice_feedback,
        "company_pattern_note": company_ctx.get("pattern_source_note"),
        "turns": [
            {
                "turn_number": t["turn_number"],
                "phase": t["phase"],
                "question_source": t["question_source"],
                "question_topic": t["question_topic"],
                "question_difficulty": t["question_difficulty"],
                "followup_strategy": t.get("followup_strategy"),
                "interviewer_message": t["interviewer_message"],
                "question_text": t["question_text"],
                "candidate_answer": t.get("candidate_answer"),
                "evaluation_score": (t.get("evaluation_json") or {}).get("score") if t.get("evaluation_json") else None,
                "practice_feedback": t.get("practice_feedback"),
            }
            for t in turns
        ],
        "evaluation_report": session.get("evaluation_report"),
    }


def process_candidate_turn(
    session_id: int,
    user_id: int,
    turn_number: int,
    candidate_answer: str,
    response_time_seconds: int,
    time_remaining_seconds: Optional[int],
    transcription_uncertain: bool,
    cursor,
) -> Dict[str, Any]:
    """
    Validates turn idempotency, evaluates candidate response, runs backend-controlled state
    transitions & adaptive follow-up engine, persists next interviewer prompt, and returns updated session.
    """
    cursor.execute(
        "SELECT * FROM mock_interview_sessions WHERE id = %s AND user_id = %s FOR UPDATE;",
        (session_id, user_id),
    )
    session = cursor.fetchone()
    if not session:
        raise ValueError("Interview session not found")
    session = dict(session)

    cursor.execute(
        "SELECT * FROM mock_interview_turns WHERE session_id = %s ORDER BY turn_number ASC;",
        (session_id,),
    )
    turns = [dict(r) for r in cursor.fetchall()]

    # Idempotency / duplicate submission protection
    current_idx = int(session.get("current_turn_index") or 1)
    if session["status"] == "completed":
        return _format_session_response(session, turns, session.get("pending_prompt") or {}, None)
    if turn_number != current_idx:
        # Return current session cleanly if user double-clicked Submit
        last_t = turns[-1] if turns else {}
        return _format_session_response(
            session,
            turns,
            session.get("pending_prompt") or {},
            last_t.get("practice_feedback"),
        )

    active_turn = turns[-1]
    snap = session.get("candidate_profile_snapshot") or {}
    candidate_ctx = snap.get("candidate") or {}
    company_ctx = snap.get("company") or {}
    project_questions = snap.get("project_questions") or []

    rem_time = (
        max(0, int(time_remaining_seconds))
        if time_remaining_seconds is not None
        else max(0, int(session.get("time_remaining_seconds") or 0) - max(0, int(response_time_seconds or 0)))
    )

    asked_ids = list(session.get("asked_question_ids") or [])
    asked_prompts = list(session.get("asked_prompts") or [])
    followups_used = int(session.get("followups_used_for_topic") or 0)
    main_asked = int(session.get("main_questions_asked") or 0)
    max_questions = int(session.get("max_questions") or 6)
    curr_diff = session.get("current_difficulty") or "Medium"
    summary = session.get("conversation_summary") or ""
    mode = session["mode"]

    eval_result: Optional[Dict[str, Any]] = None
    practice_feedback: Optional[Dict[str, Any]] = None

    if active_turn["phase"] == "introduction":
        # No scoring penalty on introduction acknowledgement
        eval_result = {
            "score": 100,
            "verdict": "Ready",
            "word_count": len((candidate_answer or "").split()),
            "is_ambiguous": False,
            "is_incorrect": False,
            "recommended_followup_strategy": None,
        }
    else:
        pending = session.get("pending_prompt") or {}
        keywords = pending.get("keywords") or []
        eval_result = evaluate_candidate_response(
            question_text=active_turn["question_text"],
            answer_text=candidate_answer,
            category=session["category"],
            topic=active_turn.get("question_topic") or session["category"],
            difficulty=active_turn.get("question_difficulty") or curr_diff,
            keywords=keywords,
            transcription_uncertain=transcription_uncertain,
        )
        curr_diff = _step_difficulty(curr_diff, eval_result["score"])
        summary = _update_compact_summary(
            summary,
            active_turn.get("question_topic") or session["category"],
            eval_result["score"],
            active_turn.get("followup_strategy"),
        )
        if MODE_RULES.get(mode, {}).get("immediate_feedback"):
            practice_feedback = {
                "score": eval_result["score"],
                "verdict": eval_result["verdict"],
                "what_was_correct": eval_result["what_was_correct"],
                "what_was_missing": eval_result["what_was_missing"],
                "suggested_improvement": eval_result["suggested_improvement"],
                "expected_answer": eval_result["expected_answer"],
            }

    # Save candidate answer & evaluation to active turn
    cursor.execute(
        """
        UPDATE mock_interview_turns
        SET candidate_answer = %s,
            transcription_uncertain = %s,
            response_time_seconds = %s,
            evaluation_json = %s,
            practice_feedback = %s,
            answered_at = CURRENT_TIMESTAMP
        WHERE id = %s;
        """,
        (
            candidate_answer,
            bool(transcription_uncertain),
            max(0, int(response_time_seconds or 0)),
            json.dumps(eval_result),
            json.dumps(practice_feedback) if practice_feedback else None,
            active_turn["id"],
        ),
    )
    active_turn["candidate_answer"] = candidate_answer
    active_turn["evaluation_json"] = eval_result
    active_turn["practice_feedback"] = practice_feedback

    # Determine next phase strictly via backend state machine
    prev_phase = active_turn["phase"]
    max_followups = MODE_RULES.get(mode, MODE_RULES["realistic"])["max_followups_per_topic"]

    if prev_phase == "introduction":
        next_phase = "warmup"
        q_obj = _generate_contextual_question(
            session, candidate_ctx, company_ctx, "warmup", "Easy", asked_prompts, cursor, project_questions
        )
        next_prompt = {
            "phase": "warmup",
            "question_source": q_obj["question_source"],
            "source_question_id": q_obj.get("source_question_id"),
            "question_topic": q_obj["topic"],
            "question_difficulty": q_obj["difficulty"],
            "followup_strategy": None,
            "interviewer_message": "Great, let's begin with a warm-up question.",
            "question_text": q_obj["question"],
            "keywords": q_obj.get("keywords") or [],
        }
        followups_used = 0
        main_asked += 1
        if q_obj.get("source_question_id"):
            asked_ids.append(q_obj["source_question_id"])
        asked_prompts.append(q_obj["question"])

    elif prev_phase == "final":
        # Move to Phase 6 Conclusion & Complete
        closing_msg = (
            "Thank you for your thoughtful questions and responses today. "
            "That concludes our interview session. Your comprehensive evaluation report is ready below."
        )
        next_prompt = {
            "phase": "conclusion",
            "question_source": "closing",
            "source_question_id": None,
            "question_topic": "Conclusion",
            "question_difficulty": curr_diff,
            "followup_strategy": None,
            "interviewer_message": closing_msg,
            "question_text": "Interview concluded — view your full evaluation report.",
            "keywords": [],
            "should_complete": True,
        }
        cursor.execute(
            """
            UPDATE mock_interview_sessions
            SET current_phase = 'conclusion',
                current_difficulty = %s,
                conversation_summary = %s,
                time_remaining_seconds = %s,
                pending_prompt = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s;
            """,
            (curr_diff, summary, rem_time, json.dumps(next_prompt), session_id),
        )
        session["current_phase"] = "conclusion"
        session["pending_prompt"] = next_prompt
        return _format_session_response(session, turns, next_prompt, practice_feedback)

    else:
        # Decide whether to trigger Adaptive Follow-Up OR advance to Next Main / Final
        should_followup = (
            prev_phase in ("warmup", "main", "followup")
            and bool((candidate_answer or "").strip())
            and followups_used < max_followups
            and rem_time >= 90
            and main_asked < max_questions
            and (
                eval_result.get("is_ambiguous")
                or eval_result.get("is_incorrect")
                or eval_result.get("score", 0) < 88
                or followups_used == 0
            )
        )

        # In short 10m sessions or low remaining time, cap to 1 follow-up per topic
        if session["duration_minutes"] <= 10 and followups_used >= 1:
            should_followup = False

        if should_followup:
            next_prompt = _generate_adaptive_followup(
                session, active_turn, candidate_answer, eval_result, company_ctx
            )
            next_phase = "followup"
            followups_used += 1
            asked_prompts.append(next_prompt["question_text"])
        elif main_asked >= max_questions - 1 or rem_time < 75:
            # Transition to Phase 5 Final Question
            next_phase = "final"
            q_obj = _generate_contextual_question(
                session, candidate_ctx, company_ctx, "final", curr_diff, asked_prompts, cursor, project_questions
            )
            next_prompt = {
                "phase": "final",
                "question_source": q_obj["question_source"],
                "source_question_id": None,
                "question_topic": q_obj["topic"],
                "question_difficulty": q_obj["difficulty"],
                "followup_strategy": None,
                "interviewer_message": _generate_transition_message(
                    session, active_turn["question_text"], candidate_answer, q_obj, company_ctx
                ),
                "question_text": q_obj["question"],
                "keywords": q_obj.get("keywords") or [],
            }
            followups_used = 0
            main_asked += 1
            asked_prompts.append(q_obj["question"])
        else:
            # Advance to Next Main Question
            next_phase = "main"
            q_obj = _generate_contextual_question(
                session, candidate_ctx, company_ctx, "main", curr_diff, asked_prompts, cursor, project_questions
            )
            next_prompt = {
                "phase": "main",
                "question_source": q_obj["question_source"],
                "source_question_id": q_obj.get("source_question_id"),
                "question_topic": q_obj["topic"],
                "question_difficulty": q_obj["difficulty"],
                "followup_strategy": None,
                "interviewer_message": _generate_transition_message(
                    session, active_turn["question_text"], candidate_answer, q_obj, company_ctx
                ),
                "question_text": q_obj["question"],
                "keywords": q_obj.get("keywords") or [],
            }
            followups_used = 0
            main_asked += 1
            if q_obj.get("source_question_id"):
                asked_ids.append(q_obj["source_question_id"])
            asked_prompts.append(q_obj["question"])

    new_turn_num = current_idx + 1
    cursor.execute(
        """
        INSERT INTO mock_interview_turns
        (session_id, turn_number, phase, question_source, source_question_id,
         question_topic, question_difficulty, followup_strategy, interviewer_message,
         question_text, is_complete)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE)
        RETURNING *;
        """,
        (
            session_id,
            new_turn_num,
            next_prompt["phase"],
            next_prompt["question_source"],
            next_prompt.get("source_question_id"),
            next_prompt["question_topic"],
            next_prompt["question_difficulty"],
            next_prompt.get("followup_strategy"),
            next_prompt["interviewer_message"],
            next_prompt["question_text"],
        ),
    )
    new_turn = dict(cursor.fetchone())
    turns.append(new_turn)

    cursor.execute(
        """
        UPDATE mock_interview_sessions
        SET current_phase = %s,
            current_difficulty = %s,
            asked_question_ids = %s,
            asked_prompts = %s,
            conversation_summary = %s,
            time_remaining_seconds = %s,
            current_turn_index = %s,
            followups_used_for_topic = %s,
            main_questions_asked = %s,
            pending_prompt = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s;
        """,
        (
            next_prompt["phase"],
            curr_diff,
            json.dumps(asked_ids),
            json.dumps(asked_prompts[-20:]),
            summary,
            rem_time,
            new_turn_num,
            followups_used,
            main_asked,
            json.dumps(next_prompt),
            session_id,
        ),
    )
    session.update(
        {
            "current_phase": next_prompt["phase"],
            "current_difficulty": curr_diff,
            "time_remaining_seconds": rem_time,
            "current_turn_index": new_turn_num,
            "followups_used_for_topic": followups_used,
            "main_questions_asked": main_asked,
            "pending_prompt": next_prompt,
        }
    )

    return _format_session_response(session, turns, next_prompt, practice_feedback)


def generate_practice_hint(session_id: int, user_id: int, cursor) -> str:
    """
    Provides a non-spoiler guiding hint ONLY when session mode == 'practice'.
    """
    cursor.execute(
        "SELECT mode, category, pending_prompt FROM mock_interview_sessions WHERE id = %s AND user_id = %s;",
        (session_id, user_id),
    )
    session = cursor.fetchone()
    if not session:
        raise ValueError("Interview session not found")
    if session["mode"] != "practice":
        raise ValueError("Hints are only available in Practice Mode")

    pending = session.get("pending_prompt") or {}
    qtext = pending.get("question_text") or ""
    keywords = pending.get("keywords") or []

    llm_hint = call_groq_structured_json(
        system_prompt=(
            "You are a helpful interview coach in Practice Mode. Give ONE short progressive hint "
            "(2 sentences max) to help the candidate structure their answer WITHOUT giving away the complete answer. "
            'Return JSON: {"hint": str}.'
        ),
        user_prompt=f"Question: {qtext}\nKey concepts: {', '.join(keywords)}",
        max_tokens=140,
        temperature=0.35,
    )
    if llm_hint and llm_hint.get("hint"):
        return str(llm_hint["hint"]).strip()

    if keywords:
        return f"Try structuring your explanation around {', '.join(keywords[:3])}, and include one concrete example or complexity trade-off."
    return "Break your answer into core definition, how it works step by step, and one practical example or edge case."

