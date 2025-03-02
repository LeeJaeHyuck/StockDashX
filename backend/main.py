from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List, Optional
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

app = FastAPI(title="주식 관리 대시보드 API")

# CORS 설정
origins = [
    "http://localhost",
    "http://localhost:3000",  # React 기본 포트
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 기본 모델 정의
class StockBase(BaseModel):
    symbol: str
    name: str

class StockPrice(StockBase):
    current_price: float
    change_percent: float
    last_updated: str

# 라우트 정의
@app.get("/")
async def root():
    return {"message": "주식 관리 대시보드 API에 오신 것을 환영합니다!"}

@app.get("/api/stocks", response_model=List[StockBase])
async def get_stocks():
    # 여기서는 샘플 데이터 반환
    return [
        {"symbol": "AAPL", "name": "Apple Inc."},
        {"symbol": "MSFT", "name": "Microsoft Corporation"},
        {"symbol": "GOOGL", "name": "Alphabet Inc."}
    ]

@app.get("/api/stock/{symbol}", response_model=StockPrice)
async def get_stock_price(symbol: str):
    # 실제로는 여기서 외부 API 호출하여 주식 데이터 가져오기
    # 지금은 샘플 데이터 반환
    return {
        "symbol": symbol,
        "name": f"{symbol} Corporation",
        "current_price": 150.25,
        "change_percent": 2.5,
        "last_updated": "2025-03-02T12:00:00Z"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
