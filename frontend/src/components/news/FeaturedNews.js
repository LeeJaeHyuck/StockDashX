import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMarketNews } from '../../api/news';

/**
 * 주요 뉴스 컴포넌트
 * 
 * 대시보드나 다른 페이지에 표시할 수 있는 주요 뉴스 요약을 제공합니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {number} props.count - 표시할 뉴스 항목 수 (기본값: 3)
 */
const FeaturedNews = ({ count = 3 }) => {
  // 뉴스 기사 상태
  const [articles, setArticles] = useState([]);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 뉴스 로드
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 시장 뉴스 API 호출
        const data = await getMarketNews(1, count);
        setArticles(data.articles.slice(0, count));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, [count]);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">주요 뉴스</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="bg-gray-300 h-16 w-16 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">주요 뉴스</h3>
        <p className="text-red-600 text-sm">뉴스를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  // 뉴스가 없을 때
  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">주요 뉴스</h3>
        <p className="text-gray-500">현재 표시할 뉴스가 없습니다.</p>
      </div>
    );
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">주요 뉴스</h3>
        <Link to="/news" className="text-sm text-blue-600 hover:text-blue-800">
          모든 뉴스 보기
        </Link>
      </div>
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <a>
            key={`${article.url}-${index}`}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start group"
          
            {/* 뉴스 썸네일 (있는 경우) */}
            {article.urlToImage && (
              <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded overflow-hidden mr-3">
                <img
                  src={article.urlToImage}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {/* 뉴스 제목 */}
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">
                {article.title}
              </h4>
              
              {/* 출처와 날짜 */}
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <span>{article.source}</span>
                <span className="mx-1">&middot;</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FeaturedNews;