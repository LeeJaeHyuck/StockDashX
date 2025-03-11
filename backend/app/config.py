import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 기본 설정
DEBUG = os.getenv("DEBUG", "False") == "True"
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# 데이터베이스 설정
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "stockdashx_db")
DB_USER = os.getenv("DB_USER", "stockdashx")
DB_PASSWORD = os.getenv("DB_PASSWORD", "stockdashx")

# 데이터베이스 URL 생성
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# 보안 설정
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_change_in_production")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# API 키
STOCK_API_KEY = os.getenv("STOCK_API_KEY", "")
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")