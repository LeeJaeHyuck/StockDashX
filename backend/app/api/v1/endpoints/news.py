from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, Dict, Any
from app.services.news_service import get_market_news, get_stock_news
from app.api.v1.endpoints.auth import get_current_user
from app.db.models import User as UserModel

router = APIRouter()

@router.get("/market")
async def market_news(
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지 당 뉴스 항목 수"),
    current_user: UserModel = Depends(get_current_user)
):
    """
    시장 전반에 관한 뉴스를 가져오는 API 엔드포인트
    
    Args:
        page (int): 페이지 번호 (기본값: 1)
        page_size (int): 페이지 당 뉴스 항목 수 (기본값: 10, 최대: 100)
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        
    Returns:
        dict: 뉴스 데이터 (articles, totalResults 포함)
    """
    try:
        # 뉴스 서비스를 통해 시장 뉴스 가져오기
        news_data = await get_market_news(page, page_size)
        return news_data
    except HTTPException as e:
        # 이미 HTTPException인 경우 그대로 전달
        raise e
    except Exception as e:
        # 기타 예외를 HTTPException으로 변환
        raise HTTPException(status_code=500, detail=f"뉴스 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/stock/{symbol}")
async def stock_news(
    symbol: str,
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지 당 뉴스 항목 수"),
    current_user: UserModel = Depends(get_current_user)
):
    """
    특정 주식에 관한 뉴스를 가져오는 API 엔드포인트
    
    Args:
        symbol (str): 주식 심볼 (예: AAPL, MSFT)
        page (int): 페이지 번호 (기본값: 1)
        page_size (int): 페이지 당 뉴스 항목 수 (기본값: 10, 최대: 100)
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        
    Returns:
        dict: 뉴스 데이터 (symbol, companyName, articles, totalResults 포함)
    """
    try:
        # 심볼을 대문자로 변환 (일관성을 위해)
        symbol = symbol.upper()
        
        # 뉴스 서비스를 통해 주식 관련 뉴스 가져오기
        news_data = await get_stock_news(symbol, page, page_size)
        return news_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"뉴스 조회 중 오류가 발생했습니다: {str(e)}")