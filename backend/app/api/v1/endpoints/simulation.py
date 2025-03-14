from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import (
    SimulationAccount as SimulationAccountModel,
    SimulationTransaction as SimulationTransactionModel,
    Stock as StockModel,
    User as UserModel
)
from app.schemas.simulation import (
    SimulationAccount,
    SimulationAccountCreate,
    SimulationAccountDetail,
    SimulationTransaction,
    SimulationTransactionCreate
)
from app.api.v1.endpoints.auth import get_current_user
from app.services.stock_data import get_stock_quote
from decimal import Decimal

router = APIRouter()

@router.post("/accounts", response_model=SimulationAccount)
def create_simulation_account(
    account: SimulationAccountCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    모의 투자 계좌 생성 API 엔드포인트
    
    Args:
        account (SimulationAccountCreate): 생성할 모의 투자 계좌 정보
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        SimulationAccount: 생성된 모의 투자 계좌 정보
        
    Raises:
        HTTPException: 동일한 이름의 계좌가 이미 있는 경우
    """
    # 동일 이름의 계좌가 이미 있는지 확인
    existing = db.query(SimulationAccountModel).filter(
        SimulationAccountModel.user_id == current_user.id,
        SimulationAccountModel.name == account.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 동일한 이름의 모의 투자 계좌가 있습니다."
        )
    
    # 새 모의 투자 계좌 생성
    db_account = SimulationAccountModel(
        user_id=current_user.id,
        name=account.name,
        initial_balance=account.initial_balance,
        current_balance=account.initial_balance
    )
    
    # 데이터베이스에 저장
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    
    return db_account

@router.get("/accounts", response_model=List[SimulationAccount])
def get_simulation_accounts(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    사용자의 모의 투자 계좌 목록 조회 API 엔드포인트
    
    Args:
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        List[SimulationAccount]: 모의 투자 계좌 목록
    """
    accounts = db.query(SimulationAccountModel).filter(
        SimulationAccountModel.user_id == current_user.id
    ).all()
    
    return accounts

@router.get("/accounts/{account_id}", response_model=SimulationAccountDetail)
def get_simulation_account(
    account_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    특정 모의 투자 계좌 상세 정보 조회 API 엔드포인트
    
    Args:
        account_id (int): 조회할 모의 투자 계좌 ID
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        SimulationAccountDetail: 모의 투자 계좌 상세 정보
        
    Raises:
        HTTPException: 계좌가 없거나 접근 권한이 없는 경우
    """
    # 계좌 조회
    account = db.query(SimulationAccountModel).filter(SimulationAccountModel.id == account_id).first()
    
    # 계좌가 없으면 404 에러
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="모의 투자 계좌를 찾을 수 없습니다."
        )
    
    # 현재 사용자의 계좌가 아니면 403 에러
    if account.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 모의 투자 계좌에 접근할 권한이 없습니다."
        )
    
    # 계좌에 속한 모든 거래 내역 조회
    transactions = db.query(SimulationTransactionModel).filter(
        SimulationTransactionModel.account_id == account_id
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
            total_cost = holdings[symbol]["total_cost"] + float(transaction.total_amount)
            
            holdings[symbol]["quantity"] = total_quantity
            holdings[symbol]["total_cost"] = total_cost
            
            if total_quantity > 0:
                holdings[symbol]["avg_price"] = total_cost / total_quantity
        
        elif transaction.transaction_type == "SELL":
            if symbol in holdings:
                # 매도 시 수량 감소
                holdings[symbol]["quantity"] -= transaction.quantity
                
                # 매도 금액 계산 (FIFO 방식 단순화)
                sell_value = float(transaction.total_amount)
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
    
    # 성과 계산
    total_portfolio_value = float(account.current_balance) + current_value
    total_profit_loss = total_portfolio_value - float(account.initial_balance)
    profit_loss_percent = (total_profit_loss / float(account.initial_balance) * 100) if float(account.initial_balance) > 0 else 0
    
    performance = {
        "initial_balance": float(account.initial_balance),
        "current_balance": float(account.current_balance),
        "invested_value": total_investment,
        "current_investment_value": current_value,
        "total_portfolio_value": total_portfolio_value,
        "total_profit_loss": total_profit_loss,
        "profit_loss_percent": profit_loss_percent
    }
    
    # 계좌 상세 정보 반환
    return {
        "id": account.id,
        "user_id": account.user_id,
        "name": account.name,
        "initial_balance": float(account.initial_balance),
        "current_balance": float(account.current_balance),
        "created_at": account.created_at,
        "holdings": holdings_list,
        "performance": performance
    }

@router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_simulation_account(
    account_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    모의 투자 계좌 삭제 API 엔드포인트
    
    Args:
        account_id (int): 삭제할 모의 투자 계좌 ID
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        None
        
    Raises:
        HTTPException: 계좌가 없거나 접근 권한이 없는 경우
    """
    # 계좌 조회
    account = db.query(SimulationAccountModel).filter(SimulationAccountModel.id == account_id).first()
    
    # 계좌가 없으면 404 에러
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="모의 투자 계좌를 찾을 수 없습니다."
        )
    
    # 현재 사용자의 계좌가 아니면 403 에러
    if account.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 모의 투자 계좌에 접근할 권한이 없습니다."
        )
    
    # 계좌 삭제 (관련 거래 내역도 cascade로 함께 삭제됨)
    db.delete(account)
    db.commit()

