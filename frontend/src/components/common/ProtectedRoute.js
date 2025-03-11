import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * 보호된 라우트 컴포넌트 - 인증된 사용자만 접근 가능
 * @param {object} children - 자식 컴포넌트
 * @returns {JSX.Element} - 렌더링될 컴포넌트
 */
const ProtectedRoute = ({ children }) => {
  // 인증 컨텍스트에서 사용자 정보와 로딩 상태 가져오기
  const { user, loading } = useAuth();

  // 로딩 중이면 로딩 표시
  if (loading) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }

  // 사용자가 인증되지 않았으면 로그인 페이지로 리다이렉트
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;