<!-- 
  PREPNEST CONTEXT SYSTEM | DOCUMENT 5 OF 5
  HOW TO UPDATE:
  - Update this document when new rules, constraints, architectural boundaries,
    or AI operational procedures are established.
  - This file serves as the definitive instruction guide for any AI assistant working on PrepNest.
-->

# 🤖 PrepNest — AI Operational Instructions & System Rules

| Guideline Category | Requirement Level |
| :--- | :--- |
| **Document Purpose** | Ground truth system prompt and guardrails for AI coding agents |
| **Target Codebase** | PrepNest (FastAPI + React 19 + PostgreSQL/Neon) |
| **Strict Compliance** | **MANDATORY** across all sessions, refactors, and feature additions |

---

## 1. Prime Directives (Non-Negotiable Invariants)

1. **Never Break Working Endpoints or Schemas:**
   Existing table structures (`users`, `dsa_problems`, `resume_analyses`, `roadmap_*`, `aptitude_*`) have dependent frontend components. When adding fields, ALWAYS use defensive SQL (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).
2. **Never Store or Request Plaintext Passwords:**
   Always route credentials through `hash_password()` with application salt or through the Neon Auth delegate. Never expose password hashes in API serialization models.
3. **Prevent SQL Injection at All Costs:**
   Never construct SQL statements using Python f-strings or string concatenation. Use `%s` parameterized tuples exclusively with `cursor.execute()`.
4. **Always Clean Up Database Cursors:**
   Every database interaction using `get_db_connection()` must follow the `try-finally` idiom to close the cursor and connection, or use a context manager to prevent connection pool exhaustion.
5. **Preserve UI Aesthetics & Dark Theme:**
   All frontend code must follow the project's established dark-mode palette (`bg-slate-950`, `bg-slate-900`, `border-slate-800`, `text-slate-100`, accents in `indigo` and `purple`). Do not introduce random bright white default backgrounds or raw unstyled HTML elements.

---

## 2. Mandatory First Steps: What Files to Read First

Before generating code or planning complex refactors, you **MUST** inspect the relevant ground-truth files:

```plaintext
1. Configuration & Env:  backend/.env (check DATABASE_URL, ports)
2. Database Schema:      backend/database.py (check init_db() and active table definitions)
3. API Routes:           backend/main.py (check existing route signatures and Pydantic models)
4. Authentication Flow:  backend/auth.py & frontend/src/context/AuthContext.jsx
5. Frontend App Routing: frontend/src/App.jsx (check paths, protected routes, and page imports)
```

---

## 3. Modification Guidelines by Layer

### 3.1 Backend (FastAPI / Python)
- **Adding New Endpoints:**
  - Define explicit Pydantic request models (`BaseModel`) and response models where applicable.
  - Place endpoints under the `/api/` prefix (e.g., `/api/dsa/...`, `/api/aptitude/...`).
  - Use appropriate HTTP methods (`GET` for retrieval, `POST` for mutation/execution, `PUT` for complete updates, `DELETE` for removal).
- **Database Operations:**
  ```python
  conn = get_db_connection()
  cursor = conn.cursor()
  try:
      cursor.execute("SELECT ... WHERE id = %s", (entity_id,))
      result = cursor.fetchone()
      conn.commit()
      return result
  except Exception as e:
      conn.rollback()
      raise HTTPException(status_code=500, detail=str(e))
  finally:
      cursor.close()
      conn.close()
  ```

### 3.2 Frontend (React 19 / Vite / Tailwind)
- **Path Aliases:** Use the configured `@/` alias for root `src/` imports (e.g., `import { Sidebar } from '@/components/Sidebar'`).
- **Icons:** Use `lucide-react` icons. Maintain visual consistency with existing components.
- **API Base URL:** Respect `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'`. Never hardcode absolute `localhost:8000` URLs directly inside components.
- **Handling Auth Tokens:** Attach the JWT token from `localStorage.getItem('prepnest_token')` via the `Authorization: Bearer <token>` header for all authenticated requests.
- **Loading & Error States:** Every asynchronous API call must render:
  1. A loading spinner or skeleton while waiting for response.
  2. A friendly error alert/toast if the network or API fails.
  3. A fallback UI if the returned list is empty.

---

## 4. How to Handle Edge Cases Without Breaking Existing Code

| Scenario | Incorrect Action (Hallucination Risk) | Correct Action |
| :--- | :--- | :--- |
| **New table column needed** | Running destructive `DROP TABLE` or re-creating tables | Use `ALTER TABLE <table> ADD COLUMN IF NOT EXISTS <col> <type>;` in `init_db()` |
| **Neon Auth unreachable** | Crashing the login/signup route with unhandled HTTP error | Fall back gracefully to local salted hash lookup & log warning |
| **File parsing fails in Resume Analyzer** | Throwing raw 500 stack trace to user | Catch PyMuPDF/docx exceptions, return clean 400 error: *"Unsupported or corrupted document format"* |
| **Student executes infinite loop in DSA** | Freezing backend server thread | Set strict execution timeout (e.g., 5 seconds) and catch `TimeoutError` |
| **User session token expires** | Letting API calls fail silently with blank pages | Intercept `401 Unauthorized` in `AuthContext` and redirect user cleanly to `/login` |

---

## 5. Environment & Terminal Commands Reference

The user operates on a **Windows** environment with PowerShell.

- **Frontend Server:** Runs Vite at `http://localhost:5173` via `npm run dev` in `frontend/`.
- **Backend Server:** Runs Uvicorn at `http://localhost:8000` via `uvicorn main:app --reload --host 0.0.0.0 --port 8000` in `backend/`.
- **Database Verification:**
  To verify backend database health and test data suites without restarting servers:
  ```powershell
  python backend/test_roadmap_suite.py
  ```
- **Checking Running Processes:**
  Avoid killing the active dev servers unless explicitly required for dependency updates.

---

## 6. Verification Checklist Before Marking Work Complete

- [ ] Does the new code adhere to the dark theme styling (`slate-950` / `slate-900`)?
- [ ] Are all database queries parameterized with `%s` to prevent SQL injection?
- [ ] Are cursors and database connections safely closed in `finally` blocks?
- [ ] Did you avoid hardcoded URLs by utilizing environment variables or `VITE_API_BASE_URL`?
- [ ] Are Pydantic models defined for all new payload structures?
- [ ] Has the corresponding documentation in `/docs` been updated if this introduces a new module or architectural flow?
