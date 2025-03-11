from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL  # 환경 변수에서 가져온 DB URL 사용

# SQLAlchemy 엔진 생성 (데이터베이스 연결)
engine = create_engine(DATABASE_URL)

# 세션 팩토리 생성 (DB 세션을 만들기 위한 클래스)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLAlchemy 모델의 기본 클래스
Base = declarative_base()

# DB 세션 의존성 함수 (FastAPI 엔드포인트에서 사용)
def get_db():
    # 요청마다 새로운 DB 세션 생성
    db = SessionLocal()
    try:
        # 세션을 요청 처리에 사용
        yield db
    finally:
        # 요청 처리 후 세션 닫기
        db.close()