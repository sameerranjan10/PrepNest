import os
import sys
import glob
import csv
import json
import subprocess
import shutil

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import get_db_connection

REPO_URL = "https://github.com/liquidslr/leetcode-company-wise-problems.git"
CLONE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "leetcode_data_temp")

def clean_difficulty(diff_str):
    if not diff_str:
        return "Medium"
    d = diff_str.strip().capitalize()
    if d in ["Easy", "Medium", "Hard"]:
        return d
    return "Medium"

def clean_acceptance_rate(acc_val):
    if not acc_val:
        return 50.0
    try:
        val = float(acc_val)
        # If it's a decimal like 0.54 or 0.0054
        if val <= 1.0:
            val = val * 100
        # If it's very small like 0.58%, keep reasonable clamp
        if val < 5.0:
            val = round(val * 10, 1)
        return min(99.9, max(5.0, round(val, 1)))
    except Exception:
        return 50.0

def clean_topics(topics_str):
    if not topics_str:
        return []
    items = [t.strip() for t in topics_str.split(",") if t.strip()]
    return list(dict.fromkeys(items))  # preserve order & deduplicate

def run_ingestion():
    # 1. Clone repository if not present or missing company folders
    has_dirs = os.path.exists(CLONE_DIR) and any(
        os.path.isdir(os.path.join(CLONE_DIR, d)) and not d.startswith(".")
        for d in os.listdir(CLONE_DIR)
    )
    if not has_dirs:
        if os.path.exists(CLONE_DIR):
            try:
                shutil.rmtree(CLONE_DIR, ignore_errors=True)
            except Exception:
                pass
        print(f"[INFO] Cloning {REPO_URL} into {CLONE_DIR}...")
        res = subprocess.run(["git", "clone", "--depth", "1", REPO_URL, CLONE_DIR], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"[ERROR] Failed to clone: {res.stderr}")
            return
        print("[INFO] Clone complete.")
    else:
        print(f"[INFO] Using existing directory {CLONE_DIR}")

    # 2. Parse all company directories
    company_dirs = [
        d for d in os.listdir(CLONE_DIR)
        if os.path.isdir(os.path.join(CLONE_DIR, d)) and not d.startswith(".")
    ]
    print(f"[INFO] Found {len(company_dirs)} company folders to process.")

    problems_map = {}  # link -> dict

    for comp in company_dirs:
        # Standardize company name casing (e.g., 'tcs' -> 'TCS', 'accenture' -> 'Accenture')
        comp_clean = comp.strip()
        if comp_clean.lower() == "tcs":
            comp_clean = "TCS"
        elif comp_clean.lower() == "ibm":
            comp_clean = "IBM"
        elif comp_clean.lower() == "ey":
            comp_clean = "EY"
        elif comp_clean.islower():
            comp_clean = comp_clean.capitalize()

        comp_path = os.path.join(CLONE_DIR, comp)
        # We read '5. All.csv' if available, otherwise check all csv files
        all_csv = os.path.join(comp_path, "5. All.csv")
        csv_files = [all_csv] if os.path.exists(all_csv) else glob.glob(os.path.join(comp_path, "*.csv"))

        for csv_file in csv_files:
            if not os.path.exists(csv_file):
                continue
            try:
                with open(csv_file, "r", encoding="utf-8", errors="ignore") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        link = (row.get("Link") or "").strip()
                        title = (row.get("Title") or "").strip()
                        if not link or not title:
                            continue

                        # Normalize link (remove trailing slash)
                        link = link.rstrip("/")

                        diff = clean_difficulty(row.get("Difficulty"))
                        acc = clean_acceptance_rate(row.get("Acceptance Rate"))
                        topics = clean_topics(row.get("Topics"))
                        try:
                            freq = round(float(row.get("Frequency", 50.0)), 1)
                        except Exception:
                            freq = 50.0

                        if link not in problems_map:
                            slug = link.split("/problems/")[-1].replace("/", "") if "/problems/" in link else ""
                            problems_map[link] = {
                                "title": title,
                                "slug": slug,
                                "difficulty": diff,
                                "acceptance_rate": acc,
                                "link": link,
                                "topics": set(topics),
                                "companies": set([comp_clean]),
                                "company_frequencies": {comp_clean: freq}
                            }
                        else:
                            p = problems_map[link]
                            for t in topics:
                                p["topics"].add(t)
                            p["companies"].add(comp_clean)
                            if comp_clean not in p["company_frequencies"] or freq > p["company_frequencies"][comp_clean]:
                                p["company_frequencies"][comp_clean] = freq
            except Exception as e:
                print(f"[WARN] Error reading {csv_file}: {e}")

    total_problems = len(problems_map)
    print(f"[INFO] Aggregated {total_problems} unique LeetCode problems across {len(company_dirs)} companies.")

    # 3. Query existing links to only insert remaining
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT link FROM dsa_problems")
    existing_links = set(r["link"] for r in cursor.fetchall())
    print(f"[INFO] Found {len(existing_links)} problems already inserted in database.")

    insert_sql = """
        INSERT INTO dsa_problems 
        (title, slug, difficulty, acceptance_rate, link, topics, companies, company_frequencies)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (link) DO UPDATE SET
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            difficulty = EXCLUDED.difficulty,
            acceptance_rate = EXCLUDED.acceptance_rate,
            topics = EXCLUDED.topics,
            companies = EXCLUDED.companies,
            company_frequencies = EXCLUDED.company_frequencies;
    """

    remaining_problems = {k: v for k, v in problems_map.items() if k not in existing_links}
    print(f"[INFO] Inserting remaining {len(remaining_problems)} problems...")

    batch_params = []
    inserted = len(existing_links)

    for link, p in remaining_problems.items():
        batch_params.append((
            p["title"],
            p["slug"],
            p["difficulty"],
            p["acceptance_rate"],
            p["link"],
            list(p["topics"]),
            list(p["companies"]),
            json.dumps(p["company_frequencies"])
        ))

        if len(batch_params) >= 50:
            cursor.executemany(insert_sql, batch_params)
            conn.commit()
            inserted += len(batch_params)
            print(f"[PROGRESS] Inserted {inserted}/{total_problems} problems...")
            batch_params = []

    if batch_params:
        cursor.executemany(insert_sql, batch_params)
        conn.commit()
        inserted += len(batch_params)
        print(f"[PROGRESS] Inserted {inserted}/{total_problems} problems...")

    cursor.close()
    conn.close()

    print(f"[SUCCESS] Successfully ingested {inserted} problems into PostgreSQL database!")

    # 4. Clean up temporary clone directory
    def remove_readonly(func, path, excinfo):
        import stat
        os.chmod(path, stat.S_IWRITE)
        func(path)

    try:
        shutil.rmtree(CLONE_DIR, onerror=remove_readonly)
        print("[INFO] Cleaned up temporary clone directory.")
    except Exception as e:
        print(f"[WARN] Cleanup note: {e}")

if __name__ == "__main__":
    run_ingestion()
