from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import Portfolio as PortfolioModel, Transaction as TransactionModel, Stock as StockModel, User as UserModel
from app.schemas.portfolios import Portfolio as PortfolioSchema, PortfolioCreate, PortfolioUpdate, PortfolioDetail
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=PortfolioSchema)
def create_portfolio(
    portfolio: PortfolioCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    새 포트폴리오 생성 API 엔드포인트
    
    Args:
        portfolio (PortfolioCreate): 생성할 포트폴리오 정보
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        PortfolioSchema: 생성된 포트폴리오 정보
        
    Raises:
        HTTPException: 이미 동일한 이름의 포트폴리오가 있는 경우
    """
    # 동일 이름의 포트폴리오가 이미 있는지 확인
    existing = db.query(PortfolioModel).filter(
        PortfolioModel.user_id == current_user.id,
        PortfolioModel.name == portfolio.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 동일한 이름의 포트폴리오가 있습니다."
        )
    
    # 새 포트폴리오 생성
    db_portfolio = PortfolioModel(
        user_id=current_user.id,
        name=portfolio.name,
        description=portfolio.description
    )
    
    # 데이터베이스에 저장
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    
    return db_portfolio

@router.get("/", response_model=List[PortfolioSchema])
def get_portfolios(
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    사용자의 포트폴리오 목록 조회 API 엔드포인트
    
    Args:
        skip (int): 건너뛸 항목 수
        limit (int): 최대 항목 수
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        List[PortfolioSchema]: 포트폴리오 목록
    """
    # 현재 사용자의 포트폴리오 목록 조회
    portfolios = db.query(PortfolioModel).filter(
        PortfolioModel.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return portfolios

@router.get("/{portfolio_id}", response_model=PortfolioDetail)
def get_portfolio(
    portfolio_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    특정 포트폴리오 상세 정보 조회 API 엔드포인트
    
    Args:
        portfolio_id (int): 조회할 포트폴리오 ID
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        PortfolioDetail: 포트폴리오 상세 정보 (보유 주식 포함)
        
    Raises:
        HTTPException: 포트폴리오가 없거나 접근 권한이 없는 경우
    """
    # 포트폴리오 조회
    portfolio = db.query(PortfolioModel).filter(PortfolioModel.id == portfolio_id).first()
    
    # 포트폴리오가 없으면 404 에러
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="포트폴리오를 찾을 수 없습니다."
        )
    
    # 현재 사용자의 포트폴리오가 아니면 403 에러
    if portfolio.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 포트폴리오에 접근할 권한이 없습니다."
        )
    
    # 포트폴리오에 속한 모든 거래 내역 조회
    transactions = db.query(TransactionModel).filter(
        TransactionModel.portfolio_id == portfolio_id
    ).all()
    
    # 보유 주식 계산
    holdings = {}
    total_investment = 0
    current_value = 0
    
    for transaction in transactions:
        symbol = transaction.stock.symbol
        
        # 매수/매도에 따라 계산
        if transaction.transaction_type == "BUY":
            if symbol not in holdings:
                holdings[symbol] = {
                    "symbol": symbol,
                    "name": transaction.stock.name,
                    "quantity": 0,
                    "avg_price": 0,
                    "current_price": float(transaction.stock.last_price) if transaction.stock.last_price else 0,
                    "total_cost": 0,
                    "current_value": 0,
                    "profit_loss": 0,
                    "profit_loss_percent": 0
                }
            
            # 평균 단가 계산
            total_quantity = holdings[symbol]["quantity"] + transaction.quantity
            total_cost = holdings[symbol]["total_cost"] + (transaction.quantity * float(transaction.price))
            
            holdings[symbol]["quantity"] = total_quantity
            holdings[symbol]["total_cost"] = total_cost
            
            if total_quantity > 0:
                holdings[symbol]["avg_price"] = total_cost / total_quantity
        
        elif transaction.transaction_type == "SELL":
            if symbol in holdings:
                # 매도 시 수량 감소
                holdings[symbol]["quantity"] -= transaction.quantity
                
                # 매도 금액 계산 (FIFO 방식 단순화)
                sell_value = transaction.quantity * float(transaction.price)
                buy_value = transaction.quantity * holdings[symbol]["avg_price"]
                
                # 매도 이익/손실 반영
                holdings[symbol]["total_cost"] -= buy_value
    
    # 현재 가치 및 수익/손실 계산
    holdings_list = []
    
    for symbol, holding in holdings.items():
        if holding["quantity"] > 0:
            holding["current_value"] = holding["quantity"] * holding["current_price"]
            holding["profit_loss"] = holding["current_value"] - holding["total_cost"]
            
            if holding["total_cost"] > 0:
                holding["profit_loss_percent"] = (holding["profit_loss"] / holding["total_cost"]) * 100
            
            total_investment += holding["total_cost"]
            current_value += holding["current_value"]
            
            holdings_list.append(holding)
    
    # 포트폴리오 성과 계산
    portfolio_performance = {
        "total_investment": total_investment,
        "current_value": current_value,
        "profit_loss": current_value - total_investment,
        "profit_loss_percent": ((current_value - total_investment) / total_investment * 100) if total_investment > 0 else 0,
        "holdings": holdings_list
    }
    
    # 포트폴리오 상세 정보 반환
    return {
        "id": portfolio.id,
        "name": portfolio.name,
        "description": portfolio.description,
        "created_at": portfolio.created_at,
        "performance": portfolio_performance
    }

@router.put("/{portfolio_id}", response_model=PortfolioSchema)
def update_portfolio(
    portfolio_id: int,
    portfolio: PortfolioUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    포트폴리오 정보 업데이트 API 엔드포인트
    
    Args:
        portfolio_id (int): 업데이트할 포트폴리오 ID
        portfolio (PortfolioUpdate): 업데이트할 포트폴리오 정보
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        PortfolioSchema: 업데이트된 포트폴리오 정보
        
    Raises:
        HTTPException: 포트폴리오가 없거나 접근 권한이 없는 경우
    """
    # 포트폴리오 조회
    db_portfolio = db.query(PortfolioModel).filter(PortfolioModel.id == portfolio_id).first()
    
    # 포트폴리오가 없으면 404 에러
    if not db_portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="포트폴리오를 찾을 수 없습니다."
        )
    
    # 현재 사용자의 포트폴리오가 아니면 403 에러
    if db_portfolio.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 포트폴리오에 접근할 권한이 없습니다."
        )
    
    # 이름 변경 시 중복 확인
    if portfolio.name and portfolio.name != db_portfolio.name:
        existing = db.query(PortfolioModel).filter(
            PortfolioModel.user_id == current_user.id,
            PortfolioModel.name == portfolio.name
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 동일한 이름의 포트폴리오가 있습니다."
            )
    
    # 포트폴리오 정보 업데이트
    if portfolio.name is not None:
        db_portfolio.name = portfolio.name
        
    if portfolio.description is not None:
        db_portfolio.description = portfolio.description
    
    # 변경사항 저장
    db.commit()
    db.refresh(db_portfolio)
    
    return db_portfolio

@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(
    portfolio_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    포트폴리오 삭제 API 엔드포인트
    
    Args:
        portfolio_id (int): 삭제할 포트폴리오 ID
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        None
        
    Raises:
        HTTPException: 포트폴리오가 없거나 접근 권한이 없는 경우
    """
    # 포트폴리오 조회
    db_portfolio = db.query(PortfolioModel).filter(PortfolioModel.id == portfolio_id).first()
    
    # 포트폴리오가 없으면 404 에러
    if not db_portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="포트폴리오를 찾을 수 없습니다."
        )
    
    # 현재 사용자의 포트폴리오가 아니면 403 에러
    if db_portfolio.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 포트폴리오에 접근할 권한이 없습니다."
        )
    
    # 포트폴리오 삭제 (관련 거래 내역도 cascade로 함께 삭제됨)
    db.delete(db_portfolio)
    db.commit()