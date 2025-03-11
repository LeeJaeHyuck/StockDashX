from sqlalchemy.orm import Session
from app.db.models import User
from app.schemas.users import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password

def get_user(db: Session, user_id: int):
    """사용자 ID로 사용자 조회"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """이메일로 사용자 조회"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    """사용자 이름으로 사용자 조회"""
    return db.query(User).filter(User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """사용자 목록 조회"""
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    """새 사용자 생성"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: UserUpdate):
    """사용자 정보 업데이트"""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    update_data = user.dict(exclude_unset=True)
    
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    """사용자 삭제"""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    db.delete(db_user)
    db.commit()
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    """사용자 인증"""
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user