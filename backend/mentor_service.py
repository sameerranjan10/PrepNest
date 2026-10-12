import os
import json
import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger("prepnest.mentor")

# Path to company role requirements dataset
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
COMPANIES_ROLES_PATH = os.path.join(DATA_DIR, "company_role_requirements.json")

COMPANY_ROLES_DATA: List[Dict[str, Any]] = []
if os.path.exists(COMPANIES_ROLES_PATH):
    try:
        with open(COMPANIES_ROLES_PATH, "r", encoding="utf-8") as f:
            COMPANY_ROLES_DATA = json.load(f)
    except Exception as e:
        logger.warning(f"Could not load company_role_requirements.json: {e}")


def get_company_role_benchmark(company_name: str, role_name: str) -> Optional[Dict[str, Any]]:
    """
    Finds matching benchmark requirements from the company_role_requirements dataset.
    """
    if not COMPANY_ROLES_DATA:
        return None

    c_norm = (company_name or "").strip().lower()
    r_norm = (role_name or "").strip().lower()

    if not c_norm and not r_norm:
        return COMPANY_ROLES_DATA[0] if COMPANY_ROLES_DATA else None

    # 1. Exact match
    for item in COMPANY_ROLES_DATA:
        ic = item.get("company", "").strip().lower()
        ir = item.get("role", "").strip().lower()
        if (ic == c_norm or c_norm in ic) and (ir == r_norm or r_norm in ir):
            return item

    # 2. Match company
    if c_norm:
        for item in COMPANY_ROLES_DATA:
            if c_norm in item.get("company", "").strip().lower():
                return item

    # 3. Match role
    if r_norm:
        for item in COMPANY_ROLES_DATA:
            if r_norm in item.get("role", "").strip().lower():
                return item

    return COMPANY_ROLES_DATA[0] if COMPANY_ROLES_DATA else None


# -------------------------------------------------------------
# Intent Detection & Response Length Resolution (Token Efficiency)
# -------------------------------------------------------------

def resolve_response_length(message: str, requested_length: Optional[str] = None) -> tuple[str, int]:
    """
    Determines output length mode and max_tokens limit.
    - quick: 50-150 tokens (max_tokens=150)
    - normal: 150-300 tokens (max_tokens=300) [DEFAULT]
    - detailed: 400-700 tokens (max_tokens=600)
    """
    msg_lower = (message or "").lower()
    detailed_triggers = [
        "explain in detail", "give detailed explanation", "teach me deeply",
        "show complete solution", "explain step by step", "in detail", "detailed",
        "deep dive", "elaborate", "step by step"
    ]
    quick_triggers = ["quick", "in short", "briefly", "one line", "hello", "hi", "hey"]

    if requested_length == "detailed" or any(t in msg_lower for t in detailed_triggers):
        return "detailed", 600
    elif requested_length == "quick" or (len(message.split()) <= 2 and any(t in msg_lower for t in quick_triggers)):
        return "quick", 150
    else:
        return "normal", 300


def extract_query_entities(message: str) -> Dict[str, Optional[str]]:
    """
    Extracts company or role mentioned directly in the user query.
    E.g. "Am I ready for TCS Web Developer?" -> company: TCS, role: Web Developer
    """
    msg_lower = (message or "").lower()
    detected_company = None
    detected_role = None

    # Check companies from benchmark
    for item in COMPANY_ROLES_DATA:
        c = item.get("company", "").strip()
        if c and c.lower() in msg_lower:
            detected_company = c
            break

    # Common placement roles
    role_map = {
        "web developer": "Web Developer",
        "frontend": "Frontend Developer",
        "backend": "Backend Developer",
        "full stack": "Full Stack Developer",
        "software engineer": "Software Engineer",
        "sde": "Software Engineer",
        "data analyst": "Data Analyst",
        "data engineer": "Data Engineer",
        "qa": "QA/SDET Engineer",
        "devops": "Cloud/DevOps Engineer"
    }
    for key, role_name in role_map.items():
        if key in msg_lower:
            detected_role = role_name
            break

    return {
        "company": detected_company,
        "role": detected_role
    }


def detect_query_intent(message: str, mode: Optional[str] = None) -> str:
    """
    Classifies user message into specific prep intent to minimize context fetching.
    """
    msg = (message or "").lower().strip()
    m = (mode or "general").lower().strip()

    # 1. If user explicitly selected a specialized mode, prioritize that mode
    if m == "interview":
        return "INTERVIEW_MOCK"
    if m == "study_plan":
        return "STUDY_PLAN"
    if m == "career":
        return "CAREER_READINESS"
    if m == "roadmap":
        return "ROADMAP_NEXT"
    if m == "resume":
        return "RESUME_HELP"
    if m == "dsa":
        return "DSA_HINT"
    if m == "tutor":
        return "TUTOR_CONCEPT"

    # 2. Otherwise classify from message content
    if msg in ["hello", "hi", "hey", "who are you", "what can you do", "help"]:
        return "GREETING"

    if any(k in msg for k in ["study today", "study plan", "routine", "schedule", "sprint", "2-hour", "7-day", "what should i study", "daily plan"]):
        return "STUDY_PLAN"

    if any(k in msg for k in ["interview", "mock", "quiz me", "ask me a question", "behavioral", "technical round"]):
        return "INTERVIEW_MOCK"

    if any(k in msg for k in ["ready", "readiness", "clear interview", "eligible", "hiring bar", "chance", "placement ready"]):
        return "CAREER_READINESS"

    if any(k in msg for k in ["learn next", "next topic", "curriculum", "what topic", "roadmap next"]):
        return "ROADMAP_NEXT"

    if any(k in msg for k in ["resume", "bullet", "ats", "score", "star method", "star format", "xyz formula", "cv"]):
        return "RESUME_HELP"

    if any(k in msg for k in ["hint", "dsa", "leetcode", "algorithm", "time complexity", "space complexity", "solve", "binary search", "array", "tree", "graph", "dp", "dynamic programming"]):
        return "DSA_HINT"

    if any(k in msg for k in ["explain", "teach", "what is", "how does", "difference between", "concept"]):
        return "TUTOR_CONCEPT"

    return "GENERAL"



# -------------------------------------------------------------
# Token-Efficient Selective Context Builder
# -------------------------------------------------------------

def build_selective_student_context(
    user_id: int,
    intent: str,
    entities: Dict[str, Optional[str]],
    cursor
) -> str:
    """
    Retrieves ONLY the minimal, relevant context required for the user's intent.
    Never retrieves or sends full database dumps.
    Produces a compact, low-token text representation (<60-120 tokens).
    """
    # 1. Fetch minimal student identity (1 fast query)
    user_info = {
        "name": "Student",
        "company": entities.get("company") or "Tech Company",
        "role": entities.get("role") or "Software Engineer",
        "lang": "Python",
        "level": "Intermediate",
        "skills": []
    }

    try:
        cursor.execute("""
            SELECT full_name, target_companies, target_role, preferred_language, prep_level, skills
            FROM users WHERE id = %s;
        """, (user_id,))
        u_row = cursor.fetchone()
        if u_row:
            u_dict = dict(u_row)
            user_info["name"] = u_dict.get("full_name") or "Student"
            if not entities.get("company") and u_dict.get("target_companies"):
                user_info["company"] = u_dict["target_companies"]
            if not entities.get("role") and u_dict.get("target_role"):
                user_info["role"] = u_dict["target_role"]
            user_info["lang"] = u_dict.get("preferred_language") or "Python"
            user_info["level"] = u_dict.get("prep_level") or "Intermediate"
            if u_dict.get("skills"):
                sk = u_dict["skills"]
                user_info["skills"] = [s.strip() for s in sk.split(",") if s.strip()] if isinstance(sk, str) else sk
    except Exception as e:
        logger.warning(f"Error fetching base user context: {e}")

    # 2. SELECTIVE RETRIEVAL BASED STRICTLY ON INTENT

    if intent == "GREETING":
        # Ultra-minimal: zero unnecessary database queries
        return f"Student: {user_info['name']} | Target: {user_info['company']} -> {user_info['role']}"

    elif intent == "CAREER_READINESS":
        # Target company/role benchmark + match vs missing + ATS score + DSA/roadmap counts
        bench = get_company_role_benchmark(user_info["company"], user_info["role"])
        req_skills = []
        if bench and bench.get("required_skills"):
            req_skills = [s.strip() for s in bench["required_skills"].split(";") if s.strip()][:5]

        # Resume score & keywords
        ats_score = "N/A"
        missing_kw = []
        matched_kw = []
        try:
            cursor.execute("""
                SELECT overall_score, missing_keywords, matched_keywords
                FROM resume_analyses
                WHERE user_id = %s
                ORDER BY created_at DESC LIMIT 1;
            """, (user_id,))
            r_row = cursor.fetchone()
            if r_row:
                ats_score = f"{r_row['overall_score']}/100"
                m_kw = r_row.get("missing_keywords") or []
                if isinstance(m_kw, str):
                    m_kw = json.loads(m_kw)
                missing_kw = m_kw[:4] if isinstance(m_kw, list) else []

                mt_kw = r_row.get("matched_keywords") or []
                if isinstance(mt_kw, str):
                    mt_kw = json.loads(mt_kw)
                matched_kw = mt_kw[:4] if isinstance(mt_kw, list) else []
        except Exception:
            pass

        # Solved DSA count
        dsa_count = 0
        try:
            cursor.execute("SELECT COUNT(*) as c FROM user_dsa_progress WHERE user_id = %s AND is_solved = TRUE;", (user_id,))
            dsa_count = cursor.fetchone()["c"]
        except Exception:
            pass

        return (
            f"Target: {user_info['company']} -> {user_info['role']}\n"
            f"Benchmark Required Skills: {', '.join(req_skills) if req_skills else 'Core CS, DSA, Web/Backend, SQL'}\n"
            f"Student Matched: {', '.join(matched_kw) if matched_kw else ', '.join(user_info['skills'][:4]) or 'Foundations'}\n"
            f"Student Missing/Weak: {', '.join(missing_kw) if missing_kw else 'System Design, Advanced DSA'}\n"
            f"Metrics: ATS Score: {ats_score} | DSA Solved: {dsa_count}"
        )

    elif intent == "STUDY_PLAN":
        # Next incomplete roadmap topics + top missing skills + DSA count
        next_topics = []
        try:
            cursor.execute("""
                SELECT t.title, d.name as domain_name
                FROM roadmap_topics t
                JOIN roadmap_domains d ON t.domain_id = d.id
                WHERE t.id NOT IN (
                    SELECT topic_id FROM user_roadmap_progress WHERE user_id = %s AND status = 'completed'
                )
                ORDER BY d.display_order, t.display_order
                LIMIT 2;
            """, (user_id,))
            next_topics = [f"{r['title']} ({r['domain_name']})" for r in cursor.fetchall()]
        except Exception:
            pass

        missing_skills = []
        try:
            cursor.execute("SELECT missing_keywords FROM resume_analyses WHERE user_id = %s ORDER BY created_at DESC LIMIT 1;", (user_id,))
            r = cursor.fetchone()
            if r and r.get("missing_keywords"):
                mk = r["missing_keywords"]
                if isinstance(mk, str):
                    mk = json.loads(mk)
                missing_skills = mk[:3] if isinstance(mk, list) else []
        except Exception:
            pass

        dsa_count = 0
        try:
            cursor.execute("SELECT COUNT(*) as c FROM user_dsa_progress WHERE user_id = %s AND is_solved = TRUE;", (user_id,))
            dsa_count = cursor.fetchone()["c"]
        except Exception:
            pass

        return (
            f"Student: {user_info['name']} | Target: {user_info['company']} -> {user_info['role']}\n"
            f"Top Weak Skills: {', '.join(missing_skills) if missing_skills else 'DSA, REST APIs'}\n"
            f"Next Roadmap Topics: {', '.join(next_topics) if next_topics else 'Arrays, REST APIs'}\n"
            f"DSA Solved: {dsa_count}"
        )

    elif intent == "ROADMAP_NEXT":
        # Next 3 incomplete roadmap topics
        next_topics = []
        try:
            cursor.execute("""
                SELECT t.title, d.name as domain_name
                FROM roadmap_topics t
                JOIN roadmap_domains d ON t.domain_id = d.id
                WHERE t.id NOT IN (
                    SELECT topic_id FROM user_roadmap_progress WHERE user_id = %s AND status = 'completed'
                )
                ORDER BY d.display_order, t.display_order
                LIMIT 3;
            """, (user_id,))
            next_topics = [f"{r['title']} ({r['domain_name']})" for r in cursor.fetchall()]
        except Exception:
            pass

        return (
            f"Target Role: {user_info['role']} at {user_info['company']}\n"
            f"Next Recommended Topics: {', '.join(next_topics) if next_topics else 'Arrays & Strings, REST APIs, SQL Fundamentals'}"
        )

    elif intent == "RESUME_HELP":
        # ATS score + top missing keywords + top 2 issues
        ats_score = "N/A"
        readiness = "Developing"
        missing_kw = []
        issues_summary = []
        try:
            cursor.execute("""
                SELECT overall_score, readiness_level, missing_keywords, issues
                FROM resume_analyses
                WHERE user_id = %s
                ORDER BY created_at DESC LIMIT 1;
            """, (user_id,))
            r = cursor.fetchone()
            if r:
                ats_score = f"{r['overall_score']}/100"
                readiness = r.get("readiness_level") or "Developing"
                mk = r.get("missing_keywords") or []
                if isinstance(mk, str):
                    mk = json.loads(mk)
                missing_kw = mk[:5] if isinstance(mk, list) else []

                iss = r.get("issues") or []
                if isinstance(iss, str):
                    iss = json.loads(iss)
                if isinstance(iss, list):
                    issues_summary = [i.get("title", str(i)) if isinstance(i, dict) else str(i) for i in iss[:2]]
        except Exception:
            pass

        return (
            f"Target Role: {user_info['role']}\n"
            f"ATS Score: {ats_score} ({readiness})\n"
            f"Missing Keywords to add: {', '.join(missing_kw) if missing_kw else 'Action verbs, Metrics, Core Tech'}\n"
            f"Issues: {', '.join(issues_summary) if issues_summary else 'Quantify impact, add clear metrics'}"
        )

    elif intent == "DSA_HINT":
        # Preferred language, level, solved count
        dsa_count = 0
        try:
            cursor.execute("SELECT COUNT(*) as c FROM user_dsa_progress WHERE user_id = %s AND is_solved = TRUE;", (user_id,))
            dsa_count = cursor.fetchone()["c"]
        except Exception:
            pass

        return (
            f"Language: {user_info['lang']} | Level: {user_info['level']} | DSA Solved: {dsa_count}\n"
            f"Instruction: Give progressive hint only. No full solution unless explicitly requested."
        )

    elif intent == "INTERVIEW_MOCK":
        return (
            f"Target Company & Role: {user_info['company']} - {user_info['role']}\n"
            f"Preferred Language: {user_info['lang']}\n"
            f"Instruction: Ask ONE question at a time. Evaluate previous response first if provided."
        )

    elif intent == "TUTOR_CONCEPT":
        return (
            f"Target Role: {user_info['role']} | Language: {user_info['lang']} | Level: {user_info['level']}\n"
            f"Instruction: Explain intuitively with a real analogy. State time/space complexity. End with 1 interactive check question."
        )

    else:
        # GENERAL default compact context
        return (
            f"Student: {user_info['name']} | Target: {user_info['company']} -> {user_info['role']}\n"
            f"Language: {user_info['lang']} | Level: {user_info['level']}"
        )


# -------------------------------------------------------------
# System Prompt Assembly (Token Efficient)
# -------------------------------------------------------------

def build_token_efficient_system_prompt(
    intent: str,
    mode: str,
    compact_context: str,
    response_length: str,
    max_tokens: int
) -> str:
    """
    Builds a concise, high-agency placement mentor system prompt tailored to the intent.
    Strictly instructs model to be concise, direct, and token-efficient.
    """
    intent_guidelines = {
        "GREETING": "Greet warmly in 1-2 brief sentences (under 40 words). State how you can help them prepare for placements today.",
        "CAREER_READINESS": "Assess readiness honestly against the target company. State: 1. Readiness status, 2. Strong skills, 3. Need improvement, 4. Top 3 immediate priorities. Do NOT guarantee selection.",
        "STUDY_PLAN": "Provide a time-boxed plan (e.g. 45m DSA, 30m REST APIs). Keep it short and actionable. Avoid long intros.",
        "ROADMAP_NEXT": "Recommend the immediate next topic to learn, why it matters for their target company, and key takeaway.",
        "RESUME_HELP": "Use Google XYZ formula: 'Accomplished [X] as measured by [Y] by doing [Z]'. Never invent false experience or metrics. State 'Add a measurable result if you have one'.",
        "DSA_HINT": "Provide a progressive hint and intuition first. Explain time/space complexity. Do NOT write full solution code unless explicitly asked.",
        "INTERVIEW_MOCK": "You are a technical interviewer. Ask exactly ONE interview question. Do NOT ask multiple questions. Do NOT answer the question yourself. If user answered previous question, give a 1-sentence evaluation and ask the next question.",
        "TUTOR_CONCEPT": "Explain clearly using a simple real-world analogy. State time/space complexity. End with 1 interactive check question.",
        "GENERAL": "Provide a direct, practical answer tailored to the student's placement goal."
    }

    guideline = intent_guidelines.get(intent, intent_guidelines["GENERAL"])

    prompt = f"""You are the PrepNest AI Placement Mentor.
Be concise, practical, personalized, and placement-focused.

STUDENT CONTEXT:
{compact_context}

RULES:
1. Start directly with the answer. Do NOT use conversational filler like "Sure! I'd be happy to help...".
2. Prefer:
   - Key answer
   - 2 to 4 actionable bullet points
   - Next immediate step
3. {guideline}
4. Response mode: {response_length.upper()} (Strict token limit: ~{max_tokens} tokens).
"""
    return prompt.strip()


