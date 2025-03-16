from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import Stock as StockModel
from app.schemas.stocks import Stock as StockSchema, StockCreate, StockUpdate
from app.services.stock_data import get_stock_quote, search_stocks, get_historical_data, update_stock_db
from app.api.v1.endpoints.auth import get_current_user
from datetime import datetime


router = APIRouter()

@router.get("/search", response_model=List[dict])
async def search_stock(
    query: str = Query(..., description="검색어 (주식 심볼 또는 회사명)"),
    current_user = Depends(get_current_user)
):
    """
    주식 검색 API 엔드포인트
    
    검색어를 기반으로 주식을 검색합니다.
    
    Args:
        query (str): 검색어
        current_user: 인증된 사용자 (의존성 주입)
        
    Returns:
        List[dict]: 검색 결과 목록
    """
    # 외부 API를 통해 주식 검색
    return await search_stocks(query)

@router.get("/quote/{symbol}", response_model=dict)
async def get_stock_quote_endpoint(
    symbol: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    주식 시세 조회 API 엔드포인트
    
    특정 주식의 실시간 시세 데이터를 가져옵니다.
    
    Args:
        symbol (str): 주식 심볼
        current_user: 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        dict: 주식 시세 데이터
    """
    
    # 외부 API를 통해 주식 시세 가져오기
    quote_data = await get_stock_quote(symbol)
    
    # 데이터베이스에 주식 정보 업데이트
    update_stock_db(db, quote_data)
    
    return quote_data

# @router.get("/quote/{symbol}", response_model=dict)
# async def get_stock_quote_endpoint(
#     symbol: str,
#     current_user = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     # 먼저 데이터베이스에서 주식 정보 조회
#     db_stock = db.query(StockModel).filter(StockModel.symbol == symbol).first()
    
#     # 데이터베이스에 있고, 최근에 업데이트된 경우 (예: 5분 이내)
#     if db_stock:
#         # 데이터베이스 정보 반환
        
#         return {
#             "symbol": db_stock.symbol,
#             # "name": db_stock.name,
#             "price": float(db_stock.last_price),
#             # "change": float(quote_data.get("09. change", 0)),
#             "change": 0,
#             "change_percent": float(db_stock.change_percent),
#             "volume": 0,  # 데이터베이스에 저장되지 않은 정보는 기본값 사용
#             "latest_trading_day": "",
#             "previous_close": 0,
#             "timestamp": db_stock.updated_at.isoformat()
#         }
    
#     try:
#         # 데이터베이스에 없거나 오래된 경우 외부 API 호출
#         quote_data = await get_stock_quote(symbol)
        
#         # 데이터베이스 업데이트
#         update_stock_db(db, quote_data)
        
#         return quote_data
#     except Exception as e:
#         # API 호출 실패 시, 데이터베이스에 있는 정보라도 반환
#         if db_stock:
#             return {
#                 "symbol": db_stock.symbol,
#                 "name": db_stock.name,
#                 "price": float(db_stock.last_price),
#                 "change_percent": float(db_stock.change_percent),
#                 "volume": 0,
#                 "latest_trading_day": "",
#                 "previous_close": 0,
#                 "timestamp": db_stock.updated_at.isoformat()
#             }
#         # 완전히 실패한 경우 에러 발생
#         raise HTTPException(status_code=503, detail=f"주식 정보를 가져오지 못했습니다: {str(e)}")

@router.get("/history/{symbol}", response_model=dict)
async def get_stock_history(
    symbol: str,
    interval: str = Query("daily", description="데이터 간격 (daily, weekly, monthly)"),
    current_user = Depends(get_current_user)
):
    """
    주식 과거 데이터 조회 API 엔드포인트
    
    특정 주식의 과거 가격 데이터를 가져옵니다.
    
    Args:
        symbol (str): 주식 심볼
        interval (str): 데이터 간격
        current_user: 인증된 사용자 (의존성 주입)
        
    Returns:
        dict: 과거 주가 데이터
    """
    # 외부 API를 통해 과거 데이터 가져오기
    return await get_historical_data(symbol, interval)

@router.get("/", response_model=List[StockSchema])
def get_stocks(
    skip: int = 0, 
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    저장된 주식 목록 조회 API 엔드포인트
    
    데이터베이스에 저장된 주식 목록을 가져옵니다.
    
    Args:
        skip (int): 건너뛸 항목 수
        limit (int): 최대 항목 수
        current_user: 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        List[StockSchema]: 주식 목록
    """
    # 데이터베이스에서 주식 목록 조회
    stocks = db.query(StockModel).offset(skip).limit(limit).all()
    return stocks