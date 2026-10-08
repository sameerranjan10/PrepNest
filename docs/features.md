<!-- 
  PREPNEST CONTEXT SYSTEM | DOCUMENT 6 OF 6
  HOW TO UPDATE:
  - Update this document whenever a page, tab, button, or user interaction is added, modified, or deprecated.
  - Maintain the page-by-page UI breakdown with exact button labels, callbacks, and triggered endpoints.
-->

# 🌟 PrepNest — Comprehensive Feature & UI Interaction Catalog

| Metadata | Details |
| :--- | :--- |
| **System** | PrepNest Placement Preparation Platform |
| **Document Classification** | Page-by-Page UI Specifications, Tabs, Buttons & Action Workflows |
| **Status Tagging** | `[Production Ready]` • `[Active MVP]` • `[In Progress]` • `[Planned]` |
| **Last Updated** | October 2026 |

---

## 1. High-Level Feature Overview Matrix

| Module | Feature Name | Status | Frontend Route / Component | Primary Backend API |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | Dual Authentication (Neon Auth + Local JWT) | `[Active MVP]` | `/login`, `/signup`, `AuthContext.jsx` | `/api/auth/register`, `/api/auth/login` |
| **Profile** | Academic & Placement Profile Hub | `[Active MVP]` | `/settings`, `Settings.jsx` | `/api/user/profile`, `/api/user/password` |
| **Aptitude** | Diagnostic Aptitude Assessment & Quizzes | `[Active MVP]` | `/aptitude`, `Aptitude.jsx` | `/api/aptitude/submit`, `/api/aptitude/questions` |
| **Aptitude** | Searchable Question Directory & Single-Solve | `[Active MVP]` | `QuestionDirectory.jsx` | `/api/aptitude/directory`, `/api/aptitude/solve` |
| **DSA** | Problem Directory & Filter Engine | `[Active MVP]` | `/dsa`, `DSA.jsx` | `/api/dsa/problems`, `/api/dsa/meta` |
| **DSA** | LeetCode-Style Solving Workspace | `[Active MVP]` | `DSAPracticeModal.jsx` | `/api/dsa/run`, `/api/dsa/submit` |
| **Resume** | Multi-Format ATS Resume Parser (.pdf, .docx) | `[Active MVP]` | `/resume-analyzer`, `ResumeAnalyzer.jsx` | `/api/resume/analyze` |
| **Resume** | Company & Job Description Matcher | `[Active MVP]` | `ResumeAnalyzer.jsx` | `/api/resume/job-match`, `/api/resume/reevaluate-target` |
| **Resume** | AI Bullet Point Impact Enhancer | `[Active MVP]` | `ResumeAnalyzer.jsx` | `/api/resume/improve-bullet` |
| **Roadmaps** | 7 Curated Engineering Learning Tracks | `[Production Ready]` | `/roadmaps`, `Roadmaps.jsx` | `/api/roadmap/domains`, `/api/roadmap/topics/*` |
| **Company Prep** | Company Syllabus & Round Breakdowns | `[Active MVP]` | `/company-prep`, `CompanyPrep.jsx` | `/api/companies` |
| **Interviews** | Interactive Webcam & Mic Mock Interview | `[In Progress]` | `/mock-interview`, `MockInterview.jsx` | Browser SpeechRecognition + MediaStream |
| **AI Mentor** | Conversational Placement Assistant | `[In Progress]` | `/ai-assistant`, `AIAssistant.jsx` | `/api/ai/chat` (Roadmap) |
| **Community** | Discussion Forum & Peer Collaboration | `[Active MVP]` | `/community`, `Community.jsx` | LocalStorage + State Synchronization |
| **Analytics** | Campus Leaderboard & Readiness Tracker | `[Active MVP]` | `/leaderboard`, `/dashboard` | Aggregated user stats & scorecards |

---

## 2. Page-by-Page Breakdown: Tabs, Buttons & Exact Functions

---

