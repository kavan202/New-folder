from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Union

from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.user_service import UserService
from app.auth import create_access_token, get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return UserService.register_user(db=db, user_in=user_in)

@router.post("/register-admin", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_admin(
    user_in: UserCreate, 
    current_admin: User = Depends(get_current_admin_user), 
    db: Session = Depends(get_db)
):
    return UserService.register_admin_user(db=db, user_in=user_in)

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = UserService.authenticate_user(
        db=db, 
        username_or_email=login_data.username, 
        password=login_data.password
    )
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login/form", response_model=Token, include_in_schema=False)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = UserService.authenticate_user(
        db=db, 
        username_or_email=form_data.username, 
        password=form_data.password
    )
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
