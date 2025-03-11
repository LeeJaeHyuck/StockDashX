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