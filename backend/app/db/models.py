from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, Numeric, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "stockdashx"}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 정의
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")


class Stock(Base):
    __tablename__ = "stocks"
    __table_args__ = {"schema": "stockdashx"}

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    last_price = Column(Numeric(10, 2))
    change_percent = Column(Numeric(5, 2))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계 정의
    transactions = relationship("Transaction", back_populates="stock")


class Portfolio(Base):
    __tablename__ = "portfolios"
    __table_args__ = {"schema": "stockdashx"}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("stockdashx.users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 정의
    user = relationship("User", back_populates="portfolios")
    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = {"schema": "stockdashx"}

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("stockdashx.portfolios.id", ondelete="CASCADE"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stockdashx.stocks.id"), nullable=False)
    transaction_type = Column(String, nullable=False)  # "BUY" or "SELL"
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 정의
    portfolio = relationship("Portfolio", back_populates="transactions")
    stock = relationship("Stock", back_populates="transactions")


# 모의 투자 계좌 모델
class SimulationAccount(Base):
    __tablename__ = "simulation_accounts"
    __table_args__ = {"schema": "stockdashx"}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("stockdashx.users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    initial_balance = Column(Numeric(10, 2), nullable=False, default=100000.00)  # 기본 초기 자금 $100,000
    current_balance = Column(Numeric(10, 2), nullable=False, default=100000.00)  # 현재 현금 잔액
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 정의
    user = relationship("User", back_populates="simulation_accounts")
    simulation_transactions = relationship("SimulationTransaction", back_populates="account", cascade="all, delete-orphan")


# 모의 투자 거래 내역 모델
class SimulationTransaction(Base):
    __tablename__ = "simulation_transactions"
    __table_args__ = {"schema": "stockdashx"}

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("stockdashx.simulation_accounts.id", ondelete="CASCADE"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stockdashx.stocks.id"), nullable=False)
    transaction_type = Column(String, nullable=False)  # "BUY" or "SELL"
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)  # 총 거래 금액 (수량 * 가격)
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 정의
    account = relationship("SimulationAccount", back_populates="simulation_transactions")
    stock = relationship("Stock", back_populates="simulation_transactions")


# 기존 User 모델에 관계 추가
User.simulation_accounts = relationship("SimulationAccount", back_populates="user", cascade="all, delete-orphan")

# 기존 Stock 모델에 관계 추가
Stock.simulation_transactions = relationship("SimulationTransaction", back_populates="stock")