<!-- 
  PREPNEST CONTEXT SYSTEM | DOCUMENT 3 OF 5
  HOW TO UPDATE:
  - Update this document when new linting rules, naming conventions,
    error handling strategies, or architectural constraints are agreed upon.
  - Required reading for all contributors and automated agents.
-->

# 📐 PrepNest — Coding Standards & Engineering Guidelines

| Specification | Standard |
| :--- | :--- |
| **Python Standard** | PEP 8, Type Hinting (`typing`), Pydantic v2 |
| **JavaScript / React Standard** | ES6+, Functional Components with Hooks, JSX |
| **CSS Methodology** | Tailwind CSS 3.x (Utility-First, Dark Theme Standard) |
| **SQL Practice** | Parameterized SQL (`psycopg2` placeholders `%s`), Transaction Isolation |
| **Linting & Formatting** | Black / Flake8 (Python), ESLint / Prettier (JS) |

---

## 1. File Organization & Naming Conventions

### 1.1 Directory & File Nomenclature
- **Backend Files:** `snake_case.py` (e.g., `resume_service.py`, `database.py`, `auth.py`).
- **Frontend Components & Pages:** `PascalCase.jsx` (e.g., `ResumeAnalyzer.jsx`, `DSAPracticeModal.jsx`, `Sidebar.jsx`).
- **Frontend Utilities & Helpers:** `camelCase.js` (e.g., `aptitudeData.js`, `mockData.js`).
- **Documentation:** `kebab-case.md` (e.g., `coding-standards.md`, `project-brief.md`).

### 1.2 Component Organization Structure
When creating a React component in `frontend/src/`:
```plaintext
components/
└── ComponentName/             # (For multi-part components) OR ComponentName.jsx
    ├── ComponentName.jsx      # Main presentation and logic
    └── subcomponents/         # Sub-elements if component exceeds 400 lines
```

---

## 2. Python & FastAPI Backend Standards

### 2.1 Type Annotations & Pydantic Contracts
Every request and response body must be defined with explicit Pydantic models. Avoid handling unvalidated arbitrary JSON dictionaries directly.

```python
# ✅ GOOD: Strongly typed Pydantic request model
class DSASubmitCodeRequest(BaseModel):
    user_id: Optional[int] = 1
    problem_id: int
    language: str
    code: str

@app.post("/api/dsa/submit")
def submit_dsa_code(payload: DSASubmitCodeRequest):
    ...

# ❌ BAD: Untyped dictionary access without validation
@app.post("/api/dsa/submit")
def submit_dsa_code(data: dict):
    code = data.get("code")  # Prone to KeyErrors and missing type checks
```

### 2.2 Database Cursor Safety & SQL Injection Prevention
**MANDATORY RULE:** NEVER format SQL queries using f-strings or string concatenation. Always use parameterized `%s` placeholders.

```python
# ✅ GOOD: Parameterized query with try-finally resource cleanup
conn = get_db_connection()
cursor = conn.cursor()
try:
    cursor.execute(
        "SELECT id, title, difficulty FROM dsa_problems WHERE difficulty = %s;",
        (difficulty_param,)
    )
    problems = cursor.fetchall()
    conn.commit()
    return problems
except Exception as e:
    conn.rollback()
    raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
finally:
    cursor.close()
    conn.close()

# ❌ BAD: Vulnerable to SQL injection & connection leaks
cursor = conn.cursor()
cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")  # HIGH SECURITY RISK!
# Missing cursor.close() and conn.close() will exhaust connection pool!
```

### 2.3 Exception Handling & HTTP Status Codes
Raise explicit `HTTPException` with informative error messages. Use standard HTTP status codes:
- `400 Bad Request`: Validation failure or business logic rejection.
- `401 Unauthorized`: Missing, invalid, or expired session token.
- `403 Forbidden`: Authenticated user lacks permission.
- `404 Not Found`: Entity not found in database.
- `422 Unprocessable Entity`: Automatic Pydantic validation failure.
- `500 Internal Server Error`: Unhandled database or operational exception.

---

## 3. Frontend & React 19 Standards

### 3.1 Component Architecture Rules
1. **Component Purity:** Keep presentational components clean. Extract business logic, complex data transformations, or multi-step calculations into custom hooks or utility functions.
2. **Single Responsibility:** If a page file exceeds 800 lines, extract modal dialogs, complex tables, and chart subcomponents into separate files under `src/components/`.
3. **Key Prop Integrity:** Always use stable unique identifiers (e.g., `problem.id`, `question.id`) for list keys. Never use array index (`key={index}`) when items can be filtered, sorted, or mutated.

```jsx
// ✅ GOOD: Stable ID keys and semantic Tailwind classes
{problems.map((prob) => (
  <ProblemCard 
    key={prob.id} 
    problem={prob} 
    onSolve={() => handleOpenModal(prob.id)} 
  />
))}

// ❌ BAD: Index as key in dynamic list
{problems.map((prob, index) => (
  <div key={index}>{prob.title}</div>
))}
```

### 3.2 Styling Guidelines (Tailwind CSS)
- **Palette Consistency:** Use the project-wide dark theme centered around `slate-950` (backgrounds), `slate-900` (cards/surfaces), `slate-800` (borders/dividers), and accent shades (`indigo-500`, `purple-500`, `emerald-500`).
- **Glassmorphism:** Use `backdrop-blur-md bg-slate-900/60 border border-slate-800/80` for elevated floating cards.
- **Micro-Interactions:** Always attach interactive hover/focus states (`hover:border-slate-700 transition duration-150`).
- **Responsive Design:** Ensure layouts flex cleanly using `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` or `flex-col md:flex-row`.

### 3.3 State Management & API Requests
- Store persistent global authentication in `AuthContext`.
- For component data fetching:
  - Display explicit loading spinners or skeleton states (`loading ? <Skeleton /> : <Content />`).
  - Gracefully handle empty states ("No questions found") rather than rendering blank screens.
  - Catch network errors and display toast notifications or error badges.

```jsx
// Standard fetch pattern with auth token attachment
const token = localStorage.getItem('prepnest_token');
const response = await fetch(`${API_BASE}/api/endpoint`, {
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
});
if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.detail || 'Request failed');
}
```

---

## 4. Security & Data Integrity Best Practices

1. **No Plaintext Passwords:** Passwords must always pass through irreversible cryptographic hashing (`hash_password()` with application salt) before database insertion. Passwords must NEVER be returned in API response models.
2. **Sanitize Uploaded Files:** 
   - Restrict resume uploads strictly to `.pdf` and `.docx`.
   - Limit file sizes to <= 10MB to prevent denial-of-service memory pressure.
3. **Environment Secrets:**
   - Sensitive credentials (`DATABASE_URL`, `SECRET_KEY`, `NEON_AUTH_URL`) must remain in `.env` files.
   - Never commit `.env` with real production passwords to public git repositories.
4. **CORS Policy:** Restrict allowed headers, origins, and methods appropriately when deploying to public hosting environments.

---

## 5. Testing & Code Quality Assurance

- **Verification Before Commits:** Run the verification test suite before pushing database or routing changes:
  ```bash
  python backend/test_roadmap_suite.py
  ```
- **Type Correctness:** Verify all database columns match the datatypes in `init_db()` (e.g., `JSONB` for dicts/lists, `INTEGER` for counts, `TEXT[]` for array columns).
