from fastapi import APIRouter
from app.api.v1.endpoints import auth

api_router = APIRouter()

# 인증 엔드포인트 등록
api_router.include_router(auth.router, prefix="/auth", tags=["인증"])