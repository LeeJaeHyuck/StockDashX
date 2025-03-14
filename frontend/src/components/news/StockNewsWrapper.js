import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StockNewsList from './StockNewsList';
import { getStockQuote } from '../../api/stocks';

/**
 * 주식 뉴스 래퍼 컴포넌트
 * 
 * URL 파라미터에서 심볼을 추출하여 주식 정보와 함께 뉴스를 표시합니다.
 */
const StockNewsWrapper = () => {
  // URL 파라미터에서 주식 심볼 가져오기
  const { symbol } = useParams();
  
  // 회사 이름 상태
  const [companyName, setCompanyName] = useState('');
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 또는 심볼 변경 시 주식 정보 로드
  useEffect(() => {
    if (!symbol) return;
    
    const fetchStockInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 주식 정보 API 호출
        const data = await getStockQuote(symbol);
        
        // 회사 이름 설정 (실제로는 API 응답에서 추출)
        setCompanyName(data.name || symbol);
      } catch (err) {
        setError(err.message);
        // 에러가 있어도 심볼 자체는 표시할 수 있으므로 계속 진행
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockInfo();
  }, [symbol]);

  // 에러 표시 (옵션)
  if (error) {
    console.warn('주식 정보 로드 중 오류:', error);
    // 이 경우 StockNewsList에는 심볼만 전달됨
  }

  return (
    <StockNewsList symbol={symbol} companyName={companyName} />
  );
};

export default StockNewsWrapper;