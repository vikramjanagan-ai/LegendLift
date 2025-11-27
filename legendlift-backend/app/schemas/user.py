from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


# Base Schema
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str
    role: UserRole
    profile_image: Optional[str] = None


# Schema for creating a user
class UserCreate(UserBase):
    password: str


# Schema for updating a user
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    active: Optional[bool] = None


# Schema for password update
class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str


# Schema for user response
class UserResponse(UserBase):
    id: str
    active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Schema for login
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: UserRole


# Schema for token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
