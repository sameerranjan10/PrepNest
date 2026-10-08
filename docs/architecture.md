<!-- 
  PREPNEST CONTEXT SYSTEM | DOCUMENT 2 OF 5
  HOW TO UPDATE:
  - Update this document whenever new services, database tables, external APIs,
    or fundamental architecture flows are introduced or modified.
  - Review prior to any significant refactoring or dependency additions.
-->

# 🏛️ PrepNest — System Architecture & Technical Specifications

| Spec | Details |
| :--- | :--- |
| **System Classification** | Modular Client-Server Web Application |
| **Backend Runtime** | Python 3.9+ with FastAPI (Asynchronous ASGI) |
| **Frontend Framework** | React 19 + Vite 8 (SPA Architecture) |
| **Styling Engine** | Tailwind CSS 3.4 (Dark-Themed Slate Palette) |
| **Database Engine** | PostgreSQL (Neon Serverless PostgreSQL with SSL connection pooling) |
| **Document Parsers** | PyMuPDF (fitz), python-docx |
| **Primary State Management** | React Context (`AuthContext`), React Hook State, TanStack React Query 5 |

---

## 1. System Topology & Architectural Diagram

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Vite + React 19 SPA)"]
        UI[Tailwind UI / Dark Mode]
        Router[React Router 6]
        AuthCtx[Auth Context & LocalStorage]
        Pages[Pages: DSA, Aptitude, Resume, Roadmaps, Interviews]
    end

    subgraph API_Gateway["Backend API (FastAPI @ Port 8000)"]
        CORS[CORS Middleware]
        AuthRouter["/api/auth/* (Neon + Local JWT)"]
        UserRouter["/api/user/* (Profile & Goals)"]
        AptRouter["/api/aptitude/* (Quizzes & Results)"]
        DSARouter["/api/dsa/* (Problems & Code Runner)"]
        ResumeRouter["/api/resume/* (ATS Engine)"]
        RoadmapRouter["/api/roadmap/* (Domain Tracks)"]
    end

    subgraph External_Services["External Services & Micro-Engines"]
        NeonAuth["Neon Managed Auth API"]
        Judge0["Judge0 Remote Code Execution (Roadmap)"]
    end

    subgraph Storage["Persistent Layer (PostgreSQL / NeonDB)"]
        DB[(Neon Serverless Postgres)]
        Tables["Tables: users, dsa_problems, resume_analyses, roadmap_*, aptitude_*"]
    end

    UI --> Router
    Router --> Pages
    Pages --> AuthCtx
    AuthCtx -->|Bearer Token / API Fetch| CORS
    CORS --> API_Gateway

    AuthRouter -->|Sign-up / Sign-in Request| NeonAuth
    AuthRouter -->|Session Token Verify| DB
    ResumeRouter -->|PyMuPDF / docx Extraction| ResumeRouter
    DSARouter -.->|Execution Delegation| Judge0
    API_Gateway -->|psycopg2-binary Pooled Query| DB
