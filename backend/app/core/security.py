from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES  # 환경 변수 사용

# 비밀번호 해싱 설정 (bcrypt 알고리즘 사용)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 설정
ALGORITHM = "HS256"  # JWT 암호화 알고리즘

def verify_password(plain_password, hashed_password):
    """
    입력한 비밀번호와 해시된 비밀번호 비교
    
    Args:
        plain_password: 사용자가 입력한 평문 비밀번호
        hashed_password: DB에 저장된 해시된 비밀번호
        
    Returns:
        bool: 비밀번호 일치 여부
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """
    비밀번호 해싱 - 안전한 저장을 위해 사용
    
    Args:
        password: 해시할 평문 비밀번호
        
    Returns:
        str: 해시된 비밀번호
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    JWT 액세스 토큰 생성
    
    Args:
        data: 토큰에 인코딩할 데이터 (보통 사용자 식별 정보)
        expires_delta: 토큰 만료 시간 (None이면 기본값 사용)
        
    Returns:
        str: 생성된 JWT 토큰
    """
    # 원본 데이터 변경 방지를 위한 복사
    to_encode = data.copy()
    
    # 만료 시간 설정
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    # 만료 시간 추가
    to_encode.update({"exp": expire})
    
    # JWT 토큰 인코딩
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt