import httpx
from fastapi import HTTPException
from datetime import datetime, timedelta
from app.config import NEWS_API_KEY

# News API 기본 URL
NEWS_API_BASE_URL = "https://newsapi.org/v2"

# 캐시 설정 (메모리 캐시 - 실제 프로덕션에서는 Redis 등 사용 권장)
CACHE = {}
CACHE_TTL = 900  # 캐시 유효 시간(초) - 15분

async def get_market_news(page: int = 1, page_size: int = 10):
    """
    시장 전반에 관한 뉴스를 가져옵니다.
    
    Args:
        page (int): 페이지 번호 (기본값: 1)
        page_size (int): 페이지 당 뉴스 항목 수 (기본값: 10)
        
    Returns:
        dict: 뉴스 데이터 (articles, totalResults 포함)
        
    Raises:
        HTTPException: API 요청 실패 시
    """
    # 캐시 확인
    cache_key = f"market_news_{page}_{page_size}"
    now = datetime.now()
    
    if cache_key in CACHE:
        cache_time, cache_data = CACHE[cache_key]
        # 캐시가 유효하면 캐시된 데이터 반환
        if now - cache_time < timedelta(seconds=CACHE_TTL):
            return cache_data
    
    try:
        # API 요청 매개변수
        params = {
            "q": "stock market OR finance OR economy",  # 시장 관련 키워드 검색
            "language": "en",  # 영어 뉴스만 (언어 옵션은 필요에 따라 변경)
            "sortBy": "publishedAt",  # 최신순 정렬
            "pageSize": page_size,
            "page": page,
            "apiKey": NEWS_API_KEY
        }
        
        # API 요청
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{NEWS_API_BASE_URL}/everything", params=params)
            response.raise_for_status()  # HTTP 오류 확인
            data = response.json()
        
        # 응답 데이터 확인
        if data["status"] != "ok":
            raise HTTPException(status_code=500, detail=f"뉴스 API 오류: {data.get('message', '알 수 없는 오류')}")
        
        # 뉴스 데이터 정제
        articles = data.get("articles", [])
        processed_articles = []
        
        for article in articles:
            # 필요한 정보만 추출하고 불필요한 필드 제거
            processed_articles.append({
                "title": article.get("title", ""),
                "description": article.get("description", ""),
                "url": article.get("url", ""),
                "urlToImage": article.get("urlToImage", ""),
                "source": article.get("source", {}).get("name", ""),
                "publishedAt": article.get("publishedAt", ""),
                "content": article.get("content", "")
            })
        
        result = {
            "articles": processed_articles,
            "totalResults": data.get("totalResults", 0)
        }
        
        # 결과 캐싱
        CACHE[cache_key] = (now, result)
        
        return result
        
    except httpx.HTTPError as e:
        # HTTP 요청 오류 처리
        raise HTTPException(status_code=503, detail=f"뉴스 API 요청 실패: {str(e)}")
    except Exception as e:
        # 기타 오류 처리
        raise HTTPException(status_code=500, detail=f"뉴스 데이터 가져오기 실패: {str(e)}")

async def get_stock_news(symbol: str, page: int = 1, page_size: int = 10):
    """
    특정 주식에 관한 뉴스를 가져옵니다.
    
    Args:
        symbol (str): 주식 심볼 (예: AAPL, MSFT)
        page (int): 페이지 번호 (기본값: 1)
        page_size (int): 페이지 당 뉴스 항목 수 (기본값: 10)
        
    Returns:
        dict: 뉴스 데이터 (articles, totalResults 포함)
        
    Raises:
        HTTPException: API 요청 실패 시
    """
    # 캐시 확인
    cache_key = f"stock_news_{symbol}_{page}_{page_size}"
    now = datetime.now()
    
    if cache_key in CACHE:
        cache_time, cache_data = CACHE[cache_key]
        # 캐시가 유효하면 캐시된 데이터 반환
        if now - cache_time < timedelta(seconds=CACHE_TTL):
            return cache_data
    
    try:
        # 회사 정보 확인 (확장 가능)
        # 실제 구현에서는 데이터베이스나 외부 API를 통해 회사명을 가져올 수 있음
        company_info = {
            "AAPL": "Apple",
            "MSFT": "Microsoft",
            "GOOGL": "Google",
            "AMZN": "Amazon",
            "META": "Meta",
            "TSLA": "Tesla",
            "NVDA": "NVIDIA"
        }
        
        # 검색 키워드 설정
        company_name = company_info.get(symbol, symbol)
        search_query = f"{symbol} OR {company_name} stock"
        
        # API 요청 매개변수
        params = {
            "q": search_query,
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": page_size,
            "page": page,
            "apiKey": NEWS_API_KEY
        }
        
        # API 요청
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{NEWS_API_BASE_URL}/everything", params=params)
            response.raise_for_status()
            data = response.json()
        
        # 응답 데이터 확인
        if data["status"] != "ok":
            raise HTTPException(status_code=500, detail=f"뉴스 API 오류: {data.get('message', '알 수 없는 오류')}")
        
        # 뉴스 데이터 정제
        articles = data.get("articles", [])
        processed_articles = []
        
        for article in articles:
            processed_articles.append({
                "title": article.get("title", ""),
                "description": article.get("description", ""),
                "url": article.get("url", ""),
                "urlToImage": article.get("urlToImage", ""),
                "source": article.get("source", {}).get("name", ""),
                "publishedAt": article.get("publishedAt", ""),
                "content": article.get("content", "")
            })
        
        result = {
            "symbol": symbol,
            "companyName": company_name,
            "articles": processed_articles,
            "totalResults": data.get("totalResults", 0)
        }
        
        # 결과 캐싱
        CACHE[cache_key] = (now, result)
        
        return result
        
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"뉴스 API 요청 실패: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"뉴스 데이터 가져오기 실패: {str(e)}")