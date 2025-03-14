from fastapi import APIRouter
from app.api.v1.endpoints import auth, stocks, portfolios, transactions, simulation, news

api_router = APIRouter()

# 인증 엔드포인트 등록
api_router.include_router(auth.router, prefix="/auth", tags=["인증"])

# 주식 데이터 엔드포인트 등록
api_router.include_router(stocks.router, prefix="/stocks", tags=["주식 데이터"])

# 포트폴리오 엔드포인트 등록
api_router.include_router(portfolios.router, prefix="/portfolios", tags=["포트폴리오"])

# 거래 내역 엔드포인트 등록
api_router.include_router(transactions.router, prefix="/transactions", tags=["거래 내역"])

# 모의 투자 엔드포인트 등록
api_router.include_router(simulation.router, prefix="/simulation", tags=["모의 투자"])

# 뉴스 엔드포인트 등록
api_router.include_router(news.router, prefix="/news", tags=["뉴스"])