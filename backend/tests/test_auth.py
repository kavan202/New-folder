import pytest
from fastapi import status

def test_register_user_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "speedracer",
            "email": "speed@example.com",
            "password": "fastpassword123",
            "role": "user"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["username"] == "speedracer"
    assert data["email"] == "speed@example.com"
    assert data["role"] == "user"
    assert "id" in data

def test_register_duplicate_username(client):
    user_payload = {
        "username": "duplicate_user",
        "email": "user1@example.com",
        "password": "password123"
    }
    res1 = client.post("/api/auth/register", json=user_payload)
    assert res1.status_code == status.HTTP_201_CREATED

    user_payload["email"] = "user2@example.com"
    res2 = client.post("/api/auth/register", json=user_payload)
    assert res2.status_code == status.HTTP_400_BAD_REQUEST
    assert "Username already registered" in res2.json()["detail"]

def test_login_success(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "correctpassword"
        }
    )

    response = client.post(
        "/api/auth/login",
        json={
            "username": "loginuser",
            "password": "correctpassword"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "loginuser"

def test_login_invalid_credentials(client):
    response = client.post(
        "/api/auth/login",
        json={
            "username": "nonexistent",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_register_admin_unauthorized(client):
    # Unauthenticated request should fail with 401
    response = client.post(
        "/api/auth/register-admin",
        json={
            "username": "newadmin",
            "email": "newadmin@example.com",
            "password": "adminpassword123"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_register_admin_by_existing_admin(client, db_session):
    from app.models.user import User, UserRole
    from app.auth import get_password_hash

    # Manually seed an admin user into the DB
    admin_user = User(
        username="admin_boss",
        email="boss@example.com",
        hashed_password=get_password_hash("bosspass123"),
        role=UserRole.ADMIN.value
    )
    db_session.add(admin_user)
    db_session.commit()

    # Login as admin_boss
    login_res = client.post(
        "/api/auth/login",
        json={"username": "admin_boss", "password": "bosspass123"}
    )
    assert login_res.status_code == status.HTTP_200_OK
    token = login_res.json()["access_token"]

    # Register a new admin using token
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/auth/register-admin",
        json={
            "username": "sub_admin",
            "email": "subadmin@example.com",
            "password": "subadminpassword"
        },
        headers=headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["username"] == "sub_admin"
    assert data["role"] == "admin"

