from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import JWTError, jwt

# 필요한 모듈과 클래스 임포트
from app.db.database import get_db  # 데이터베이스 세션 가져오는 함수
from app.db.models import User as UserModel  # SQLAlchemy 모델 (DB 쿼리용)
from app.schemas.users import User as UserSchema  # Pydantic 모델 (응답 모델용)
from app.schemas.users import UserCreate  # Pydantic 모델 (요청 모델용)
from app.core.security import create_access_token, verify_password, get_password_hash, ALGORITHM
from app.config import SECRET_KEY

# API 라우터 생성
router = APIRouter()

# OAuth2 인증 스키마 설정 (토큰 URL 지정)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")

def create_user(db: Session, user: UserCreate):
    """
    새 사용자 생성 함수
    
    Args:
        db (Session): 데이터베이스 세션
        user (UserCreate): 생성할 사용자 정보 (Pydantic 모델)
        
    Returns:
        UserModel: 생성된 사용자 객체 (SQLAlchemy 모델)
    """
    # 비밀번호 해싱 (평문 저장 방지)
    hashed_password = get_password_hash(user.password)
    
    # SQLAlchemy 모델 인스턴스 생성
    db_user = UserModel(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    
    # 데이터베이스에 사용자 추가
    db.add(db_user)
    # 변경사항 커밋
    db.commit()
    # 생성된 ID 등의 정보를 얻기 위해 새로고침
    db.refresh(db_user)
    
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    """
    사용자 인증 함수
    
    Args:
        db (Session): 데이터베이스 세션
        username (str): 로그인 시도하는 사용자 이름
        password (str): 로그인 시도하는 비밀번호
        
    Returns:
        UserModel 또는 False: 인증 성공 시 사용자 객체, 실패 시 False
    """
    # 사용자 이름으로 사용자 검색
    user = db.query(UserModel).filter(UserModel.username == username).first()
    
    # 사용자가 존재하지 않으면 인증 실패
    if not user:
        return False
    
    # 비밀번호 검증 (해시된 비밀번호와 입력된 비밀번호 비교)
    if not verify_password(password, user.hashed_password):
        return False
    
    # 인증 성공
    return user

@router.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    새 사용자 등록 API 엔드포인트
    
    Args:
        user (UserCreate): 등록할 사용자 정보 (요청 본문)
        db (Session, optional): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        UserSchema: 생성된 사용자 정보 (응답 모델)
        
    Raises:
        HTTPException: 이메일이나 사용자 이름이 이미 사용 중인 경우
    """
    # 이메일 중복 확인 - SQLAlchemy 모델 사용
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 이메일입니다"
        )
    
    # 사용자 이름 중복 확인 - SQLAlchemy 모델 사용
    db_user = db.query(UserModel).filter(UserModel.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 사용자 이름입니다"
        )
    
    # 사용자 생성 및 반환
    return create_user(db=db, user=user)

@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    로그인하여 액세스 토큰 발급 API 엔드포인트
    
    Args:
        form_data (OAuth2PasswordRequestForm, optional): 로그인 양식 데이터 (의존성 주입)
        db (Session, optional): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        dict: 액세스 토큰과 토큰 타입
        
    Raises:
        HTTPException: 인증 실패 시
    """
    # 사용자 인증 시도
    user = authenticate_user(db, form_data.username, form_data.password)
    print(user)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="잘못된 사용자 이름 또는 비밀번호",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 액세스 토큰 생성 (30분 유효)
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username},  # 토큰에 사용자 이름 저장
        expires_delta=access_token_expires
    )
    
    # 토큰 반환
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    현재 인증된 사용자 가져오기 (보호된 엔드포인트를 위한 의존성 함수)
    
    Args:
        token (str, optional): JWT 토큰 (의존성 주입)
        db (Session, optional): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        UserModel: 인증된 사용자 정보
        
    Raises:
        HTTPException: 인증 정보가 유효하지 않은 경우
    """
    # 인증 실패 시 발생할 예외 정의
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보를 확인할 수 없습니다",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # JWT 토큰 디코딩
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")  # 토큰에서 사용자 이름 추출
        
        # 사용자 이름이 없으면 인증 실패
        if username is None:
            raise credentials_exception
    except JWTError:
        # 토큰 디코딩 실패 시 인증 실패
        raise credentials_exception
    
    # 데이터베이스에서 사용자 조회
    user = db.query(UserModel).filter(UserModel.username == username).first()
    
    # 사용자가 없으면 인증 실패
    if user is None:
        raise credentials_exception
        
    return user