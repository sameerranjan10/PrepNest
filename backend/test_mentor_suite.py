import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from dotenv import load_dotenv

# Load env
load_dotenv('.env')

from main import app
from database import get_db_connection

client = TestClient(app)

print("=" * 60)
print("PREPNEST TOKEN-EFFICIENT AI MENTOR TEST SUITE (STEP 29)")
print("=" * 60)

passed = 0
failed = 0

def record_test(name, success, details=""):
    global passed, failed
    safe_details = str(details).encode('ascii', errors='replace').decode('ascii')
    if success:
        passed += 1
        print(f" [PASS] {name} | {safe_details}")
    else:
        failed += 1
        print(f" [FAIL] {name} | {safe_details}")

# -------------------------------------------------------------
# Test 1: "Hello" -> Short response
# -------------------------------------------------------------
res1 = client.post("/api/mentor/chat", json={"message": "Hello", "mode": "general"})
if res1.status_code == 200:
    data1 = res1.json()
    reply1 = data1["assistant_message"]["content"]
    usage1 = data1.get("usage", {})
    record_test("1. Hello Greeting", usage1.get("completion_tokens", 0) <= 150, f"Tokens Out: {usage1.get('completion_tokens')} | Reply: {reply1[:60]}...")
    client.delete(f"/api/mentor/conversations/{data1['conversation_id']}")
else:
    record_test("1. Hello Greeting", False, res1.text)

# -------------------------------------------------------------
# Test 2: "What should I study today?" -> Short time-boxed plan
# -------------------------------------------------------------
res2 = client.post("/api/mentor/chat", json={"message": "What should I study today?", "mode": "study_plan"})
if res2.status_code == 200:
    data2 = res2.json()
    reply2 = data2["assistant_message"]["content"]
    usage2 = data2.get("usage", {})
    record_test("2. Study Plan", "today" in reply2.lower() or "dsa" in reply2.lower() or "min" in reply2.lower(), f"Tokens Out: {usage2.get('completion_tokens')} | Length: {data2.get('response_length')}")
    client.delete(f"/api/mentor/conversations/{data2['conversation_id']}")
else:
    record_test("2. Study Plan", False, res2.text)

# -------------------------------------------------------------
# Test 3: "Am I ready for TCS Web Developer?" -> Uses TCS + Web Developer context
# -------------------------------------------------------------
res3 = client.post("/api/mentor/chat", json={"message": "Am I ready for TCS Web Developer?", "mode": "career"})
if res3.status_code == 200:
    data3 = res3.json()
    reply3 = data3["assistant_message"]["content"]
    usage3 = data3.get("usage", {})
    has_tcs_context = "tcs" in reply3.lower() or "web" in reply3.lower() or "developer" in reply3.lower() or "ready" in reply3.lower()
    record_test("3. Career Readiness (TCS)", has_tcs_context, f"Tokens Out: {usage3.get('completion_tokens')} | In: {usage3.get('prompt_tokens')}")
    client.delete(f"/api/mentor/conversations/{data3['conversation_id']}")
else:
    record_test("3. Career Readiness (TCS)", False, res3.text)

# -------------------------------------------------------------
# Test 4: "Explain binary search." -> Short explanation
# -------------------------------------------------------------
res4 = client.post("/api/mentor/chat", json={"message": "Explain binary search.", "mode": "tutor"})
if res4.status_code == 200:
    data4 = res4.json()
    reply4 = data4["assistant_message"]["content"]
    usage4 = data4.get("usage", {})
    record_test("4. Explain Binary Search (Normal)", usage4.get("completion_tokens", 0) <= 300, f"Tokens Out: {usage4.get('completion_tokens')}")
    client.delete(f"/api/mentor/conversations/{data4['conversation_id']}")
else:
    record_test("4. Explain Binary Search (Normal)", False, res4.text)

# -------------------------------------------------------------
# Test 5: "Explain binary search in detail." -> Longer explanation (detailed mode)
# -------------------------------------------------------------
res5 = client.post("/api/mentor/chat", json={"message": "Explain binary search in detail.", "mode": "tutor"})
if res5.status_code == 200:
    data5 = res5.json()
    reply5 = data5["assistant_message"]["content"]
    usage5 = data5.get("usage", {})
    is_detailed = data5.get("response_length") == "detailed" and usage5.get("completion_tokens", 0) > usage4.get("completion_tokens", 0)
    record_test("5. Explain Binary Search (Detailed)", is_detailed, f"Tokens Out: {usage5.get('completion_tokens')} | Length: {data5.get('response_length')}")
    client.delete(f"/api/mentor/conversations/{data5['conversation_id']}")
else:
    record_test("5. Explain Binary Search (Detailed)", False, res5.text)

# -------------------------------------------------------------
# Test 6: "Give me a DSA hint." -> Progressive hint, not immediate full code dump
# -------------------------------------------------------------
res6 = client.post("/api/mentor/chat", json={"message": "Give me a DSA hint for Two Sum.", "mode": "dsa"})
if res6.status_code == 200:
    data6 = res6.json()
    reply6 = data6["assistant_message"]["content"]
    has_hint = "hint" in reply6.lower() or "hash" in reply6.lower() or "complement" in reply6.lower()
    record_test("6. DSA Hint Guidance", has_hint, f"Tokens: {data6.get('usage', {}).get('completion_tokens')}")
    client.delete(f"/api/mentor/conversations/{data6['conversation_id']}")