### 2.1 Public Landing Page (`/landing`)
*File: [`frontend/src/pages/Landing.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/Landing.jsx)*

#### Navigation Links & Tabs:
- **Navbar Links (`#features`, `#stats`, `#pricing`, `#faq`):** Smooth scroll jump links to in-page marketing sections.
- **FAQ Accordion Items (`toggleFaq(idx)`):** Expands or collapses FAQ answers regarding AI interview evaluation, DSA company tags, and free usage tiers.

#### Buttons & Action Triggers:
| Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **"Go to Dashboard"** (Navbar - Authenticated) | `LayoutDashboard` | Directs authenticated users immediately to `/dashboard`. |
| **"Sign In"** (Navbar - Guest) | None | Navigates to `/login`. |
| **"Start Preparing"** (Navbar - Guest) | `ArrowRight` | Navigates to `/signup` with primary CTA styling. |
| **"Get Started Free" / "Open Dashboard"** (Hero) | `ArrowRight` | Navigates to `/signup?redirect=/dashboard` for new guests, or `/dashboard` for logged-in users. |
| **"View Interactive Dashboard"** (Hero secondary) | `Play` | Secondary preview button navigating directly to `/login?redirect=/dashboard` or `/dashboard`. |
| **"Explore AI Interviewer"** (Feature card) | `ChevronRight` | Deep-links user directly into the AI Mock Interview simulation track. |
| **"View Problem Sets"** (Feature card) | `ChevronRight` | Navigates to `/dsa` to explore the company coding archive. |
| **"Analyze Resume"** (Feature card) | `ChevronRight` | Navigates to `/resume-analyzer` to upload a resume. |

---

### 2.2 User Authentication Pages (`/login` & `/signup`)
*Files: [`frontend/src/pages/Login.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/Login.jsx), [`frontend/src/pages/Signup.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/Signup.jsx)*

#### Buttons & Action Triggers:
| Page | Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- | :--- |
| **Login** | **"Sign In to Workspace"** | `ArrowRight` | Submits `{ email, password }` to `POST /api/auth/login`. On success, updates `AuthContext` with access token and redirects to target route (default `/dashboard`). |
| **Login** | **"Register here"** Link | None | Navigates to `/signup` preserving query redirect parameters. |
| **Signup** | **"Create Free Account"** | `ArrowRight` | Submits `{ full_name, email, password }` to `POST /api/auth/register`. Allocates 250 credits, logs in user, and redirects to dashboard. |
| **Signup** | **"Sign In here"** Link | None | Navigates to `/login` preserving query redirect parameters. |

---

### 2.3 Student Main Dashboard (`/dashboard`)
*File: [`frontend/src/pages/Dashboard.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/Dashboard.jsx)*

#### Overview Widgets & Gauges:
- **Placement Readiness Gauge (SVG Circle):** Calculates dynamic readiness score (72% to 99%) based on live DSA problems solved and aptitude accuracy.
- **Credit Counter Badge:** Displays live remaining AI diagnostic credits from user session.

#### Interactive Cards & Action Triggers:
| Button / Card | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **DSA Solved Stat Card** | `Code2` | Navigates to `/dsa`; displays `dsaMeta.solved_count` / `dsaMeta.total_problems`. |
| **Aptitude Problems Stat Card** | `BrainCircuit` | Navigates to `/aptitude`; displays `aptitudeStats.solved` / `aptitudeStats.total`. |
| **Mock Interview Score Card** | `CheckCircle2` | Navigates to `/mock-interview`; shows current interview performance rating. |
| **"Launch Practice Hub"** Card Button | `ArrowRight` | Direct action button launching the Campus Aptitude Hub (`/aptitude`). |
| **"Explore Company Tracks"** Card Button | `ArrowRight` | Direct action button opening Company Prep Tracks (`/company-prep`). |
| **"Browse DSA Directory"** Card Button | `ArrowRight` | Direct action button opening the 3,390+ LeetCode DSA problem bank (`/dsa`). |

---

### 2.4 DSA Problem Directory & In-Browser Code Workspace (`/dsa`)
*Files: [`frontend/src/pages/DSA.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/DSA.jsx), [`frontend/src/components/DSAPracticeModal.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/components/DSAPracticeModal.jsx)*

#### Filter Tabs & Toolbar (in `DSA.jsx`):
- **Problem Status Tabs:**
  - `All`: Shows all 3,390+ questions in repository.
  - `Unsolved` (`Circle`): Filters only unattempted problems.
  - `Solved` (`CheckCircle`): Filters problems completed by the student.
  - `Starred` (`Star`): Filters bookmarked problems.
- **Difficulty Tabs:**
  - `All Difficulties`, `Easy` (Green), `Medium` (Amber), `Hard` (Rose).
- **Company & Topic Filter Dropdowns:**
  - Company Selector: Filters by 470+ hiring companies (Google, Amazon, Meta, TCS, etc.).
  - Topic Selector: Filters by DSA topics (Arrays, Dynamic Programming, Graphs, Trees, Strings, etc.).
  - Sort By Selector: Sorts by `Problem ID`, `Difficulty`, `Acceptance Rate`, or `Title`.

#### Action Buttons in Problem Table:
| Button / Action | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **Toggle Solved Checkbox** | `Circle` / `CheckCircle` | Calls `POST /api/dsa/toggle-solved`; marks problem solved, increments counter, awards +25 XP. |
| **Star / Bookmark Button** | `Star` | Calls `POST /api/dsa/toggle-bookmark`; adds/removes problem from student's revision list. |
| **Problem Title Click** | Text | Sets `activePracticeProblemId`, popping up the interactive `DSAPracticeModal`. |
| **Topic Pill Click** | Badge | Sets filter to that specific topic and resets to Page 1. |
| **Company Pill Click** | Badge | Sets filter to that specific company and resets to Page 1. |
| **Pagination Buttons** | `ChevronLeft` / `ChevronRight` | Increments or decrements active problem page (`pageToFetch`). |

#### In-Modal Workspace Tabs & Buttons (`DSAPracticeModal.jsx`):
- **Left Panel Tabs:**
  - `Description`: Renders markdown problem statement, input/output examples, constraints, topic badges, and company tags.
  - `Solutions`: Displays verified reference implementations across languages with time/space complexity analysis.
  - `Editorial`: In-depth breakdown of optimal algorithms (e.g., Two Pointer vs Hash Map approaches).
  - `Hints`: Expandable accordion hints to guide the user without spoiling the complete answer.
- **Console / Execution Tabs:**
  - `Test Cases / Output`: Shows stdout, test case pass/fail badges, run times, and expected vs actual diffs.
  - `Custom Input`: Textarea enabling students to input arbitrary test matrices or parameters.
- **Editor Buttons & Controls:**
| Button | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **Language Selector** | Dropdown | Switches active editor language between `Python`, `JavaScript`, `C++`, and `Java`, auto-loading starter boilerplate code. |
| **"Reset Code"** | `RotateCcw` | Restores default starter code template, discarding unsaved editor changes. |
| **"Copy Code"** | `Copy` | Copies current editor text to clipboard with temporary checkmark feedback. |
| **"Toggle Fullscreen"** | `Maximize2` / `Minimize2` | Expands workspace to fill entire browser viewport. |
| **"Run Code"** | `Play` | Sends code and sample test cases to `POST /api/dsa/run`; displays test results in console panel. |
| **"Submit Solution"** | `ArrowRight` | Submits code to `POST /api/dsa/submit`; validates against hidden test harnesses, updates `user_dsa_progress`, and awards points. |
| **"Copy Solution to Editor"** | `Copy` | Inside Solutions tab: replaces editor content with the reference solution. |
| **"Close Modal"** | `X` / ESC Key | Closes code workspace and refreshes parent table stats. |

---

### 2.5 Aptitude Assessment Hub & Quiz Engine (`/aptitude`)
*Files: [`frontend/src/pages/Aptitude.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/Aptitude.jsx), [`frontend/src/components/QuestionDirectory.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/components/QuestionDirectory.jsx)*

#### Main Hub Tabs & Modes:
- **`Hub Mode`:**
  - `Searchable Question Directory` Tab: Explore and practice 1,170+ aptitude questions individually.
  - `Timed Assessments & History` Tab: View past test scorecards, attempt histories, and performance analytics.
- **`Test Mode`:** Interactive exam room with timer countdown, question palette, and radio options.
- **`Results Mode`:** Comprehensive scorecard with percentage score, time taken, and accuracy metrics.
- **`Review Mode`:** Step-by-step post-test autopsy displaying correct vs selected answers with detailed math derivations.

#### Buttons & Action Triggers:
| View Mode | Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- | :--- |
| **Hub** | **"Start Custom Mock Test"** | `Play` | Opens the Quiz Configuration Modal. |
| **Hub** | **"Quick Test" on Category Cards** | `ArrowRight` | Launches instant 10-question assessment for Quantitative, Logical, Verbal, or Core CS. |
| **Config Modal** | **Category / Company / Difficulty Pills** | Badges | Sets quiz parameters (subtopic, company tag, question count: 5/10/15/20, timer: standard/blitz/untimed). |
| **Config Modal** | **"Start Diagnostic Assessment"** | `Play` | Fetches filtered questions, initializes state, and transitions view to `test`. |
| **Test** | **Question Numbered Buttons (1..N)** | Numbers | Jumps directly to that question. Colors denote: Green = Answered, Amber = Flagged, Slate = Unvisited. |
| **Test** | **Option Selectors (A, B, C, D)** | Radio | Selects answer for current question and persists in test session state. |
| **Test** | **"Mark for Review"** | `Bookmark` | Flags question to revisit before final submission. |
| **Test** | **"Clear Response"** | `RotateCcw` | Clears chosen radio option for the active question. |
| **Test** | **"Previous" / "Next"** | `ChevronLeft` / `ChevronRight` | Steps backward and forward through test questions. |
| **Test** | **"Finish / Submit Test"** | `CheckCircle2` | Submits answers to `POST /api/aptitude/submit`; computes scores, saves to `aptitude_test_results`, and opens results screen. |
| **Results** | **"Detailed Question Review"** | `Eye` | Switches to `review` mode to inspect explanations for all questions. |
| **Results** | **"Retake Assessment"** | `RotateCcw` | Resets quiz state and launches a fresh test. |
| **Results** | **"Back to Aptitude Hub"** | `ArrowLeft` | Returns to main hub dashboard. |
| **Directory** | **"Solve / Practice"** (in Directory) | `Play` | Opens single question solve modal with instant answer checking via `POST /api/aptitude/solve`. |

---

### 2.6 Automated Resume ATS Analyzer & Optimizer (`/resume-analyzer`)
*File: [`frontend/src/pages/ResumeAnalyzer.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/ResumeAnalyzer.jsx)*

#### Report Navigation Tabs:
- **`Overview` (`all`):** Overall ATS Readiness score gauge (0-100), key strengths, critical issues, and section-by-section rating cards.
- **`Structure & Formatting` (`structure`):** File format validation, contact information completeness, and document section hierarchy checks.
- **`Skill Gap Analysis` (`gap`):** 7-domain technical taxonomy extraction displaying matched vs missing industry keywords.
- **`Bullet Point Optimizer` (`bullets`):** Line-by-line review of work experience bullet points with suggested Google XYZ formula rewrites.
- **`Job Description Matcher` (`jd`):** Custom job description comparison tab with match score and keyword gap diagnostics.
- **`ATS Fixes & Issues` (`issues`):** Prioritized action items (High, Medium, Low impact) to maximize ATS pass rate.

#### Buttons & Action Triggers:
| Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **"Upload File / Browse"** | `UploadCloud` | Opens file picker; accepts `.pdf` or `.docx` resumes (up to 10MB). |
| **"Scan & Analyze Resume"** | `Sparkles` | Sends multi-part file to `POST /api/resume/analyze`; executes PyMuPDF text parsing, taxonomy matching, and saves report to `resume_analyses`. |
| **"Clear / Upload Another"** | `Trash2` | Clears active resume report state and resets upload drop-zone. |
| **"Match Against Job Description"** | `Target` | Inside JD tab: posts pasted job description to `POST /api/resume/job-match`; returns custom match score and keyword gaps. |
| **"Re-evaluate Target Match"** | `RefreshCw` | Calls `POST /api/resume/reevaluate-target` for updated company and role selections without re-uploading file. |
| **"Enhance Single Bullet Point"** | `Wand2` | Inside Bullet Enhancer tool: posts single sentence to `POST /api/resume/improve-bullet`; generates 3 quantifiable impact variations. |
| **"Copy Enhanced Bullet"** | `Copy` | Copies selected improved bullet variation to clipboard. |

---

### 2.7 Interactive Domain Roadmaps (`/roadmaps`)
*File: [`frontend/src/pages/Roadmaps.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/Roadmaps.jsx)*

#### Domain Selection Cards & Tabs:
- **7 Engineering Tracks:**
  1. `Data Structures & Algorithms` (`Code2`)
  2. `Frontend Engineering` (`Globe`)
  3. `Backend Engineering` (`Server`)
  4. `Full Stack Development` (`Layers`)
  5. `Artificial Intelligence & ML` (`BrainCircuit`)
  6. `DevOps & Cloud Computing` (`GitBranch`)
  7. `Core Computer Science` (`Database`)
- **Difficulty Filter Tabs:** `All`, `Beginner`, `Intermediate`, `Advanced`.

#### Topic Drawer Modal Tabs (`selectedTopic`):
- **`Learn` (`learn`):** Theoretical explanations, key bullet points, syntax-highlighted code examples, and curated external documentation links.
- **`Practice Tasks` (`practice`):** Step-by-step coding assignments with expected outputs and expandable hint drawers.
- **`Topic Quiz` (`quiz`):** Concept verification quiz with interactive answer options and instant feedback.
- **`Capstone Project` (`project`):** Domain mini-project specification with requirements, suggested tech stack, and deliverable checklists.

#### Buttons & Action Triggers:
| Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **Domain Card Click** | Domain Icon | Fetches topics and capstone project for domain via `GET /api/roadmap/domains/{id}/topics`. |
| **"Reset Domain Progress"** | `RotateCcw` | Calls `POST /api/roadmap/reset`; resets completed topics in `user_roadmap_progress` for selected domain after user confirmation. |
| **Topic Row Click** | `ChevronRight` | Opens detailed Topic Drawer modal via `GET /api/roadmap/topics/{id}`. |
| **Toggle Topic Completed** | `CheckCircle2` / `Circle` | Calls `POST /api/roadmap/progress`; marks topic completed or incomplete, updating progress bars. |
| **"Show / Hide Hint"** (in Tasks) | `Lightbulb` | Toggles visibility of practical problem-solving hints. |
| **"Submit Quiz Answer"** | `Check` | Evaluates chosen multiple-choice quiz option, displaying correctness and explanation. |
| **"Next Topic"** (in Drawer) | `ArrowRight` | Automatically advances drawer to the subsequent topic in the track. |
| **"Close Drawer"** | `X` | Dismisses topic drawer and refreshes domain completion percentages. |

---

### 2.8 Company-Specific Placement Preparation (`/company-prep`)
*File: [`frontend/src/pages/CompanyPrep.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/CompanyPrep.jsx)*

#### Views & Controls:
- **Main Company Directory:** Search input filtering companies by name (TCS, Infosys, Amazon, Google, etc.) or targeted role (SDE, System Engineer, Analyst).
- **Company Detail Profile View:** Activated when a specific company is selected.

#### Buttons & Action Triggers:
| Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **Company Card Click** | `Building2` | Selects company, updates URL search param `?company={name}`, and loads interview rounds. |
| **"Back to All Companies"** | `ChevronLeft` | Clears selected company and returns to grid view. |
| **"Launch Timed Mock OA"** | `Play` | Navigates to `/aptitude?company={name}`, pre-configuring aptitude test for that company's OA format. |
| **"Practice DSA Interview Sheet"** | `Code2` | Navigates to `/dsa?company={name}`, filtering the 3,390+ DSA problem set specifically for that company. |
| **"Practice Question"** (in Directory) | `Play` | Opens single question solve modal for company-tagged aptitude problems. |

---

### 2.9 AI Mock Interview Simulator (`/mock-interview`)
*File: [`frontend/src/pages/MockInterview.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/MockInterview.jsx)*

#### Interview Track Tabs:
- `Technical Track`: Concurrency, REST, Operating Systems, Database Normalization, Processes vs Threads.
- `HR Track`: Tell me about yourself, Strengths, Difficult challenges, 5-year vision, Why should we hire you.
- `Behavioral Track`: Team conflict resolution, Tight deadlines, Leadership, Handling failure.

#### Audio, Video & Interview Controls:
| Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **"Enable / Start Camera"** | `Video` | Calls `navigator.mediaDevices.getUserMedia`; connects webcam feed to live video canvas element. |
| **"Toggle Video Stream"** | `Video` / `VideoOff` | Disables or enables webcam video track without dropping the interview session. |
| **"Toggle Microphone"** | `Mic` / `MicOff` | Mutes or unmutes the audio track. |
| **"Start Interview Round"** | `Play` | Initializes interview timer, loads first question, and activates browser SpeechRecognition. |
| **"Record / Speak Answer"** | `Mic` | Listens to student speech and renders live interim transcript on screen. |
| **"Stop Answering"** | `Square` | Stops recognition; evaluates spoken transcript against required architectural keywords. |
| **"Next Question"** | `ChevronRight` | Advances to the next question in the active interview category. |
| **"Restart Interview"** | `RotateCcw` | Resets interview timer, question index, and keyword scorecards. |
| **"Complete Interview"** | `CheckCircle2` | Ends interview, generating composite communication, keyword coverage, and articulation feedback. |

---

### 2.10 AI Placement Mentor & Assistant (`/ai-assistant`)
*File: [`frontend/src/pages/AIAssistant.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/AIAssistant.jsx)*

#### Chat Controls & Buttons:
| Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **"Optimize LRU Cache Code"** | `Code` | Pre-fills prompt bar with algorithmic optimization question. |
| **"Review ATS Resume Impact"** | `FileText` | Pre-fills prompt bar with resume bullet evaluation query. |
| **Prompt Input Field** | Text Input | Captures student question regarding DSA, complexity, system design, or placement advice. |
| **"Send Message"** | `Send` | Dispatches prompt to placement mentor chat thread and renders response bubble. |

---

### 2.11 Campus Leaderboard & Rankings (`/leaderboard`)
*File: [`frontend/src/pages/Leaderboard.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/Leaderboard.jsx)*

#### Filter Tabs & Sort Selectors:
- **Time Period Tabs:** `All Time` (`all`), `This Month` (`month`), `This Week` (`week`).
- **Sort Metric Dropdown:** `Total XP` (`xp`), `Problems Solved` (`problems`), `Daily Streak` (`streak`), `Placement Readiness` (`readiness`).
- **Student Search Bar:** Real-time filter across candidate names, usernames, and target developer roles.

#### Buttons & Action Triggers:
| Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **Leaderboard Row Click** | User Row | Opens User Profile Inspector Modal displaying detailed scores (DSA %, Aptitude %, Interview %) and badges. |
| **"Simulate Practice XP"** | `Zap` | Simulates live problem completions to test real-time rank re-calculation. |
| **"Toggle Analytics Summary"** | `BarChart3` | Displays cohort statistics: Average XP, Max XP, Total Problems Solved, Highest Active Streak. |
| **"Close Profile Modal"** | `X` | Dismisses student detail inspector modal. |

---

### 2.12 Peer Community & Mentorship (`/community`)
*File: [`frontend/src/pages/Community.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/Community.jsx)*

#### Main Community Tabs:
- `Discussions & Feeds` (`community`): Public peer discussion posts, questions, and interview debriefs.
- `Find Mentors & Alumni` (`mentors`): Directory of verified senior students and alumni mentors.
- `Study Groups & Events` (`groups`): Scheduled peer prep sessions and live mock interview groups.

#### Discussion Filter Tabs:
- Category Pills: `All`, `Placement`, `DSA`, `Career`, `Resume`, `Aptitude`, `Study Group`.
- Sort Selector: `Latest`, `Popular` (most liked), `Unanswered`.

#### Buttons & Action Triggers:
| Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- |
| **"New Discussion / Post"** | `Plus` | Opens the Create Post Modal. |
| **"Publish Discussion"** (in Modal) | `Send` | Validates title, category, and content; prepends post to community list and syncs to `localStorage`. |
| **"Like Post"** | `Heart` | Increments/decrements post like count and toggles heart icon. |
| **"Comment on Post"** | `MessageCircle` | Opens slide-out comment drawer to read and append replies. |
| **"Post Comment"** (in Drawer) | `Send` | Appends comment to discussion thread with timestamp and author initials. |
| **"Save / Bookmark Post"** | `Bookmark` | Toggles saved status of the post for quick reference. |
| **"Connect with Mentor"** | `UserPlus` | Sends peer connection request in the Mentors directory. |
| **"Request Mentorship"** | `Handshake` | Opens mentorship request dialogue with chosen senior student. |

---

### 2.13 Student Settings & Profile Configuration (`/settings`)
*File: [`frontend/src/pages/Settings.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/pages/Settings.jsx)*

#### Settings Category Tabs:
1. `Personal Info` (`personal` - `User`): Full name, phone, location, bio, target role, target companies, and skill tags.
2. `Academics` (`academic` - `GraduationCap`): College, degree, graduating year, semester, CGPA, 10th %, 12th %.
3. `Coding Platforms` (`coding` - `Code2`): Handles for LeetCode, Codeforces, HackerRank, CodeChef, and GeeksforGeeks.
4. `Social & Links` (`social` - `Share2`): GitHub URL, LinkedIn profile, portfolio website, and resume download link.
5. `Prep Goals & AI` (`preferences` - `Sliders`): Daily DSA target, daily aptitude target, prep level, preferred language, email notifications.
6. `Account & Security` (`security` - `ShieldCheck`): Current password, new password, confirm password, and subscription plan status.

#### Buttons & Action Triggers:
| Tab | Button / Element | Icon | Exact Function / Action |
| :--- | :--- | :--- | :--- |
| **Global** | **"Save All Changes"** | `Save` | Compiles form state; calls `PUT /api/user/profile`; updates `users` record and refreshes `AuthContext`. |
| **Personal** | **"Add Skill" / "Remove Skill"** | `Plus` / `X` | Adds new technology tag or removes existing tag from skills array. |
| **Personal** | **"Add Company" / "Remove Company"** | `Plus` / `X` | Adds or removes target company from wishlist array. |
| **Security** | **"Update Password"** | `KeyRound` | Submits `{ current_password, new_password }` to `POST /api/user/password`; validates existing hash and updates password. |
| **Preferences**| **Daily Goal Increments / Language Selector** | Controls | Adjusts daily problem targets (1 to 10) and default coding language (Python, C++, Java, JS). |

---

### 2.14 Global Navigation Components
*Files: [`frontend/src/components/Sidebar.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/components/Sidebar.jsx), [`frontend/src/components/Header.jsx`](file:///c:/Users/dritw/Downloads/PrepNest-main/frontend/src/components/Header.jsx)*

#### Sidebar Navigation Items:
- **13 Navigation Links:** `Dashboard`, `Resume Analyzer`, `Aptitude Hub`, `DSA Directory`, `Mock Interview`, `Company Track`, `Roadmaps`, `Projects`, `AI Mentor`, `Leaderboard`, `Community`, `Notes`, `Settings`.
- **"Sign Out" Button (`LogOut`):** Invokes `logout()` in `AuthContext`, invalidates local session tokens, calls `POST /api/auth/logout`, and redirects user to `/login`.

#### Top Header Bar Controls:
- **Global Search Bar:** Real-time search across problems, companies, and documentation.
- **AI Credits Pill (`Sparkles`):** Displays remaining balance of diagnostic credits (default 250).
- **Active Plan Pill (`Zap`):** Indicates current membership tier (`Pro`).
- **Streak Pill (`Flame`):** Displays daily practice streak indicator.
- **Settings Shortcut Button (`Settings`):** Direct navigation shortcut to `/settings`.
- **Notifications Button (`Bell`):** Toggles system notification panel.

---

## 3. Technical Edge Cases & Defensive Handling

| Component / Workflow | Potential Edge Case | Built-In Defensive Behavior |
| :--- | :--- | :--- |
| **Resume Upload** | Non-PDF / Non-DOCX uploaded | Client validates file extension; backend PyMuPDF throws clean 400 error without crashing ASGI worker. |
| **DSA Code Execution** | Infinite loops / Heavy recursion | Execution runner enforces strict 5-second process timeout and terminates cleanly. |
| **Aptitude Test Submission** | Student closes browser during timed test | Answers are continuously saved in local state; timer calculates elapsed seconds accurately upon reconnection. |
| **Profile Save** | Backend server temporarily disconnected | Frontend catches network failure, persists changes to `localStorage`, and displays a fallback notification: *"Saved locally! Backend offline"*. |
| **Session Expiration** | JWT token expires after 24 hours | Intercepted by `AuthContext`; cleanly redirects student to `/login` preserving intended destination in query params. |
