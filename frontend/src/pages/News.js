import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NewsList from '../components/news/NewsList';
import StockNewsWrapper from '../components/news/StockNewsWrapper';
import NewsSearch from '../components/news/NewsSearch';

/**
 * 뉴스 페이지 컴포넌트
 * 
 * 뉴스 관련 서브 라우트와 컴포넌트를 관리합니다.
 * 시장 뉴스와 특정 주식 뉴스를 표시합니다.
 */
const News = () => {
  return (
    <div className="space-y-8">
      {/* 뉴스 검색 컴포넌트 */}
      <NewsSearch />
      
      {/* 뉴스 라우팅 */}
      <Routes>
        {/* 시장 뉴스 */}
        <Route index element={<NewsList />} />
        
        {/* 특정 주식 뉴스 */}
        <Route path="stock/:symbol" element={<StockNewsWrapper />} />
        
        {/* 잘못된 경로는 뉴스 목록으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/news" />} />
      </Routes>
    </div>
  );
};

export default News;