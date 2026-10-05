import os
import sys
import json
import re
import random

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import get_db_connection

COMPANIES = [
    "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", 
    "Capgemini", "Amazon", "Google", "Microsoft", "Deloitte"
]

def clean_html(raw_html):
    if not raw_html:
        return ""
    # Remove <ol>...</ol> lists (the options part in questionHtml)
    text = re.sub(r'<ol[\s\S]*?</ol>', '', raw_html, flags=re.IGNORECASE)
    # Remove MathML or images
    text = re.sub(r'<math[\s\S]*?</math>', '', text, flags=re.IGNORECASE)
    # Strip remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Clean whitespace and HTML entities
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    return re.sub(r'\s+', ' ', text).strip()

def ingest_dataset(gate_qa_dir, questions_per_topic=30):
    """
    Ingests cleaned questions from Gate_QA dataset into PostgreSQL.
    questions_per_topic: Number of questions to pick per subtopic (ensures great variety).
    """
    data_dir = os.path.join(gate_qa_dir, "public", "data", "aptitude")
    if not os.path.exists(data_dir):
        print(f"[ERROR] Could not find data directory: {data_dir}")
        return

    cat_map = {
        "quant": "quantitative",
        "reasoning": "logical",
        "english": "verbal"
    }

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE aptitude_questions ADD COLUMN IF NOT EXISTS company_tag TEXT;")
    conn.commit()

    total_inserted = 0
    total_skipped = 0

    insert_sql = """
        INSERT INTO aptitude_questions 
        (category, subtopic, difficulty, company_tag, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """

    for folder_name, db_category in cat_map.items():
        sub_folder = os.path.join(data_dir, folder_name)
        if not os.path.exists(sub_folder):
            continue

        topic_files = [f for f in os.listdir(sub_folder) if f.endswith(".json")]
        print(f"\n📂 Processing {folder_name.upper()} ({len(topic_files)} topics)...")

        for f in topic_files:
            file_path = os.path.join(sub_folder, f)
            with open(file_path, "r", encoding="utf-8", errors="ignore") as fl:
                try:
                    q_list = json.load(fl)
                except Exception:
                    continue

            # Filter valid MCQs with 4 options and a valid single letter answer (A, B, C, D)
            valid_qs = []
            for item in q_list:
                ans = str(item.get("answer", "")).strip().upper()
                opts = item.get("options", [])
                if ans in ["A", "B", "C", "D"] and isinstance(opts, list) and len(opts) == 4:
                    q_text = clean_html(item.get("questionHtml", ""))
                    # Avoid image-only questions or very short snippets
                    if len(q_text) >= 15:
                        valid_qs.append((item, q_text, [clean_html(o) for o in opts], ans))

            # Sample questions to maintain even distribution across all subtopics
            sample_size = min(len(valid_qs), questions_per_topic)
            selected = random.sample(valid_qs, sample_size) if len(valid_qs) > sample_size else valid_qs

            subtopic_name = f.replace(".json", "").replace("-", " ").title()

            topic_inserted = 0
            for raw_item, q_text, cleaned_opts, ans in selected:
                # Check for duplicate
                cursor.execute("SELECT id FROM aptitude_questions WHERE question_text = %s", (q_text,))
                if cursor.fetchone():
                    total_skipped += 1
                    continue

                subtopic = raw_item.get("subtopic") or subtopic_name
                company = random.choice(COMPANIES)
                difficulty = random.choice(["Easy", "Medium", "Medium", "Hard"])

                cursor.execute(insert_sql, (
                    db_category,
                    subtopic,
                    difficulty,
                    company,
                    q_text,
                    cleaned_opts[0] or "Option A",
                    cleaned_opts[1] or "Option B",
                    cleaned_opts[2] or "Option C",
                    cleaned_opts[3] or "Option D",
                    ans,
                    f"Correct Answer: Option {ans}."
                ))
                topic_inserted += 1
                total_inserted += 1

            conn.commit()
            if topic_inserted > 0:
                print(f"  ✓ {subtopic_name}: Added {topic_inserted} questions")

    # Get final count
    cursor.execute("SELECT COUNT(*) AS total FROM aptitude_questions;")
    new_total = cursor.fetchone()["total"]

    cursor.close()
    conn.close()

    print("\n" + "=" * 55)
    print(f"[SUCCESS] Ingestion Complete!")
    print(f"  - New Questions Added: {total_inserted}")
    print(f"  - Skipped Duplicates:  {total_skipped}")
    print(f"  - Total Questions in Database: {new_total}")
    print("=" * 55 + "\n")

if __name__ == "__main__":
    gate_dir = r"C:\Users\vivek\.gemini\antigravity\brain\6b3b0b1d-ef9c-457c-81e1-344f1cfd1603\scratch\Gate_QA"
    
    count_per_topic = 25  # ~25 questions across ~60 topics = ~1,500 questions
    if len(sys.argv) > 1:
        try:
            count_per_topic = int(sys.argv[1])
        except ValueError:
            pass

    print(f"Starting Gate_QA ingestion (~{count_per_topic} questions per topic)...")
    ingest_dataset(gate_dir, count_per_topic)
