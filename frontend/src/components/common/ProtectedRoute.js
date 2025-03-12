import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * 보호된 라우트 컴포넌트
 * 
 * 사용자 인증 상태를 확인하여 인증된 사용자만 접근할 수 있도록 합니다.
 * 인증되지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {React.ReactNode} props.children - 보호할 자식 컴포넌트
 */
const ProtectedRoute = ({ children }) => {
  // 인증 컨텍스트에서 사용자 정보와 로딩 상태 가져오기
  const { user, loading } = useAuth();

  // 인증 정보 로딩 중이면 로딩 표시
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