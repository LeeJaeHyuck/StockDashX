-- 주식 테이블에 기본 데이터 추가
INSERT INTO stockdashx.stocks (symbol, name, last_price, change_percent)
VALUES
  ('AAPL', 'Apple Inc.', 173.45, 2.45),
  ('MSFT', 'Microsoft Corporation', 324.78, -1.23),
  ('GOOGL', 'Alphabet Inc.', 134.56, 0.87),
  ('AMZN', 'Amazon.com, Inc.', 167.89, 3.21),
  ('META', 'Meta Platforms, Inc.', 273.25, 1.92),
  ('TSLA', 'Tesla, Inc.', 245.56, -2.15),
  ('NVDA', 'NVIDIA Corporation', 412.87, 5.67),
  ('JPM', 'JPMorgan Chase & Co.', 142.33, 0.45),
  ('V', 'Visa Inc.', 234.56, 1.12),
  ('WMT', 'Walmart Inc.', 156.23, -0.35)
ON CONFLICT (symbol) DO UPDATE 
SET name = EXCLUDED.name,
    last_price = EXCLUDED.last_price,
    change_percent = EXCLUDED.change_percent;