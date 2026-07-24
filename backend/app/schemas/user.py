from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.user import UserRole

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = UserRole.USER.value

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = UserRole.USER.value

class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
