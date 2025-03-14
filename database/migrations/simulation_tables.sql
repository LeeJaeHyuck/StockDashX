-- 모의 투자 계좌 테이블
CREATE TABLE IF NOT EXISTS stockdashx.simulation_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES stockdashx.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 100000.00,
    current_balance DECIMAL(12, 2) NOT NULL DEFAULT 100000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 모의 투자 거래 내역 테이블
CREATE TABLE IF NOT EXISTS stockdashx.simulation_transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES stockdashx.simulation_accounts(id) ON DELETE CASCADE,
    stock_id INTEGER NOT NULL REFERENCES stockdashx.stocks(id),
    transaction_type VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_simulation_accounts_user_id ON stockdashx.simulation_accounts(user_id);
CREATE INDEX idx_simulation_transactions_account_id ON stockdashx.simulation_transactions(account_id);
CREATE INDEX idx_simulation_transactions_stock_id ON stockdashx.simulation_transactions(stock_id);