@router.post("/transactions", response_model=SimulationTransaction)
async def create_simulation_transaction(
    transaction: SimulationTransactionCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    모의 투자 거래 내역 생성 API 엔드포인트
    
    Args:
        transaction (SimulationTransactionCreate): 생성할 모의 투자 거래 내역 정보
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        SimulationTransaction: 생성된 모의 투자 거래 내역 정보
        
    Raises:
        HTTPException: 계좌가 없거나 접근 권한이 없는 경우, 또는 잔액 부족 등의 오류 발생 시
    """
    # 계좌 존재 및 접근 권한 확인
    account = db.query(SimulationAccountModel).filter(SimulationAccountModel.id == transaction.account_id).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="모의 투자 계좌를 찾을 수 없습니다."
        )
    
    if account.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 모의 투자 계좌에 접근할 권한이 없습니다."
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
    
    # 총 거래 금액 계산
    total_amount = Decimal(str(transaction.quantity)) * Decimal(str(transaction.price))
    
    # 매수 거래인 경우 잔액 확인
    if transaction.transaction_type == "BUY":
        if account.current_balance < total_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"잔액이 부족합니다. 현재 잔액: ${float(account.current_balance)}, 필요 금액: ${float(total_amount)}"
            )
        
        # 잔액 감소
        account.current_balance -= total_amount
    
    # 매도 거래인 경우 보유 수량 확인
    elif transaction.transaction_type == "SELL":
        # 계좌의 모든 거래 내역 가져오기
        all_transactions = db.query(SimulationTransactionModel).filter(
            SimulationTransactionModel.account_id == account.id,
            SimulationTransactionModel.stock_id == stock.id
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
        
        # 잔액 증가
        account.current_balance += total_amount
    
    # 새 거래 내역 생성
    db_transaction = SimulationTransactionModel(
        account_id=account.id,
        stock_id=stock.id,
        transaction_type=transaction.transaction_type,
        quantity=transaction.quantity,
        price=transaction.price,
        total_amount=total_amount
    )
    
    # 데이터베이스에 저장
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction

@router.get("/accounts/{account_id}/transactions", response_model=List[SimulationTransaction])
def get_account_transactions(
    account_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    특정 모의 투자 계좌의 거래 내역 목록 조회 API 엔드포인트
    
    Args:
        account_id (int): 조회할 모의 투자 계좌 ID
        current_user (UserModel): 현재 인증된 사용자 (의존성 주입)
        db (Session): 데이터베이스 세션 (의존성 주입)
        
    Returns:
        List[SimulationTransaction]: 거래 내역 목록
        
    Raises:
        HTTPException: 계좌가 없거나 접근 권한이 없는 경우
    """
    # 계좌 존재 및 접근 권한 확인
    account = db.query(SimulationAccountModel).filter(SimulationAccountModel.id == account_id).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="모의 투자 계좌를 찾을 수 없습니다."
        )
    
    if account.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 모의 투자 계좌에 접근할 권한이 없습니다."
        )
    
    # 거래 내역 조회 (최신순 정렬)
    transactions = db.query(SimulationTransactionModel).filter(
        SimulationTransactionModel.account_id == account_id
    ).order_by(SimulationTransactionModel.transaction_date.desc()).all()
    
    return transactions