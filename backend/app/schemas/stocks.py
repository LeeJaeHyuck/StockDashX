from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# 기본 주식 모델
class StockBase(BaseModel):
    symbol: str
    name: str

# 주식 생성 시 필요한 정보
class StockCreate(StockBase):
    pass

# 주식 정보 업데이트
class StockUpdate(BaseModel):
    name: Optional[str] = None
    last_price: Optional[float] = None
    change_percent: Optional[float] = None

# DB에서 가져온 주식 정보
class Stock(StockBase):
    id: int
    last_price: Optional[float] = None
    change_percent: Optional[float] = None
    updated_at: datetime
    
    class Config:
        orm_mode = True