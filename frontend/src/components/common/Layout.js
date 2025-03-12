import React from 'react';
import { Outlet } from 'react-router-dom'; // 중첩 라우팅을 위한 Outlet
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * 애플리케이션의 기본 레이아웃 컴포넌트
 * 
 * 사이드바, 네비게이션 바, 메인 콘텐츠 영역, 푸터를 포함하는 전체 레이아웃을 정의합니다.
 * React Router의 Outlet을 사용하여 중첩된 라우트의 컴포넌트를 렌더링합니다.
 */
const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 좌측 사이드바 */}
      <Sidebar />
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 상단 네비게이션 바 */}
        <Navbar />
        
        {/* 메인 콘텐츠 - Outlet으로 중첩 라우트가 렌더링되는 위치 */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* 하단 푸터 */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;