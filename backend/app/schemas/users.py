from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime

# 기본 사용자 모델
class UserBase(BaseModel):
    email: EmailStr
    username: str

# 사용자 생성 시 필요한 정보
class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_must_be_valid(cls, v):
        if len(v) < 8:
            raise ValueError('비밀번호는 최소 8자 이상이어야 합니다')
        return v

# 사용자 정보 업데이트
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

# DB에서 가져온 사용자 정보
class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True