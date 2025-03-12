import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // 인증 상태 관리 커스텀 훅

/**
 * 상단 네비게이션 바 컴포넌트
 * 
 * 앱 로고, 사용자 인증 상태에 따른 네비게이션 링크, 프로필 메뉴 등을 표시합니다.
 */
const Navbar = () => {
  // 인증 컨텍스트에서 사용자 정보와 로그아웃 함수 가져오기
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 로고 및 브랜드 이름 */}
          <div className="flex items-center">
            <span className="text-xl font-semibold text-blue-600">StockDashX</span>
          </div>
          
          {/* 네비게이션 링크 및 프로필 영역 */}
          <div className="flex items-center">
            {user ? (
              // 로그인 상태일 때 표시되는 영역
              <div className="flex items-center space-x-4">
                {/* 사용자 이름 표시 */}
                <span className="text-sm">{user.username}</span>
                
                {/* 로그아웃 버튼 */}
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              // 로그아웃 상태일 때 표시되는 영역
              <div className="space-x-2">
                {/* 로그인 링크 */}
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  로그인
                </Link>
                
                {/* 회원가입 링크 */}
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;