def test_register_and_login(client):
    # Register new user
    res = client.post("/api/auth/register", json={
        "email": "traveler@example.com",
        "password": "securepassword123",
        "full_name": "Test Traveler"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "traveler@example.com"

    # Login with new user
    res_login = client.post("/api/auth/login", json={
        "email": "traveler@example.com",
        "password": "securepassword123"
    })
    assert res_login.status_code == 200
    token_data = res_login.json()
    assert "access_token" in token_data

    # Test me endpoint with bearer token
    token = token_data["access_token"]
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "traveler@example.com"

def test_login_invalid_password(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@railtrack.gov.in",
        "password": "wrongpassword"
    })
    assert res.status_code == 401
