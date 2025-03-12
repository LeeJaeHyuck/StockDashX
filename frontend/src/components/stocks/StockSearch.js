import React, { useState } from 'react';
import { searchStocks } from '../../api/stocks';

/**
 * 주식 검색 컴포넌트
 * 
 * 사용자가 주식을 검색하고 결과를 표시합니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Function} props.onSelectStock - 주식 선택 시 호출될 콜백 함수
 */
const StockSearch = ({ onSelectStock }) => {
  // 검색어 상태
  const [query, setQuery] = useState('');
  // 검색 결과 상태
  const [results, setResults] = useState([]);
  // 로딩 상태
  const [loading, setLoading] = useState(false);
  // 에러 상태
  const [error, setError] = useState(null);

  /**
   * 검색 버튼 클릭 핸들러
   */
  const handleSearch = async () => {
    // 검색어가 없으면 반환
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // API를 통해 주식 검색
      const data = await searchStocks(query);
      setResults(data);
      
      // 결과가 없을 경우 메시지 표시
      if (data.length === 0) {
        setError('검색 결과가 없습니다.');
      }
    } catch (err) {
      // 에러 처리
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 엔터 키 핸들러
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">주식 검색</h2>
      
      {/* 검색 입력 폼 */}
      <div className="flex mb-4">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="주식 심볼 또는 회사명 입력"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      {/* 검색 결과 목록 */}
      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">검색 결과</h3>
          <ul className="divide-y divide-gray-200">
            {results.map((stock) => (
              <li 
                key={stock.symbol}
                className="py-2 cursor-pointer hover:bg-gray-50"
                onClick={() => onSelectStock(stock.symbol)}
              >
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium text-blue-600">{stock.symbol}</span>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {stock.region} | {stock.currency}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StockSearch;