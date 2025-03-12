import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getStockQuote } from '../api/stocks';
import PriceChart from '../components/charts/PriceChart';

/**
 * 주식 상세 정보 페이지
 * 
 * 특정 주식의 상세 정보와 차트를 표시합니다.
 */
const StockDetail = () => {
  // URL 파라미터에서 주식 심볼 가져오기
  const { symbol } = useParams();
  // URL 쿼리 파라미터에서 차트 간격 가져오기
  const [searchParams] = useSearchParams();
  const interval = searchParams.get('interval') || 'daily';
  
  // 주식 정보 상태
  const [stockData, setStockData] = useState(null);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 또는 심볼 변경 시 데이터 로드
  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // API를 통해 주식 시세 데이터 가져오기
        const data = await getStockQuote(symbol);
        setStockData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
    
    // 실시간 데이터 업데이트 (10초마다)
    const intervalId = setInterval(fetchStockData, 10000);
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, [symbol]);

  // 로딩 중 표시
  if (loading && !stockData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>주식 데이터 로딩 중...</p>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{symbol} 주식 정보</h1>
      </div>

      {/* 주식 요약 정보 */}
      {stockData && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h2 className="text-xl font-semibold">{stockData.symbol}</h2>
              <p className="text-gray-600">최근 거래일: {stockData.latest_trading_day}</p>
            </div>
            <div>
              <p className="text-3xl font-bold">${stockData.price.toFixed(2)}</p>
              <p className={`text-lg ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} 
                ({stockData.change_percent.toFixed(2)}%)
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">거래량</p>
                  <p className="font-medium">{stockData.volume.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">전일 종가</p>
                  <p className="font-medium">${stockData.previous_close.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 주가 차트 */}
      <PriceChart symbol={symbol} interval={interval} />
    </div>
  );
};

export default StockDetail;