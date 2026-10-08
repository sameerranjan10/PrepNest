import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.testclient import TestClient
from dotenv import load_dotenv
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from main import app

conn = psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=RealDictCursor)
cur = conn.cursor()

# 1. Count domains, topics, tasks, resources, projects
cur.execute("SELECT COUNT(*) as count FROM roadmap_domains;")
n_domains = cur.fetchone()["count"]
cur.execute("SELECT COUNT(*) as count FROM roadmap_topics;")
n_topics = cur.fetchone()["count"]
cur.execute("SELECT COUNT(*) as count FROM roadmap_resources;")
n_resources = cur.fetchone()["count"]
cur.execute("SELECT COUNT(*) as count FROM roadmap_practice_tasks;")
n_tasks = cur.fetchone()["count"]
cur.execute("SELECT COUNT(*) as count FROM roadmap_projects;")
n_projects = cur.fetchone()["count"]

print(f"Verification DB Counts: Domains={n_domains}, Topics={n_topics}, Resources={n_resources}, Tasks={n_tasks}, Projects={n_projects}")

assert n_domains == 7, f"Expected 7 domains, got {n_domains}"
assert n_topics == 35, f"Expected 35 topics, got {n_topics}"
assert n_resources >= 105, f"Expected >= 105 resources, got {n_resources}"
assert n_tasks >= 105, f"Expected >= 105 tasks, got {n_tasks}"
assert n_projects == 7, f"Expected 7 projects, got {n_projects}"

# 2. TestClient API tests
client = TestClient(app)

# Test domains list
r = client.get("/api/roadmap/domains")
assert r.status_code == 200
data = r.json()
assert len(data["domains"]) == 7
print("[OK] GET /api/roadmap/domains OK")

# Test domain topics for all 7 domains
for d in data["domains"]:
    domain_id = d["id"]
    res = client.get(f"/api/roadmap/domains/{domain_id}/topics")
    assert res.status_code == 200, f"Failed for {domain_id}: {res.text}"
    t_data = res.json()
    assert len(t_data["topics"]) > 0
    assert t_data["project"] is not None
print("[OK] All 7 domain topic tracks & mini-projects OK")

# Test topic detail with DSA linking
# Find the topic with slug arrays-strings
cur.execute("SELECT id FROM roadmap_topics WHERE slug = 'arrays-strings' LIMIT 1;")
arr_id = cur.fetchone()["id"]
res_dsa = client.get(f"/api/roadmap/topics/{arr_id}")
assert res_dsa.status_code == 200
dsa_detail = res_dsa.json()
print("[OK] DSA Topic detail with problem linking count:", len(dsa_detail["dsa_problems"]))
assert len(dsa_detail["practice_tasks"]) >= 3
assert len(dsa_detail["resources"]) >= 3

# Test progress toggle & reset
r_toggle = client.post("/api/roadmap/progress", json={"topic_id": arr_id, "status": "completed", "user_id": 1})
assert r_toggle.status_code == 200
assert r_toggle.json()["status"] == "completed"
print("[OK] Toggle completed OK")

r_reset = client.post("/api/roadmap/progress/reset", json={"user_id": 1})
assert r_reset.status_code == 200
print("[OK] Reset progress OK")


# Test recommendations
r_recs = client.get("/api/roadmap/recommendations?user_id=1")
assert r_recs.status_code == 200
assert len(r_recs.json()["recommendations"]) > 0
print("[OK] Recommendations endpoint OK")


cur.close()
conn.close()
print("\n==========================================")
print("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
print("==========================================")
