import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStocks } from '../api/stocks';

/**
 * 주식 목록 페이지 컴포넌트
 * 
 * 모든 주식을 테이블 형태로, 검색 및 필터링 기능을 제공합니다.
 */
const StockList = () => {
  // 주식 목록 상태
  const [stocks, setStocks] = useState([]);
  // 원본 주식 목록 (필터링용)
  const [originalStocks, setOriginalStocks] = useState([]);
  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState('');
  // 현재 페이지 상태
  const [currentPage, setCurrentPage] = useState(1);
  // 페이지 당 항목 수
  const [itemsPerPage] = useState(10);
  // 정렬 상태
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'ascending' });
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 주식 데이터 로드
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // API에서 주식 목록 가져오기
        const data = await getStocks();
        setStocks(data);
        setOriginalStocks(data);
      } catch (err) {
        setError('주식 데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('주식 목록 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStocks();
  }, []);

  // 검색어 변경 핸들러
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
    
    // 검색어로 필터링
    if (value.trim() === '') {
      setStocks(originalStocks);
    } else {
      const filteredStocks = originalStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(value.toLowerCase()) || 
        stock.name.toLowerCase().includes(value.toLowerCase())
      );
      setStocks(filteredStocks);
    }
  };

  // 정렬 핸들러
  const requestSort = (key) => {
    let direction = 'ascending';
    
    // 같은 키로 정렬 중이면 방향 전환
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    // 정렬 구성 업데이트
    setSortConfig({ key, direction });
    
    // 주식 목록 정렬
    const sortedStocks = [...stocks].sort((a, b) => {
      // 숫자 필드 처리
      if (key === 'last_price' || key === 'change_percent') {
        const aValue = parseFloat(a[key]) || 0;
        const bValue = parseFloat(b[key]) || 0;
        
        if (direction === 'ascending') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      } 
      // 문자열 필드 처리
      else {
        const aValue = a[key] || '';
        const bValue = b[key] || '';
        
        if (direction === 'ascending') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
    });
    
    setStocks(sortedStocks);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 페이지 상단으로 스크롤
    window.scrollTo(0, 0);
  };

  // 현재 페이지 데이터 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStocks = stocks.slice(indexOfFirstItem, indexOfLastItem);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(stocks.length / itemsPerPage);

  // 페이지 번호 배열 생성
  const pageNumbers = [];
  
  // 최대 5개의 페이지 번호 표시
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  // 끝 페이지가 최대치에 도달하지 않으면 시작 페이지 조정
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // 정렬 방향 표시 아이콘
  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '↑' : '↓';
    }
    return '';
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <span className="ml-2">주식 데이터를 불러오는 중...</span>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">주식 목록</h1>
        <div className="w-64">
          <input
            type="text"
            placeholder="주식 심볼 또는 이름 검색..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 주식 수 요약 */}
      <div className="text-sm text-gray-500">
        총 {stocks.length}개 주식, {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, stocks.length)}개 표시 중
      </div>

      {/* 주식 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {stocks.length === 0 ? (
          <p className="text-center text-gray-500 py-8">검색 결과가 없습니다.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* 심볼 헤더 */}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('symbol')}
                >
                  심볼 {getSortIcon('symbol')}
                </th>
                
                {/* 이름 헤더 */}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  이름 {getSortIcon('name')}
                </th>
                
                {/* 가격 헤더 */}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('last_price')}
                >
                  가격 {getSortIcon('last_price')}
                </th>
                
                {/* 변동 헤더 */}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('change_percent')}
                >
                  변동 {getSortIcon('change_percent')}
                </th>
                
                {/* 액션 헤더 */}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stock.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${parseFloat(stock.last_price).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${
                        parseFloat(stock.change_percent) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {parseFloat(stock.change_percent) >= 0 ? '+' : ''}
                      {parseFloat(stock.change_percent).toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/stocks/${stock.symbol}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      상세
                    </Link>
                    <Link
                      to={`/simulation`}
                      className="text-green-600 hover:text-green-900"
                    >
                      거래
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
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
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === number
                    ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}
            
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

export default StockList;