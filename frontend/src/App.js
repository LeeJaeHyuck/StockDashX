import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// 페이지 컴포넌트 임포트
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Portfolio from './pages/Portfolio';
import StockDetail from './pages/StockDetail';
import NotFound from './pages/NotFound';

// 레이아웃 및 보호된 라우트 컴포넌트 임포트
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

/**
 * 애플리케이션의 루트 컴포넌트
 * 
 * 전체 라우팅 구조와 인증 컨텍스트 제공자를 설정합니다.
 */
function App() {
  return (
    // 인증 상태 관리를 위한 컨텍스트 제공자
    <AuthProvider>
      {/* 라우터 설정 */}
      <Router>
        <Routes>
          {/* 공개 라우트 - 인증 불필요 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 레이아웃이 적용된 라우트 그룹 */}
          <Route element={<Layout />}>
            {/* 루트 경로는 대시보드로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* 보호된 라우트 - 인증 필요 */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/portfolio/*" 
              element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stocks/:symbol" 
              element={
                <ProtectedRoute>
                  <StockDetail />
                </ProtectedRoute>
              } 
            />
            {/* 추가 보호된 라우트는 여기에 정의 */}
          </Route>
          
          {/* 404 페이지 - 일치하는 경로가 없을 때 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;