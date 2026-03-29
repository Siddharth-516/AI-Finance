"""Purpose: basic API smoke test."""
from fastapi.testclient import TestClient
from app.main import app


def test_healthz():
    client = TestClient(app)
    r = client.get('/api/v1/healthz')
    assert r.status_code == 200


def test_google_login_creates_or_returns_user(monkeypatch):
    def fake_verify_google_identity(id_token_str, email, name):
        return {
            'email': 'test-google-user@example.com',
            'name': 'Google Test User',
        }

    monkeypatch.setattr('app.api.routes.auth.verify_google_identity', fake_verify_google_identity)

    client = TestClient(app)
    r = client.post('/api/v1/auth/google', json={'id_token': 'dummy-token'})
    assert r.status_code == 200
    body = r.json()
    assert 'token' in body
    assert body['profile']['email'] == 'test-google-user@example.com'
    assert body['profile']['name'] == 'Google Test User'

