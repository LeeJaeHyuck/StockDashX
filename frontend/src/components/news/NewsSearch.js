import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchStocks } from '../../api/stocks';

/**
 * 뉴스 검색 컴포넌트
 * 
 * 주식 심볼을 검색하여 해당 주식의 뉴스 페이지로 이동할 수 있는 폼을 제공합니다.
 */
const NewsSearch = () => {
  // 검색어 상태
  const [query, setQuery] = useState('');
  // 검색 결과 상태
  const [results, setResults] = useState([]);
  // 검색 결과 표시 여부
  const [showResults, setShowResults] = useState(false);
  // 로딩 상태
  const [loading, setLoading] = useState(false);
  // 에러 상태
  const [error, setError] = useState(null);
  // 네비게이션 훅
  const navigate = useNavigate();

  /**
   * 검색 버튼 클릭 핸들러
   */
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // 주식 검색 API 호출
      const data = await searchStocks(query);
      setResults(data);
      setShowResults(true);
      
      // 결과가 없을 때 메시지 표시
      if (data.length === 0) {
        setError('검색 결과가 없습니다.');
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 검색어 입력 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    // 입력이 변경되면 결과 숨기기
    setShowResults(false);
  };

  /**
   * 엔터 키 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  /**
   * 주식 선택 핸들러
   * @param {string} symbol - 선택한 주식 심볼
   */
  const handleSelectStock = (symbol) => {
    // 선택한 주식의 뉴스 페이지로 이동
    navigate(`/news/stock/${symbol}`);
    // 결과 초기화
    setResults([]);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">주식 뉴스 검색</h3>
      
      {/* 검색 폼 */}
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="주식 심볼 또는 회사명 입력"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>
        
        {/* 에러 메시지 */}
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
        
        {/* 검색 결과 */}
        {showResults && results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-300 max-h-60 overflow-y-auto">
            <ul>
              {results.map((stock) => (
                <li
                  key={stock.symbol}
                  onClick={() => handleSelectStock(stock.symbol)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-gray-600">{stock.name}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsSearch;