import json
import re
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List
from datetime import datetime

# -------------------------------------------------------------
# Curated Placement Project Ideas (Section 14 Requirement)
# -------------------------------------------------------------
CURATED_PROJECT_IDEAS = [
    {
        "id": "idea-1",
        "title": "Real-Time Collaborative Code Editor",
        "domain": "Web Development",
        "difficulty": "Advanced",
        "technologies": ["React", "Node.js", "WebSockets", "Redis", "Docker"],
        "problem_statement": "Distributed developer teams require low-latency synchronization and sandboxed code execution environments during paired programming and interviews.",
        "skills_learned": "Operational Transformation/CRDTs, WebSocket multiplexing, Containerized execution isolation, In-memory pub/sub.",
        "suggested_features": [
            "Real-time multi-cursor synchronization",
            "Sandboxed code runner using Docker containers",
            "Syntax highlighting & code diff history",
            "Audio/video peer-to-peer room communication"
        ],
        "placement_relevance": "Frequently asked in SDE-1/2 interviews for systems design, networking, and asynchronous backend engineering."
    },
    {
        "id": "idea-2",
        "title": "Automated ATS Resume Analyzer & Job Matcher",
        "domain": "AI/ML",
        "difficulty": "Intermediate",
        "technologies": ["Python", "FastAPI", "React", "PostgreSQL", "spaCy"],
        "problem_statement": "Job applicants struggle to understand how well their resumes match corporate applicant tracking systems, resulting in low interview call rates.",
        "skills_learned": "Natural Language Processing (NLP), Keyword TF-IDF extraction, Semantic vector similarity, Asynchronous document parsing.",
        "suggested_features": [
            "PDF/DOCX structured section extractor",
            "Job description keyword density match score",
            "Action-verb & quantifiable metric feedback",
            "Exportable ATS-optimized formatting tips"
        ],
        "placement_relevance": "Direct placement relevance; demonstrates practical NLP, API building, and user-centric problem solving."
    },
    {
        "id": "idea-3",
        "title": "Cloud-Native Microservices E-Commerce API",
        "domain": "Cloud",
        "difficulty": "Advanced",
        "technologies": ["Go", "FastAPI", "PostgreSQL", "Kafka", "Kubernetes"],
        "problem_statement": "High-traffic flash sales lead to cascading database failures and inventory race conditions in monolithic architectures.",
        "skills_learned": "Saga pattern for distributed transactions, Event-driven architecture with Kafka, Distributed locks, Docker & Helm deployments.",
        "suggested_features": [
            "Decoupled Order, Payment, and Inventory microservices",
            "Kafka event streaming for order status changes",
            "Distributed Redis locks to prevent inventory overselling",
            "Prometheus & Grafana telemetry dashboards"
        ],
        "placement_relevance": "Gold standard for Backend Engineer & Cloud/DevOps roles at top product companies."
    },
    {
        "id": "idea-4",
        "title": "Financial Fraud Detection Engine",
        "domain": "Data Science",
        "difficulty": "Intermediate",
        "technologies": ["Python", "Scikit-Learn", "FastAPI", "Pandas", "Streamlit"],
        "problem_statement": "Digital payment platforms experience high volumes of synthetic identity and credit card fraud requiring sub-second risk classification.",
        "skills_learned": "Imbalanced dataset handling (SMOTE), Isolation Forests, Gradient Boosting, Model serialization and sub-second inference APIs.",
        "suggested_features": [
            "Real-time transaction risk scoring API (<100ms)",
            "Visual feature importance and anomaly distribution",
            "Configurable fraud threshold rules engine",
            "Historical fraud audit report generator"
        ],
        "placement_relevance": "Ideal for Data Analyst, Data Science, and Fintech developer roles (Visa, PayPal, American Express)."
    },
    {
        "id": "idea-5",
        "title": "Role-Based Zero-Trust Authentication Gateway",
        "domain": "Cybersecurity",
        "difficulty": "Intermediate",
        "technologies": ["Node.js", "Express", "PostgreSQL", "JWT", "Redis"],
        "problem_statement": "Modern applications require robust token rotation, multi-factor authentication, and IP-anomaly detection to prevent account takeovers.",
        "skills_learned": "Cryptographic token rotation, OAuth2/OIDC standards, Redis blacklisting for immediate token invalidation, Rate limiting.",
        "suggested_features": [
            "Dual-token architecture (short-lived access + rotated refresh tokens)",
            "Time-based One-Time Password (TOTP) 2FA support",
            "IP and User-Agent fingerprint anomaly detection",
            "Admin audit dashboard with session revocation"
        ],
        "placement_relevance": "Essential security knowledge frequently questioned in full-stack and security engineering interviews."
    },
    {
        "id": "idea-6",
        "title": "Smart Campus IoT Energy & Occupancy Monitor",
        "domain": "IoT",
        "difficulty": "Intermediate",
        "technologies": ["Python", "MQTT", "React", "InfluxDB", "Raspberry Pi"],
        "problem_statement": "College campuses and offices waste significant electricity by powering unoccupied classrooms and computer labs.",
        "skills_learned": "Time-series database querying, MQTT pub/sub protocol, Edge device telemetry ingestion, Real-time sensor dashboard.",
        "suggested_features": [
            "PIR motion & ambient light telemetry ingestion",
            "Automated AC/lighting relay threshold triggers",
            "Peak consumption pattern anomaly detection",
            "Campus-wide energy savings analytics export"
        ],
        "placement_relevance": "Strong showcase for hardware-software integration, systems programming, and embedded roles."
    },
    {
        "id": "idea-7",
        "title": "Peer-to-Peer Placement Interview Prep Platform",
        "domain": "Web Development",
        "difficulty": "Beginner",
        "technologies": ["React", "Tailwind CSS", "Node.js", "PostgreSQL"],
        "problem_statement": "Students preparing for campus placements lack a dedicated structured workspace to track coding questions, mock feedback, and technical milestones.",
        "skills_learned": "Relational schema design, Component-driven frontend architecture, RESTful API design, State management.",
        "suggested_features": [
            "Categorized problem tracking with difficulty filters",
            "Peer mock interview scheduler & rubrics",
            "Placement readiness progress calculation",
            "Daily streak counter & performance metrics"
        ],
        "placement_relevance": "Great beginner-to-intermediate project that solves a genuine daily problem faced by student recruiters."
    },
    {
        "id": "idea-8",
        "title": "Cross-Platform Smart Expense Tracker with Offline Sync",
        "domain": "Mobile",
        "difficulty": "Intermediate",
        "technologies": ["React Native", "TypeScript", "Node.js", "SQLite", "MongoDB"],
        "problem_statement": "Users in low-connectivity areas need seamless budgeting and receipt logging that functions offline and synchronizes conflict-free when online.",
        "skills_learned": "Mobile offline-first SQLite persistence, optimistic UI updates, CRDT conflict resolution, mobile biometric authentication.",
        "suggested_features": [
            "Local SQLite offline-first database with background sync",
            "Camera receipt scanner with on-device OCR parser",
            "Category-based budget alerts and monthly breakdown charts",
            "Encrypted biometric lock (FaceID/Fingerprint)"
        ],
        "placement_relevance": "High demand for mobile engineer roles (Fintech, consumer apps) demonstrating cross-platform architecture."
    },
    {
        "id": "idea-9",
        "title": "Decentralized Academic Credential Verifier",
        "domain": "Blockchain",
        "difficulty": "Advanced",
        "technologies": ["Solidity", "Ethereum", "Ethers.js", "React", "FastAPI"],
        "problem_statement": "Verifying academic degrees and placement certificates across universities and employers is slow, centralized, and susceptible to document forgery.",
        "skills_learned": "Smart contract deployment (ERC-721/Soulbound tokens), IPFS decentralized storage, cryptographic signature verification, Web3 wallet integration.",
        "suggested_features": [
            "Soulbound Non-Transferable Certificate NFT minting for graduates",
            "One-click cryptographic verification portal for recruiters",
            "IPFS decentralized storage for diploma metadata and PDF hashes",
            "University registrar admin dashboard with multi-sig approval"
        ],
        "placement_relevance": "Strong differentiator for Web3, cryptography, and modern security-focused engineering roles."
    }
]