# -------------------------------------------------------------
# Compact Conversation History
# -------------------------------------------------------------

def build_compact_messages(
    history: List[Dict[str, str]],
    system_prompt: str
) -> List[Dict[str, str]]:
    """
    Limits conversation history to the last 4-6 messages (2-3 turns).
    Prevents conversation token explosion.
    """
    payload_messages = [{"role": "system", "content": system_prompt}]

    # Send only the last 4 messages (2 user turns, 2 assistant turns)
    recent = history[-4:] if len(history) > 4 else history

    if len(history) > 4:
        # Add a 1-line context summary note for older history
        payload_messages.append({
            "role": "system",
            "content": "[Context: Continuing ongoing placement prep discussion. Be direct and avoid repeating earlier suggestions.]"
        })

    for m in recent:
        role = m.get("role", "user")
        if role in ("user", "assistant"):
            payload_messages.append({
                "role": role,
                "content": m.get("content", "")
            })

    if not any(m.get("role") == "user" for m in payload_messages):
        payload_messages.append({"role": "user", "content": "Hello"})

    return payload_messages



# -------------------------------------------------------------
# Groq LLM Invocation with Token & Cost Monitoring
# -------------------------------------------------------------

def call_groq_mentor(
    messages: List[Dict[str, str]],
    system_prompt: str,
    model: Optional[str] = None,
    max_tokens: int = 300,
    intent: str = "GENERAL",
    response_length: str = "normal"
) -> Dict[str, Any]:
    """
    Invokes Groq API with strict max_tokens, automatic model fallback,
    and safe development token usage monitoring.
    """
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    target_model = model or os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b").strip()

    if not groq_api_key or groq_api_key.startswith("gsk_your_groq_api_key"):
        return {
            "success": True,
            "is_mock": True,
            "model": target_model,
            "response": (
                "👋 **PrepNest AI Placement Mentor is Ready!**\n\n"
                "To activate live high-speed AI responses with Groq, please follow these simple steps:\n\n"
                "1. Get your free API key at **[Groq Console](https://console.groq.com/keys)**.\n"
                "2. Open your `backend/.env` file.\n"
                "3. Set `GROQ_API_KEY=gsk_your_actual_key_here`\n"
                "4. Save the file and restart your backend server.\n\n"
                f"*Configured Model:* `{target_model}`"
            ),
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        }

    start_time = time.time()
    try:
        from groq import Groq
        client = Groq(api_key=groq_api_key)

        payload_messages = build_compact_messages(messages, system_prompt)

        # Fallback candidate models
        candidate_models = [target_model, "qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile"]
        candidate_models = list(dict.fromkeys(candidate_models))

        last_error = None
        for candidate in candidate_models:
            try:
                chat_completion = client.chat.completions.create(
                    messages=payload_messages,
                    model=candidate,
                    temperature=0.5,
                    max_tokens=max_tokens,
                )

                choice = chat_completion.choices[0]
                content = choice.message.content
                if not content and hasattr(choice.message, "reasoning"):
                    content = getattr(choice.message, "reasoning", "")

                prompt_tokens = getattr(chat_completion.usage, "prompt_tokens", 0) if hasattr(chat_completion, "usage") else 0
                comp_tokens = getattr(chat_completion.usage, "completion_tokens", 0) if hasattr(chat_completion, "usage") else 0
                total_tokens = prompt_tokens + comp_tokens
                elapsed_ms = round((time.time() - start_time) * 1000)

                # Development token monitoring log (Step 23)
                print(
                    f"[TOKEN MONITOR] Intent: {intent} | Mode: {response_length.upper()} | "
                    f"In: {prompt_tokens} | Out: {comp_tokens} | Total: {total_tokens} | "
                    f"Time: {elapsed_ms}ms | Model: {candidate}"
                )

                return {
                    "success": True,
                    "is_mock": False,
                    "model": candidate,
                    "response": (content or "").strip() or "Here is your placement advice.",
                    "usage": {
                        "prompt_tokens": prompt_tokens,
                        "completion_tokens": comp_tokens,
                        "total_tokens": total_tokens,
                        "response_length": response_length,
                        "intent": intent,
                        "latency_ms": elapsed_ms
                    }
                }
            except Exception as model_err:
                err_str = str(model_err)
                if "does not exist" in err_str.lower() or "404" in err_str:
                    logger.warning(f"Groq model {candidate} not accessible, trying fallback...")
                    last_error = model_err
                    continue
                else:
                    raise model_err

        if last_error:
            raise last_error

    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000)
        logger.error(f"Groq API call error: {str(e)}")
        err_msg = str(e)
        if "invalid_api_key" in err_msg.lower() or "401" in err_msg:
            friendly_err = "Invalid Groq API key. Please check the `GROQ_API_KEY` in `backend/.env`."
        elif "rate_limit_exceeded" in err_msg.lower() or "429" in err_msg:
            friendly_err = "AI Mentor is temporarily busy. Please try again shortly."
        elif "timeout" in err_msg.lower():
            friendly_err = "Request timed out. Please try asking again."
        else:
            friendly_err = f"AI Mentor service encountered an error: {err_msg[:120]}"

        return {
            "success": False,
            "is_mock": False,
            "model": target_model,
            "response": f"⚠️ {friendly_err}",
            "error": friendly_err,
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
                "response_length": response_length,
                "intent": intent,
                "latency_ms": elapsed_ms
            }
        }


