from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.crud.users import authenticate_user, create_user
from app.schemas.users import User, UserCreate
from app.core.security import create_access_token, ALGORITHM
from app.config import SECRET_KEY  # 환경 변수에서 가져온 시크릿 키
from datetime import timedelta
from jose import JWTError, jwt

router = APIRouter()

# OAuth2 비밀번호 흐름을 위한 토큰 URL 설정
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")

@router.post("/register", response_model=User)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    새 사용자 등록 API 엔드포인트
    
    Args:
        user: 등록할 사용자 정보
        db: 데이터베이스 세션
        
    Returns:
        생성된 사용자 정보
        
    Raises:
        HTTPException: 이메일이나 사용자 이름이 이미 사용 중인 경우
    """
    # 이메일 중복 확인
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 이메일입니다"
        )
    
    # 사용자 이름 중복 확인
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 사용자 이름입니다"
        )
    
    # 사용자 생성
    return create_user(db=db, user=user)

@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    로그인하여 액세스 토큰 발급 API 엔드포인트
    
    Args:
        form_data: 로그인 양식 데이터 (username, password)
        db: 데이터베이스 세션
        
    Returns:
        dict: 액세스 토큰과 토큰 타입
        
    Raises:
        HTTPException: 인증 실패 시
    """
    # 사용자 인증
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="잘못된 사용자 이름 또는 비밀번호",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 액세스 토큰 생성
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    현재 인증된 사용자 가져오기 (의존성 함수)
    
    Args:
        token: JWT 토큰
        db: 데이터베이스 세션
        
    Returns:
        User: 인증된 사용자 정보
        
    Raises:
        HTTPException: 인증 정보가 유효하지 않은 경우
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보를 확인할 수 없습니다",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 토큰 디코딩
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # 사용자 조회
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user