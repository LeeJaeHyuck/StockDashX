import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// 페이지 컴포넌트 import
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import StockDetail from './pages/StockDetail';
import StockList from './pages/StockList'; // 추가된 import
import Portfolio from './pages/Portfolio';
import Simulation from './pages/Simulation';
import News from './pages/News';
import NotFound from './pages/NotFound';

// 레이아웃 컴포넌트
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* 주식 목록 및 상세 페이지 */}
            <Route 
              path="/stocks" 
              element={
                <ProtectedRoute>
                  <StockList />
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
            
            {/* 기존 라우트들... */}
            <Route 
              path="/portfolio/*" 
              element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/simulation/*" 
              element={
                <ProtectedRoute>
                  <Simulation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/news/*" 
              element={
                <ProtectedRoute>
                  <News />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;