# -------------------------------------------------------------
# Frontend Dashboard Card Context Summary
# -------------------------------------------------------------

def get_student_context_summary(user_id: int, cursor) -> Dict[str, Any]:
    """
    Returns a lightweight context summary tailored for the frontend UI dashboard card.
    """
    context = {
        "full_name": "Student",
        "target_company": "Tech Company",
        "target_role": "Software Engineer",
        "preferred_language": "Python",
        "prep_level": "Intermediate",
        "skills": []
    }

    try:
        cursor.execute("""
            SELECT full_name, target_companies, target_role, preferred_language, prep_level, skills
            FROM users WHERE id = %s;
        """, (user_id,))
        u = cursor.fetchone()
        if u:
            context["full_name"] = u.get("full_name") or "Student"
            context["target_company"] = u.get("target_companies") or "Tech Company"
            context["target_role"] = u.get("target_role") or "Software Engineer"
            context["preferred_language"] = u.get("preferred_language") or "Python"
            context["prep_level"] = u.get("prep_level") or "Intermediate"
            if u.get("skills"):
                sk = u["skills"]
                context["skills"] = [s.strip() for s in sk.split(",") if s.strip()] if isinstance(sk, str) else sk
    except Exception as e:
        logger.warning(f"Error fetching base profile: {e}")

    # Resume
    ats_score = None
    readiness_level = "Developing"
    missing_skills = []
    matched_skills = []
    try:
        cursor.execute("""
            SELECT overall_score, readiness_level, target_company, target_role, missing_keywords, matched_keywords
            FROM resume_analyses
            WHERE user_id = %s
            ORDER BY created_at DESC LIMIT 1;
        """, (user_id,))
        r = cursor.fetchone()
        if r:
            ats_score = r.get("overall_score")
            readiness_level = r.get("readiness_level") or "Developing"
            if r.get("target_company") and context["target_company"] == "Tech Company":
                context["target_company"] = r["target_company"]
            if r.get("target_role") and context["target_role"] == "Software Engineer":
                context["target_role"] = r["target_role"]
            mk = r.get("missing_keywords") or []
            if isinstance(mk, str):
                mk = json.loads(mk)
            missing_skills = [s.title() for s in (mk[:5] if isinstance(mk, list) else [])]

            mt = r.get("matched_keywords") or []
            if isinstance(mt, str):
                mt = json.loads(mt)
            matched_skills = [s.title() for s in (mt[:5] if isinstance(mt, list) else [])]
    except Exception as e:
        logger.warning(f"Error fetching resume summary: {e}")

    # Roadmap
    roadmap_pct = 0
    roadmap_completed = 0
    roadmap_total = 35
    try:
        cursor.execute("SELECT COUNT(*) as c FROM roadmap_topics;")
        t_row = cursor.fetchone()
        if t_row and t_row["c"] > 0:
            roadmap_total = t_row["c"]

        cursor.execute("SELECT COUNT(*) as c FROM user_roadmap_progress WHERE user_id = %s AND status = 'completed';", (user_id,))
        c_row = cursor.fetchone()
        if c_row:
            roadmap_completed = c_row["c"]
            roadmap_pct = round((roadmap_completed / roadmap_total) * 100)
    except Exception:
        pass

    # DSA
    dsa_solved = 0
    dsa_total = 0
    diff_breakdown = {"Easy": 0, "Medium": 0, "Hard": 0}
    try:
        cursor.execute("SELECT COUNT(*) as c FROM dsa_problems;")
        dp = cursor.fetchone()
        if dp:
            dsa_total = dp["c"]

        cursor.execute("SELECT COUNT(*) as c FROM user_dsa_progress WHERE user_id = %s AND is_solved = TRUE;", (user_id,))
        ds = cursor.fetchone()
        if ds:
            dsa_solved = ds["c"]

        cursor.execute("""
            SELECT p.difficulty, COUNT(*) as c
            FROM user_dsa_progress u
            JOIN dsa_problems p ON u.problem_id = p.id
            WHERE u.user_id = %s AND u.is_solved = TRUE
            GROUP BY p.difficulty;
        """, (user_id,))
        for row in cursor.fetchall():
            d = row["difficulty"]
            if d in diff_breakdown:
                diff_breakdown[d] = row["c"]
    except Exception:
        pass

    skill_match_pct = 70
    if matched_skills or missing_skills:
        tot = len(matched_skills) + len(missing_skills)
        if tot > 0:
            skill_match_pct = max(30, min(100, round((len(matched_skills) / tot) * 100)))

    return {
        "student_name": context.get("full_name", "Student"),
        "target_company": context.get("target_company", "Tech Company"),
        "target_role": context.get("target_role", "Software Engineer"),
        "preferred_language": context.get("preferred_language", "Python"),
        "prep_level": context.get("prep_level", "Intermediate"),
        "ats_score": ats_score,
        "readiness_level": readiness_level,
        "skill_match_percentage": skill_match_pct,
        "matched_skills": matched_skills[:5],
        "missing_skills": missing_skills[:5],
        "roadmap_percentage": roadmap_pct,
        "roadmap_completed": roadmap_completed,
        "roadmap_total": roadmap_total,
        "dsa_solved": dsa_solved,
        "dsa_total": dsa_total,
        "dsa_breakdown": diff_breakdown,
        "aptitude_avg_score": 0
    }


MODE_CONFIGS = {
    "general": {"name": "Placement Coach", "description": "Holistic placement strategy and milestones.", "icon": "Bot"},
    "career": {"name": "Company Bar", "description": "Hiring bar evaluation for target companies.", "icon": "Briefcase"},
    "study_plan": {"name": "Study Sprint", "description": "Time-boxed daily schedules and sprint plans.", "icon": "Calendar"},
    "roadmap": {"name": "Curriculum", "description": "Next roadmap topics and prerequisite links.", "icon": "Compass"},
    "resume": {"name": "Resume & STAR", "description": "ATS keyword matching and Google XYZ bullet phrasing.", "icon": "FileText"},
    "dsa": {"name": "Guided DSA", "description": "Progressive hints and complexity analysis.", "icon": "Code2"},
    "interview": {"name": "Mock 1-on-1", "description": "1-by-1 technical & behavioral mock questions.", "icon": "Users"},
    "tutor": {"name": "CS Tutor", "description": "Intuitive CS concept deep-dives and check questions.", "icon": "GraduationCap"}
}