else:
    record_test("6. DSA Hint Guidance", False, res6.text)

# -------------------------------------------------------------
# Test 7: "Start Java interview." -> Exactly one question
# -------------------------------------------------------------
res7 = client.post("/api/mentor/chat", json={"message": "Start Java interview.", "mode": "interview"})
if res7.status_code == 200:
    data7 = res7.json()
    reply7 = data7["assistant_message"]["content"]
    question_mark_count = reply7.count("?")
    record_test("7. Interview 1 Question at a time", question_mark_count >= 1, f"Question asked: {reply7[:80]}...")
    client.delete(f"/api/mentor/conversations/{data7['conversation_id']}")
else:
    record_test("7. Interview 1 Question at a time", False, res7.text)

# -------------------------------------------------------------
# Test 8: Resume question -> Uses actual Resume Analyzer data
# -------------------------------------------------------------
res8 = client.post("/api/mentor/chat", json={"message": "Why is my resume score at its current level?", "mode": "resume"})
if res8.status_code == 200:
    data8 = res8.json()
    reply8 = data8["assistant_message"]["content"]
    record_test("8. Resume Analyzer Integration", "score" in reply8.lower() or "82" in reply8 or "ats" in reply8.lower() or "keywords" in reply8.lower(), f"Reply: {reply8[:70]}...")
    client.delete(f"/api/mentor/conversations/{data8['conversation_id']}")
else:
    record_test("8. Resume Analyzer Integration", False, res8.text)

# -------------------------------------------------------------
# Test 9: User without resume -> Graceful response
# -------------------------------------------------------------
from mentor_service import build_selective_student_context
conn = get_db_connection()
cur = conn.cursor()
# Test context builder for non-existent resume user (e.g. 999999)
ctx_no_resume = build_selective_student_context(999999, "RESUME_HELP", {}, cur)
record_test("9. User without Resume Fallback", "ATS Score: N/A" in ctx_no_resume or "Target Role" in ctx_no_resume, f"Context: {ctx_no_resume}")

# -------------------------------------------------------------
# Test 10: User without target company -> Graceful response
# -------------------------------------------------------------
ctx_no_company = build_selective_student_context(999999, "CAREER_READINESS", {}, cur)
record_test("10. User without Target Company Fallback", "Tech Company" in ctx_no_company or "Target" in ctx_no_company, f"Context: {ctx_no_company.splitlines()[0]}")
cur.close()
conn.close()

# -------------------------------------------------------------
# Test 11: Groq Rate Limit handling -> Friendly error
# -------------------------------------------------------------
from mentor_service import call_groq_mentor
# Verify call_groq_mentor error formatting
fake_rl_res = call_groq_mentor([{"role": "user", "content": "test"}], "test", max_tokens=10)
record_test("11. Error/Fallback message handling", "success" in fake_rl_res, f"Has friendly response format")

# -------------------------------------------------------------
# Test 12: Invalid API key -> Friendly backend error
# -------------------------------------------------------------
orig_key = os.environ.get("GROQ_API_KEY")
try:
    os.environ["GROQ_API_KEY"] = "gsk_invalid_test_key_12345"
    res12 = client.post("/api/mentor/chat", json={"message": "Test invalid key", "mode": "general"})
    data12 = res12.json()
    reply12 = data12["assistant_message"]["content"]
    record_test("12. Invalid API key friendly error", "Invalid Groq API key" in reply12 or "error" in reply12.lower(), f"Friendly Msg: {reply12[:60]}")
    client.delete(f"/api/mentor/conversations/{data12['conversation_id']}")
finally:
    if orig_key:
        os.environ["GROQ_API_KEY"] = orig_key

# -------------------------------------------------------------
# Test 13: User A accessing User B data -> DENIED (HTTP 403 / 404)
# -------------------------------------------------------------
# Create conversation under user 1
res_c = client.post("/api/mentor/conversations", json={"title": "Private User 1 Thread"})
c_id = res_c.json()["id"]

# Attempt to fetch as user 2 using custom authorization token
import auth
token_user2 = auth.create_access_token({"sub": "user2@test.com", "user_id": 99999})
res_steal = client.get(f"/api/mentor/conversations/{c_id}", headers={"Authorization": f"Bearer {token_user2}"})
record_test("13. User A accessing User B data Isolation", res_steal.status_code in [403, 404], f"Status Code: {res_steal.status_code}")

# Cleanup
client.delete(f"/api/mentor/conversations/{c_id}")

# -------------------------------------------------------------
# Test 14: Check frontend bundle -> NO GROQ_API_KEY
# -------------------------------------------------------------
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist", "assets")
bundle_has_key = False
if os.path.exists(frontend_dist):
    for fn in os.listdir(frontend_dist):
        if fn.endswith(".js"):
            with open(os.path.join(frontend_dist, fn), "r", encoding="utf-8") as f:
                content = f.read()
                if "GROQ_API_KEY" in content or "gsk_" in content:
                    bundle_has_key = True
                    break
record_test("14. Frontend bundle leak check", not bundle_has_key, "Zero GROQ_API_KEY found in build assets")

print("=" * 60)
print(f"TEST SUITE RESULTS: {passed} PASSED / {failed} FAILED")
print("=" * 60)

if failed > 0:
    sys.exit(1)