```

---

## 2. Technology Stack Breakdown

### Frontend Layer
- **Core:** React 19.x with functional components and React Hooks.
- **Build Tool:** Vite 8.x featuring Fast Refresh and ESM bundling.
- **Styling:** Tailwind CSS 3.4 with custom utility combinations, CSS variables, and Lucide React icons.
- **Routing:** `react-router-dom` v6 with declarative routing and role/session-based `ProtectedRoute` guards.
- **Data Fetching & State:**
  - `AuthContext`: Centralized authentication status, user profile syncing, token persistence.
  - `@tanstack/react-query`: Efficient caching, refetching, and server-state synchronization.
  - `recharts`: Performance visualization across aptitude test results and DSA progress.
  - `framer-motion`: Smooth transitions across modals, drawers, and quiz step-cards.

### Backend Layer
- **Web Framework:** FastAPI with asynchronous endpoint support and Pydantic v2 data serialization.
- **Server:** Uvicorn ASGI server with automatic reload during development.
- **Security & Tokens:**
  - `PyJWT`: HMAC-SHA256 stateless access tokens.
  - `hashlib` & `bcrypt`: Multi-layer password hashing with application-level salting.
  - CORS middleware configured for cross-origin local and production origin headers.
- **Document Processing:**
  - `pymupdf` (Fitz): High-speed PDF text and layout extraction for resume analysis.
  - `python-docx`: Microsoft Word (.docx) document structure parser.

### Database Layer
- **Engine:** PostgreSQL 16 on Neon Serverless Cloud.
- **Connection Driver:** `psycopg2-binary` with `RealDictCursor` for dictionary-mapped SQL output.
- **Connection Management:** Dynamic pool management via environment variable `DATABASE_URL` with SSL mode enabled.
- **Schema Management:** Automated startup verification and dynamic column migration (`ALTER TABLE ADD COLUMN IF NOT EXISTS`) implemented in `backend/database.py`.

---

## 3. Directory Structure

```plaintext
PrepNest-main/
├── README.md                      # High-level overview & quickstart guide
├── start.bat                      # Windows launcher for concurrent frontend + backend
├── docs/                          # Architectural & AI context documentation
│   ├── README.md                  # Documentation map & usage guide
│   ├── project-brief.md           # Product requirements & problem statement
│   ├── architecture.md            # Technical specifications & topology
│   ├── coding-standards.md        # Style guides, conventions & error handling
│   ├── roadmap.md                 # Implementation phases & task backlogs
│   └── ai-instructions.md         # Autonomous AI developer rules & context
│
├── backend/                       # FastAPI application & business logic
│   ├── main.py                    # Root FastAPI app, routing, controllers (~2700 lines)
│   ├── auth.py                    # Auth utilities, Neon Auth proxy, JWT lifecycle
│   ├── database.py                # Postgres connection factory, schemas & seeds
│   ├── resume_service.py          # ATS scoring logic, taxonomy, keyword extractors
│   ├── requirements.txt           # Python dependency declarations
│   ├── .env                       # Environment configs (DATABASE_URL, NEON_AUTH_URL)
│   ├── data/                      # Static datasets & taxonomy
│   │   ├── company_role_requirements.json # Job matching keyword corpora
│   │   ├── sample_questions.csv   # Seed question bank
│   │   └── sample_questions.json  # JSON format questions
│   ├── ingest_dsa.py              # DSA problem ingestion pipeline
│   ├── seed_roadmap.py            # Pre-populates 7 roadmap domains & 35 topics
│   └── test_roadmap_suite.py      # Automated validation suite for roadmap APIs
│
└── frontend/                      # React 19 + Vite single-page application
    ├── index.html                 # Single page root HTML
    ├── vite.config.js             # Vite configuration with @ path aliases
    ├── tailwind.config.js         # Tailwind theme & plugin configurations
    ├── package.json               # Node.js dependencies & scripts
    └── src/
        ├── main.jsx               # React DOM entry point
        ├── App.jsx                # Router configuration & protected layout
        ├── globals.css            # Base stylesheet & scrollbar modifications
        ├── context/
        │   └── AuthContext.jsx    # User session, login/logout, profile state
        ├── components/
        │   ├── Header.jsx         # Global top navigation & search bar
        │   ├── Sidebar.jsx        # Primary platform navigation bar
        │   ├── ProtectedRoute.jsx # Route-guard checking authentication token
        │   ├── DSAPracticeModal.jsx # LeetCode-style code solving workspace
        │   └── QuestionDirectory.jsx # Searchable aptitude question browser
        ├── pages/
        │   ├── Landing.jsx        # Public hero landing page
        │   ├── Login.jsx / Signup.jsx # Auth pages
        │   ├── Dashboard.jsx      # Metrics overview, streaks & recent attempts
        │   ├── DSA.jsx            # DSA repository with company & difficulty filters
        │   ├── Aptitude.jsx       # Quizzes, timed evaluations & scorecards
        │   ├── ResumeAnalyzer.jsx # ATS analysis, keyword matching & bullet enhancer
        │   ├── Roadmaps.jsx       # 7 curated domain tracks with mini-projects
        │   ├── CompanyPrep.jsx    # Company syllabus & round breakdowns
        │   ├── MockInterview.jsx  # AI interview simulator with camera/mic
        │   ├── AIAssistant.jsx    # Placement mentor conversational UI
        │   ├── Leaderboard.jsx    # Student ranking and streak leaderboard
        │   ├── Community.jsx      # Discussion threads & peer Q&A
        │   └── Settings.jsx       # Profile editing, coding handles & password update
        └── lib/
            ├── aptitudeData.js    # Aptitude fallback data structures
            └── mockData.js        # Default user metrics & mock state
```

---

## 4. Key Data Flow Pipelines

### 4.1 Authentication Flow (Hybrid Model)
```mermaid
sequenceDiagram
    autonumber
    actor User as Student
    participant FE as Frontend (AuthContext)
    participant BE as Backend (/api/auth)
    participant Neon as Neon Auth API
    participant DB as PostgreSQL Database

    User->>FE: Submits Email & Password
    FE->>BE: POST /api/auth/login
    alt Managed Neon Auth Available
        BE->>Neon: POST /sign-in/email
        Neon-->>BE: Session Token & User Metadata
    else Neon Auth Fallback
        BE->>DB: Query user by email & verify password hash
    end
    BE->>BE: Generate Access Token (JWT)
    BE-->>FE: Returns { access_token, user_object }
    FE->>FE: Stores in localStorage & updates AuthContext
