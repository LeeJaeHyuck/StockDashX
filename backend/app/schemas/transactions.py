from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# 기본 거래 내역 모델
class TransactionBase(BaseModel):
    """
    거래 내역 기본 정보 스키마
    
    모든 거래 내역 관련 스키마의 기본이 되는 공통 필드를 정의합니다.
    """
    transaction_type: str  # "BUY" or "SELL"
    quantity: int
    price: float

# 거래 내역 생성 시 필요한 정보
class TransactionCreate(TransactionBase):
    """
    거래 내역 생성 요청 스키마
    
    거래 내역을 생성할 때 필요한 정보를 정의합니다.
    """
    portfolio_id: int
    symbol: str  # 주식 심볼

# DB에서 가져온 거래 내역 정보
class Transaction(TransactionBase):
    """
    거래 내역 응답 스키마
    
    데이터베이스에서 가져온 거래 내역 정보를 클라이언트에 반환할 때 사용합니다.
    """
    id: int
    portfolio_id: int
    stock_id: int
    transaction_date: datetime
    
    class Config:
        orm_mode = True

# 거래 내역 상세 정보 (주식 정보 포함)
class TransactionDetail(Transaction):
    """
    거래 내역 상세 정보 스키마
    
    거래 내역의 기본 정보와 관련 주식 정보를 함께 포함합니다.
    """
    stock_symbol: str
    stock_name: str
    total_amount: float