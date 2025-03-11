-- 초기 데이터베이스 설정
CREATE SCHEMA IF NOT EXISTS stockdashx;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS stockdashx.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 주식 테이블
CREATE TABLE IF NOT EXISTS stockdashx.stocks (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    last_price DECIMAL(10, 2),
    change_percent DECIMAL(5, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 포트폴리오 테이블
CREATE TABLE IF NOT EXISTS stockdashx.portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES stockdashx.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- 거래 내역 테이블
CREATE TABLE IF NOT EXISTS stockdashx.transactions (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER NOT NULL REFERENCES stockdashx.portfolios(id) ON DELETE CASCADE,
    stock_id INTEGER NOT NULL REFERENCES stockdashx.stocks(id),
    transaction_type VARCHAR(10) NOT NULL, -- BUY or SELL
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);