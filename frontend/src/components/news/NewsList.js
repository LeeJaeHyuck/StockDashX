import React, { useState, useEffect } from 'react';
import NewsItem from './NewsItem';
import { getMarketNews } from '../../api/news';

/**
 * 뉴스 목록 컴포넌트
 * 
 * 뉴스 기사 목록을 표시하고 페이지네이션을 제공합니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.symbol - 주식 심볼 (특정 주식의 뉴스를 보여줄 때 사용, 선택적)
 * @param {Function} props.getNewsFunction - 뉴스를 가져오는 함수 (선택적, 기본값: getMarketNews)
 * @param {string} props.title - 뉴스 섹션 제목 (선택적, 기본값: "최신 금융 뉴스")
 */
const NewsList = ({ symbol, getNewsFunction = getMarketNews, title = "최신 금융 뉴스" }) => {
  // 뉴스 기사 상태
  const [articles, setArticles] = useState([]);
  // 총 결과 수 상태
  const [totalResults, setTotalResults] = useState(0);
  // 현재 페이지 상태
  const [currentPage, setCurrentPage] = useState(1);
  // 페이지 당 기사 수
  const [pageSize] = useState(9);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 또는 의존성 변경 시 뉴스 로드
  useEffect(() => {
    fetchNews(currentPage);
  }, [currentPage, symbol, getNewsFunction]);

  /**
   * 뉴스 데이터 가져오기
   * @param {number} page - 페이지 번호
   */
  const fetchNews = async (page) => {
    try {
      setLoading(true);
      setError(null);
      
      // 뉴스 API 호출 (심볼이 있으면 해당 주식 뉴스, 없으면 시장 뉴스)
      const params = symbol ? [symbol, page, pageSize] : [page, pageSize];
      const data = await getNewsFunction(...params);
      
      setArticles(data.articles);
      setTotalResults(data.totalResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 페이지 변경 핸들러
   * @param {number} page - 새 페이지 번호
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo(0, 0);
  };

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(totalResults / pageSize);

  // 로딩 중 표시
  if (loading && articles.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2">뉴스를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>뉴스를 불러오는 중 오류가 발생했습니다: {error}</p>
      </div>
    );
  }

  // 결과가 없을 때
  if (articles.length === 0) {
    return (
      <div className="text-center p-8">
        <p>관련 뉴스가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      
      {/* 뉴스 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <NewsItem key={`${article.url}-${index}`} article={article} />
        ))}
      </div>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* 이전 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">이전</span>
              &laquo;
            </button>
            
            {/* 페이지 번호 버튼 */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              // 페이지 번호 계산 (현재 페이지 주변 5개 페이지 표시)
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {/* 다음 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">다음</span>
              &raquo;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default NewsList;