import os
import sys
import json
import csv

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import get_db_connection

def ensure_columns(conn):
    """Ensure optional columns like company_tag exist on aptitude_questions table."""
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE aptitude_questions ADD COLUMN IF NOT EXISTS company_tag TEXT;")
    conn.commit()
    cursor.close()

def normalize_row(row):
    """
    Normalizes fields from different CSV/JSON formats into the expected DB schema:
    category, subtopic, difficulty, company_tag, question_text,
    option_a, option_b, option_c, option_d, correct_option, explanation
    """
    def get_val(*possible_keys, default=""):
        for k in possible_keys:
            for actual_k, val in row.items():
                if actual_k and actual_k.strip().lower() == k.lower():
                    if val is not None and str(val).strip():
                        return str(val).strip()
        return default

    question_text = get_val("question_text", "question", "problem", "title", "q")
    if not question_text:
        return None

    # Handle options if options is passed as an array or dict
    opts = row.get("options")
    if isinstance(opts, list) and len(opts) >= 4:
        opt_a = str(opts[0]).strip()
        opt_b = str(opts[1]).strip()
        opt_c = str(opts[2]).strip()
        opt_d = str(opts[3]).strip()
    elif isinstance(opts, dict):
        opt_a = str(opts.get("A", opts.get("a", ""))).strip()
        opt_b = str(opts.get("B", opts.get("b", ""))).strip()
        opt_c = str(opts.get("C", opts.get("c", ""))).strip()
        opt_d = str(opts.get("D", opts.get("d", ""))).strip()
    else:
        opt_a = get_val("option_a", "option a", "a", "opt_a", "option1")
        opt_b = get_val("option_b", "option b", "b", "opt_b", "option2")
        opt_c = get_val("option_c", "option c", "c", "opt_c", "option3")
        opt_d = get_val("option_d", "option d", "d", "opt_d", "option4")

    # Correct option
    correct = get_val("correct_option", "correct_answer", "answer", "ans", "correct", default="A").upper()
    if correct.startswith("OPTION "):
        correct = correct.replace("OPTION ", "").strip()
    if correct not in ["A", "B", "C", "D"]:
        if correct.lower() == opt_a.lower():
            correct = "A"
        elif correct.lower() == opt_b.lower():
            correct = "B"
        elif correct.lower() == opt_c.lower():
            correct = "C"
        elif correct.lower() == opt_d.lower():
            correct = "D"
        else:
            correct = "A"

    category = get_val("category", "type", default="quantitative").lower()
    if category not in ["quantitative", "logical", "verbal", "technical"]:
        if "quant" in category or "math" in category or "aptitude" in category:
            category = "quantitative"
        elif "logic" in category or "reasoning" in category:
            category = "logical"
        elif "verb" in category or "english" in category:
            category = "verbal"
        else:
            category = "quantitative"

    subtopic = get_val("subtopic", "topic", "section", default="General Aptitude")
    difficulty = get_val("difficulty", "level", default="Medium").capitalize()
    if difficulty not in ["Easy", "Medium", "Hard"]:
        difficulty = "Medium"

    company_tag = get_val("company_tag", "company", "companies", "target_company", default="General")
    explanation = get_val("explanation", "solution", "rationale", default="No explanation provided.")

    return {
        "category": category,
        "subtopic": subtopic,
        "difficulty": difficulty,
        "company_tag": company_tag,
        "question_text": question_text,
        "option_a": opt_a,
        "option_b": opt_b,
        "option_c": opt_c,
        "option_d": opt_d,
        "correct_option": correct,
        "explanation": explanation
    }

def import_file(filepath):
    if not os.path.exists(filepath):
        print(f"[ERROR] File not found: {filepath}")
        return False

    print(f"[INFO] Reading: {filepath}")
    records = []

    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".csv":
        with open(filepath, "r", encoding="utf-8-sig", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                norm = normalize_row(row)
                if norm:
                    records.append(norm)
    elif ext == ".json":
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            data = json.load(f)
            if isinstance(data, list):
                for item in data:
                    norm = normalize_row(item)
                    if norm:
                        records.append(norm)
            elif isinstance(data, dict):
                q_list = data.get("questions", data.get("data", []))
                for item in q_list:
                    norm = normalize_row(item)
                    if norm:
                        records.append(norm)
    else:
        print(f"[ERROR] Unsupported file format '{ext}'. Please use .csv or .json.")
        return False

    if not records:
        print("[WARN] No valid question records found in file.")
        return False

    print(f"[INFO] Found {len(records)} valid questions. Connecting to database...")
    conn = get_db_connection()
    ensure_columns(conn)
    cursor = conn.cursor()

    inserted_count = 0
    skipped_count = 0

    insert_sql = """
        INSERT INTO aptitude_questions 
        (category, subtopic, difficulty, company_tag, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """

    for q in records:
        try:
            # Check for duplicate question
            cursor.execute("SELECT id FROM aptitude_questions WHERE question_text = %s", (q["question_text"],))
            if cursor.fetchone():
                skipped_count += 1
                continue

            cursor.execute(insert_sql, (
                q["category"],
                q["subtopic"],
                q["difficulty"],
                q["company_tag"],
                q["question_text"],
                q["option_a"],
                q["option_b"],
                q["option_c"],
                q["option_d"],
                q["correct_option"],
                q["explanation"]
            ))
            inserted_count += 1
        except Exception as e:
            print(f"[WARN] Error inserting question '{q['question_text'][:40]}...': {e}")

    conn.commit()

    # Get total count
    cursor.execute("SELECT COUNT(*) AS total FROM aptitude_questions")
    total = cursor.fetchone()["total"]

    cursor.close()
    conn.close()

    print("\n" + "=" * 50)
    print(f"[SUCCESS] Successfully Imported: {inserted_count} questions")
    if skipped_count > 0:
        print(f"[INFO]    Skipped Duplicates:   {skipped_count} questions")
    print(f"[STATS]   Total Questions in DB: {total}")
    print("=" * 50 + "\n")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_path = sys.argv[1]
    else:
        default_csv = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "sample_questions.csv")
        if os.path.exists(default_csv):
            target_path = default_csv
        else:
            print("Usage: python import_questions.py <path_to_file.csv_or_json>")
            sys.exit(1)

    import_file(target_path)