```

### 4.2 Resume ATS Analysis Pipeline
```mermaid
flowchart TD
    A[User uploads .pdf or .docx] --> B[FastAPI receives UploadFile stream]
    B --> C{File Type Detection}
    C -->|PDF| D[PyMuPDF / fitz extracts text blocks & font metadata]
    C -->|DOCX| E[python-docx parses paragraphs & table cells]
    D & E --> F[Text Normalization & Cleansing]
    F --> G[Taxonomy Scanner: Languages, Frameworks, Cloud, Databases]
    F --> H[Metric Analyzer: Regex detection of %, $, numbers, metrics]
    F --> I[Action Verb Scanner: Analyzes bullet lead words]
    F --> J[Target Company / Role Matcher]
    G & H & I & J --> K[Calculate ATS Score & Category Breakdown]
    K --> L[Generate Specific Bullet Point Rewrite Recommendations]
    L --> M[Persist record to resume_analyses table]
    M --> N[Return structured JSON report to Frontend]
```

### 4.3 Interactive Code Execution Pipeline
```mermaid
flowchart LR
    A[Student writes code in DSAPracticeModal] --> B[Selects Language e.g., Python, C++, Java]
    B --> C[Hits 'Run Code' or 'Submit Solution']
    C --> D[POST /api/dsa/run or /api/dsa/submit]
    D --> E[Backend Test Harness Runner]
    E --> F[Execute against Sample & Hidden Test Cases]
    F --> G{Passed All Cases?}
    G -->|Yes| H[Mark problem as solved in user_dsa_progress]
    G -->|No| I[Return failed input, expected vs actual output]
    H & I --> J[Update Streak & Refresh UI State]
```

---

## 5. Relational Database Schema Design

The platform relies on normalized PostgreSQL tables with foreign key cascades:

```mermaid
erDiagram
    users ||--o{ aptitude_test_results : takes
    users ||--o{ user_question_progress : records
    users ||--o{ user_dsa_progress : tracks
    users ||--o{ resume_analyses : uploads
    users ||--o{ user_roadmap_progress : completes
    
    dsa_problems ||--o{ user_dsa_progress : referenced_by
    aptitude_questions ||--o{ user_question_progress : referenced_by

    roadmap_domains ||--o{ roadmap_topics : contains
    roadmap_domains ||--o{ roadmap_projects : includes
    roadmap_topics ||--o{ roadmap_resources : provides
    roadmap_topics ||--o{ roadmap_practice_tasks : assigns
    roadmap_topics ||--o{ user_roadmap_progress : logs

    users {
        int id PK
        string email UK
        string full_name
        string hashed_password
        string plan
        int credits
        string target_role
        string leetcode_username
        string github_url
        timestamp created_at
    }

    dsa_problems {
        int id PK
        string title
        string slug UK
        string difficulty
        text[] topics
        text[] companies
        jsonb examples
        jsonb constraints
        jsonb code_snippets
        jsonb solutions
    }

    resume_analyses {
        int id PK
        int user_id FK
        string file_name
        int overall_score
        string readiness_level
        jsonb scores
        jsonb skills_categorized
        jsonb strengths
        jsonb issues
        jsonb bullet_improvements
        timestamp created_at
    }

    roadmap_domains {
        string id PK
        string name
        string difficulty
        string estimated_weeks
        int display_order
    }

    roadmap_topics {
        int id PK
        string domain_id FK
        string slug
        string title
        text explanation
        jsonb key_points
        jsonb quiz
    }
```

---

## 6. Architectural Design Patterns Applied

1. **Layered Separation of Concerns:**
   - Transport layer (FastAPI route declarations, status codes, query parameters).
   - Domain logic layer (`resume_service.py`, `auth.py`).
   - Persistence layer (`database.py` with explicit transaction commits and cursors).

2. **Defensive Schema Evolution:**
   - Startup hooks automatically invoke `ALTER TABLE ADD COLUMN IF NOT EXISTS` for all incrementally added user fields and problem metadata, preventing breaking deployments when schemas expand.

3. **Hybrid Authentication with Graceful Fallback:**
   - When configured, queries authenticate against managed cloud Neon Auth sessions.
   - If Neon Auth is unavailable, the system safely falls back to local JWT token generation and salted SHA-256 password hash comparison, preventing developer lockouts during local offline work.

4. **Normalized Taxonomy & JSONB Flexibility:**
   - Uses relational foreign keys for user ownership and problem tracking, combined with PostgreSQL `JSONB` columns for unstructured metadata (test cases, code snippets, keyword breakdowns, bullet improvements).
