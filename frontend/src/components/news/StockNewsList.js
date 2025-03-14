import React from 'react';
import NewsList from './NewsList';
import { getStockNews } from '../../api/news';

/**
 * 주식 관련 뉴스 목록 컴포넌트
 * 
 * 특정 주식과 관련된 뉴스를 표시합니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.symbol - 주식 심볼 (예: AAPL, MSFT)
 * @param {string} props.companyName - 회사 이름 (선택적)
 */
const StockNewsList = ({ symbol, companyName }) => {
  return (
    <NewsList
      symbol={symbol}
      getNewsFunction={getStockNews}
      title={`${companyName || symbol} 관련 뉴스`}
    />
  );
};

export default StockNewsList;