import httpx
import asyncio
from fastapi import HTTPException
from datetime import datetime, timedelta
from app.config import STOCK_API_KEY
from app.db.models import Stock
from sqlalchemy.orm import Session

# Alpha Vantage API 기본 URL
ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

# 캐시 설정 (메모리 캐시 - 실제 프로덕션에서는 Redis 등 사용 권장)
CACHE = {}
CACHE_TTL = 60  # 캐시 유효 시간(초)

async def get_stock_quote(symbol: str):
    """
    특정 주식의 실시간 시세 데이터를 가져옵니다.
    
    Args:
        symbol (str): 주식 심볼 (예: AAPL, MSFT)
        
    Returns:
        dict: 주식 시세 데이터
        
    Raises:
        HTTPException: API 요청 실패 시
    """
    # 캐시 확인
    cache_key = f"quote_{symbol}"
    now = datetime.now()
    
    if cache_key in CACHE:
        cache_time, cache_data = CACHE[cache_key]
        # 캐시가 유효하면 캐시된 데이터 반환
        if now - cache_time < timedelta(seconds=CACHE_TTL):
            return cache_data
    
    try:
        # API 요청 매개변수
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": STOCK_API_KEY
        }
        
        # 비동기 HTTP 클라이언트로 API 요청
        async with httpx.AsyncClient() as client:
            response = await client.get(ALPHA_VANTAGE_BASE_URL, params=params)
            response.raise_for_status()  # HTTP 오류 확인
            data = response.json()
        
        # API 응답 확인
        if "Global Quote" not in data or not data["Global Quote"]:
            raise HTTPException(status_code=404, detail=f"주식 {symbol}에 대한 데이터를 찾을 수 없습니다.")
        
        # 응답 데이터 정제
        quote_data = data["Global Quote"]
        result = {
            "symbol": symbol,
            "price": float(quote_data.get("05. price", 0)),
            "change": float(quote_data.get("09. change", 0)),
            "change_percent": float(quote_data.get("10. change percent", "0%").replace("%", "")),
            "volume": int(quote_data.get("06. volume", 0)),
            "latest_trading_day": quote_data.get("07. latest trading day", ""),
            "previous_close": float(quote_data.get("08. previous close", 0)),
            "timestamp": now.isoformat()
        }
        
        # 결과 캐싱
        CACHE[cache_key] = (now, result)
        
        return result
        
    except httpx.HTTPError as e:
        # HTTP 요청 오류 처리
        raise HTTPException(status_code=503, detail=f"외부 API 요청 실패: {str(e)}")
    except (KeyError, ValueError) as e:
        # 데이터 파싱 오류 처리
        raise HTTPException(status_code=500, detail=f"데이터 파싱 오류: {str(e)}")

async def search_stocks(query: str):
    """
    주식 심볼 또는 회사명으로 주식 검색
    
    Args:
        query (str): 검색어
        
    Returns:
        list: 검색 결과 목록
    """
    # 캐시 확인
    cache_key = f"search_{query}"
    now = datetime.now()
    
    if cache_key in CACHE:
        cache_time, cache_data = CACHE[cache_key]
        if now - cache_time < timedelta(seconds=CACHE_TTL):
            return cache_data
    
    try:
        # API 요청 매개변수
        params = {
            "function": "SYMBOL_SEARCH",
            "keywords": query,
            "apikey": STOCK_API_KEY
        }
        
        # API 요청
        async with httpx.AsyncClient() as client:
            response = await client.get(ALPHA_VANTAGE_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
        
        # 결과 확인
        if "bestMatches" not in data:
            return []
        
        # 검색 결과 정제
        results = []
        for match in data["bestMatches"]:
            results.append({
                "symbol": match.get("1. symbol", ""),
                "name": match.get("2. name", ""),
                "type": match.get("3. type", ""),
                "region": match.get("4. region", ""),
                "currency": match.get("8. currency", ""),
            })
        
        # 결과 캐싱
        CACHE[cache_key] = (now, results)
        
        return results
        
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"외부 API 요청 실패: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"검색 중 오류 발생: {str(e)}")

async def get_historical_data(symbol: str, interval: str = "daily"):
    """
    특정 주식의 과거 데이터를 가져옵니다.
    
    Args:
        symbol (str): 주식 심볼
        interval (str): 데이터 간격 ('daily', 'weekly', 'monthly')
        
    Returns:
        dict: 과거 주가 데이터
    """
    # 캐시 확인
    cache_key = f"history_{symbol}_{interval}"
    now = datetime.now()
    
    if cache_key in CACHE:
        cache_time, cache_data = CACHE[cache_key]
        if now - cache_time < timedelta(seconds=CACHE_TTL):
            return cache_data
    
    # API 함수 매핑
    function_map = {
        "daily": "TIME_SERIES_DAILY",
        "weekly": "TIME_SERIES_WEEKLY",
        "monthly": "TIME_SERIES_MONTHLY"
    }
    
    if interval not in function_map:
        raise HTTPException(status_code=400, detail=f"유효하지 않은 간격: {interval}")
    
    try:
        # API 요청 매개변수
        params = {
            "function": function_map[interval],
            "symbol": symbol,
            "apikey": STOCK_API_KEY,
            "outputsize": "compact"  # 최근 100개 데이터만
        }
        
        # API 요청
        async with httpx.AsyncClient() as client:
            response = await client.get(ALPHA_VANTAGE_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
        
        # 응답 확인
        time_series_key = f"Time Series ({interval.capitalize()})"
        if time_series_key not in data:
            time_series_key = list(filter(lambda x: "Time Series" in x, data.keys()))
            if not time_series_key:
                raise HTTPException(status_code=404, detail=f"주식 {symbol}에 대한 과거 데이터를 찾을 수 없습니다.")
            time_series_key = time_series_key[0]
        
        # 데이터 정제
        historical_data = []
        for date, values in data[time_series_key].items():
            historical_data.append({
                "date": date,
                "open": float(values.get("1. open", 0)),
                "high": float(values.get("2. high", 0)),
                "low": float(values.get("3. low", 0)),
                "close": float(values.get("4. close", 0)),
                "volume": int(values.get("5. volume", 0))
            })
        
        # 날짜 기준 정렬
        historical_data.sort(key=lambda x: x["date"])
        
        result = {
            "symbol": symbol,
            "interval": interval,
            "data": historical_data
        }
        
        # 결과 캐싱
        CACHE[cache_key] = (now, result)
        
        return result
        
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"외부 API 요청 실패: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"과거 데이터 가져오기 실패: {str(e)}")

def update_stock_db(db: Session, stock_data: dict):
    """
    주식 데이터를 데이터베이스에 업데이트합니다.
    
    Args:
        db (Session): 데이터베이스 세션
        stock_data (dict): 주식 데이터
        
    Returns:
        Stock: 업데이트된 주식 객체
    """
    # 주식 객체 검색 또는 생성
    db_stock = db.query(Stock).filter(Stock.symbol == stock_data["symbol"]).first()
    
    if not db_stock:
        # 새 주식 생성
        db_stock = Stock(
            symbol=stock_data["symbol"],
            name=stock_data.get("name", stock_data["symbol"]),
            last_price=stock_data["price"],
            change_percent=stock_data["change_percent"]
        )
        db.add(db_stock)
    else:
        # 기존 주식 업데이트
        db_stock.last_price = stock_data["price"]
        db_stock.change_percent = stock_data["change_percent"]
    
    # 변경사항 저장
    db.commit()
    db.refresh(db_stock)
    
    return db_stock