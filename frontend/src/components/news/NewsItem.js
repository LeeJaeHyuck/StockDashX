import React from 'react';

/**
 * 뉴스 항목 컴포넌트
 * 
 * 단일 뉴스 기사의 정보를 표시합니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.article - 뉴스 기사 정보
 */
const NewsItem = ({ article }) => {
  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString;
    }
  };

  // 기본 이미지 URL (이미지가 없는 경우 사용)
  const defaultImageUrl = 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* 뉴스 이미지 */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={article.urlToImage || defaultImageUrl}
          alt={article.title || '뉴스 제목'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; // 무한 반복 방지
            e.target.src = defaultImageUrl;
          }}
        />
        
        {/* 출처 및 발행일 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
          <div className="flex justify-between">
            <span>{article.source || '출처 미상'}</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </div>
      
      {/* 뉴스 내용 */}
      <div className="p-4">
        {/* 제목 */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {article.title || '제목 없음'}
        </h3>
        
        {/* 설명 */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.description || '설명이 없습니다.'}
        </p>
        
        {/* 더 읽기 링크 - 새 탭에서 열기 */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          자세히 읽기 &rarr;
        </a>
      </div>
    </div>
  );
};

export default NewsItem;