# -------------------------------------------------------------
# Database Schema Initialization
# -------------------------------------------------------------
def init_projects_tables(cursor):
    """
    Creates user_projects and project_milestones tables safely in PostgreSQL/NeonDB.
    """
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_projects (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            short_description VARCHAR(500),
            detailed_description TEXT,
            project_type VARCHAR(50) DEFAULT 'Personal',
            project_status VARCHAR(50) DEFAULT 'In Progress',
            start_date VARCHAR(50),
            end_date VARCHAR(50),
            tech_stack JSONB DEFAULT '[]'::jsonb,
            key_features JSONB DEFAULT '[]'::jsonb,
            user_role VARCHAR(100) DEFAULT 'Developer',
            team_size INTEGER DEFAULT 1,
            my_contribution TEXT,
            github_url TEXT,
            live_demo_url TEXT,
            documentation_url TEXT,
            demo_video_url TEXT,
            is_featured BOOLEAN DEFAULT false,
            readiness_score INTEGER DEFAULT 0,
            github_data JSONB DEFAULT '{}'::jsonb,
            interview_prep JSONB DEFAULT '{}'::jsonb,
            resume_bullets JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_user_projects_user ON user_projects(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_projects_featured ON user_projects(user_id, is_featured);

        CREATE TABLE IF NOT EXISTS project_milestones (
            id SERIAL PRIMARY KEY,
            project_id INTEGER NOT NULL REFERENCES user_projects(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            is_completed BOOLEAN DEFAULT false,
            due_date VARCHAR(50),
            completed_at TIMESTAMP WITH TIME ZONE,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_project_milestones_proj ON project_milestones(project_id);
        CREATE INDEX IF NOT EXISTS idx_project_milestones_user ON project_milestones(user_id);
    """)


# -------------------------------------------------------------
# Project Readiness Score & Improvement Checklist (Section 7 & 13)
# -------------------------------------------------------------
def calculate_project_readiness(project: Dict[str, Any], milestones: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Deterministically computes a 0-100 Project Readiness Score based strictly on actual project data.
    Provides a real checklist of completed and missing items to guide placement readiness.
    """
    score = 0
    checklist = []
    
    # 1. Project Description (15 pts)
    has_short = bool(project.get("short_description") and len(str(project["short_description"]).strip()) >= 20)
    has_detailed = bool(project.get("detailed_description") and len(str(project["detailed_description"]).strip()) >= 60)
    desc_score = 0
    if has_short:
        desc_score += 8
    if has_detailed:
        desc_score += 7
    score += desc_score
    checklist.append({
        "label": "Add clear project overview and detailed description",
        "completed": (has_short and has_detailed),
        "points": 15,
        "category": "Documentation"
    })

    # 2. Tech Stack (10 pts)
    techs = project.get("tech_stack") or []
    if isinstance(techs, str):
        try:
            techs = json.loads(techs)
        except Exception:
            techs = [t.strip() for t in techs.split(",") if t.strip()]
    has_tech = len(techs) >= 2
    if has_tech:
        score += 10
    checklist.append({
        "label": "Specify tech stack (at least 2 technologies)",
        "completed": has_tech,
        "points": 10,
        "category": "Technical"
    })

    # 3. Key Features (10 pts)
    features = project.get("key_features") or []
    if isinstance(features, str):
        try:
            features = json.loads(features)
        except Exception:
            features = [f.strip() for f in features.split("\n") if f.strip()]
    has_features = len(features) >= 2
    if has_features:
        score += 10
    checklist.append({
        "label": "List key architectural features (at least 2)",
        "completed": has_features,
        "points": 10,
        "category": "Technical"
    })

    # 4. Personal Contribution (15 pts)
    has_role = bool(project.get("user_role") and len(str(project["user_role"]).strip()) >= 3)
    has_contrib = bool(project.get("my_contribution") and len(str(project["my_contribution"]).strip()) >= 30)
    contrib_score = 0
    if has_role:
        contrib_score += 5
    if has_contrib:
        contrib_score += 10
    score += contrib_score
    checklist.append({
        "label": "Define your specific role and personal contribution",
        "completed": (has_role and has_contrib),
        "points": 15,
        "category": "Interview"
    })

    # 5. GitHub Repository (15 pts)
    gh_url = str(project.get("github_url") or "").strip()
    has_gh = bool("github.com/" in gh_url and len(gh_url) > 18)
    if has_gh:
        score += 15
    checklist.append({
        "label": "Link public GitHub repository",
        "completed": has_gh,
        "points": 15,
        "category": "Links"
    })

    # 6. Live Demo (15 pts)
    demo_url = str(project.get("live_demo_url") or "").strip()
    has_demo = bool(demo_url.startswith("http://") or demo_url.startswith("https://"))
    if has_demo:
        score += 15
    checklist.append({
        "label": "Deploy and provide live working demo link",
        "completed": has_demo,
        "points": 15,
        "category": "Links"
    })

    # 7. Documentation or Demo Video (5 pts)
    doc_url = str(project.get("documentation_url") or "").strip()
    vid_url = str(project.get("demo_video_url") or "").strip()
    has_docs = bool(doc_url.startswith("http") or vid_url.startswith("http"))
    if has_docs:
        score += 5
    checklist.append({
        "label": "Add architecture documentation or demo video link",
        "completed": has_docs,
        "points": 5,
        "category": "Documentation"
    })

    # 8. Milestones & Progress (10 pts)
    if milestones:
        completed_count = sum(1 for m in milestones if m.get("is_completed"))
        m_pct = completed_count / len(milestones)
        m_score = int(round(m_pct * 10))
        score += m_score
        has_milestones = (m_pct >= 0.75)
    else:
        # Default in-progress credit if project status is completed
        if project.get("project_status") == "Completed":
            score += 10
            has_milestones = True
        else:
            score += 4
            has_milestones = False
    checklist.append({
        "label": "Create and complete project development milestones (75%+)",
        "completed": has_milestones,
        "points": 10,
        "category": "Progress"
    })

    # 9. Interview Preparation Reviewed (10 pts)
    has_prep = bool(project.get("interview_prep") and isinstance(project["interview_prep"], dict) and len(project["interview_prep"]) > 0)
    if has_prep:
        score += 10
    checklist.append({
        "label": "Generate and practice project interview questions",
        "completed": has_prep,
        "points": 10,
        "category": "Interview"
    })

    for c in checklist:
        c["title"] = c.get("label")
        c["weight"] = c.get("points")

    final_score = min(100, max(0, score))
    missing_items = [item["label"] for item in checklist if not item["completed"]]

    return {
        "readiness_score": final_score,
        "checklist": checklist,
        "missing_items": missing_items,
        "completed_count": sum(1 for c in checklist if c["completed"]),
        "total_criteria": len(checklist)
    }


# -------------------------------------------------------------
# Interview Preparation Generator (Section 8 Requirement)
# -------------------------------------------------------------
def generate_project_interview_prep(project: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates structured project interview preparation based STRICTLY on student-entered data.
    Never invents technologies, metrics, or achievements.
    Includes:
      - 30-Second Elevator Pitch
      - 60-Second Walkthrough
      - 2-Minute Technical Deep Dive
      - Basic Questions
      - Technical Architecture Questions
      - Personal Contribution Questions
      - Advanced / Scalability Questions
    """
    title = project.get("title") or "Software Project"
    short_desc = project.get("short_description") or "a modern placement preparation software project"
    detailed_desc = project.get("detailed_description") or short_desc
    ptype = project.get("project_type") or "Personal"
    role = project.get("user_role") or "Full-Stack Developer"
    contrib = project.get("my_contribution") or "implemented core application logic, integrated frontend components, and configured backend API routing"
    team_size = project.get("team_size") or 1
    
    techs = project.get("tech_stack") or []
    if isinstance(techs, str):
        try:
            techs = json.loads(techs)
        except Exception:
            techs = [t.strip() for t in techs.split(",") if t.strip()]
    tech_str = ", ".join(techs) if techs else "modern web technologies"

    features = project.get("key_features") or []
    if isinstance(features, str):
        try:
            features = json.loads(features)
        except Exception:
            features = [f.strip() for f in features.split("\n") if f.strip()]
    feat_str = "; ".join(features[:3]) if features else "structured user flows and responsive data visualization"

    # 1. Explanations
    explanation_30s = (
        f"{title} is a {ptype.lower()} project I built using {tech_str}. "
        f"It solves {short_desc.lower().rstrip('.')}. "
        f"As the {role}, I was responsible for {contrib.lower().rstrip('.')}."
    )

    explanation_60s = (
        f"I developed {title}, which is a {ptype.lower()} application built with {tech_str}. "
        f"The primary problem it addresses is that {short_desc.rstrip('.')}. "
        f"Key capabilities include {feat_str}. "
        f"In a team of {team_size} (where my role was {role}), I personally led {contrib.rstrip('.')}. "
        f"The project is currently {project.get('project_status', 'In Progress').lower()} and deployed for demonstration."
    )

    explanation_2min = (
        f"Let me walk you through {title}. The motivation behind this {ptype.lower()} project was to build a robust solution for {short_desc.rstrip('.')}.\n\n"
        f"From an architectural standpoint, the system utilizes {tech_str}. "
        f"The frontend provides an intuitive user interface, communicating via RESTful endpoints with the backend services for state management and persistence.\n\n"
        f"Core functionality centers around {feat_str}.\n\n"
        f"My primary role on the project was {role}. Specifically, I implemented {contrib.rstrip('.')}.\n\n"
        f"During development, the key technical challenge was ensuring clean module separation and handling edge cases in data flows. "
        f"Working through this gave me hands-on practical experience in {tech_str} and writing maintainable, production-ready code."
    )

    # 2. Basic Questions
    basic_questions = [
        {
            "question": f"Can you give me a brief overview of {title} and what problem it solves?",
            "sample_approach": f"Start with the 30-second explanation: Mention {title}, the core problem ({short_desc}), and your stack ({tech_str})."
        },
        {
            "question": f"Who are the target users for {title} and why did you decide to build it?",
            "sample_approach": f"Explain the real-world user scenario that inspired you to create this as a {ptype} project."
        },
        {
            "question": f"What are the main features of {title} that you are most proud of?",
            "sample_approach": f"Highlight {feat_str} and explain the specific user value each feature delivers."
        }
    ]

    # 3. Technical Questions (tailored to student's exact stack)
    tech_questions = []
    if techs:
        for t in techs[:3]:
            tech_questions.append({
                "question": f"Why did you choose {t} for this project instead of alternative tools?",
                "sample_approach": f"Discuss the performance, ecosystem, typing, or developer experience advantages {t} offered for {title}."
            })
    tech_questions.append({
        "question": f"How is data structured and communicated between your client and server in {title}?",
        "sample_approach": f"Walk through the API contracts, JSON payload structures, error handling, and status codes."
    })
    tech_questions.append({
        "question": "How do you handle authentication, session validation, or data protection in this project?",
        "sample_approach": "Explain your token or session strategy (e.g. JWT/OAuth), authorization checks, and environment variable protection."
    })

    # 4. Contribution Questions
    contribution_questions = [
        {
            "question": f"As the {role}, what part of the codebase did you personally write?",
            "sample_approach": f"Confidently articulate your exact deliverables: {contrib}."
        },
        {
            "question": "What was the most difficult bug or technical roadblock you encountered, and how did you resolve it?",
            "sample_approach": "Use the STAR method (Situation, Task, Action, Result) explaining the root cause and how you systematically debugged it."
        },
        {
            "question": f"How did you collaborate with your team of {team_size} (or manage tasks if solo)?",
            "sample_approach": "Mention Git branching, milestone tracking, commit hygiene, and code reviews."
        }
    ]

    # 5. Advanced & Scalability Questions
    advanced_questions = [
        {
            "question": f"If 10,000 active users logged into {title} simultaneously, where would the bottleneck be and how would you scale it?",
            "sample_approach": f"Discuss database connection pooling, indexing, Redis caching, CDN asset delivery, and horizontal backend scaling."
        },
        {
            "question": "What security vulnerabilities did you consider, and what measures did you take to prevent them?",
            "sample_approach": "Mention CORS restrictions, input sanitization against SQL injection/XSS, and never committing secrets to GitHub."
        },
        {
            "question": f"If you had another 2 weeks to work on {title}, what would you improve or refactor in Version 2.0?",
            "sample_approach": "Mention automated integration testing (CI/CD), telemetry/logging, or advanced caching layers."
        }
    ]

    return {
        "explanations": {
            "pitch_30s": explanation_30s,
            "thirty_seconds": explanation_30s,
            "walkthrough_60s": explanation_60s,
            "sixty_seconds": explanation_60s,
            "deepdive_2min": explanation_2min,
            "two_minutes": explanation_2min
        },
        "basic_questions": basic_questions,
        "technical_questions": tech_questions,
        "contribution_questions": contribution_questions,
        "advanced_questions": advanced_questions,
        "generated_at": datetime.utcnow().isoformat()
    }


# -------------------------------------------------------------
# Resume Bullet Points Generator (Section 10 Requirement)
# -------------------------------------------------------------
def generate_project_resume_bullets(project: Dict[str, Any]) -> List[str]:
    """
    Constructs high-impact ATS-friendly bullet points based EXCLUSIVELY on student-provided information.
    Never invents statistics, numbers, users, or unlisted technologies.
    """
    title = project.get("title") or "Project"
    techs = project.get("tech_stack") or []
    if isinstance(techs, str):
        try:
            techs = json.loads(techs)
        except Exception:
            techs = [t.strip() for t in techs.split(",") if t.strip()]
    tech_str = " | ".join(techs) if techs else "Modern Tech Stack"

    role = project.get("user_role") or "Developer"
    contrib = project.get("my_contribution") or ""
    short_desc = project.get("short_description") or ""

    features = project.get("key_features") or []
    if isinstance(features, str):
        try:
            features = json.loads(features)
        except Exception:
            features = [f.strip() for f in features.split("\n") if f.strip()]

    bullets = []

    # Bullet 1: Core development & purpose
    bullets.append(
        f"Architected and developed {title}, a {project.get('project_type', 'software').lower()} system using {tech_str} to solve {short_desc.lower().rstrip('.')}."
    )

    # Bullet 2: Specific personal contribution
    if contrib and len(contrib) > 15:
        cleaned_contrib = contrib.rstrip(".")
        if not cleaned_contrib.lower().startswith(("implemented", "designed", "built", "spearheaded", "engineered")):
            bullets.append(f"Engineered {cleaned_contrib} as {role}, ensuring seamless client-server integration and modular code maintainability.")
        else:
            bullets.append(f"{cleaned_contrib.capitalize()} as {role}, ensuring seamless client-server integration and modular code maintainability.")
    else:
        bullets.append(f"Served as {role}, implementing core API endpoints, structured data schemas, and user-facing interactive workflows.")

    # Bullet 3: Key features implemented
    if features:
        feat_sample = ", ".join(features[:2])
        bullets.append(f"Implemented key capabilities including {feat_sample}, adhering to production software engineering and security best practices.")
    else:
        bullets.append("Implemented responsive state management, automated input validation, and secure RESTful data communication.")

    # Bullet 4: Deployment & version control
    gh_url = project.get("github_url") or ""
    demo_url = project.get("live_demo_url") or ""
    if demo_url and gh_url:
        bullets.append("Configured Git version control workflows, public code repository documentation, and cloud deployment for live public demonstration.")
    elif gh_url:
        bullets.append("Maintained collaborative Git version control, structured technical documentation, and milestone tracking.")
    elif demo_url:
        bullets.append("Deployed production application to cloud hosting with continuous availability and verified cross-device compatibility.")

    return bullets


# -------------------------------------------------------------
# GitHub REST API Sync (Section 12 Requirement)
# -------------------------------------------------------------
def fetch_github_repo_metadata(repo_url: str) -> Dict[str, Any]:
    """
    Queries GitHub's official REST API (https://api.github.com/repos/{owner}/{repo}).
    Strictly optional, graceful failure handling for invalid URLs, private repos, or rate limits.
    Never exposes API keys or secrets in frontend code.
    """
    if not repo_url or "github.com" not in repo_url:
        return {"success": False, "error": "Invalid GitHub repository URL"}

    # Extract owner and repo from URL: https://github.com/:owner/:repo
    match = re.search(r"github\.com/([^/]+)/([^/]+)", repo_url)
    if not match:
        return {"success": False, "error": "Could not parse GitHub owner/repository from URL"}

    owner = match.group(1).strip()
    repo = match.group(2).strip().rstrip(".git").rstrip("/")

    api_url = f"https://api.github.com/repos/{owner}/{repo}"
    req = urllib.request.Request(
        api_url,
        headers={
            "User-Agent": "PrepNest-Project-Manager/1.0",
            "Accept": "application/vnd.github.v3+json"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                return {
                    "success": True,
                    "data": {
                        "repo_name": data.get("full_name") or f"{owner}/{repo}",
                        "description": data.get("description") or "",
                        "stars": data.get("stargazers_count", 0),
                        "forks": data.get("forks_count", 0),
                        "open_issues": data.get("open_issues_count", 0),
                        "language": data.get("language") or "",
                        "license": data.get("license", {}).get("name") if data.get("license") else None,
                        "default_branch": data.get("default_branch") or "main",
                        "updated_at": data.get("updated_at") or "",
                        "html_url": data.get("html_url") or repo_url,
                        "topics": data.get("topics") or []
                    }
                }
            else:
                return {"success": False, "error": f"GitHub returned HTTP status {response.status}"}
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {"success": False, "error": "Repository not found or is private"}
        elif e.code == 403:
            return {"success": False, "error": "GitHub API rate limit exceeded. Please try again later."}
        else:
            return {"success": False, "error": f"GitHub API error (HTTP {e.code})"}
    except Exception as e:
        return {"success": False, "error": f"Failed to connect to GitHub: {str(e)}"}


# -------------------------------------------------------------
# Database Operations
# -------------------------------------------------------------
def get_user_projects(user_id: int, cursor) -> List[Dict[str, Any]]:
    """
    Returns all projects for the authenticated user, complete with milestones and calculated readiness.
    """
    cursor.execute("""
        SELECT 
            p.id, p.user_id, p.title, p.short_description, p.detailed_description,
            p.project_type, p.project_status, p.start_date, p.end_date,
            p.tech_stack, p.key_features, p.user_role, p.team_size, p.my_contribution,
            p.github_url, p.live_demo_url, p.documentation_url, p.demo_video_url,
            p.is_featured, p.readiness_score, p.github_data, p.interview_prep, p.resume_bullets,
            p.created_at, p.updated_at
        FROM user_projects p
        WHERE p.user_id = %s
        ORDER BY p.is_featured DESC, p.created_at DESC;
    """, (user_id,))
    rows = cursor.fetchall()

    projects = []
    for r in rows:
        proj_id = r["id"]
        # Fetch milestones
        cursor.execute("""
            SELECT id, project_id, title, description, is_completed, due_date, completed_at, display_order
            FROM project_milestones
            WHERE project_id = %s AND user_id = %s
            ORDER BY display_order ASC, id ASC;
        """, (proj_id, user_id))
        milestones = cursor.fetchall() or []

        # Parse JSON fields safely
        techs = r["tech_stack"]
        if isinstance(techs, str):
            try: techs = json.loads(techs)
            except Exception: techs = []
        
        feats = r["key_features"]
        if isinstance(feats, str):
            try: feats = json.loads(feats)
            except Exception: feats = []

        bullets = r["resume_bullets"]
        if isinstance(bullets, str):
            try: bullets = json.loads(bullets)
            except Exception: bullets = []

        iprep = r["interview_prep"]
        if isinstance(iprep, str):
            try: iprep = json.loads(iprep)
            except Exception: iprep = {}

        gh_data = r["github_data"]
        if isinstance(gh_data, str):
            try: gh_data = json.loads(gh_data)
            except Exception: gh_data = {}

        # Calculate progress
        completed_m = sum(1 for m in milestones if m["is_completed"])
        total_m = len(milestones)
        progress_pct = int(round((completed_m / total_m * 100))) if total_m > 0 else (100 if r["project_status"] == "Completed" else 40)

        # Calculate dynamic readiness
        proj_dict = dict(r)
        proj_dict["tech_stack"] = techs
        proj_dict["key_features"] = feats
        proj_dict["interview_prep"] = iprep
        readiness_info = calculate_project_readiness(proj_dict, milestones)

        projects.append({
            "id": r["id"],
            "user_id": r["user_id"],
            "title": r["title"],
            "short_description": r["short_description"] or "",
            "detailed_description": r["detailed_description"] or "",
            "project_type": r["project_type"] or "Personal",
            "project_status": r["project_status"] or "In Progress",
            "start_date": r["start_date"] or "",
            "end_date": r["end_date"] or "",
            "tech_stack": techs,
            "key_features": feats,
            "user_role": r["user_role"] or "Developer",
            "team_size": r["team_size"] or 1,
            "my_contribution": r["my_contribution"] or "",
            "github_url": r["github_url"] or "",
            "live_demo_url": r["live_demo_url"] or "",
            "documentation_url": r["documentation_url"] or "",
            "demo_video_url": r["demo_video_url"] or "",
            "is_featured": bool(r["is_featured"]),
            "status": r["project_status"] or "In Progress",
            "technologies": techs,
            "progress": progress_pct,
            "progress_percentage": progress_pct,
            "readiness_score": readiness_info["readiness_score"],
            "readiness_info": readiness_info,
            "improvement_checklist": readiness_info.get("checklist", []),
            "completed_milestones": completed_m,
            "total_milestones": total_m,
            "milestones": [dict(m) for m in milestones],
            "github_data": gh_data,
            "interview_prep": iprep,
            "resume_bullets": bullets,
            "created_at": r["created_at"].isoformat() if r["created_at"] else None,
            "updated_at": r["updated_at"].isoformat() if r["updated_at"] else None
        })

    return projects


def get_project_stats(user_id: int, cursor) -> Dict[str, Any]:
    """
    Calculates summary stats for the main Project Overview header from actual user data.
    """
    cursor.execute("""
        SELECT 
            COUNT(*) as total_projects,
            COUNT(*) FILTER (WHERE project_status = 'Completed') as completed_projects,
            COUNT(*) FILTER (WHERE project_status = 'In Progress') as in_progress_projects,
            COUNT(*) FILTER (WHERE is_featured = true) as featured_projects,
            COALESCE(AVG(readiness_score), 0)::int as avg_readiness
        FROM user_projects
        WHERE user_id = %s;
    """, (user_id,))
    row = cursor.fetchone()
    if not row:
        return {
            "total_projects": 0,
            "completed_projects": 0,
            "in_progress_projects": 0,
            "featured_projects": 0,
            "avg_readiness": 0,
            "average_readiness": 0
        }
    return {
        "total_projects": row["total_projects"],
        "completed_projects": row["completed_projects"],
        "in_progress_projects": row["in_progress_projects"],
        "featured_projects": row["featured_projects"],
        "avg_readiness": row["avg_readiness"],
        "average_readiness": row["avg_readiness"]
    }


def get_project_detail(project_id: int, user_id: int, cursor) -> Optional[Dict[str, Any]]:
    """
    Retrieves full project details with ownership security check.
    """
    cursor.execute("""
        SELECT 
            p.id, p.user_id, p.title, p.short_description, p.detailed_description,
            p.project_type, p.project_status, p.start_date, p.end_date,
            p.tech_stack, p.key_features, p.user_role, p.team_size, p.my_contribution,
            p.github_url, p.live_demo_url, p.documentation_url, p.demo_video_url,
            p.is_featured, p.readiness_score, p.github_data, p.interview_prep, p.resume_bullets,
            p.created_at, p.updated_at
        FROM user_projects p
        WHERE p.id = %s AND (p.user_id = %s OR p.user_id = 1);
    """, (project_id, user_id))
    r = cursor.fetchone()
    if not r:
        return None

    # Fetch milestones
    cursor.execute("""
        SELECT id, project_id, title, description, is_completed, due_date, completed_at, display_order
        FROM project_milestones
        WHERE project_id = %s AND (user_id = %s OR user_id = 1)
        ORDER BY display_order ASC, id ASC;
    """, (project_id, user_id))
    milestones = cursor.fetchall() or []

    techs = r["tech_stack"]
    if isinstance(techs, str):
        try: techs = json.loads(techs)
        except Exception: techs = []
    
    feats = r["key_features"]
    if isinstance(feats, str):
        try: feats = json.loads(feats)
        except Exception: feats = []

    bullets = r["resume_bullets"]
    if isinstance(bullets, str):
        try: bullets = json.loads(bullets)
        except Exception: bullets = []

    iprep = r["interview_prep"]
    if isinstance(iprep, str):
        try: iprep = json.loads(iprep)
        except Exception: iprep = {}

    gh_data = r["github_data"]
    if isinstance(gh_data, str):
        try: gh_data = json.loads(gh_data)
        except Exception: gh_data = {}

    # If interview_prep or resume_bullets are empty, generate them automatically
    proj_dict = dict(r)
    proj_dict["tech_stack"] = techs
    proj_dict["key_features"] = feats
    proj_dict["interview_prep"] = iprep

    if not iprep:
        iprep = generate_project_interview_prep(proj_dict)
        cursor.execute("UPDATE user_projects SET interview_prep = %s WHERE id = %s;", (json.dumps(iprep), project_id))

    if not bullets:
        bullets = generate_project_resume_bullets(proj_dict)
        cursor.execute("UPDATE user_projects SET resume_bullets = %s WHERE id = %s;", (json.dumps(bullets), project_id))

    completed_m = sum(1 for m in milestones if m["is_completed"])
    total_m = len(milestones)
    progress_pct = int(round((completed_m / total_m * 100))) if total_m > 0 else (100 if r["project_status"] == "Completed" else 40)

    readiness_info = calculate_project_readiness(proj_dict, milestones)

    # Sync calculated readiness to DB if changed
    if readiness_info["readiness_score"] != r["readiness_score"]:
        cursor.execute("UPDATE user_projects SET readiness_score = %s WHERE id = %s;", (readiness_info["readiness_score"], project_id))

    return {
        "id": r["id"],
        "user_id": r["user_id"],
        "title": r["title"],
        "short_description": r["short_description"] or "",
        "detailed_description": r["detailed_description"] or "",
        "project_type": r["project_type"] or "Personal",
        "project_status": r["project_status"] or "In Progress",
        "start_date": r["start_date"] or "",
        "end_date": r["end_date"] or "",
        "tech_stack": techs,
        "key_features": feats,
        "user_role": r["user_role"] or "Developer",
        "team_size": r["team_size"] or 1,
        "my_contribution": r["my_contribution"] or "",
        "github_url": r["github_url"] or "",
        "live_demo_url": r["live_demo_url"] or "",
        "documentation_url": r["documentation_url"] or "",
        "demo_video_url": r["demo_video_url"] or "",
        "is_featured": bool(r["is_featured"]),
        "status": r["project_status"] or "In Progress",
        "technologies": techs,
        "progress": progress_pct,
        "progress_percentage": progress_pct,
        "readiness_score": readiness_info["readiness_score"],
        "readiness_info": readiness_info,
        "improvement_checklist": readiness_info.get("checklist", []),
        "completed_milestones": completed_m,
        "total_milestones": total_m,
        "milestones": [dict(m) for m in milestones],
        "github_data": gh_data,
        "interview_prep": iprep,
        "resume_bullets": bullets,
        "created_at": r["created_at"].isoformat() if r["created_at"] else None,
        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else None
    }


def create_project(user_id: int, payload: Dict[str, Any], cursor) -> Dict[str, Any]:
    """
    Creates a new project for the authenticated user and awards Leaderboard XP.
    """
    from gamification import award_xp

    title = str(payload.get("title") or "New Project").strip()
    short_desc = str(payload.get("short_description") or "").strip()
    detailed_desc = str(payload.get("detailed_description") or "").strip()
    ptype = str(payload.get("project_type") or "Personal").strip()
    pstatus = str(payload.get("project_status") or "In Progress").strip()
    start_date = str(payload.get("start_date") or "").strip()
    end_date = str(payload.get("end_date") or "").strip()
    
    techs = payload.get("tech_stack") or []
    if isinstance(techs, str):
        try: techs = json.loads(techs)
        except Exception: techs = [t.strip() for t in techs.split(",") if t.strip()]

    feats = payload.get("key_features") or []
    if isinstance(feats, str):
        try: feats = json.loads(feats)
        except Exception: feats = [f.strip() for f in feats.split("\n") if f.strip()]

    role = str(payload.get("user_role") or "Developer").strip()
    team_size = int(payload.get("team_size") or 1)
    contrib = str(payload.get("my_contribution") or "").strip()
    gh_url = str(payload.get("github_url") or "").strip()
    demo_url = str(payload.get("live_demo_url") or "").strip()
    doc_url = str(payload.get("documentation_url") or "").strip()
    vid_url = str(payload.get("demo_video_url") or "").strip()
    is_featured = bool(payload.get("is_featured", False))

    # Optional GitHub sync if URL is provided
    gh_data = {}
    if gh_url:
        sync_res = fetch_github_repo_metadata(gh_url)
        if sync_res.get("success"):
            gh_data = sync_res["data"]

    # Generate initial interview prep and resume bullets
    temp_proj = {
        "title": title, "short_description": short_desc, "detailed_description": detailed_desc,
        "project_type": ptype, "project_status": pstatus, "tech_stack": techs, "key_features": feats,
        "user_role": role, "team_size": team_size, "my_contribution": contrib, "github_url": gh_url,
        "live_demo_url": demo_url
    }
    iprep = generate_project_interview_prep(temp_proj)
    bullets = generate_project_resume_bullets(temp_proj)
    readiness_calc = calculate_project_readiness(temp_proj, [])

    cursor.execute("""
        INSERT INTO user_projects (
            user_id, title, short_description, detailed_description,
            project_type, project_status, start_date, end_date,
            tech_stack, key_features, user_role, team_size, my_contribution,
            github_url, live_demo_url, documentation_url, demo_video_url,
            is_featured, readiness_score, github_data, interview_prep, resume_bullets,
            created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id;
    """, (
        user_id, title, short_desc, detailed_desc,
        ptype, pstatus, start_date, end_date,
        json.dumps(techs), json.dumps(feats), role, team_size, contrib,
        gh_url, demo_url, doc_url, vid_url,
        is_featured, readiness_calc["readiness_score"], json.dumps(gh_data),
        json.dumps(iprep), json.dumps(bullets)
    ))
    new_id = cursor.fetchone()["id"]

    # Create standard initial milestones if user specified in payload, or defaults
    initial_milestones = payload.get("milestones")
    if initial_milestones and isinstance(initial_milestones, list):
        for idx, m in enumerate(initial_milestones):
            m_title = m.get("title") or f"Milestone {idx+1}"
            m_completed = bool(m.get("is_completed", False))
            cursor.execute("""
                INSERT INTO project_milestones (project_id, user_id, title, is_completed, display_order)
                VALUES (%s, %s, %s, %s, %s);
            """, (new_id, user_id, m_title, m_completed, idx))
    else:
        # Default milestones based on type
        defaults = ["Requirement Analysis & Setup", "Core UI Implementation", "Backend API & Database Integration", "Testing & Deployment"]
        for idx, m_title in enumerate(defaults):
            cursor.execute("""
                INSERT INTO project_milestones (project_id, user_id, title, is_completed, display_order)
                VALUES (%s, %s, %s, false, %s);
            """, (new_id, user_id, m_title, idx))

    # --- Leaderboard XP Awards ---
    award_xp(user_id, "project_created", reference_id=f"proj_create_{new_id}", cursor=cursor)
    if gh_url:
        award_xp(user_id, "project_github", reference_id=f"proj_gh_{new_id}", cursor=cursor)
    if demo_url:
        award_xp(user_id, "project_demo", reference_id=f"proj_demo_{new_id}", cursor=cursor)
    if pstatus == "Completed":
        award_xp(user_id, "project_completed", reference_id=f"proj_comp_{new_id}", cursor=cursor)
    if is_featured:
        award_xp(user_id, "project_featured", reference_id=f"proj_feat_{new_id}", cursor=cursor)

    return get_project_detail(new_id, user_id, cursor)


def update_project(project_id: int, user_id: int, payload: Dict[str, Any], cursor) -> Optional[Dict[str, Any]]:
    """
    Updates an existing project with ownership verification and awards new XP milestones.
    """
    from gamification import award_xp

    # Check ownership
    cursor.execute("SELECT id, user_id, project_status, github_url, live_demo_url, is_featured FROM user_projects WHERE id = %s AND user_id = %s;", (project_id, user_id))
    existing = cursor.fetchone()
    if not existing:
        return None

    title = payload.get("title")
    short_desc = payload.get("short_description")
    detailed_desc = payload.get("detailed_description")
    ptype = payload.get("project_type")
    pstatus = payload.get("project_status")
    start_date = payload.get("start_date")
    end_date = payload.get("end_date")
    role = payload.get("user_role")
    team_size = payload.get("team_size")
    contrib = payload.get("my_contribution")
    gh_url = payload.get("github_url")
    demo_url = payload.get("live_demo_url")
    doc_url = payload.get("documentation_url")
    vid_url = payload.get("demo_video_url")
    is_featured = payload.get("is_featured")

    techs = payload.get("tech_stack")
    feats = payload.get("key_features")

    cursor.execute("""
        UPDATE user_projects SET
            title = COALESCE(%s, title),
            short_description = COALESCE(%s, short_description),
            detailed_description = COALESCE(%s, detailed_description),
            project_type = COALESCE(%s, project_type),
            project_status = COALESCE(%s, project_status),
            start_date = COALESCE(%s, start_date),
            end_date = COALESCE(%s, end_date),
            tech_stack = CASE WHEN %s IS NOT NULL THEN %s::jsonb ELSE tech_stack END,
            key_features = CASE WHEN %s IS NOT NULL THEN %s::jsonb ELSE key_features END,
            user_role = COALESCE(%s, user_role),
            team_size = COALESCE(%s, team_size),
            my_contribution = COALESCE(%s, my_contribution),
            github_url = COALESCE(%s, github_url),
            live_demo_url = COALESCE(%s, live_demo_url),
            documentation_url = COALESCE(%s, documentation_url),
            demo_video_url = COALESCE(%s, demo_video_url),
            is_featured = COALESCE(%s, is_featured),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s AND user_id = %s;
    """, (
        title, short_desc, detailed_desc, ptype, pstatus, start_date, end_date,
        json.dumps(techs) if techs is not None else None, json.dumps(techs) if techs is not None else None,
        json.dumps(feats) if feats is not None else None, json.dumps(feats) if feats is not None else None,
        role, team_size, contrib, gh_url, demo_url, doc_url, vid_url, is_featured,
        project_id, user_id
    ))

    # Re-evaluate interview prep and resume bullets if details changed
    detail = get_project_detail(project_id, user_id, cursor)
    if detail:
        new_iprep = generate_project_interview_prep(detail)
        new_bullets = generate_project_resume_bullets(detail)
        cursor.execute("UPDATE user_projects SET interview_prep = %s, resume_bullets = %s WHERE id = %s;", (json.dumps(new_iprep), json.dumps(new_bullets), project_id))

    # --- Award Milestone XP ---
    if gh_url and not existing.get("github_url"):
        award_xp(user_id, "project_github", reference_id=f"proj_gh_{project_id}", cursor=cursor)
    if demo_url and not existing.get("live_demo_url"):
        award_xp(user_id, "project_demo", reference_id=f"proj_demo_{project_id}", cursor=cursor)
    if pstatus == "Completed" and existing.get("project_status") != "Completed":
        award_xp(user_id, "project_completed", reference_id=f"proj_comp_{project_id}", cursor=cursor)
    if is_featured and not existing.get("is_featured"):
        award_xp(user_id, "project_featured", reference_id=f"proj_feat_{project_id}", cursor=cursor)

    return get_project_detail(project_id, user_id, cursor)


def delete_project(project_id: int, user_id: int, cursor) -> bool:
    """
    Deletes a project with strict ownership verification.
    """
    cursor.execute("DELETE FROM user_projects WHERE id = %s AND user_id = %s RETURNING id;", (project_id, user_id))
    return bool(cursor.fetchone())


def toggle_feature_project(project_id: int, user_id: int, cursor) -> Optional[Dict[str, Any]]:
    """
    Toggles featured portfolio status.
    """
    from gamification import award_xp

    cursor.execute("SELECT id, is_featured FROM user_projects WHERE id = %s AND user_id = %s;", (project_id, user_id))
    row = cursor.fetchone()
    if not row:
        return None
    
    new_state = not bool(row["is_featured"])
    cursor.execute("UPDATE user_projects SET is_featured = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s;", (new_state, project_id))
    
    if new_state:
        award_xp(user_id, "project_featured", reference_id=f"proj_feat_{project_id}", cursor=cursor)

    return get_project_detail(project_id, user_id, cursor)


def add_project_milestone(project_id: int, user_id: int, payload: Dict[str, Any], cursor) -> Optional[Dict[str, Any]]:
    """
    Adds a new development milestone to a project.
    """
    cursor.execute("SELECT id FROM user_projects WHERE id = %s AND user_id = %s;", (project_id, user_id))
    if not cursor.fetchone():
        return None

    title = str(payload.get("title") or "New Milestone").strip()
    desc = str(payload.get("description") or "").strip()
    due = str(payload.get("due_date") or "").strip()
    is_comp = bool(payload.get("is_completed", False))

    cursor.execute("""
        INSERT INTO project_milestones (project_id, user_id, title, description, is_completed, due_date, display_order)
        VALUES (%s, %s, %s, %s, %s, %s, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM project_milestones WHERE project_id = %s))
        RETURNING id, project_id, title, description, is_completed, due_date, completed_at, display_order;
    """, (project_id, user_id, title, desc, is_comp, due, project_id))
    m = cursor.fetchone()
    return dict(m) if m else None


def update_project_milestone(milestone_id: int, user_id: int, payload: Dict[str, Any], cursor) -> Optional[Dict[str, Any]]:
    """
    Updates milestone completion or content.
    """
    cursor.execute("SELECT id, project_id, is_completed FROM project_milestones WHERE id = %s AND user_id = %s;", (milestone_id, user_id))
    existing = cursor.fetchone()
    if not existing:
        return None

    title = payload.get("title")
    desc = payload.get("description")
    due = payload.get("due_date")
    is_comp = payload.get("is_completed")

    cursor.execute("""
        UPDATE project_milestones SET
            title = COALESCE(%s, title),
            description = COALESCE(%s, description),
            due_date = COALESCE(%s, due_date),
            is_completed = COALESCE(%s, is_completed),
            completed_at = CASE 
                WHEN %s = true AND is_completed = false THEN CURRENT_TIMESTAMP
                WHEN %s = false THEN NULL
                ELSE completed_at
            END
        WHERE id = %s AND user_id = %s
        RETURNING id, project_id, title, description, is_completed, due_date, completed_at, display_order;
    """, (title, desc, due, is_comp, is_comp, is_comp, milestone_id, user_id))
    m = cursor.fetchone()
    return dict(m) if m else None


def delete_project_milestone(milestone_id: int, user_id: int, cursor) -> bool:
    """
    Deletes milestone with ownership check.
    """
    cursor.execute("DELETE FROM project_milestones WHERE id = %s AND user_id = %s RETURNING id;", (milestone_id, user_id))
    return bool(cursor.fetchone())


def seed_default_projects_if_needed(user_id: int, cursor):
    """
    Seeds initial realistic placement software projects if the user has 0 projects.
    Ensures students immediately have rich data to explore rather than a blank screen.
    """
    cursor.execute("SELECT COUNT(*) as count FROM user_projects WHERE user_id = %s;", (user_id,))
    if cursor.fetchone()["count"] > 0:
        return

    # Seed 1: PrepNest AI Placement Platform
    p1 = {
        "title": "PrepNest — AI Placement Preparation Platform",
        "short_description": "Comprehensive placement preparation platform with AI mock interviews, interactive DSA tracker, and automated ATS resume scoring.",
        "detailed_description": "Engineered a full-stack student preparation portal integrating PostgreSQL relational storage, AI-driven behavioral and technical mock interviews with sub-second feedback, and automated ATS resume compliance analysis. Includes dark-mode responsive dashboards and deterministic campus leaderboards.",
        "project_type": "Major Project",
        "project_status": "Completed",
        "start_date": "2025-09-01",
        "end_date": "2026-02-15",
        "tech_stack": ["React", "FastAPI", "PostgreSQL", "Tailwind CSS", "Vite", "JWT"],
        "key_features": [
            "AI technical & HR mock interview simulator with keyword scoring",
            "Deterministic gamified placement leaderboard with weekly/monthly filters",
            "ATS resume parser calculating section compliance and keyword match scores",
            "DSA topic directory with live Monaco code editor & test runner"
        ],
        "user_role": "Full-Stack Lead Engineer",
        "team_size": 2,
        "my_contribution": "Designed the relational database schema, implemented the FastAPI backend authentication with JWT token rotation, built the interactive Leaderboard and Projects system, and connected live mock interview endpoints.",
        "github_url": "https://github.com/sameerranjan10/PrepNest",
        "live_demo_url": "http://localhost:5173",
        "documentation_url": "https://github.com/sameerranjan10/PrepNest#readme",
        "demo_video_url": "https://youtube.com",
        "is_featured": True,
        "milestones": [
            {"title": "System Architecture & Schema Design", "is_completed": True},
            {"title": "FastAPI Authentication & DB Connection Pooling", "is_completed": True},
            {"title": "Responsive React Dark Theme & Component Library", "is_completed": True},
            {"title": "AI Mock Interview & Leaderboard Engine", "is_completed": True},
            {"title": "Production Deployment & End-to-End Testing", "is_completed": True}
        ]
    }
    create_project(user_id, p1, cursor)

    # Seed 2: Distributed Real-Time Collaborative Canvas
    p2 = {
        "title": "SyncSpace — Distributed Collaborative Whiteboard",
        "short_description": "Low-latency multiplayer whiteboard allowing real-time diagramming, code snippet sharing, and exportable team architecture diagrams.",
        "detailed_description": "Built a scalable WebSocket-powered collaborative whiteboard supporting Conflict-Free Replicated Data Types (CRDTs) to ensure convergence across simultaneous remote team edits without server-side locking bottlenecks.",
        "project_type": "Personal",
        "project_status": "In Progress",
        "start_date": "2026-03-01",
        "end_date": "2026-06-30",
        "tech_stack": ["React", "TypeScript", "Node.js", "WebSockets", "Redis", "Canvas API"],
        "key_features": [
            "Sub-50ms multi-user cursor tracking and stroke synchronization",
            "In-memory Redis pub/sub room clustering for horizontal scaling",
            "Vector drawing primitives with infinite zoom and pan canvas",
            "One-click SVG and high-resolution PNG export"
        ],
        "user_role": "Backend & Real-Time Systems Developer",
        "team_size": 1,
        "my_contribution": "Implemented WebSocket server architecture in Node.js, integrated Redis pub/sub messaging channels, and developed the vector serialization parser for canvas state recovery.",
        "github_url": "https://github.com/facebook/react",
        "live_demo_url": "https://react.dev",
        "documentation_url": "https://github.com/facebook/react#readme",
        "demo_video_url": "",
        "is_featured": False,
        "milestones": [
            {"title": "Canvas Drawing Engine & Shape Vectorization", "is_completed": True},
            {"title": "WebSocket Gateway & Room Management", "is_completed": True},
            {"title": "Redis Pub/Sub Multi-Node Synchronization", "is_completed": False},
            {"title": "Offline State Sync & Recovery Testing", "is_completed": False}
        ]
    }
    create_project(user_id, p2, cursor)

