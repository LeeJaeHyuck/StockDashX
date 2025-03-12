import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PortfolioList from '../components/portfolio/PortfolioList';
import PortfolioDetail from '../components/portfolio/PortfolioDetail';
import PortfolioForm from '../components/portfolio/PortfolioForm';
import TransactionForm from '../components/transactions/TransactionForm';

/**
 * 포트폴리오 페이지 컴포넌트
 * 
 * 포트폴리오 관련 서브 라우트와 컴포넌트를 관리합니다.
 * 목록, 상세, 생성, 수정, 거래 추가 등의 기능을 라우트로 제공합니다.
 */
const Portfolio = () => {
  return (
    <Routes>
      {/* 포트폴리오 목록 */}
      <Route index element={<PortfolioList />} />
      
      {/* 새 포트폴리오 생성 */}
      <Route path="new" element={<PortfolioForm />} />
      
      {/* 포트폴리오 상세 정보 */}
      <Route path=":portfolioId" element={<PortfolioDetail />} />
      
      {/* 포트폴리오 수정 */}
      <Route path=":portfolioId/edit" element={<PortfolioForm />} />
      
      {/* 거래 추가 */}
      <Route path=":portfolioId/transaction/new" element={<TransactionForm />} />
      
      {/* 잘못된 경로는 포트폴리오 목록으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/portfolio" />} />
    </Routes>
  );
};

export default Portfolio;