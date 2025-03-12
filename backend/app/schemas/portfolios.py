from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# 기본 포트폴리오 모델
class PortfolioBase(BaseModel):
    """
    포트폴리오 기본 정보 스키마
    
    모든 포트폴리오 관련 스키마의 기본이 되는 공통 필드를 정의합니다.
    """
    name: str
    description: Optional[str] = None

# 포트폴리오 생성 시 필요한 정보
class PortfolioCreate(PortfolioBase):
    """
    포트폴리오 생성 요청 스키마
    
    포트폴리오를 생성할 때 필요한 정보를 정의합니다.
    """
    pass

# 포트폴리오 정보 업데이트
class PortfolioUpdate(BaseModel):
    """
    포트폴리오 업데이트 요청 스키마
    
    포트폴리오 정보를 업데이트할 때 사용되는 필드를 정의합니다.
    모든 필드는 선택적이므로 부분 업데이트가 가능합니다.
    """
    name: Optional[str] = None
    description: Optional[str] = None

# DB에서 가져온 포트폴리오 정보
class Portfolio(PortfolioBase):
    """
    포트폴리오 응답 스키마
    
    데이터베이스에서 가져온 포트폴리오 정보를 클라이언트에 반환할 때 사용합니다.
    """
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# 포트폴리오 보유 주식 정보
class StockHolding(BaseModel):
    """
    주식 보유 정보 스키마
    
    포트폴리오 내 특정 주식의 보유 정보를 정의합니다.
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

# 포트폴리오 성과 정보
class PortfolioPerformance(BaseModel):
    """
    포트폴리오 성과 정보 스키마
    
    포트폴리오의 전체 성과 및 보유 주식 목록을 정의합니다.
    """
    total_investment: float
    current_value: float
    profit_loss: float
    profit_loss_percent: float
    holdings: List[Dict[str, Any]]

# 포트폴리오 상세 정보 (보유 주식 포함)
class PortfolioDetail(BaseModel):
    """
    포트폴리오 상세 정보 스키마
    
    포트폴리오의 기본 정보와 성과 정보를 함께 포함합니다.
    """
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    performance: PortfolioPerformance