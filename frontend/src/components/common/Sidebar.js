import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * 사이드바 네비게이션 컴포넌트
 * 
 * 앱의 주요 네비게이션 링크를 표시하고, 현재 활성화된 경로에 따라 스타일을 적용합니다.
 */
const Sidebar = () => {
  // 현재 라우트 위치 정보 가져오기 (활성 메뉴 표시에 사용)
  const location = useLocation();
  
  // 네비게이션 항목 정의
  const navItems = [
    { name: '대시보드', path: '/dashboard', icon: '📊' },
    { name: '포트폴리오', path: '/portfolio', icon: '📁' },
    { name: '모의 투자', path: '/simulation', icon: '💰' },
    { name: '뉴스', path: '/news', icon: '📰' },
    { name: '알림 설정', path: '/alerts', icon: '🔔' },
  ];

  return (
    <div className="bg-blue-800 text-white w-64 space-y-6 py-7 px-2 fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out z-20">
      {/* 사이드바 로고 영역 */}
      <div className="flex items-center space-x-2 px-4">
        <span className="text-2xl font-extrabold">StockDashX</span>
      </div>
      
      {/* 네비게이션 메뉴 */}
      <nav>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block py-2.5 px-4 rounded transition duration-200 ${
              // 현재 경로와 일치하면 활성화 스타일 적용
              location.pathname === item.path
                ? 'bg-blue-700 text-white'
                : 'text-blue-200 hover:bg-blue-700 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;