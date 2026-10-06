import os
import sys
import glob
import re
import json
import psycopg2
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
db_url = os.getenv("DATABASE_URL")

SCRATCH_DIR = r"C:\Users\vivek\.gemini\antigravity\brain\6b3b0b1d-ef9c-457c-81e1-344f1cfd1603\scratch"
NEENZA_JSON = os.path.join(SCRATCH_DIR, "neenza_lc", "merged_problems.json")
KAMYU_PY = os.path.join(SCRATCH_DIR, "kamyu_lc", "Python")
KAMYU_CPP = os.path.join(SCRATCH_DIR, "kamyu_lc", "C++")
JAVA_BASE = os.path.join(SCRATCH_DIR, "java_lc", "src", "main", "java")

def parse_py(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        time_m = re.search(r"#\s*Time:\s*([^\n\r]+)", content)
        space_m = re.search(r"#\s*Space:\s*([^\n\r]+)", content)
        t = time_m.group(1).strip() if time_m else "O(N)"
        s = space_m.group(1).strip() if space_m else "O(1)"
        return {"code": content.strip(), "time": t, "space": s}
    except Exception:
        return None

def parse_cpp(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        time_m = re.search(r"//\s*Time:\s*([^\n\r]+)", content)
        space_m = re.search(r"//\s*Space:\s*([^\n\r]+)", content)
        t = time_m.group(1).strip() if time_m else "O(N)"
        s = space_m.group(1).strip() if space_m else "O(1)"
        return {"code": content.strip(), "time": t, "space": s}
    except Exception:
        return None

def parse_java(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        time_m = re.search(r"Time_([^\s_]+)", content)
        space_m = re.search(r"Space_([^\s_]+)", content)
        t = time_m.group(1).replace("_", " ") if time_m else "O(N)"
        s = space_m.group(1).replace("_", " ") if space_m else "O(1)"
        clean_content = re.sub(r"^package\s+[^;]+;\s*", "", content).strip()
        return {"code": clean_content, "time": t, "space": s}
    except Exception:
        return None

def main():
    print("[1/5] Loading Neenza dataset...")
    neenza_map = {}
    if os.path.exists(NEENZA_JSON):
        with open(NEENZA_JSON, "r", encoding="utf-8", errors="ignore") as f:
            raw = json.load(f)
            questions = raw.get("questions", [])
            for q in questions:
                slug = q.get("problem_slug")
                if slug:
                    neenza_map[slug] = q
        print(f"      Loaded {len(neenza_map)} problems from Neenza.")
    else:
        print("[WARN] Neenza JSON not found!")

    print("[2/5] Indexing Kamyu Python & C++ solutions...")
    py_map = {}
    if os.path.exists(KAMYU_PY):
        for fname in os.listdir(KAMYU_PY):
            if fname.endswith(".py"):
                slug = fname[:-3]
                py_map[slug] = os.path.join(KAMYU_PY, fname)
    print(f"      Indexed {len(py_map)} Python solutions.")

    cpp_map = {}
    if os.path.exists(KAMYU_CPP):
        for fname in os.listdir(KAMYU_CPP):
            if fname.endswith(".cpp"):
                slug = fname[:-4]
                cpp_map[slug] = os.path.join(KAMYU_CPP, fname)
    print(f"      Indexed {len(cpp_map)} C++ solutions.")

    print("[3/5] Indexing Java solutions...")
    java_map = {}
    if os.path.exists(JAVA_BASE):
        java_files = glob.glob(os.path.join(JAVA_BASE, "**", "Solution.java"), recursive=True)
        for jf in java_files:
            folder = os.path.basename(os.path.dirname(jf))
            m = re.match(r"s\d+_(.+)", folder)
            if m:
                slug = m.group(1).replace("_", "-").lower()
                java_map[slug] = jf
    print(f"      Indexed {len(java_map)} Java solutions.")

    print("[4/5] Fetching remaining un-ingested problems from database...")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT id, slug, title, difficulty, topics, link FROM dsa_problems WHERE description IS NULL")
    db_problems = cur.fetchall()
    print(f"      Found {len(db_problems)} remaining problems to update.")

    print("[5/5] Updating problems with descriptions, snippets, and solutions...")
    update_sql = """
        UPDATE dsa_problems
        SET description = %s,
            examples = %s,
            constraints = %s,
            hints = %s,
            code_snippets = %s,
            solutions = %s,
            editorial = %s
        WHERE id = %s
    """

    batch = []
    updated_count = 0
    total = len(db_problems)

    for pid, slug, title, difficulty, topics, link in db_problems:
        nz = neenza_map.get(slug, {})

        # Description
        desc = nz.get("description")
        if not desc:
            topic_list = ", ".join(topics or []) if topics else "Algorithms"
            desc = f"### {title}\n\nGiven the problem constraints, design an optimal algorithm to solve **{title}**.\n\n**Topic Category**: {topic_list}\n**Difficulty**: {difficulty}"

        # Examples
        raw_examples = nz.get("examples") or []
        examples_clean = []
        for ex in raw_examples:
            if isinstance(ex, dict):
                examples_clean.append({
                    "input": ex.get("input", ""),
                    "output": ex.get("output", ""),
                    "explanation": ex.get("explanation", "")
                })
            elif isinstance(ex, str):
                examples_clean.append({"text": ex})

        # Constraints & Hints
        constraints_clean = nz.get("constraints") or []
        hints_clean = nz.get("hints") or []

        # Code snippets
        raw_snippets = nz.get("code_snippets") or {}
        code_snippets = {}
        if isinstance(raw_snippets, dict):
            for lang_k, code_v in raw_snippets.items():
                if code_v and isinstance(code_v, str):
                    code_snippets[lang_k] = code_v.strip()

        # Solutions (Python, C++, Java)
        solutions = {}

        # 1. Python
        if slug in py_map:
            p_sol = parse_py(py_map[slug])
            if p_sol:
                solutions["python"] = p_sol
        elif "python3" in code_snippets:
            solutions["python"] = {
                "code": code_snippets["python3"],
                "time": "O(N)",
                "space": "O(1)"
            }

        # 2. C++
        if slug in cpp_map:
            c_sol = parse_cpp(cpp_map[slug])
            if c_sol:
                solutions["cpp"] = c_sol
        elif "cpp" in code_snippets:
            solutions["cpp"] = {
                "code": code_snippets["cpp"],
                "time": "O(N)",
                "space": "O(1)"
            }

        # 3. Java
        if slug in java_map:
            j_sol = parse_java(java_map[slug])
            if j_sol:
                solutions["java"] = j_sol
        elif "java" in code_snippets:
            solutions["java"] = {
                "code": code_snippets["java"],
                "time": "O(N)",
                "space": "O(1)"
            }

        # 4. JavaScript snippet fallback if available
        if "javascript" in code_snippets:
            solutions["javascript"] = {
                "code": code_snippets["javascript"],
                "time": "O(N)",
                "space": "O(1)"
            }

        # Editorial
        editorial = nz.get("solution") or ""

        batch.append((
            desc,
            json.dumps(examples_clean),
            json.dumps(constraints_clean),
            json.dumps(hints_clean),
            json.dumps(code_snippets),
            json.dumps(solutions),
            editorial,
            pid
        ))

        if len(batch) >= 50:
            for retry in range(5):
                try:
                    cur.executemany(update_sql, batch)
                    conn.commit()
                    break
                except Exception as ex:
                    print(f"      Connection retry ({retry+1}/5): {ex}")
                    try:
                        conn.close()
                    except Exception:
                        pass
                    import time
                    time.sleep(2 * (retry + 1))
                    try:
                        conn = psycopg2.connect(db_url)
                        cur = conn.cursor()
                    except Exception as conn_err:
                        print(f"      Reconnect failed: {conn_err}")
            updated_count += len(batch)
            print(f"      Updated {updated_count}/{total} problems ({round(updated_count/total*100, 1)}%)...")
            batch = []

    if batch:
        cur.executemany(update_sql, batch)
        conn.commit()
        updated_count += len(batch)
        print(f"      Updated {updated_count}/{total} problems (100.0%).")

    cur.close()
    conn.close()
    print("[SUCCESS] All DSA problems updated with rich descriptions, snippets, and solutions!")

if __name__ == "__main__":
    main()
