from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# 기본 포트폴리오 모델
class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None

# 포트폴리오 생성 시 필요한 정보
class PortfolioCreate(PortfolioBase):
    pass

# 포트폴리오 정보 업데이트
class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# DB에서 가져온 포트폴리오 정보
class Portfolio(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True