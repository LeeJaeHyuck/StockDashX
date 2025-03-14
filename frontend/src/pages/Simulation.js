import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import SimulationAccountList from '../components/simulation/SimulationAccountList';
import SimulationAccountForm from '../components/simulation/SimulationAccountForm';
import SimulationAccountDetail from '../components/simulation/SimulationAccountDetail';
import SimulationTradeForm from '../components/simulation/SimulationTradeForm';

/**
 * 모의 투자 상세 페이지 래퍼 컴포넌트
 * 계좌 ID를 URL 파라미터에서 추출하여 실제 컴포넌트에 전달합니다.
 */
const SimulationDetailWrapper = () => {
  const { accountId } = useParams();
  return <SimulationAccountDetail accountId={Number(accountId)} />;
};

/**
 * 모의 투자 거래 폼 래퍼 컴포넌트
 * 계좌 ID를 URL 파라미터에서 추출하여 실제 컴포넌트에 전달합니다.
 */
const SimulationTradeFormWrapper = () => {
  const { accountId } = useParams();
  return <SimulationTradeForm accountId={Number(accountId)} />;
};

/**
 * 모의 투자 페이지 컴포넌트
 * 
 * 모의 투자 관련 서브 라우트와 컴포넌트를 관리합니다.
 * 계좌 목록, 상세, 생성, 거래 추가 등의 기능을 라우트로 제공합니다.
 */
const Simulation = () => {
  return (
    <Routes>
      {/* 모의 투자 계좌 목록 */}
      <Route index element={<SimulationAccountList />} />
      
      {/* 새 모의 투자 계좌 생성 */}
      <Route path="new" element={<SimulationAccountForm />} />
      
      {/* 모의 투자 계좌 상세 정보 */}
      <Route path=":accountId" element={<SimulationDetailWrapper />} />
      
      {/* 모의 투자 거래 추가 */}
      <Route path=":accountId/trade" element={<SimulationTradeFormWrapper />} />
      
      {/* 잘못된 경로는 모의 투자 목록으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/simulation" />} />
    </Routes>
  );
};

export default Simulation;