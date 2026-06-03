"""
IMPULSE IA — Backend API tests (pytest)
Tests cover: auth (register/login/me/logout), profile, password change, projects CRUD, dashboard stats.
Uses Bearer token auth. Uses short duration (3 days) for project gen to keep Groq calls fast.
"""

import os
import uuid
import pytest
import requests
from dotenv import load_dotenv

# Carga variables de entorno desde backend/.env si está disponible (test-only secrets).
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://impulse-ia.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

# Las credenciales demo viven en .env (no commit). Si faltan, fallamos rápido para evitar hardcoding.
DEMO_EMAIL = os.environ.get("DEMO_EMAIL", "demo@impulseia.com")
DEMO_PASSWORD = os.environ["DEMO_PASSWORD"] if "DEMO_PASSWORD" in os.environ else None
if not DEMO_PASSWORD:
    raise RuntimeError(
        "DEMO_PASSWORD missing in env. Set it in backend/.env (see README) or export it."
    )


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def demo_token(client):
    # ensure demo exists (idempotent)
    client.post(f"{API}/auth/seed-demo", timeout=15)
    r = client.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Demo login failed: {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def demo_auth(demo_token):
    return {"Authorization": f"Bearer {demo_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def new_user(client):
    """Create a fresh user for isolation tests."""
    email = f"TEST_{uuid.uuid4().hex[:8]}@impulseia.com"
    payload = {"name": "Test User", "email": email, "password": "Test1234!", "company": "TEST_Co"}
    r = client.post(f"{API}/auth/register", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    return {"email": email, "token": data["token"], "user": data["user"], "auth": {"Authorization": f"Bearer {data['token']}", "Content-Type": "application/json"}}


# ---------- Health ----------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# ---------- Auth ----------
class TestAuth:
    def test_register_success(self, new_user):
        assert new_user["user"]["email"] == new_user["email"].lower()
        assert new_user["user"]["company"] == "TEST_Co"
        assert new_user["user"]["plan"] == "free"
        assert isinstance(new_user["token"], str) and len(new_user["token"]) > 10

    def test_register_duplicate_email(self, client, new_user):
        r = client.post(f"{API}/auth/register", json={
            "name": "Dup", "email": new_user["email"], "password": "Test1234!", "company": "X"
        }, timeout=10)
        assert r.status_code == 409

    def test_register_invalid_email(self, client):
        r = client.post(f"{API}/auth/register", json={
            "name": "Bad", "email": "notanemail", "password": "Test1234!", "company": "X"
        }, timeout=10)
        assert r.status_code == 422

    def test_register_short_password(self, client):
        r = client.post(f"{API}/auth/register", json={
            "name": "Bad", "email": f"TEST_{uuid.uuid4().hex[:6]}@x.com", "password": "123", "company": "X"
        }, timeout=10)
        assert r.status_code == 422

    def test_login_demo_success(self, client):
        r = client.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "token" in data and "user" in data
        assert data["user"]["email"] == DEMO_EMAIL

    def test_login_wrong_password(self, client):
        r = client.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": "wrong"}, timeout=10)
        assert r.status_code == 401

    def test_login_unknown_email(self, client):
        r = client.post(f"{API}/auth/login", json={"email": "nope@x.com", "password": "Demo1234!"}, timeout=10)
        assert r.status_code == 401

    def test_auth_me_with_bearer(self, client, demo_auth):
        r = client.get(f"{API}/auth/me", headers=demo_auth, timeout=10)
        assert r.status_code == 200
        assert r.json()["email"] == DEMO_EMAIL

    def test_auth_me_no_token(self, client):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_auth_me_invalid_token(self, client):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer invalid_token_xyz"}, timeout=10)
        assert r.status_code == 401


# ---------- Profile ----------
class TestProfile:
    def test_get_profile(self, client, demo_auth):
        r = client.get(f"{API}/user/profile", headers=demo_auth, timeout=10)
        assert r.status_code == 200
        assert r.json()["email"] == DEMO_EMAIL

    def test_update_profile_and_persist(self, new_user):
        auth = new_user["auth"]
        s = requests.Session()
        upd = {"name": "Renamed Tester", "industry": "Restaurante", "city": "Lima"}
        r = s.put(f"{API}/user/profile", json=upd, headers=auth, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "Renamed Tester"
        assert data["industry"] == "Restaurante"
        assert data["city"] == "Lima"
        # verify persistence via GET
        r2 = s.get(f"{API}/user/profile", headers=auth, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["industry"] == "Restaurante"
        assert r2.json()["city"] == "Lima"


# ---------- Password change ----------
class TestPasswordChange:
    def test_change_password_and_login_with_new(self, client):
        # create a fresh user to safely change password
        email = f"TEST_{uuid.uuid4().hex[:8]}@impulseia.com"
        old_pw = "OldPass123!"
        new_pw = "NewPass456!"
        reg = client.post(f"{API}/auth/register", json={
            "name": "PW User", "email": email, "password": old_pw, "company": "PWCo"
        }, timeout=10)
        assert reg.status_code == 200
        token = reg.json()["token"]
        auth = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # wrong current
        r = client.put(f"{API}/user/password", json={"current_password": "wrong", "new_password": new_pw}, headers=auth, timeout=10)
        assert r.status_code == 401

        # correct
        r = client.put(f"{API}/user/password", json={"current_password": old_pw, "new_password": new_pw}, headers=auth, timeout=10)
        assert r.status_code == 200

        # login with new
        r = client.post(f"{API}/auth/login", json={"email": email, "password": new_pw}, timeout=10)
        assert r.status_code == 200

        # cleanup: delete account
        new_token = r.json()["token"]
        client.delete(f"{API}/user/account", headers={"Authorization": f"Bearer {new_token}"}, timeout=10)


# ---------- Projects ----------
class TestProjects:
    project_id = None

    def test_create_project_groq(self, client, demo_auth):
        """Create with 3 days to keep Groq call short."""
        payload = {
            "company": "Taquería El Patrón",
            "industry": "Restaurante",
            "city": "Mérida",
            "objective": "Aumentar ventas locales",
            "duration_days": 3,
        }
        r = client.post(f"{API}/projects", json=payload, headers=demo_auth, timeout=90)
        assert r.status_code == 200, f"Project creation failed: {r.status_code} {r.text[:500]}"
        data = r.json()
        assert "project_id" in data
        assert data["duration_days"] == 3
        assert isinstance(data["content"], list)
        assert len(data["content"]) >= 1
        first = data["content"][0]
        for field in ("day", "title", "facebook", "instagram", "hashtags", "reel_script", "visual_idea", "cta"):
            assert field in first, f"missing field {field}"
        TestProjects.project_id = data["project_id"]

    def test_list_projects(self, client, demo_auth):
        r = client.get(f"{API}/projects", headers=demo_auth, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert any(p["project_id"] == TestProjects.project_id for p in items)
        sample = next(p for p in items if p["project_id"] == TestProjects.project_id)
        assert "posts_count" in sample and sample["posts_count"] >= 1

    def test_get_project_detail(self, client, demo_auth):
        pid = TestProjects.project_id
        assert pid, "no project_id from previous test"
        r = client.get(f"{API}/projects/{pid}", headers=demo_auth, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["project_id"] == pid
        assert "_id" not in data
        assert len(data["content"]) >= 1

    def test_get_project_not_found(self, client, demo_auth):
        r = client.get(f"{API}/projects/prj_nonexistent", headers=demo_auth, timeout=10)
        assert r.status_code == 404

    def test_get_project_other_user_isolation(self, client, new_user):
        # the new user should NOT see demo's project
        pid = TestProjects.project_id
        r = client.get(f"{API}/projects/{pid}", headers=new_user["auth"], timeout=10)
        assert r.status_code == 404

    def test_delete_project(self, client, demo_auth):
        pid = TestProjects.project_id
        r = client.delete(f"{API}/projects/{pid}", headers=demo_auth, timeout=10)
        assert r.status_code == 200
        # verify gone
        r2 = client.get(f"{API}/projects/{pid}", headers=demo_auth, timeout=10)
        assert r2.status_code == 404

    def test_create_project_invalid_duration(self, client, demo_auth):
        r = client.post(f"{API}/projects", json={
            "company": "X", "industry": "Y", "city": "Z", "objective": "W", "duration_days": 99
        }, headers=demo_auth, timeout=10)
        assert r.status_code == 422


# ---------- Dashboard ----------
class TestDashboard:
    def test_dashboard_stats(self, client, demo_auth):
        r = client.get(f"{API}/dashboard/stats", headers=demo_auth, timeout=15)
        assert r.status_code == 200
        data = r.json()
        for k in ("total_projects", "total_posts", "last_generation", "current_plan"):
            assert k in data
        assert isinstance(data["total_projects"], int)
        assert isinstance(data["total_posts"], int)
        assert data["current_plan"] in ("free", "pro", "agency")


# ---------- Logout ----------
class TestLogout:
    def test_logout_invalidates_token(self, client):
        # fresh user to logout
        email = f"TEST_{uuid.uuid4().hex[:8]}@impulseia.com"
        reg = client.post(f"{API}/auth/register", json={
            "name": "LO User", "email": email, "password": "Test1234!", "company": "LOCo"
        }, timeout=10)
        token = reg.json()["token"]
        auth = {"Authorization": f"Bearer {token}"}
        # me works
        r = client.get(f"{API}/auth/me", headers=auth, timeout=10)
        assert r.status_code == 200
        # logout
        r = client.post(f"{API}/auth/logout", headers=auth, timeout=10)
        assert r.status_code == 200
        # me fails
        r = client.get(f"{API}/auth/me", headers=auth, timeout=10)
        assert r.status_code == 401


# ---------- Cleanup ----------
@pytest.fixture(scope="session", autouse=True)
def cleanup_new_user(request, new_user):
    yield
    try:
        requests.delete(f"{API}/user/account", headers=new_user["auth"], timeout=10)
    except Exception:
        pass
