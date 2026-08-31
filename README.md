# 🚀 PrepNest — AI-Powered Placement Readiness & Interview Preparation Platform

<div align="center">

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styles-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![JWT](https://img.shields.io/badge/Auth-JWT%20Bearer-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

<p align="center">
  <strong>Master Data Structures & Algorithms, crack technical & HR mock interviews, optimize your resume for ATS, and land top-tier tech offers with an AI-driven preparation ecosystem.</strong>
</p>

[Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Application Routes](#-application-routes)

</div>

---

## 📖 Overview

**PrepNest** is a full-stack, next-generation AI placement preparation SaaS application engineered for engineering students, software developers, and campus placement candidates aiming for top tech companies (such as Google, Microsoft, Amazon, Meta, and Adobe). 

PrepNest combines structured DSA sheets, interactive AI mock interview simulations with real-time feedback, ATS resume parsing and keyword optimization, targeted company-specific preparation tracks, and a personalized AI mentor chat interface into a modern dark-mode experience.

---

## ✨ Key Features

### 🎯 1. Interactive Placement Readiness Dashboard
* **Dynamic Placement Meter**: Real-time algorithmic readiness score calculated from solved problems, mock tests, and resume strength.
* **Streak & Gamification**: Daily streaks, XP points tracking, leveling system, and placement tier classifications (e.g., Top 5% Placement Tier).
* **Weekly Performance Analytics**: Interactive bar charts powered by Recharts visualizing daily problem-solving hours and efficiency.
* **Quick Action Widgets**: Instant access to ongoing company tracks, bookmarked DSA problems, and interview history.

### 💻 2. Curated DSA Directory & Tracker
* **Topic-Based Organization**: Curated problem sets covering Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, Two Pointers, and System Design.
* **Difficulty & Company Tags**: Filter problems by difficulty (`Easy`, `Medium`, `Hard`) and target company question frequency (Google, Amazon, Meta, Microsoft, Adobe).
* **Status Tracking**: Track solved vs. unsolved questions, acceptance rates, and bookmark problems for revision.

### 🎙️ 3. AI Mock Interview Simulator
* **Simulated Video/Audio Room**: Integrated webcam preview with simulated interviewer video streams and live session timer.
* **Technical & Behavioral Rounds**: Support for both technical algorithmic rounds and HR behavioral/situational questions.
* **Real-Time Evaluation**: Instant feedback on communication confidence, problem-solving structure, and algorithmic complexity.
* **History & Scoring**: Historical session logs detailing overall scores, feedback points, and confidence percentages.

### 📄 4. AI Resume Analyzer & ATS Optimizer
* **ATS Compatibility Scoring**: Instant scoring (0–100%) checking formatting, section structure, and machine readability.
* **Keyword Match Percentage**: Evaluates resume keywords against industry-standard software engineering job descriptions.
* **Actionable Feedback**: Identifies strengths, weaknesses, and specific missing high-value technical keywords (e.g., Docker, Kubernetes, CI/CD, Redis).
* **Exportable Reports**: Generate and download comprehensive evaluation reports.

### 🏢 5. Company-Specific Preparation Tracks
* **Targeted Company Hubs**: Dedicated preparation modules for Google, Microsoft, Amazon, Meta, and more.
* **Hiring Difficulty & Metrics**: Insights into company hiring difficulty, interview rounds, and question banks.
* **Curated Company Sheets**: Direct links to top company-specific DSA sheets and interview trends.

### 🤖 6. PrepNest AI Placement Mentor
* **AI Chat Assistant**: Context-aware AI tutor capable of explaining complex algorithms, optimizing $O(N^2)$ to $O(N)$ code, and clarifying system design concepts.
* **Quick Prompt Suggestions**: One-click prompt pills for code optimization, resume impact breakdown, and time complexity reviews.

### 🔐 7. Secure FastAPI Authentication System
* **User Registration & Login**: Validated registration with email, full name, and password.
* **JWT Access Tokens**: Stateless authentication with 24-hour token expiration.
* **Salted Password Hashing**: Secure password hashing algorithms.
* **SQLite Persistent Storage**: Automatic table initialization for user credentials, subscription plans (`Pro`), and credits.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Description |
| :--- | :--- |
| **React 19** | Modern UI library utilizing functional components and hooks |
| **Vite 8** | Ultra-fast frontend build tool and dev server |
| **Tailwind CSS 3** | Utility-first CSS framework with sleek dark-mode aesthetics |
| **Lucide React** | Modern, lightweight icon library |
| **Recharts** | Composable charting library for analytics and dashboards |
| **React Router DOM v6** | Client-side routing and navigation guards |
| **Framer Motion** | Smooth animations and micro-interactions |
| **Zustand & TanStack Query** | State management and data fetching |

### Backend
| Technology | Description |
| :--- | :--- |
| **FastAPI** | High-performance modern Python web framework |
| **Uvicorn** | Lightning-fast ASGI web server implementation |
| **Pydantic v2** | Data validation and schema parsing |
| **PyJWT** | JSON Web Token encoding and decoding |
| **SQLite3** | Lightweight, zero-config relational database |
| **Passlib & Bcrypt** | Secure password hashing utilities |

---

## 📁 Project Structure

```text
PrepNest-main/
├── backend/
│   ├── auth.py              # JWT token handling & password hashing logic
│   ├── database.py          # SQLite database connection & schema initialization
│   ├── main.py              # FastAPI application endpoints & CORS configuration
│   └── requirements.txt     # Python backend dependencies
│
└── frontend/
    ├── public/              # Static public assets
    ├── src/
    │   ├── assets/          # Project images and icons
    │   ├── components/      # Reusable UI components
    │   │   ├── Header.jsx   # Top navigation bar with notifications & user profile
    │   │   └── Sidebar.jsx  # Main responsive navigation sidebar
    │   ├── lib/
    │   │   └── mockData.js  # Curated mock data (DSA, Companies, Resumes, User)
    │   ├── pages/           # Application route views
    │   │   ├── AIAssistant.jsx    # AI placement mentor chat interface
    │   │   ├── CompanyPrep.jsx    # Company-specific prep tracks
    │   │   ├── Dashboard.jsx      # Main student dashboard & progress metrics
    │   │   ├── DSA.jsx            # DSA questions directory & filters
    │   │   ├── Landing.jsx        # Public landing page with hero & features
    │   │   ├── Login.jsx          # Login portal connected to FastAPI
    │   │   ├── MockInterview.jsx  # AI mock interview simulation room
    │   │   ├── ResumeAnalyzer.jsx # ATS resume scorer & analysis view
    │   │   └── Signup.jsx         # Registration portal
    │   ├── App.jsx          # Route configurations
    │   ├── globals.css      # Base Tailwind styles & custom scrollbars
    │   └── main.jsx         # React application entry point
    ├── index.html           # HTML template
    ├── package.json         # Frontend dependencies & scripts
    ├── postcss.config.js    # PostCSS configuration
    ├── tailwind.config.js   # Custom Tailwind theme colors & glow configurations
    └── vite.config.js       # Vite configuration with path aliases (`@/`)
```

---

## 🚀 Getting Started

Follow these step-by-step instructions to set up and run the application locally on your machine.

### 📋 Prerequisites
Ensure you have the following installed:
* **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
* **npm** or **yarn** / **pnpm**
* **Python**: `3.9` or higher ([Download Python](https://www.python.org/))
* **Git** (optional)

---

### 1️⃣ Clone or Navigate to the Project

```bash
cd PrepNest-main
```

---

### 2️⃣ Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI backend server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be running at: **`http://localhost:8000`**  
   Interactive Swagger API docs available at: **`http://localhost:8000/docs`**

---

### 3️⃣ Frontend Setup (React + Vite)

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 🔌 API Documentation

The FastAPI backend exposes the following RESTful endpoints:

### Authentication & User Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check | No |
| `POST` | `/api/auth/register` | Register a new user and receive JWT token | No |
| `POST` | `/api/auth/login` | Authenticate user credentials and return JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & credit balance | Yes (`Bearer <token>`) |

#### Sample Register Request:
```json
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "Alex Johnson",
  "email": "alex@prepnest.ai",
  "password": "SecurePassword123!"
}
```

#### Sample Token Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "alex@prepnest.ai",
    "full_name": "Alex Johnson",
    "plan": "Pro",
    "credits": 250,
    "created_at": "2026-08-31 16:00:00"
  }
}
```

---

## 🗺️ Application Routes

| Route | Page | Description |
| :--- | :--- | :--- |
| `/landing` | **Landing Page** | Platform overview, success statistics, features, plans, and FAQ |
| `/login` | **Login Portal** | User sign-in with FastAPI JWT authentication |
| `/signup` | **Sign Up Portal** | Account registration with automatic credit allocation |
| `/dashboard` | **Dashboard** | Placement readiness score, streak tracker, analytics & quick actions |
| `/dsa` | **DSA Directory** | Curated problems categorized by topics, difficulty, and company tags |
| `/mock-interview` | **Mock Interview** | Real-time AI interview simulator with timer & evaluation |
| `/resume-analyzer` | **Resume Analyzer** | ATS score calculator, keyword match & actionable improvement recommendations |
| `/company-prep` | **Company Track** | Targeted preparation tracks for Google, Amazon, Meta, Microsoft, etc. |
| `/ai-assistant` | **AI Placement Mentor** | Context-aware AI chat assistant for coding questions and system design |

---

## 🎨 Design System & Highlights

* **Dark-Mode-First UI**: Built on Slate-950/900 palettes with radiant indigo, purple, and cyan ambient glows.
* **Glassmorphism**: Backdrop blur effects (`backdrop-blur-xl`, `bg-slate-900/60`, `border-slate-800`).
* **Responsive Layout**: Collapsible navigation sidebar and grid layouts adaptable across mobile, tablet, and widescreen displays.
* **Interactive Micro-Interactions**: Hover scales, pulse indicators, and status badges.

---

## 🔮 Roadmap

- [ ] Real-time speech-to-text integration using Web Speech API / Whisper for mock interviews
- [ ] Integrated Monaco code editor for live in-browser code execution & test case verification
- [ ] PDF parser for direct resume uploading and dynamic ATS extraction
- [ ] Multi-user leaderboard and competitive campus placement contests
- [ ] Integration with OpenAI / Anthropic API for dynamic AI mentor responses

---

## 📄 License

This project is licensed under the MIT License — feel free to use, customize, and extend it for your own placement preparation or educational platforms.
