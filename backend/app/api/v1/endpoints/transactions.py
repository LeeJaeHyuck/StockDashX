from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import Transaction as TransactionModel, Portfolio as PortfolioModel, Stock as StockModel, User as UserModel
from app.schemas.transactions import Transaction as TransactionSchema, TransactionCreate
from app.api.v1.endpoints.auth import get_current_user
from app.services.stock_data import get_stock_quote

router = APIRouter()

@router.post("/", response_model=TransactionSchema)
async def create_transaction(
    transaction: TransactionCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    새 거래 내역 생성 API 엔드포인트
    
    Args:
        transaction (TransactionCreate): 생성할 거래 내역 정보
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        TransactionSchema: 생성된 거래 내역 정보
        
    Raises:
        HTTPException: 포트폴리오가 없거나 접근 권한이 없는 경우, 또는 주식이 존재하지 않는 경우
    """
    # 포트폴리오 존재 및 접근 권한 확인
    portfolio = db.query(PortfolioModel).filter(PortfolioModel.id == transaction.portfolio_id).first()
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="포트폴리오를 찾을 수 없습니다."
        )

    if portfolio.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 포트폴리오에 접근할 권한이 없습니다."
        )
    
    # 주식 존재 확인 및 필요시 생성
    stock = db.query(StockModel).filter(StockModel.symbol == transaction.symbol).first()
    
    if not stock:
        try:
            # 외부 API를 통해 주식 정보 가져오기
            stock_data = await get_stock_quote(transaction.symbol)
            
            # 주식 정보 생성
            stock = StockModel(
                symbol=transaction.symbol,
                name=stock_data.get("name", transaction.symbol),
                last_price=stock_data.get("price", 0),
                change_percent=stock_data.get("change_percent", 0)
            )
            db.add(stock)
            db.flush()  # ID 할당을 위해 flush
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"유효하지 않은 주식 심볼입니다: {str(e)}"
            )
    
    # 판매 거래인 경우 보유 수량 확인
    if transaction.transaction_type == "SELL":
        # 포트폴리오의 모든 거래 내역 가져오기
        all_transactions = db.query(TransactionModel).filter(
            TransactionModel.portfolio_id == portfolio.id,
            TransactionModel.stock_id == stock.id
        ).all()
        
        # 현재 보유 수량 계산
        current_quantity = 0
        for t in all_transactions:
            if t.transaction_type == "BUY":
                current_quantity += t.quantity
            elif t.transaction_type == "SELL":
                current_quantity -= t.quantity
        
        # 판매하려는 수량이 보유 수량보다 많으면 에러
        if transaction.quantity > current_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"보유한 수량({current_quantity}주)보다 많은 수량({transaction.quantity}주)을 판매할 수 없습니다."
            )
    
    # 새 거래 내역 생성
    db_transaction = TransactionModel(
        portfolio_id=portfolio.id,
        stock_id=stock.id,
        transaction_type=transaction.transaction_type,
        quantity=transaction.quantity,
        price=transaction.price
    )
    
    # 데이터베이스에 저장
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction

@router.get("/portfolio/{portfolio_id}", response_model=List[TransactionSchema])
def get_portfolio_transactions(
    portfolio_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    특정 포트폴리오의 거래 내역 목록 조회 API 엔드포인트
    
    Args:
        portfolio_id (int): 조회할 포트폴리오 ID
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        List[TransactionSchema]: 거래 내역 목록
        
    Raises:
        HTTPException: 포트폴리오가 없거나 접근 권한이 없는 경우
    """
    # 포트폴리오 존재 및 접근 권한 확인
    portfolio = db.query(PortfolioModel).filter(PortfolioModel.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="포트폴리오를 찾을 수 없습니다."
        )
    
    if portfolio.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 포트폴리오에 접근할 권한이 없습니다."
        )
    
    # 거래 내역 조회 (최신순 정렬)
    transactions = db.query(TransactionModel).filter(
        TransactionModel.portfolio_id == portfolio_id
    ).order_by(TransactionModel.transaction_date.desc()).all()
    
    return transactions