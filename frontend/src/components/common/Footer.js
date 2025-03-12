import React from 'react';

/**
 * 푸터 컴포넌트
 * 
 * 페이지 하단에 저작권 정보 및 기타 공통 링크를 표시합니다.
 */
const Footer = () => {
  return (
    <footer className="bg-white py-3 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} StockDashX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;