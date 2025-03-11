from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 데이터베이스 URL 설정
SQLALCHEMY_DATABASE_URL = "postgresql://admin:powergen@localhost:5432/stockdashx"

# 엔진 생성
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 모델 베이스 클래스 생성
Base = declarative_base()

# DB 세션 의존성 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()