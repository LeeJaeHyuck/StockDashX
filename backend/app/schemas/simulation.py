from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# 모의 투자 계좌 기본 모델
class SimulationAccountBase(BaseModel):
    """
    모의 투자 계좌 기본 정보 스키마
    
    모든 모의 투자 계좌 관련 스키마의 기본이 되는 공통 필드를 정의합니다.
    """
    name: str
    initial_balance: Optional[float] = 100000.00  # 기본 초기 자금 $100,000

# 모의 투자 계좌 생성 요청 모델
class SimulationAccountCreate(SimulationAccountBase):
    """
    모의 투자 계좌 생성 요청 스키마
    
    모의 투자 계좌를 생성할 때 필요한 정보를 정의합니다.
    """
    pass

# 모의 투자 계좌 응답 모델
class SimulationAccount(SimulationAccountBase):
    """
    모의 투자 계좌 응답 스키마
    
    데이터베이스에서 가져온 모의 투자 계좌 정보를 클라이언트에 반환할 때 사용합니다.
    """
    id: int
    user_id: int
    current_balance: float
    created_at: datetime
    
    class Config:
        orm_mode = True

# 모의 투자 거래 내역 기본 모델
class SimulationTransactionBase(BaseModel):
    """
    모의 투자 거래 내역 기본 정보 스키마
    
    모든 모의 투자 거래 내역 관련 스키마의 기본이 되는 공통 필드를 정의합니다.
    """
    transaction_type: str  # "BUY" or "SELL"
    quantity: int
    price: float
    
    @validator('transaction_type')
    def check_transaction_type(cls, v):
        if v not in ["BUY", "SELL"]:
            raise ValueError('거래 유형은 "BUY" 또는 "SELL"이어야 합니다.')
        return v

    @validator('quantity')
    def check_quantity(cls, v):
        if v <= 0:
            raise ValueError('수량은 0보다 커야 합니다.')
        return v

    @validator('price')
    def check_price(cls, v):
        if v <= 0:
            raise ValueError('가격은 0보다 커야 합니다.')
        return v

# 모의 투자 거래 내역 생성 요청 모델
class SimulationTransactionCreate(SimulationTransactionBase):
    """
    모의 투자 거래 내역 생성 요청 스키마
    
    모의 투자 거래 내역을 생성할 때 필요한 정보를 정의합니다.
    """
    account_id: int
    symbol: str  # 주식 심볼

# 모의 투자 거래 내역 응답 모델
class SimulationTransaction(SimulationTransactionBase):
    """
    모의 투자 거래 내역 응답 스키마
    
    데이터베이스에서 가져온 모의 투자 거래 내역 정보를 클라이언트에 반환할 때 사용합니다.
    """
    id: int
    account_id: int
    stock_id: int
    total_amount: float
    transaction_date: datetime
    
    class Config:
        orm_mode = True

# 모의 투자 계좌 상세 정보 모델
class SimulationAccountDetail(SimulationAccount):
    """
    모의 투자 계좌 상세 정보 스키마
    
    모의 투자 계좌의 기본 정보와 함께 보유 주식 및 성과 정보를 포함합니다.
    """
    holdings: List[Dict[str, Any]]
    performance: Dict[str, Any]

# 모의 투자 홀딩 정보 모델
class SimulationHolding(BaseModel):
    """
    모의 투자 보유 주식 정보 스키마
    
    모의 투자 계좌에서 보유 중인 주식의 상세 정보를 정의합니다.
    """
    symbol: str
    name: str
    quantity: int
    avg_price: float
    current_price: float
    total_cost: float
    current_value: float
    profit_loss: float
    profit_loss_percent: float