import pytest
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse

def test_user_creation(db_session):
    user = User(
        username="testdriver",
        email="testdriver@example.com",
        hashed_password="secret_hashed_pw",
        role=UserRole.USER.value
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert user.username == "testdriver"
    assert user.email == "testdriver@example.com"
    assert user.role == "user"
    assert user.created_at is not None

def test_admin_user_role(db_session):
    admin = User(
        username="adminuser",
        email="admin@example.com",
        hashed_password="admin_hashed_pw",
        role=UserRole.ADMIN.value
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)

    assert admin.role == "admin"

def test_user_schema_validation():
    user_data = {
        "username": "johndoe",
        "email": "johndoe@example.com",
        "password": "securepassword123"
    }
    schema = UserCreate(**user_data)
    assert schema.username == "johndoe"
    assert schema.email == "johndoe@example.com"
    assert schema.role == "user"
